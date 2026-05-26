import { useState, useEffect, useRef } from "react";
import { useDraggable, useDroppable, DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import CHARACTERS from "../data/characters";
import CardComponent from "./CardComponent";
import { ATTACK_CONFIG } from "./TokenPool";
import socket from "../socket";

export function StagingToken({ token }) {
  const cfg = ATTACK_CONFIG[token.type] ?? ATTACK_CONFIG.attack;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: token.id,
    data: { draggableType: "staging_token", tokenId: token.id, attackType: token.type },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base select-none transition-all ${cfg.bg} ${cfg.border} ${
        isDragging ? "opacity-30 scale-95" : "cursor-grab active:cursor-grabbing hover:scale-110 shadow-sm"
      }`}
      style={{ touchAction: "none" }}
      title={`${cfg.label} — drag to enemy`}
    >
      {cfg.icon}
    </div>
  );
}

// ── Hand area ─────────────────────────────────────────────────────────────────

function DraggableHandCard({ card, position, zIndex, onBringToFront, isMe }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `hcard_${card.id}`,
    data: { draggableType: "hand_card", cardId: card.id },
    disabled: !isMe,
  });

  return (
    <div
      onPointerDown={() => isMe && onBringToFront(card.id)}
      style={{
        position: "absolute",
        left: position.x + (transform?.x ?? 0),
        top: position.y + (transform?.y ?? 0),
        zIndex: isDragging ? 1000 : zIndex,
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
      }}
    >
      <div ref={setNodeRef} {...(isMe ? { ...listeners, ...attributes } : {})} style={{ cursor: isMe ? (isDragging ? "grabbing" : "grab") : "default" }}>
        <CardComponent card={card} isPlayable={false} forceFullOpacity />
      </div>
    </div>
  );
}

function HandAreaInner({ hand, drawPile, discardPile, peekCard, cardPositions, zOrder, onBringToFront, isMe, handCanvasRef }) {
  const [showBrowse, setShowBrowse] = useState(false);

  const { setNodeRef: setDrawRef, isOver: isOverDraw } = useDroppable({ id: "inner_draw_pile" });
  const { setNodeRef: setDiscardRef, isOver: isOverDiscard } = useDroppable({ id: "inner_discard_pile" });

  const drawCount = drawPile?.length ?? 0;
  const discardCount = discardPile?.length ?? 0;

  const { setNodeRef: setDrawDragRef, listeners: drawListeners, attributes: drawAttributes, isDragging: isDrawDragging } = useDraggable({
    id: "draw_pile_drag",
    data: { draggableType: "draw_pile" },
    disabled: !isMe || drawCount === 0,
  });
  const topDiscard = discardPile?.[discardCount - 1] ?? null;

  const handleRetrieve = (cardId) => {
    socket.emit("retrieve_from_discard", { cardId });
    setShowBrowse(false);
  };

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
    <div className="flex gap-3 px-4 py-3 bg-paper-50 border-t border-ink-border/20" style={{ minWidth: 900 }}>
      {/* ── Draw Pile ── */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="text-[9px] text-ink-300 uppercase tracking-[0.12em] font-bold">Draw</div>
        <div ref={setDrawRef}>
          <button
            ref={setDrawDragRef}
            {...drawListeners}
            {...drawAttributes}
            onClick={() => isMe && drawCount > 0 && socket.emit("draw_card")}
            disabled={!isMe || drawCount === 0}
            className={`relative rounded-xl border-2 flex items-center justify-center select-none transition-all ${
              isOverDraw
                ? "border-brown-soft bg-brown ring-2 ring-brown-soft ring-offset-1"
                : "border-brown bg-brown-deep"
            } ${isMe && drawCount > 0 ? "hover:bg-brown cursor-pointer active:scale-95" : "opacity-60 cursor-default"} ${isDrawDragging ? "opacity-40" : ""}`}
            style={{ width: 176, height: 258, touchAction: "none" }}
            title={isMe ? (drawCount > 0 ? "Click or drag to draw a card" : "Draw pile empty") : undefined}
          >
            <span className="text-5xl">🐾</span>
            {drawCount > 0 && (
              <span className="absolute top-2 right-2 bg-ink text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                {drawCount}
              </span>
            )}
          </button>
        </div>
        {isMe && drawCount === 0 && discardCount > 0 && (
          <button
            onClick={() => socket.emit("shuffle_discard")}
            className="text-[10px] bg-paper-200 text-ink font-display border border-ink-border/40 rounded-lg px-2 py-1 shadow-[0_1px_0_#271d14] hover:-translate-y-px hover:shadow-[0_2px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
          >
            Shuffle ↺
          </button>
        )}
        {!isMe && (
          <span className="text-[10px] text-ink-300">{drawCount} cards</span>
        )}
      </div>

      {/* ── Hand Canvas ── */}
      <div className="w-px bg-ink-border/20 self-stretch shrink-0" />
      <div ref={handCanvasRef} className="flex-1 relative" style={{ minHeight: 320 }}>
        {isMe && hand?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-300/60 text-sm italic select-none pointer-events-none">
            No cards in hand
          </div>
        )}
        {hand?.map((card) => (
          <DraggableHandCard
            key={card.id}
            card={card}
            position={cardPositions[card.id] ?? { x: 0, y: 0 }}
            zIndex={zOrder.indexOf(card.id) + 2}
            onBringToFront={onBringToFront}
            isMe={isMe}
          />
        ))}
      </div>

      <div className="w-px bg-ink-border/20 self-stretch shrink-0" />

      {/* ── Discard Pile ── */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="text-[9px] text-ink-300 uppercase tracking-[0.12em] font-bold">Discard</div>
        <div
          ref={setDiscardRef}
          onClick={() => isMe && discardCount > 0 && setShowBrowse(true)}
          className={`relative transition-all ${isMe && discardCount > 0 ? "cursor-pointer hover:opacity-90" : "cursor-default"} ${
            isOverDiscard ? "ring-2 ring-red ring-offset-1 rounded-xl" : ""
          }`}
          style={{ width: 176, height: 258 }}
          title={isMe ? (discardCount > 0 ? "Click to browse discard pile" : "Discard pile empty") : undefined}
        >
          {/* Stack illusion */}
          {discardCount > 2 && (
            <div className="absolute rounded-xl border-2 border-ink-300/50 bg-paper-200" style={{ width: 176, height: 258, top: 6, left: 6 }} />
          )}
          {discardCount > 1 && (
            <div className="absolute rounded-xl border-2 border-ink-300/50 bg-paper-200" style={{ width: 176, height: 258, top: 3, left: 3 }} />
          )}
          <div className="absolute top-0 left-0" style={{ zIndex: 2, pointerEvents: "none" }}>
            {topDiscard ? (
              <CardComponent card={topDiscard} isPlayable={false} forceFullOpacity />
            ) : (
              <div
                className="rounded-xl border-2 border-dashed border-ink-300/50 bg-paper-50 flex items-center justify-center text-ink-300/60 text-sm select-none"
                style={{ width: 176, height: 258 }}
              >
                Empty
              </div>
            )}
          </div>
          {discardCount > 0 && (
            <div className="absolute top-2 right-2 bg-ink-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow" style={{ zIndex: 10 }}>
              {discardCount}
            </div>
          )}
        </div>
        {!isMe && (
          <span className="text-[10px] text-ink-300">{discardCount} cards</span>
        )}
      </div>

      {/* ── Peek modal ── */}
      {isMe && peekCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={() => socket.emit("peek_to_top")}>
          <div className="bg-paper-50 rounded-xl p-4 shadow-2xl border-2 border-ink-border flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-display text-ink-700">Peeked card</div>
            <CardComponent card={peekCard} isPlayable={false} />
            <div className="flex gap-2 mt-2">
              <button onClick={() => socket.emit("peek_to_hand")} className="bg-moss text-white font-display text-sm px-3 py-1.5 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]">
                Take to hand
              </button>
              <button onClick={() => socket.emit("peek_to_top")} className="bg-paper-200 text-ink font-display text-sm px-3 py-1.5 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]">
                Return to top
              </button>
              <button onClick={() => socket.emit("peek_to_discard")} className="bg-red-soft/30 text-red font-display text-sm px-3 py-1.5 rounded-lg border-2 border-red shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]">
                Send to discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Browse discard modal ── */}
      {showBrowse && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={() => setShowBrowse(false)}>
          <div className="bg-paper-50 rounded-xl p-4 shadow-2xl border-2 border-ink-border max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-display text-ink-700">Discard Pile ({discardCount} cards)</div>
              <button onClick={() => setShowBrowse(false)} className="text-ink-300 hover:text-ink-500 text-lg leading-none">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {discardCount === 0 ? (
                <p className="text-ink-300 text-sm italic">Discard pile is empty.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discardPile.map((card) => (
                    <CardComponent key={card.id} card={card} isPlayable={true} onClick={() => handleRetrieve(card.id)} />
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-ink-300 mt-2 text-center">Click a card to retrieve it to hand</div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

function HandArea({ hand, drawPile, discardPile, peekCard, isMe, serverCardPositions, serverZOrder }) {
  const [cardPositions, setCardPositions] = useState({});
  const [zOrder, setZOrder] = useState([]);
  const [activeDragType, setActiveDragType] = useState(null);
  const pendingDropPos = useRef(null);
  const handCanvasRef = useRef(null);

  const onBringToFront = (cardId) => {
    if (!isMe) return;
    setZOrder(prev => {
      const next = [...prev.filter(id => id !== cardId), cardId];
      socket.emit("update_card_positions", { cardPositions, zOrder: next });
      return next;
    });
  };

  // When viewing another player, use their server positions directly
  const displayPositions = isMe ? cardPositions : (serverCardPositions ?? {});
  const displayZOrder    = isMe ? zOrder        : (serverZOrder ?? []);

  const handKey = (hand || []).map((c) => c.id).join(",");
  useEffect(() => {
    if (!isMe) return; // other players' positions come from server
    setCardPositions((prev) => {
      // Seed from server positions for cards we haven't placed locally yet
      const seed = serverCardPositions ?? {};
      const next = { ...prev };
      const handIds = new Set((hand || []).map((c) => c.id));
      Object.keys(next).forEach((id) => { if (!handIds.has(id)) delete next[id]; });
      (hand || []).forEach((card, i) => {
        if (!next[card.id]) {
          if (pendingDropPos.current) {
            next[card.id] = pendingDropPos.current;
            pendingDropPos.current = null;
          } else if (seed[card.id]) {
            next[card.id] = seed[card.id];
          } else {
            next[card.id] = { x: i * 28, y: (i % 2) * 18 };
          }
        }
      });
      return next;
    });
    if (serverZOrder?.length && zOrder.length === 0) {
      setZOrder(serverZOrder);
    }
  }, [handKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleDragEnd = ({ active, over, delta }) => {
    setActiveDragType(null);
    if (active?.data?.current?.draggableType === "draw_pile") {
      const canvasEl = handCanvasRef.current;
      const translated = active.rect.current?.translated;
      if (canvasEl && translated) {
        const canvasRect = canvasEl.getBoundingClientRect();
        pendingDropPos.current = {
          x: Math.max(0, translated.left - canvasRect.left),
          y: Math.max(0, translated.top  - canvasRect.top),
        };
      }
      socket.emit("draw_card");
      return;
    }
    const cardId = active?.data?.current?.cardId;
    if (!cardId) return;
    if (over?.id === "inner_draw_pile") {
      socket.emit("return_card_to_deck", { cardId });
    } else if (over?.id === "inner_discard_pile") {
      socket.emit("discard_card", { cardId });
    } else {
      onBringToFront(cardId);
      setCardPositions((prev) => {
        const next = {
          ...prev,
          [cardId]: {
            x: (prev[cardId]?.x ?? 0) + delta.x,
            y: (prev[cardId]?.y ?? 0) + delta.y,
          },
        };
        socket.emit("update_card_positions", { cardPositions: next, zOrder });
        return next;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveDragType(active?.data?.current?.draggableType ?? null)}
      onDragEnd={handleDragEnd}
    >
      <HandAreaInner
        hand={hand}
        drawPile={drawPile}
        discardPile={discardPile}
        peekCard={peekCard}
        cardPositions={displayPositions}
        zOrder={displayZOrder}
        onBringToFront={onBringToFront}
        isMe={isMe}
        handCanvasRef={handCanvasRef}
      />
      <DragOverlay dropAnimation={null}>
        {activeDragType === "draw_pile" && (
          <div
            className="rounded-xl border-2 border-brown bg-brown-deep flex items-center justify-center shadow-2xl pointer-events-none opacity-90"
            style={{ width: 176, height: 258 }}
          >
            <span className="text-5xl">🐾</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PlayerBoard({ player, isMe, isCurrentTurn, paymentZone, hideHeader = false }) {
  const [showCharacter, setShowCharacter] = useState(false);

  if (!player) return null;

  const {
    playerId,
    name,
    character,
    lives,
    isStunned,
    hand,
    drawPile,
    discardPile,
    pawTokens,
    attackTokens,
    peekCard,
  } = player;

  const maxLives = character?.maxLives ?? 9;
  const charData = CHARACTERS.find((c) => c.id === character?.id);

  return (
    <div className={`rounded-xl border-2 shadow-md overflow-visible transition-all ${isCurrentTurn ? "border-gold" : "border-ink-border/20"}`}>
      {/* Header + collapsible character section — hidden when tabs are shown */}
      {!hideHeader && <>
        <div className={`flex items-center justify-between px-4 py-2 ${isCurrentTurn ? "bg-gold-soft/20" : "bg-paper-50"}`}>
          <div className="flex items-center gap-2 flex-wrap">
            {charData?.headshot
              ? <img
                  src={(isStunned || (lives ?? 0) === 0) && charData.stunned ? charData.stunned : charData.headshot}
                  alt={name}
                  className="w-9 h-9 object-contain shrink-0"
                />
              : <span className="text-xl">{character?.emoji}</span>
            }
            <span className="font-bold text-ink">{name}</span>
            {isMe && <span className="text-ink-300 text-xs">(you)</span>}
            {isStunned && (
              <span className="text-xs text-red font-bold bg-red-soft/20 border border-red/30 rounded px-1.5 py-0.5">
                STUNNED
              </span>
            )}
            {isCurrentTurn && (
              <span className="text-xs text-gold-deep font-semibold animate-pulse">YOUR TURN</span>
            )}
            <button
              onClick={() => setShowCharacter((v) => !v)}
              className="ml-1 text-ink-300 hover:text-ink-500 transition-colors"
              title={showCharacter ? "Hide character" : "Show character"}
            >
              <span className="text-xs">{showCharacter ? "▲" : "▼"}</span>
            </button>
          </div>
        </div>
        {showCharacter && (
        <div className={`border-t border-ink-border/10 ${isCurrentTurn ? "bg-gold-soft/10" : "bg-paper-50/60"}`}>
          {charData?.image && (
            <div
              className="relative w-full h-48 overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${charData.bgFrom} 0%, ${charData.bgTo} 100%)` }}
            >
              <img src={charData.image} alt={charData.name} className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}>
                <div className="text-white font-bold text-base leading-tight">{charData.name}</div>
                <div className="text-white/60 text-xs uppercase tracking-wide">{charData.subtitle}</div>
              </div>
            </div>
          )}
          <div className="px-4 py-3 space-y-2">
            {charData?.trait && <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-300 italic">{charData.trait}</div>}
            {charData?.passive && (
              <div className="bg-gold-soft/20 border border-gold/30 rounded-lg px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-gold-deep mb-0.5">Passive</div>
                <div className="text-xs text-ink-700 font-semibold">⚡ {charData.passive}</div>
              </div>
            )}
            <div className="text-xs text-ink-300">Max lives: {maxLives}</div>
          </div>
        </div>
        )}
      </>}

      {/* Hand area — full-width row: draw pile | hand canvas | discard pile */}
      <HandArea
        hand={hand ?? []}
        drawPile={drawPile ?? []}
        discardPile={discardPile ?? []}
        peekCard={peekCard}
        isMe={isMe}
        serverCardPositions={player.cardPositions ?? {}}
        serverZOrder={player.zOrder ?? []}
      />
    </div>
  );
}
