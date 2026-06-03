import { useState, useEffect, useRef } from "react";
import { useDraggable, useDroppable, DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CHARACTERS from "../data/characters";
import SKINS from "../data/skins";
import { getDisplayData } from "../data/getDisplayData";
import CardComponent from "./CardComponent";
import PawCoin from "./PawCoin";
import { ATTACK_CONFIG } from "./TokenPool";
import socket from "../socket";

const CARD_W  = 176;
const CARD_H  = 258;
const TIDY_Y  = 30;
const SORTED_GAP = 12;

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

function DraggableHandCard({ card, position, zIndex, onBringToFront, isMe, isSelected, onToggleSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `hcard_${card.id}`,
    data: { draggableType: "hand_card", cardId: card.id },
    disabled: !isMe,
  });

  return (
    <div
      onPointerDown={(e) => {
        if (!isMe) return;
        e.stopPropagation(); // prevent marquee start on canvas
        if (e.shiftKey) { onToggleSelect?.(card.id); return; }
        onBringToFront(card.id);
      }}
      style={{
        position: "absolute",
        left: position.x + (transform?.x ?? 0),
        top: position.y + (transform?.y ?? 0),
        zIndex: isDragging ? 1000 : zIndex,
        opacity: 1,
        touchAction: "none",
        transform: isDragging ? "rotate(2deg)" : undefined,
        transition: isDragging ? "none" : "transform 150ms ease",
      }}
    >
      <div
        ref={setNodeRef}
        {...(isMe ? { ...listeners, ...attributes } : {})}
        className={isSelected ? "rounded-xl ring-2 ring-moss ring-offset-1" : ""}
      >
        <CardComponent
          card={card}
          isPlayable={isMe}
          forceFullOpacity
          className={isMe ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}
        />
      </div>
    </div>
  );
}

function SortableHandCard({ card, isMe }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !isMe,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none",
        flexShrink: 0,
        opacity: isDragging ? 0.25 : 1,
      }}
      {...(isMe ? { ...attributes, ...listeners } : {})}
    >
      <CardComponent
        card={card}
        isPlayable={isMe}
        forceFullOpacity
        className={isMe ? "cursor-grab" : ""}
      />
    </div>
  );
}

function HandAreaInner({ hand, drawPile, discardPile, peekCard, cardPositions, zOrder, onBringToFront, isMe, handCanvasRef, handLayout = "tidy", sortedCardOrder, viewerCursors = {}, onCursorMove, onCursorLeave, selectedCards = new Set(), onToggleSelect, marquee, onCanvasPointerDown }) {
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
    <div
      className="flex gap-3 px-4 py-3 bg-paper-50 border-t border-ink-border/20 relative"
      style={{ minWidth: 900 }}
      onPointerMove={onCursorMove ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onCursorMove(e.clientX - rect.left, e.clientY - rect.top);
      } : undefined}
      onPointerLeave={onCursorLeave}
    >
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
      <div ref={handCanvasRef} className="flex-1 relative" style={{ minHeight: 320 }} onPointerDown={onCanvasPointerDown}>
        {isMe && hand?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-ink-300/60 text-sm italic select-none pointer-events-none">
            No cards in hand
          </div>
        )}
        {handLayout === "sorted" ? (
          <SortableContext items={(sortedCardOrder || []).filter(id => hand?.some(c => c.id === id))} strategy={horizontalListSortingStrategy}>
            <div className="absolute inset-0 flex items-center gap-3 px-2 overflow-x-auto" style={{ top: TIDY_Y }}>
              {hand?.map(card => (
                <SortableHandCard key={card.id} card={card} isMe={isMe} />
              ))}
            </div>
          </SortableContext>
        ) : (
          hand?.map((card, i) => (
            <DraggableHandCard
              key={card.id}
              card={card}
              position={cardPositions[card.id] ?? { x: i * 28, y: TIDY_Y }}
              zIndex={zOrder.indexOf(card.id) + 2}
              onBringToFront={onBringToFront}
              isMe={isMe}
              isSelected={selectedCards.has(card.id)}
              onToggleSelect={onToggleSelect}
            />
          ))
        )}
        {/* Marquee selection rectangle */}
        {marquee && (
          <div
            style={{
              position: "absolute",
              left: Math.min(marquee.x1, marquee.x2),
              top: Math.min(marquee.y1, marquee.y2),
              width: Math.abs(marquee.x2 - marquee.x1),
              height: Math.abs(marquee.y2 - marquee.y1),
              border: "2px dashed #5b8a4a",
              background: "rgba(91,138,74,0.08)",
              pointerEvents: "none",
              zIndex: 500,
              borderRadius: 4,
            }}
          />
        )}
      </div>

      <div className="w-px bg-ink-border/20 self-stretch shrink-0" />

      {/* ── Discard Pile ── */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="text-[9px] text-ink-300 uppercase tracking-[0.12em] font-bold">
          {isMe && selectedCards.size > 1
            ? <span className="text-moss font-bold">{selectedCards.size} selected — drag to discard</span>
            : "Discard"
          }
        </div>
        <div
          ref={setDiscardRef}
          onClick={() => isMe && discardCount > 0 && setShowBrowse(true)}
          className={`relative transition-all ${isMe && discardCount > 0 ? "cursor-pointer hover:opacity-90" : "cursor-default"} ${
            isOverDiscard ? "ring-2 ring-red ring-offset-1 rounded-xl" : isMe && selectedCards.size > 1 ? "ring-2 ring-moss/40 ring-offset-1 rounded-xl" : ""
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

      {/* ── Hand cursor overlays ── */}
      {Object.entries(viewerCursors).map(([socketId, cursor]) => (
        <div
          key={socketId}
          style={{ position: "absolute", left: cursor.x, top: cursor.y, pointerEvents: "none", zIndex: 9999 }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))", display: "block" }}>
            <path d="M0 0 L0 16 L4.5 12 L7.5 19 L10 18 L7 11 L12 11 Z" fill={cursor.color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <div style={{
            background: cursor.color,
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            marginTop: 1,
            marginLeft: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}>
            {cursor.name}
          </div>
        </div>
      ))}

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

function HandArea({ hand, drawPile, discardPile, peekCard, isMe, serverCardPositions, serverZOrder, handLayout = "tidy", serverCardOrder = [], targetPlayerId, viewerCursors = {}, myColor, myName }) {
  const [cardPositions, setCardPositions] = useState({});
  const [zOrder, setZOrder] = useState([]);
  const [cardOrder, setCardOrder] = useState([]);
  const [activeDragType, setActiveDragType] = useState(null);
  const [activeSortCardId, setActiveSortCardId] = useState(null);
  const [pendingDiscards, setPendingDiscards] = useState(new Set());
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [marquee, setMarquee] = useState(null);
  const pendingDropPos = useRef(null);
  const handCanvasRef = useRef(null);
  const lastCursorEmit = useRef(0);

  // Clear selection when hand changes (new turn, card discarded by server, etc.)
  useEffect(() => {
    setSelectedCards(prev => {
      if (prev.size === 0) return prev;
      const ids = new Set((hand || []).map(c => c.id));
      const next = new Set([...prev].filter(id => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [hand]); // eslint-disable-line react-hooks/exhaustive-deps

  const onToggleSelect = (cardId) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId);
      return next;
    });
  };

  const onCanvasPointerDown = (e) => {
    if (!isMe || handLayout === "sorted") return;
    e.preventDefault();
    const canvas = handCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    // Snapshot positions at gesture start (avoids stale closure issues)
    const snapPositions = { ...displayPositions };
    const snapHand = [...(hand || [])];
    let curX = startX, curY = startY;

    setMarquee({ x1: startX, y1: startY, x2: startX, y2: startY });

    const onMove = (ev) => {
      const r = canvas.getBoundingClientRect();
      curX = ev.clientX - r.left;
      curY = ev.clientY - r.top;
      setMarquee({ x1: startX, y1: startY, x2: curX, y2: curY });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setMarquee(null);
      if (Math.abs(curX - startX) < 6 && Math.abs(curY - startY) < 6) {
        setSelectedCards(new Set()); // click on background = deselect all
        return;
      }
      const minX = Math.min(startX, curX), maxX = Math.max(startX, curX);
      const minY = Math.min(startY, curY), maxY = Math.max(startY, curY);
      const hit = new Set();
      for (const card of snapHand) {
        const pos = snapPositions[card.id];
        if (!pos) continue;
        if (pos.x < maxX && pos.x + CARD_W > minX && pos.y < maxY && pos.y + CARD_H > minY) {
          hit.add(card.id);
        }
      }
      setSelectedCards(hit);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleCursorMove = (x, y) => {
    if (!targetPlayerId) return;
    const now = Date.now();
    if (now - lastCursorEmit.current < 50) return;
    lastCursorEmit.current = now;
    socket.emit("hand_cursor", { targetPlayerId, x, y, name: myName ?? "", color: myColor ?? "#f59e0b" });
  };

  const handleCursorLeave = () => {
    if (!targetPlayerId) return;
    socket.emit("hand_cursor_leave", { targetPlayerId });
  };

  // Clear pending discards once the server confirms them (card gone from hand)
  useEffect(() => {
    if (pendingDiscards.size === 0) return;
    const handIds = new Set((hand || []).map(c => c.id));
    setPendingDiscards(prev => {
      const next = new Set([...prev].filter(id => handIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [hand]); // eslint-disable-line react-hooks/exhaustive-deps

  const onBringToFront = (cardId) => {
    if (!isMe) return;
    setZOrder(prev => {
      const next = [...prev.filter(id => id !== cardId), cardId];
      socket.emit("update_card_positions", { cardPositions, zOrder: next });
      return next;
    });
  };

  // For free/tidy: use local positions for self, server positions for others
  const displayPositions = isMe ? cardPositions : (serverCardPositions ?? {});
  const displayZOrder    = isMe ? zOrder        : (serverZOrder ?? []);

  // For sorted: derive display order
  const handIds = (hand || []).map(c => c.id);
  const displayCardOrder = isMe
    ? [...cardOrder.filter(id => handIds.includes(id)), ...handIds.filter(id => !cardOrder.includes(id))]
    : [...(serverCardOrder ?? []).filter(id => handIds.includes(id)), ...handIds.filter(id => !(serverCardOrder ?? []).includes(id))];

  // Sync when hand changes
  const handKey = handIds.join(",");
  useEffect(() => {
    if (!isMe) return;
    // Sync card positions (free/tidy)
    setCardPositions((prev) => {
      const seed = serverCardPositions ?? {};
      const next = { ...prev };
      const handSet = new Set(handIds);
      Object.keys(next).forEach(id => { if (!handSet.has(id)) delete next[id]; });
      (hand || []).forEach((card, i) => {
        if (!next[card.id]) {
          if (pendingDropPos.current) {
            next[card.id] = pendingDropPos.current;
            pendingDropPos.current = null;
          } else if (seed[card.id]) {
            next[card.id] = seed[card.id];
          } else {
            next[card.id] = { x: i * 28, y: TIDY_Y };
          }
        }
      });
      return next;
    });
    if (serverZOrder?.length && zOrder.length === 0) setZOrder(serverZOrder);
    // Sync cardOrder (sorted)
    setCardOrder(prev => {
      const prevFiltered = prev.filter(id => handIds.includes(id));
      const newCards = handIds.filter(id => !prev.includes(id));
      return [...prevFiltered, ...newCards];
    });
  }, [handKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // ── Free/Tidy drag end ─────────────────────────────────────────────────────
  const handleDragEnd = ({ active, over, delta }) => {
    setActiveDragType(null);
    if (active?.data?.current?.draggableType === "draw_pile") {
      const canvasEl = handCanvasRef.current;
      const translated = active.rect.current?.translated;
      if (canvasEl && translated) {
        const canvasRect = canvasEl.getBoundingClientRect();
        const rawX = Math.max(0, translated.left - canvasRect.left);
        const rawY = Math.max(0, translated.top  - canvasRect.top);
        pendingDropPos.current = {
          x: handLayout === "free" ? Math.min(rawX, Math.max(0, canvasEl.clientWidth - CARD_W)) : rawX,
          y: handLayout === "tidy" ? TIDY_Y : Math.min(rawY, Math.max(0, 320 - CARD_H)),
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
      if (selectedCards.size > 1 && selectedCards.has(cardId)) {
        // Multi-discard: discard all selected cards at once
        const toDiscard = [...selectedCards];
        setPendingDiscards(prev => new Set([...prev, ...toDiscard]));
        toDiscard.forEach(id => socket.emit("discard_card", { cardId: id }));
        setSelectedCards(new Set());
      } else {
        setPendingDiscards(prev => new Set([...prev, cardId]));
        socket.emit("discard_card", { cardId });
      }
    } else {
      onBringToFront(cardId);
      setCardPositions((prev) => {
        const rawX = (prev[cardId]?.x ?? 0) + delta.x;
        const rawY = (prev[cardId]?.y ?? 0) + delta.y;
        const canvasW = handCanvasRef.current?.clientWidth ?? 9999;
        const clampedX = Math.max(0, Math.min(rawX, canvasW - CARD_W));
        const next = {
          ...prev,
          [cardId]: {
            x: clampedX,
            y: handLayout === "tidy" ? TIDY_Y : Math.max(0, Math.min(rawY, 320 - CARD_H)),
          },
        };
        socket.emit("update_card_positions", { cardPositions: next, zOrder });
        return next;
      });
    }
  };

  // ── Sorted drag over (live reorder during drag) ───────────────────────────
  const handleSortedDragOver = ({ active, over }) => {
    if (!over || !isMe || active.id === over.id) return;
    if (over.id === "inner_draw_pile" || over.id === "inner_discard_pile") return;
    setCardOrder(prev => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // ── Sorted drag start ─────────────────────────────────────────────────────
  const handleSortedDragStart = ({ active }) => {
    setActiveSortCardId(active.id);
  };

  // ── Sorted drag end ────────────────────────────────────────────────────────
  const handleSortedDragEnd = ({ active, over }) => {
    setActiveSortCardId(null);
    if (!isMe) return;
    if (over?.id === "inner_draw_pile") {
      socket.emit("return_card_to_deck", { cardId: active.id });
      return;
    }
    if (over?.id === "inner_discard_pile") {
      setPendingDiscards(prev => new Set([...prev, active.id]));
      socket.emit("discard_card", { cardId: active.id });
      return;
    }
    // State already updated live in onDragOver — just sync to server
    setCardOrder(prev => {
      socket.emit("update_hand_layout", { handLayout: "sorted", cardOrder: prev });
      return prev;
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const visibleHand = (hand || []).filter(c => !pendingDiscards.has(c.id));

  if (handLayout === "sorted") {
    const sortedHand = displayCardOrder.map(id => visibleHand.find(c => c.id === id)).filter(Boolean);
    const activeSortCard = activeSortCardId ? (hand || []).find(c => c.id === activeSortCardId) : null;
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleSortedDragStart} onDragOver={handleSortedDragOver} onDragEnd={handleSortedDragEnd}>
        <HandAreaInner
          hand={sortedHand}
          drawPile={drawPile}
          discardPile={discardPile}
          peekCard={peekCard}
          cardPositions={null}
          zOrder={[]}
          onBringToFront={() => {}}
          isMe={isMe}
          handCanvasRef={handCanvasRef}
          handLayout="sorted"
          sortedCardOrder={displayCardOrder}
          activeSortCardId={activeSortCardId}
          viewerCursors={viewerCursors}
          onCursorMove={handleCursorMove}
          onCursorLeave={handleCursorLeave}
          selectedCards={selectedCards}
          onToggleSelect={onToggleSelect}
          marquee={null}
          onCanvasPointerDown={null}
        />
        <DragOverlay dropAnimation={null}>
          {activeSortCard && (
            <CardComponent card={activeSortCard} isPlayable={false} forceFullOpacity className="cursor-grabbing rotate-2 shadow-2xl" />
          )}
        </DragOverlay>
      </DndContext>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveDragType(active?.data?.current?.draggableType ?? null)}
      onDragEnd={handleDragEnd}
    >
      <HandAreaInner
        hand={visibleHand}
        drawPile={drawPile}
        discardPile={discardPile}
        peekCard={peekCard}
        cardPositions={displayPositions}
        zOrder={displayZOrder}
        onBringToFront={onBringToFront}
        isMe={isMe}
        handCanvasRef={handCanvasRef}
        handLayout={handLayout}
        sortedCardOrder={null}
        viewerCursors={viewerCursors}
        onCursorMove={handleCursorMove}
        onCursorLeave={handleCursorLeave}
        selectedCards={selectedCards}
        onToggleSelect={onToggleSelect}
        marquee={marquee}
        onCanvasPointerDown={onCanvasPointerDown}
      />
      <DragOverlay dropAnimation={null}>
        {activeDragType === "draw_pile" && (
          <div
            className="rounded-xl border-2 border-brown bg-brown-deep flex items-center justify-center shadow-2xl pointer-events-none opacity-90"
            style={{ width: CARD_W, height: CARD_H }}
          >
            <span className="text-5xl">🐾</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PlayerBoard({ player, isMe, isCurrentTurn, paymentZone, hideHeader = false, viewerCursors = {}, myColor, myName }) {
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
  const charData = getDisplayData(player, SKINS, CHARACTERS);

  return (
    <div className={`overflow-visible transition-all ${hideHeader ? "" : `rounded-xl border-2 shadow-md ${isCurrentTurn ? "border-gold" : "border-ink-border/20"}`}`}>
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
            {charData?.backstory && <div className="text-xs text-ink-500 italic leading-snug">{charData.backstory}</div>}
            <div className="text-xs text-ink-300">Max lives: {maxLives}</div>
          </div>
        </div>
        )}
      </>}

      {/* Compact stats — shown for other players' tabs */}
      {hideHeader && !isMe && (
        <div className="flex items-center gap-5 px-4 py-2.5 border-b border-ink-border/15">
          {/* Lives */}
          <div className="flex items-center gap-1.5">
            <span className={`text-lg leading-none ${(lives ?? 0) === 0 ? "text-ink-300" : "text-red"}`}>♥</span>
            <span className="font-bold text-ink text-sm">{lives ?? 0}</span>
            <span className="text-ink-300 text-xs">/ {maxLives}</span>
          </div>
          {/* Pawcoins */}
          <div className="flex items-center gap-1.5">
            <PawCoin className="w-4 h-4" />
            <span className="font-bold text-gold-deep text-sm">{pawTokens ?? 0}</span>
          </div>
          {/* Attack tokens */}
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{ATTACK_CONFIG.attack.icon}</span>
            <span className="font-bold text-ink text-sm">{attackTokens?.length ?? 0}</span>
          </div>
          {/* Stunned badge */}
          {(lives ?? 0) === 0 && (
            <span className="text-xs text-red font-bold bg-red/10 border border-red/30 rounded px-1.5 py-0.5 ml-1">
              STUNNED
            </span>
          )}
          {/* Character info toggle */}
          <button
            onClick={() => setShowCharacter((v) => !v)}
            className={`ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
              showCharacter
                ? "bg-ink-700 text-white border-ink-700"
                : "text-ink-400 border-ink-border/30 hover:text-ink-600 hover:border-ink-border/60"
            }`}
          >
            {charData?.headshot && (
              <img src={charData.headshot} alt="" className="w-4 h-4 object-contain rounded-full" />
            )}
            {showCharacter ? "← Hand" : "Character"}
          </button>
        </div>
      )}

      {/* My tab header — just the character toggle button, no stats (those live in the HUD strip) */}
      {hideHeader && isMe && (
        <div className="flex items-center justify-end px-4 py-2.5 border-b border-ink-border/15">
          <button
            onClick={() => setShowCharacter((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
              showCharacter
                ? "bg-ink-700 text-white border-ink-700"
                : "text-ink-400 border-ink-border/30 hover:text-ink-600 hover:border-ink-border/60"
            }`}
          >
            {charData?.headshot && (
              <img src={charData.headshot} alt="" className="w-4 h-4 object-contain rounded-full" />
            )}
            {showCharacter ? "← Hand" : "Character"}
          </button>
        </div>
      )}

      {/* Character info panel — shown when toggled */}
      {hideHeader && showCharacter && charData && (
        <div className="px-5 py-4 border-b border-ink-border/10">
          <div className="flex gap-5 max-w-xl">
            {/* Portrait */}
            {charData.image && (
              <div
                className="shrink-0 rounded-xl overflow-hidden w-36"
                style={{ background: `linear-gradient(160deg, ${charData.bgFrom} 0%, ${charData.bgTo} 100%)` }}
              >
                <img src={charData.image} alt={charData.name} className="w-full h-full object-contain object-bottom" />
              </div>
            )}
            {/* Text */}
            <div className="flex flex-col justify-center gap-2 min-w-0">
              <div>
                <div className="font-bold text-base text-ink-700 leading-tight">{charData.name}</div>
                <div className="text-xs text-ink-400 uppercase tracking-wide mt-0.5">{charData.subtitle}</div>
              </div>
              {charData.backstory && (
                <p className="text-xs text-ink-500 italic leading-snug">{charData.backstory}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hand area — hidden when character info is shown */}
      {(!hideHeader || !showCharacter) && <HandArea
        hand={hand ?? []}
        drawPile={drawPile ?? []}
        discardPile={discardPile ?? []}
        peekCard={peekCard}
        isMe={isMe}
        serverCardPositions={player.cardPositions ?? {}}
        serverZOrder={player.zOrder ?? []}
        handLayout={player.handLayout ?? "tidy"}
        serverCardOrder={player.cardOrder ?? []}
        targetPlayerId={playerId}
        viewerCursors={viewerCursors}
        myColor={myColor}
        myName={myName}
      />}
    </div>
  );
}
