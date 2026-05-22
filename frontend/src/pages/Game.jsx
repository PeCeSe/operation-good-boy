import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import LocationBar from "../components/LocationBar";
import EnemySlot from "../components/EnemySlot";
import { EnemyCardDisplay } from "../components/EnemyComponent";
import ShopRow from "../components/ShopRow";
import EventDeck, { EventCardDisplay } from "../components/EventDeck";
import GameLog from "../components/GameLog";
import TokenPool, { ATTACK_CONFIG } from "../components/TokenPool";
import PlayerHUD from "../components/PlayerHUD";
import socket from "../socket";

const BOARD_W = 1700;
const BOARD_H = 1300;

function DragChip({ attackType }) {
  const cfg = ATTACK_CONFIG[attackType] ?? ATTACK_CONFIG.scratch;
  return (
    <div
      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg shadow-xl pointer-events-none ${cfg.bg} ${cfg.border}`}
    >
      {cfg.icon}
    </div>
  );
}

function EnemyDrawPile({ count, canDraw }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "enemy_deck_draw",
    data: { draggableType: "enemy_deck_draw" },
    disabled: !canDraw,
  });

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="text-[9px] text-stone-600 uppercase tracking-widest font-bold">Villain Deck</div>
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => canDraw && socket.emit("draw_enemy")}
        disabled={!canDraw}
        className={`relative rounded-xl border-2 flex items-center justify-center select-none transition-all ${
          canDraw
            ? "border-stone-900 bg-stone-700 hover:bg-stone-600 cursor-pointer active:scale-95"
            : "border-stone-400 bg-stone-300 cursor-default opacity-60"
        } ${isDragging ? "opacity-40" : ""}`}
        style={{ width: 286, height: 213, touchAction: "none" }}
        title={canDraw ? "Click or drag to draw a villain" : count === 0 ? "Deck empty" : "All slots full"}
      >
        <span className="text-6xl">👾</span>
        {count > 0 && (
          <span className="absolute top-2 right-2 bg-stone-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}

function EnemyDiscardPile({ enemyDiscard }) {
  const { setNodeRef, isOver } = useDroppable({ id: "enemy_discard" });
  const count = enemyDiscard?.length ?? 0;
  const topEnemy = enemyDiscard?.[count - 1] ?? null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="text-[9px] text-stone-600 uppercase tracking-widest font-bold">Defeated</div>
      <div
        ref={setNodeRef}
        className={`relative rounded-xl transition-all ${isOver ? "ring-2 ring-red-400 ring-offset-2" : ""}`}
        style={{ width: 286, height: 213 }}
      >
        {/* Stack illusion */}
        {count > 2 && <div className="absolute rounded-xl border-2 border-stone-400 bg-stone-300" style={{ width: 286, height: 213, top: 6, left: 6 }} />}
        {count > 1 && <div className="absolute rounded-xl border-2 border-stone-400 bg-stone-300" style={{ width: 286, height: 213, top: 3, left: 3 }} />}
        <div className="absolute top-0 left-0" style={{ zIndex: 2 }}>
          {topEnemy ? (
            <EnemyCardDisplay enemy={topEnemy} />
          ) : (
            <div
              className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                isOver ? "border-red-400 bg-red-50" : "border-stone-400 bg-stone-100/60"
              }`}
              style={{ width: 286, height: 213 }}
            >
              <span className="text-3xl opacity-40">💀</span>
              <span className={`text-xs font-semibold ${isOver ? "text-red-500" : "text-stone-400"}`}>
                {isOver ? "Drop to defeat!" : "Drag defeated villains here"}
              </span>
            </div>
          )}
        </div>
        {count > 0 && (
          <div className="absolute top-2 right-2 bg-stone-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow" style={{ zIndex: 10 }}>
            {count}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyEnemySlot() {
  return (
    <div className="flex flex-col gap-2" style={{ width: 286 }}>
      <div
        className="bg-stone-300/30 rounded-xl border-2 border-dashed border-stone-400/40 flex items-center justify-center"
        style={{ height: 213 }}
      >
        <span className="text-stone-400/50 text-sm select-none">—</span>
      </div>
      <div className="h-16 rounded-xl border-2 border-dashed border-stone-300/40 bg-stone-200/20" />
    </div>
  );
}

function ShopDeckPile({ count }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-24 h-32 bg-amber-800 rounded-xl border-2 border-amber-900 flex flex-col items-center justify-center shadow-lg gap-1">
        <span className="text-4xl">🃏</span>
        <span className="text-amber-200 font-bold text-sm">{count}</span>
      </div>
      <div className="text-[9px] text-stone-600 uppercase tracking-wide font-bold">Shop Deck</div>
    </div>
  );
}

export default function Game({ gameState, mySocketId }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const panState = useRef({ active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const [activeDrag, setActiveDrag] = useState(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const clampZoom = (z) => Math.max(0.25, Math.min(2, z));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Desktop: ctrl+scroll
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z + (e.deltaY < 0 ? 0.05 : -0.05)));
    };

    // Mobile: pinch-to-zoom
    const pinch = { active: false, dist: 0, zoom: 1 };
    const getDist = (t) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinch.active = true;
        pinch.dist = getDist(e.touches);
        pinch.zoom = zoomRef.current;
      } else {
        pinch.active = false;
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinch.active) {
        e.preventDefault();
        setZoom(clampZoom(pinch.zoom * (getDist(e.touches) / pinch.dist)));
      }
    };
    const onTouchEnd = () => { pinch.active = false; };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleBgPointerDown = useCallback((e) => {
    const c = containerRef.current;
    if (!c) return;
    panState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: c.scrollLeft,
      scrollTop: c.scrollTop,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  }, []);

  const handleBgPointerMove = useCallback((e) => {
    const p = panState.current;
    if (!p.active || !containerRef.current) return;
    containerRef.current.scrollLeft = p.scrollLeft - (e.clientX - p.startX);
    containerRef.current.scrollTop = p.scrollTop - (e.clientY - p.startY);
  }, []);

  const handleBgPointerEnd = useCallback((e) => {
    panState.current.active = false;
    e.currentTarget.style.cursor = "grab";
  }, []);

  const {
    phase,
    currentPlayerId,
    roundNumber,
    players,
    enemies,
    enemyDeck,
    enemyDiscard,
    currentLocation,
    lostLocations,
    shop,
    shopDeck,
    eventDeck,
    activeEvents,
    eventDiscard,
    paymentZone,
    log,
  } = gameState;

  const me = players.find((p) => p.socketId === mySocketId);
  const isMyTurn = me?.playerId === currentPlayerId;
  const currentPlayerName = players.find((p) => p.playerId === currentPlayerId)?.name;
  const otherPlayers = players.filter((p) => p.socketId !== mySocketId);

  function handleDragStart({ active }) {
    setActiveDrag(active.data.current ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null);
    const data = active.data.current ?? {};
    if (data.draggableType === "enemy_deck_draw") {
      socket.emit("draw_enemy");
      return;
    }
    if (data.draggableType === "event_deck_draw") {
      socket.emit("draw_event");
      return;
    }
    if (!over) return;
    if (data.draggableType === "pool_token" && over.id === "staging") {
      socket.emit("add_attack_token", { type: data.attackType });
    } else if (data.draggableType === "staging_token" && over.id !== "staging") {
      socket.emit("move_token_to_enemy", { enemyId: String(over.id), tokenId: data.tokenId });
    } else if (data.draggableType === "event_card" && over.id === "event_discard") {
      socket.emit("discard_event", { eventId: data.eventId });
    } else if (data.draggableType === "enemy_card" && over.id === "enemy_discard") {
      socket.emit("defeat_enemy", { enemyId: data.enemyId });
    }
  }

  if (phase === "victory") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-amber-50">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-bold text-amber-600">Victory!</h1>
        <p className="text-stone-500">Good Boy has been defeated. The neighborhood is safe.</p>
        <p className="text-stone-400 text-sm italic">For now.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (phase === "defeat") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">🥒</div>
        <h1 className="text-4xl font-bold text-red-400">Defeat</h1>
        <p className="text-stone-500">The neighborhood is overrun with cucumbers.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-stone-300 hover:bg-stone-400 font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* ── Scrollable canvas ── */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          inset: 0,
          bottom: 0,
          overflow: "auto",
          scrollbarWidth: "none",
          paddingBottom: 560,
          display: "flex",
        }}
      >
        {/* Scroll-space wrapper — margin:auto centers when board < viewport, normal scroll when larger */}
        <div style={{ width: BOARD_W * zoom, height: BOARD_H * zoom, position: "relative", flexShrink: 0, margin: "auto" }}>
        {/* Board surface — scaled */}
        <div
          style={{
            width: BOARD_W,
            height: BOARD_H,
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            background: "linear-gradient(160deg, #d6bc96 0%, #c4a872 50%, #c8aa78 100%)",
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.15)",
          }}
        >
          {/* Pan background — behind everything */}
          <div
            style={{ position: "absolute", inset: 0, zIndex: 0, cursor: "grab" }}
            onPointerDown={handleBgPointerDown}
            onPointerMove={handleBgPointerMove}
            onPointerUp={handleBgPointerEnd}
            onPointerLeave={handleBgPointerEnd}
          />

          {/* ── Header bar ── */}
          <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
            <div className="flex items-center gap-3 bg-stone-900/75 backdrop-blur-sm rounded-full px-5 py-2 text-white text-sm shadow-lg">
              <span className="text-amber-400 font-bold tracking-wide">🐾 Operation: Good Boy</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300">Round {roundNumber}</span>
              <span className="text-stone-500">·</span>
              {isMyTurn
                ? <span className="text-amber-300 font-semibold animate-pulse">Your turn!</span>
                : <span className="text-stone-400">{currentPlayerName}'s turn</span>
              }
            </div>
          </div>

          {/* ══════════════════════════════════
              LEFT HALF — game area
          ══════════════════════════════════ */}

          {/* ── Location (top-left) ── */}
          <div style={{ position: "absolute", top: 60, left: 40, zIndex: 1 }}>
            <LocationBar
              currentLocation={currentLocation}
              lostLocations={lostLocations ?? []}
              totalLocations={3}
            />
          </div>

          {/* ── Events (right of location) ── */}
          <div style={{ position: "absolute", top: 60, left: 360, zIndex: 1 }}>
            <div className="text-[9px] text-stone-600 uppercase tracking-widest font-bold mb-2">
              Events
            </div>
            <EventDeck
              eventDeck={eventDeck ?? []}
              activeEvents={activeEvents ?? []}
              eventDiscard={eventDiscard ?? []}
            />
          </div>

          {/* ── Villain deck + discard (row 1) ── */}
          <div style={{ position: "absolute", top: 310, left: 40, zIndex: 1, display: "flex", gap: 24 }}>
            <EnemyDrawPile
              count={enemyDeck?.length ?? 0}
              canDraw={(enemyDeck?.length ?? 0) > 0 && (enemies?.length ?? 0) < 3}
            />
            <EnemyDiscardPile enemyDiscard={enemyDiscard ?? []} />
          </div>

          {/* ── Enemy slots row (row 2) ── */}
          <div style={{ position: "absolute", top: 560, left: 40, display: "flex", gap: 16, zIndex: 1 }}>
            {Array.from({ length: 3 }).map((_, i) =>
              enemies[i] ? (
                <EnemySlot key={enemies[i].id} enemy={enemies[i]} />
              ) : (
                <EmptyEnemySlot key={i} />
              )
            )}
          </div>

          {/* ── Token pool (bottom-left) ── */}
          <div style={{ position: "absolute", bottom: 30, left: 40, zIndex: 1 }}>
            <TokenPool />
          </div>

          {/* ── Vertical divider ── */}
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 980,
              width: 2,
              height: BOARD_H - 60,
              background: "rgba(101, 67, 10, 0.35)",
              zIndex: 1,
            }}
          />

          {/* ══════════════════════════════════
              RIGHT HALF — shop
          ══════════════════════════════════ */}

          {/* ── Shop deck pile ── */}
          <div style={{ position: "absolute", top: 60, left: 1010, zIndex: 1 }}>
            <ShopDeckPile count={shopDeck?.length ?? 0} />
          </div>

          {/* ── Payment zone ── */}
          <div style={{ position: "absolute", top: 60, left: 1130, zIndex: 1, width: 300 }}>
            <PaymentZonePanel paymentZone={paymentZone} />
          </div>

          {/* ── Shop cards (2-column grid) ── */}
          <div style={{ position: "absolute", top: 240, left: 1010, zIndex: 1, width: 376 }}>
            <div className="text-[9px] text-stone-600 uppercase tracking-widest font-bold mb-3">
              Shop
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(shop ?? []).map((card, i) =>
                card ? (
                  <ShopCard key={card.id} card={card} />
                ) : (
                  <div
                    key={`empty-${i}`}
                    className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-100/40 flex items-center justify-center text-stone-300 text-sm select-none"
                    style={{ width: 176, height: 258 }}
                  >
                    Sold
                  </div>
                )
              )}
              {(shop ?? []).filter(Boolean).length === 0 && (
                <p className="text-stone-400 text-sm italic col-span-2">Shop is empty.</p>
              )}
            </div>
          </div>

          {/* ── Game log (bottom-right) ── */}
          <div style={{ position: "absolute", bottom: 30, left: 1410, width: 270, zIndex: 1 }}>
            <GameLog log={log} />
          </div>
        </div>
        </div>{/* end scroll-space wrapper */}
      </div>

      {/* ── Fixed player HUD ── */}
      <PlayerHUD
        me={me}
        otherPlayers={otherPlayers}
        paymentZone={paymentZone}
        currentPlayerId={currentPlayerId}
        isMyTurn={isMyTurn}
      />

      {/* ── Drag overlay ── */}
      <DragOverlay dropAnimation={null}>
        {(activeDrag?.draggableType === "pool_token" ||
          activeDrag?.draggableType === "staging_token") && (
          <DragChip attackType={activeDrag.attackType} />
        )}
        {activeDrag?.draggableType === "event_card" && (() => {
          const event = (activeEvents ?? []).find((e) => e.id === activeDrag.eventId);
          return event ? <EventCardDisplay event={event} /> : null;
        })()}
        {activeDrag?.draggableType === "enemy_card" && (() => {
          const enemy = (enemies ?? []).find((e) => e.id === activeDrag.enemyId);
          return enemy ? <EnemyCardDisplay enemy={enemy} /> : null;
        })()}
        {activeDrag?.draggableType === "enemy_deck_draw" && (
          <div
            className="rounded-xl border-2 border-stone-900 bg-stone-700 flex items-center justify-center shadow-2xl pointer-events-none"
            style={{ width: 286, height: 213 }}
          >
            <span className="text-6xl opacity-60">👾</span>
          </div>
        )}
        {activeDrag?.draggableType === "event_deck_draw" && (
          <div
            className="rounded-xl border-2 border-violet-400 bg-violet-800 flex items-center justify-center shadow-2xl pointer-events-none"
            style={{ width: 213, height: 213 }}
          >
            <span className="text-6xl opacity-60">🎴</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ── Inline sub-components ─────────────────────────────────────────────────────

import { useState as usePaymentState } from "react";
import CardComponent from "../components/CardComponent";
import PawCoin from "../components/PawCoin";

function PaymentZonePanel({ paymentZone }) {
  const [lastVisible, setLastVisible] = usePaymentState(false);
  const tokenCount = paymentZone?.tokens ?? 0;

  useEffect(() => {
    if (paymentZone?.lastPurchase) {
      setLastVisible(true);
      const t = setTimeout(() => setLastVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [paymentZone?.lastPurchase?.cardName]);

  return (
    <div className="bg-amber-50/80 border border-amber-300 rounded-xl px-3 py-2.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-amber-700 mb-1.5">
        Payment Zone
      </div>
      {tokenCount === 0 ? (
        <div className="text-xs text-stone-400 italic">No coins placed</div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-0.5 flex-wrap">
            {Array.from({ length: Math.min(tokenCount, 20) }).map((_, i) => (
              <PawCoin key={i} className="w-5 h-5" />
            ))}
            {tokenCount > 20 && (
              <span className="text-xs text-amber-700 self-center">+{tokenCount - 20}</span>
            )}
          </div>
          <span className="text-sm font-bold text-amber-700">{tokenCount} 🪙</span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => socket.emit("clear_payment")}
            className="text-[10px] bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded px-2 py-0.5 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
      {lastVisible && paymentZone?.lastPurchase && (
        <div className="text-[10px] text-green-600 font-semibold mt-1 animate-pulse">
          Bought: {paymentZone.lastPurchase.cardName} for {paymentZone.lastPurchase.paid} 🪙
        </div>
      )}
    </div>
  );
}

function ShopCard({ card }) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => socket.emit("buy_card", { cardId: card.id })}
    >
      <CardComponent card={card} showCost isPlayable />
    </div>
  );
}
