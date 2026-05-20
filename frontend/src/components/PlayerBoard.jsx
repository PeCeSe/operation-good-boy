import { useState, useEffect } from "react";
import { useDraggable, useDroppable, DndContext, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import CHARACTERS from "../data/characters";
import PawCoin from "./PawCoin";
import HealthSlider from "./HealthSlider";
import CardComponent from "./CardComponent";
import { ATTACK_CONFIG } from "./TokenPool";
import socket from "../socket";

function StagingToken({ token }) {
  const cfg = ATTACK_CONFIG[token.type] ?? ATTACK_CONFIG.scratch;
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
      title={`${cfg.label} — drag to enemy`}
    >
      {cfg.icon}
    </div>
  );
}

// ── Hand area ─────────────────────────────────────────────────────────────────

function DraggableHandCard({ card, position }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `hcard_${card.id}`,
    data: { draggableType: "hand_card", cardId: card.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: "absolute",
        left: position.x + (transform?.x ?? 0),
        top: position.y + (transform?.y ?? 0),
        zIndex: isDragging ? 100 : 2,
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <CardComponent card={card} isPlayable={true} />
    </div>
  );
}

function HandAreaInner({ hand, drawPile, discardPile, peekCard, cardPositions, isMe }) {
  const [showBrowse, setShowBrowse] = useState(false);

  const { setNodeRef: setDrawRef, isOver: isOverDraw } = useDroppable({ id: "inner_draw_pile" });
  const { setNodeRef: setDiscardRef, isOver: isOverDiscard } = useDroppable({ id: "inner_discard_pile" });

  const drawCount = drawPile?.length ?? 0;
  const discardCount = discardPile?.length ?? 0;
  const topDiscard = discardPile?.[discardCount - 1] ?? null;

  const handleRetrieve = (cardId) => {
    socket.emit("retrieve_from_discard", { cardId });
    setShowBrowse(false);
  };

  return (
    <div className="flex gap-3 px-4 py-3 bg-stone-50 border-t border-stone-200">
      {/* ── Draw Pile ── */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Draw</div>
        <div ref={setDrawRef}>
          <button
            onClick={() => isMe && drawCount > 0 && socket.emit("draw_card")}
            disabled={!isMe || drawCount === 0}
            className={`relative rounded-xl border-2 flex items-center justify-center text-amber-600 select-none transition-all ${
              isOverDraw
                ? "border-amber-300 bg-amber-700 ring-2 ring-amber-300 ring-offset-1"
                : "border-amber-900 bg-amber-800"
            } ${isMe && drawCount > 0 ? "hover:bg-amber-700 cursor-pointer active:scale-95" : "opacity-60 cursor-default"}`}
            style={{ width: 176, height: 258 }}
            title={isMe ? (drawCount > 0 ? "Click to draw a card" : "Draw pile empty") : undefined}
          >
            <span className="text-5xl">🐾</span>
            {drawCount > 0 && (
              <span className="absolute top-2 right-2 bg-stone-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                {drawCount}
              </span>
            )}
          </button>
        </div>
        {isMe && (
          <div className="flex flex-col items-center gap-1">
            {drawCount === 0 && discardCount > 0 && (
              <button
                onClick={() => socket.emit("shuffle_discard")}
                className="text-[10px] bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700 rounded-lg px-2 py-1 transition-colors"
              >
                Shuffle ↺
              </button>
            )}
            {drawCount > 0 && (
              <button
                onClick={() => socket.emit("peek_draw_top")}
                disabled={!!peekCard}
                className="text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-500 rounded-lg px-2 py-1 disabled:opacity-40 transition-colors"
              >
                Peek 👁
              </button>
            )}
          </div>
        )}
        {!isMe && (
          <span className="text-[10px] text-stone-400">{drawCount} cards</span>
        )}
      </div>

      {/* ── Hand Canvas ── */}
      <div className="flex-1 relative" style={{ minHeight: 258 }}>
        {isMe && hand?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm italic select-none pointer-events-none">
            No cards in hand
          </div>
        )}
        {hand?.map((card) => (
          <DraggableHandCard
            key={card.id}
            card={card}
            position={cardPositions[card.id] ?? { x: 0, y: 0 }}
          />
        ))}
      </div>

      {/* ── Discard Pile ── */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Discard</div>
        <div
          ref={setDiscardRef}
          onClick={() => isMe && discardCount > 0 && setShowBrowse(true)}
          className={`relative transition-all ${isMe && discardCount > 0 ? "cursor-pointer hover:opacity-90" : "cursor-default"} ${
            isOverDiscard ? "ring-2 ring-red-400 ring-offset-1 rounded-xl" : ""
          }`}
          style={{ width: 176, height: 258 }}
          title={isMe ? (discardCount > 0 ? "Click to browse discard pile" : "Discard pile empty") : undefined}
        >
          {/* Stack illusion */}
          {discardCount > 2 && (
            <div className="absolute rounded-xl border-2 border-stone-300 bg-stone-200" style={{ width: 176, height: 258, top: 6, left: 6 }} />
          )}
          {discardCount > 1 && (
            <div className="absolute rounded-xl border-2 border-stone-300 bg-stone-200" style={{ width: 176, height: 258, top: 3, left: 3 }} />
          )}
          <div className="absolute top-0 left-0" style={{ zIndex: 2 }}>
            {topDiscard ? (
              <CardComponent card={topDiscard} isPlayable={false} />
            ) : (
              <div
                className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-stone-300 text-sm select-none"
                style={{ width: 176, height: 258 }}
              >
                Empty
              </div>
            )}
          </div>
          {discardCount > 0 && (
            <div className="absolute top-2 right-2 bg-stone-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow" style={{ zIndex: 10 }}>
              {discardCount}
            </div>
          )}
        </div>
        {!isMe && (
          <span className="text-[10px] text-stone-400">{discardCount} cards</span>
        )}
      </div>

      {/* ── Peek modal ── */}
      {isMe && peekCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={() => socket.emit("peek_to_top")}>
          <div className="bg-white rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-bold text-stone-700 mb-1">Peeked card</div>
            <CardComponent card={peekCard} isPlayable={false} />
            <div className="flex gap-2 mt-2">
              <button onClick={() => socket.emit("peek_to_hand")} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors">
                Take to hand
              </button>
              <button onClick={() => socket.emit("peek_to_top")} className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors">
                Return to top
              </button>
              <button onClick={() => socket.emit("peek_to_discard")} className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors">
                Send to discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Browse discard modal ── */}
      {showBrowse && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={() => setShowBrowse(false)}>
          <div className="bg-white rounded-xl p-4 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-stone-700">Discard Pile ({discardCount} cards)</div>
              <button onClick={() => setShowBrowse(false)} className="text-stone-400 hover:text-stone-600 text-lg leading-none">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {discardCount === 0 ? (
                <p className="text-stone-400 text-sm italic">Discard pile is empty.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discardPile.map((card) => (
                    <CardComponent key={card.id} card={card} isPlayable={true} onClick={() => handleRetrieve(card.id)} />
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-stone-400 mt-2 text-center">Click a card to retrieve it to hand</div>
          </div>
        </div>
      )}
    </div>
  );
}

function HandArea({ hand, drawPile, discardPile, peekCard, isMe }) {
  const [cardPositions, setCardPositions] = useState({});

  const handKey = (hand || []).map((c) => c.id).join(",");
  useEffect(() => {
    setCardPositions((prev) => {
      const next = { ...prev };
      const handIds = new Set((hand || []).map((c) => c.id));
      Object.keys(next).forEach((id) => { if (!handIds.has(id)) delete next[id]; });
      (hand || []).forEach((card, i) => {
        if (!next[card.id]) {
          next[card.id] = { x: i * 28, y: (i % 2) * 18 };
        }
      });
      return next;
    });
  }, [handKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleDragEnd = ({ active, over, delta }) => {
    const cardId = active?.data?.current?.cardId;
    if (!cardId) return;
    if (over?.id === "inner_draw_pile") {
      socket.emit("return_card_to_deck", { cardId });
    } else if (over?.id === "inner_discard_pile") {
      socket.emit("discard_card", { cardId });
    } else {
      setCardPositions((prev) => ({
        ...prev,
        [cardId]: {
          x: (prev[cardId]?.x ?? 0) + delta.x,
          y: (prev[cardId]?.y ?? 0) + delta.y,
        },
      }));
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <HandAreaInner
        hand={hand}
        drawPile={drawPile}
        discardPile={discardPile}
        peekCard={peekCard}
        cardPositions={cardPositions}
        isMe={isMe}
      />
    </DndContext>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PlayerBoard({ player, isMe, isCurrentTurn, paymentZone }) {
  const [showCharacter, setShowCharacter] = useState(false);

  const { setNodeRef: setStagingRef, isOver: isStagingOver } = useDroppable({ id: "staging" });

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

  const handleSetLives = (newLives) => {
    socket.emit("set_lives", { playerId, lives: newLives });
  };

  const handleGainToken = () => {
    socket.emit("set_paw_tokens", { tokens: (pawTokens ?? 0) + 1 });
  };

  const handleMoveTokenToPayment = () => {
    if ((pawTokens ?? 0) <= 0) return;
    socket.emit("set_paw_tokens", { tokens: (pawTokens ?? 0) - 1 });
    socket.emit("place_payment", { tokens: (paymentZone?.tokens ?? 0) + 1 });
  };

  const handleEndTurn = () => socket.emit("end_turn");

  const displayTokens = Math.min(pawTokens ?? 0, 12);
  const extraTokens = (pawTokens ?? 0) - 12;

  return (
    <div className={`rounded-xl border-2 shadow-md overflow-visible transition-all ${isCurrentTurn ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${isCurrentTurn ? "bg-amber-50" : "bg-stone-50"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {charData?.headshot
            ? <img
                src={isStunned && charData.stunned ? charData.stunned : charData.headshot}
                alt={name}
                className="w-9 h-9 object-contain shrink-0"
              />
            : <span className="text-xl">{character?.emoji}</span>
          }
          <span className="font-bold text-stone-800">{name}</span>
          {isMe && <span className="text-stone-400 text-xs">(you)</span>}
          {isStunned && (
            <span className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
              STUNNED
            </span>
          )}
          {isCurrentTurn && (
            <span className="text-xs text-amber-600 font-semibold animate-pulse">YOUR TURN</span>
          )}
          <button
            onClick={() => setShowCharacter((v) => !v)}
            className="ml-1 text-stone-400 hover:text-stone-600 transition-colors"
            title={showCharacter ? "Hide character" : "Show character"}
          >
            <span className="text-xs">{showCharacter ? "▲" : "▼"}</span>
          </button>
        </div>
        <HealthSlider lives={lives ?? 0} maxLives={maxLives} onChange={handleSetLives} disabled={false} />
      </div>

      {/* Collapsible character section */}
      {showCharacter && (
        <div className={`border-t border-stone-100 ${isCurrentTurn ? "bg-amber-50/60" : "bg-stone-50/60"}`}>
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
            {charData?.trait && <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 italic">{charData.trait}</div>}
            {charData?.passive && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-0.5">Passive</div>
                <div className="text-xs text-stone-700 font-semibold">⚡ {charData.passive}</div>
              </div>
            )}
            <div className="text-xs text-stone-400">Max lives: {maxLives}</div>
          </div>
        </div>
      )}

      {/* Resources row */}
      <div className="bg-white border-t border-b border-stone-200 px-4 py-3 flex items-start gap-4 flex-wrap">
        {/* Pawcoin wallet */}
        {isMe ? (
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Pawcoins</div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleGainToken}
                className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-white font-bold text-lg flex items-center justify-center transition-colors shadow"
                title="Gain 1 pawcoin"
              >
                +
              </button>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {Array.from({ length: displayTokens }).map((_, i) => (
                  <button
                    key={i}
                    onClick={handleMoveTokenToPayment}
                    className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                    title="Move 1 coin to payment zone"
                  >
                    <PawCoin className="w-6 h-6" />
                  </button>
                ))}
                {extraTokens > 0 && (
                  <span className="text-xs text-stone-400 self-center">+{extraTokens} more</span>
                )}
              </div>
              <span className="text-sm text-amber-700 font-semibold ml-1">{pawTokens ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <PawCoin className="w-5 h-5" />
            <span className="text-sm text-amber-700 font-semibold">{pawTokens ?? 0}</span>
            <span className="text-xs text-stone-400">pawcoins</span>
          </div>
        )}

        <div className="w-px h-12 bg-stone-200 flex-shrink-0 self-center" />

        {/* Attack staging area */}
        {isMe && (
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Attacks</div>
            <div
              ref={setStagingRef}
              className={`flex flex-wrap gap-1.5 min-h-[2.5rem] min-w-[4rem] rounded-lg px-2 py-1 border-2 border-dashed transition-colors ${
                isStagingOver ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-stone-50"
              }`}
            >
              {(attackTokens ?? []).map((token) => (
                <StagingToken key={token.id} token={token} />
              ))}
              {(attackTokens ?? []).length === 0 && (
                <span className={`text-[9px] italic self-center transition-colors ${isStagingOver ? "text-amber-400" : "text-stone-300"}`}>
                  {isStagingOver ? "Drop!" : "Empty"}
                </span>
              )}
            </div>
          </div>
        )}
        {!isMe && (attackTokens ?? []).length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Attacks</div>
            <div className="flex flex-wrap gap-1">
              {(attackTokens ?? []).map((token) => {
                const cfg = ATTACK_CONFIG[token.type] ?? ATTACK_CONFIG.scratch;
                return (
                  <div key={token.id} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm ${cfg.bg} ${cfg.border}`}>
                    {cfg.icon}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* End Turn */}
        {isMe && (
          <button
            onClick={handleEndTurn}
            className="ml-auto self-center bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2 rounded-lg transition-colors"
          >
            End Turn →
          </button>
        )}
      </div>

      {/* Hand area — full-width row: draw pile | hand canvas | discard pile */}
      <HandArea
        hand={hand ?? []}
        drawPile={drawPile ?? []}
        discardPile={discardPile ?? []}
        peekCard={peekCard}
        isMe={isMe}
      />
    </div>
  );
}
