import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import CardComponent from "../components/CardComponent";
import PawCoin from "../components/PawCoin";
import LocationBar from "../components/LocationBar";
import EnemySlot from "../components/EnemySlot";
import { EnemyCardDisplay } from "../components/EnemyComponent";
import ShopRow from "../components/ShopRow";
import EventDeck, { EventCardDisplay } from "../components/EventDeck";
import GameLog from "../components/GameLog";
import { ATTACK_CONFIG } from "../components/TokenPool";
import PlayerHUD from "../components/PlayerHUD";
import StatsScreen from "../components/StatsScreen";
import CHARACTERS from "../data/characters";
import SKINS from "../data/skins";
import { getDisplayData } from "../data/getDisplayData";
import socket from "../socket";

const BOARD_W = 1700;
const BOARD_H = 1080;
const GUTTER  = 500; // scroll space around the board so edge elements can be centred

function DragChip() {
  const cfg = ATTACK_CONFIG.attack;
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
      <div className="text-[9px] text-ink-500 uppercase tracking-[0.12em] font-bold">Villain Deck</div>
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => canDraw && socket.emit("draw_enemy")}
        disabled={!canDraw}
        className={`relative rounded-xl border-2 flex items-center justify-center select-none transition-all ${
          canDraw
            ? "border-ink bg-ink-700 hover:bg-ink cursor-pointer active:scale-95"
            : "border-ink-300 bg-paper-300 cursor-default opacity-60"
        } ${isDragging ? "opacity-40" : ""}`}
        style={{ width: 286, height: 213, touchAction: "none" }}
        title={canDraw ? "Click or drag to draw a villain" : count === 0 ? "Deck empty" : "All slots full"}
      >
        <span className="text-6xl">👾</span>
        {count > 0 && (
          <span className="absolute top-2 right-2 bg-ink text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
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
      <div className="text-[9px] text-ink-500 uppercase tracking-[0.12em] font-bold">Defeated</div>
      <div
        ref={setNodeRef}
        className={`relative rounded-xl transition-all ${isOver ? "ring-2 ring-red ring-offset-2" : ""}`}
        style={{ width: 286, height: 213 }}
      >
        {/* Stack illusion */}
        {count > 2 && <div className="absolute rounded-xl border-2 border-ink-border/30 bg-paper-300/60" style={{ width: 286, height: 213, top: 6, left: 6 }} />}
        {count > 1 && <div className="absolute rounded-xl border-2 border-ink-border/30 bg-paper-300/60" style={{ width: 286, height: 213, top: 3, left: 3 }} />}
        <div className="absolute top-0 left-0" style={{ zIndex: 2 }}>
          {topEnemy ? (
            <EnemyCardDisplay enemy={topEnemy} />
          ) : (
            <div
              className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                isOver ? "border-red bg-red-soft/20" : "border-ink-300/50 bg-paper-200/20"
              }`}
              style={{ width: 286, height: 213 }}
            >
              <span className="text-3xl opacity-40">💀</span>
              <span className={`text-xs font-semibold ${isOver ? "text-red" : "text-ink-300"}`}>
                {isOver ? "Drop to defeat!" : "Drag defeated villains here"}
              </span>
            </div>
          )}
        </div>
        {count > 0 && (
          <div className="absolute top-2 right-2 bg-ink-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow" style={{ zIndex: 10 }}>
            {count}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyEnemySlot({ slotIndex, isDeckBeingDragged }) {
  const { setNodeRef, isOver } = useDroppable({ id: `enemy_slot_${slotIndex}` });
  const highlight = isDeckBeingDragged || isOver;
  return (
    <div className="flex flex-col gap-2" style={{ width: 286 }}>
      <div
        ref={setNodeRef}
        className={`rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
          isOver
            ? "border-brown bg-brown-soft/20 ring-2 ring-brown"
            : highlight
            ? "border-ink-300/70 bg-paper-300/20"
            : "border-ink-300/50 bg-paper-200/20"
        }`}
        style={{ height: 213 }}
      >
        <span className={`text-sm select-none transition-colors ${isOver ? "text-brown font-semibold" : "text-ink-border/40"}`}>
          {isOver ? "Drop here!" : "—"}
        </span>
      </div>
      <div className="h-16 rounded-xl border-2 border-dashed border-ink-300/50 bg-paper-200/20" />
    </div>
  );
}

function ShopDeckPile({ count }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-24 h-32 bg-brown-deep rounded-xl border-2 border-brown flex flex-col items-center justify-center shadow-lg gap-1">
        <span className="text-4xl">🃏</span>
        <span className="text-brown-soft font-bold text-sm">{count}</span>
      </div>
      <div className="text-[9px] text-ink-500 uppercase tracking-wide font-bold">Shop Deck</div>
    </div>
  );
}

export default function Game({ gameState, mySocketId }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const boardSurfaceRef = useRef(null);
  const panState = useRef({ active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const dndActiveRef = useRef(false);
  const [activeDrag, setActiveDrag] = useState(null);
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const lastOverRef = useRef(null);
  const [zoom, setZoom] = useState(() => Math.max(0.25, Math.min(2, window.innerWidth / BOARD_W)));
  const [otherCursors, setOtherCursors] = useState({});
  const [handCursors, setHandCursors] = useState({});
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  useEffect(() => {
    if (!showLeaveConfirm) return;
    const handler = (e) => {
      if (!e.target.closest("[data-leave-confirm]")) setShowLeaveConfirm(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLeaveConfirm]);

  const clampZoom = (z) => Math.max(0.25, Math.min(2, z));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Zoom toward cursor (Figma-style)
    const zoomToward = (cursorX, cursorY, newZoom) => {
      const c = containerRef.current;
      if (!c) return;
      const oldZoom = zoomRef.current;
      if (newZoom === oldZoom) return;

      // Board's left edge in scroll-space (wrapper centres the board horizontally)
      const wrapperWidth = Math.max(BOARD_W * oldZoom + GUTTER * 2, c.clientWidth);
      const boardLeft    = (wrapperWidth - BOARD_W * oldZoom) / 2;

      // Point under cursor in board-space (invariant we want to preserve)
      const boardX = (c.scrollLeft + cursorX - boardLeft) / oldZoom;
      const boardY = (c.scrollTop  + cursorY - GUTTER)    / oldZoom;

      // Where that point will be in scroll-space after zoom
      const newWrapperWidth = Math.max(BOARD_W * newZoom + GUTTER * 2, c.clientWidth);
      const newBoardLeft    = (newWrapperWidth - BOARD_W * newZoom) / 2;
      const newScrollX      = newBoardLeft + boardX * newZoom - cursorX;
      const newScrollY      = GUTTER       + boardY * newZoom - cursorY;

      // flushSync forces React to re-render synchronously (new wrapper dimensions
      // land in the DOM immediately), so we can set scroll right after with no
      // intermediate paint — eliminates the zoom-flicker.
      flushSync(() => {
        zoomRef.current = newZoom;
        setZoom(newZoom);
      });
      c.scrollLeft = Math.max(0, newScrollX);
      c.scrollTop  = Math.max(0, newScrollY);
    };

    // Scroll = zoom, aimed at cursor
    const onWheel = (e) => {
      e.preventDefault();
      const c = containerRef.current;
      if (!c) return;
      const rect   = c.getBoundingClientRect();
      const newZoom = clampZoom(zoomRef.current + (e.deltaY < 0 ? 0.03 : -0.03));
      zoomToward(e.clientX - rect.left, e.clientY - rect.top, newZoom);
    };

    // WASD / arrow keys = smooth pan via rAF
    const PAN_SPEED = 8; // px per frame (~480px/s at 60fps)
    const PAN_KEYS  = new Set(["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"]);
    const keysHeld  = new Set();
    const raf       = { id: null };

    const panLoop = () => {
      const c = containerRef.current;
      if (c) {
        if (keysHeld.has("arrowup")    || keysHeld.has("w")) c.scrollTop  -= PAN_SPEED;
        if (keysHeld.has("arrowdown")  || keysHeld.has("s")) c.scrollTop  += PAN_SPEED;
        if (keysHeld.has("arrowleft")  || keysHeld.has("a")) c.scrollLeft -= PAN_SPEED;
        if (keysHeld.has("arrowright") || keysHeld.has("d")) c.scrollLeft += PAN_SPEED;
      }
      raf.id = keysHeld.size > 0 ? requestAnimationFrame(panLoop) : null;
    };

    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      const key = e.key.toLowerCase();
      if (!PAN_KEYS.has(key)) return;
      e.preventDefault();
      keysHeld.add(key);
      if (!raf.id) raf.id = requestAnimationFrame(panLoop);
    };

    const onKeyUp = (e) => {
      keysHeld.delete(e.key.toLowerCase());
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
        pinch.dist   = getDist(e.touches);
        pinch.zoom   = zoomRef.current;
        const c = containerRef.current;
        const rect = c ? c.getBoundingClientRect() : { left: 0, top: 0 };
        pinch.midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        pinch.midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      } else {
        pinch.active = false;
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && pinch.active) {
        e.preventDefault();
        const ratio   = getDist(e.touches) / pinch.dist;
        const newZoom = clampZoom(pinch.zoom * (1 + (ratio - 1) * 0.5));
        zoomToward(pinch.midX, pinch.midY, newZoom);
      }
    };
    const onTouchEnd = () => { pinch.active = false; };

    // Drag-to-pan on the gutter (background outside the board)
    const onGutterPointerDown = (e) => {
      // If the pointer landed inside the board surface, let the board's own handler deal with it
      if (boardSurfaceRef.current?.contains(e.target)) return;
      // Don't start panning while a DnD drag is in progress
      if (dndActiveRef.current) return;
      e.preventDefault();
      panState.current = { active: true, startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onGutterPointerMove = (e) => {
      const p = panState.current;
      if (!p.active || dndActiveRef.current) return;
      el.scrollLeft = p.scrollLeft - (e.clientX - p.startX);
      el.scrollTop  = p.scrollTop  - (e.clientY - p.startY);
    };
    const onGutterPointerUp = () => {
      panState.current.active = false;
      el.style.cursor = "";
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown",  onGutterPointerDown);
    el.addEventListener("pointermove",  onGutterPointerMove);
    el.addEventListener("pointerup",    onGutterPointerUp);
    el.addEventListener("pointercancel",onGutterPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown",  onGutterPointerDown);
      el.removeEventListener("pointermove",  onGutterPointerMove);
      el.removeEventListener("pointerup",    onGutterPointerUp);
      el.removeEventListener("pointercancel",onGutterPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
      if (raf.id) cancelAnimationFrame(raf.id);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Initialise scroll so the board sits at the top-left of the viewport
  // (gutter space exists in all directions for scrolling past edges)
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.scrollLeft = GUTTER;
    c.scrollTop  = GUTTER;
  }, []);

  const myColorRef = useRef("#f59e0b");
  const myNameRef = useRef("");

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
    locationDeck,
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

  // Cursor tracking — send my position, receive others'
  useEffect(() => {
    myColorRef.current = me?.character?.bgFrom ?? "#f59e0b";
    myNameRef.current = me?.name ?? "";
  }, [me?.character?.bgFrom, me?.name]);

  useEffect(() => {
    let lastEmit = 0;
    const onPointerMove = (e) => {
      const now = Date.now();
      if (now - lastEmit < 50) return;
      lastEmit = now;
      const board = boardSurfaceRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      socket.emit("cursor_move", {
        x: (e.clientX - rect.left) / zoomRef.current,
        y: (e.clientY - rect.top) / zoomRef.current,
        name: myNameRef.current,
        color: myColorRef.current,
      });
    };
    const onPointerLeave = () => socket.emit("cursor_leave");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    const onCursorUpdate = ({ socketId, x, y, name, color }) => {
      setOtherCursors((prev) => ({ ...prev, [socketId]: { x, y, name, color } }));
    };
    const onCursorLeave = ({ socketId }) => {
      setOtherCursors((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
    };
    socket.on("cursor_update", onCursorUpdate);
    socket.on("cursor_leave", onCursorLeave);

    const onHandCursorUpdate = ({ socketId, targetPlayerId, x, y, name, color, gone }) => {
      setHandCursors(prev => {
        const target = { ...(prev[targetPlayerId] ?? {}) };
        if (gone) delete target[socketId];
        else target[socketId] = { x, y, name, color };
        if (Object.keys(target).length === 0) {
          const next = { ...prev };
          delete next[targetPlayerId];
          return next;
        }
        return { ...prev, [targetPlayerId]: target };
      });
    };
    socket.on("hand_cursor_update", onHandCursorUpdate);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      socket.off("cursor_update", onCursorUpdate);
      socket.off("cursor_leave", onCursorLeave);
      socket.off("hand_cursor_update", onHandCursorUpdate);
      socket.emit("cursor_leave");
    };
  }, []);
  const isMyTurn = me?.playerId === currentPlayerId;
  const currentPlayerName = players.find((p) => p.playerId === currentPlayerId)?.name;
  const otherPlayers = players.filter((p) => p.socketId !== mySocketId);

  function handleDragStart({ active }) {
    dndActiveRef.current = true;
    setActiveDrag(active.data.current ?? null);
    lastOverRef.current = null;
  }

  function handleDragOver({ over }) {
    lastOverRef.current = over ?? null;
  }

  function handleDragEnd({ active, over }) {
    dndActiveRef.current = false;
    panState.current.active = false;
    // Use last known over as fallback — dnd-kit can lose the droppable
    // at the exact moment of pointerup when targets are in a transformed container
    const effectiveOver = over ?? lastOverRef.current;
    lastOverRef.current = null;
    setActiveDrag(null);
    const data = active.data.current ?? {};
    if (data.draggableType === "paw_coin") {
      if (effectiveOver?.id === "payment_zone") {
        const paid = (paymentZone?.tokens ?? 0) + 1;
        socket.emit("set_paw_tokens", { tokens: Math.max(0, (me?.pawTokens ?? 0) - 1) });
        socket.emit("place_payment", { tokens: paid });
      }
      return;
    }
    if (data.draggableType === "enemy_deck_draw") {
      if (effectiveOver?.id?.toString().startsWith("enemy_slot_")) {
        const slotIndex = parseInt(effectiveOver.id.toString().replace("enemy_slot_", ""), 10);
        socket.emit("draw_enemy", { slotIndex });
      }
      return;
    }
    if (data.draggableType === "event_deck_draw") {
      socket.emit("draw_event");
      return;
    }
    if (!effectiveOver) return;
    if (data.draggableType === "staging_token" && effectiveOver.id !== "staging") {
      socket.emit("move_token_to_enemy", { enemyId: String(effectiveOver.id), tokenId: data.tokenId });
    } else if (data.draggableType === "enemy_card" && effectiveOver.id === "enemy_discard") {
      socket.emit("defeat_enemy", { enemyId: data.enemyId });
    }
  }

  if (phase === "victory" || phase === "defeat") {
    return <StatsScreen gameState={gameState} mySocketId={mySocketId} />;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} autoScroll={false}>

      {/* ── Top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[150] h-14 bg-paper-50 border-b-2 border-ink-border flex items-center px-3 gap-3 shadow-sm">
        {/* Left: logo — click shows leave-game confirmation */}
        <div className="relative shrink-0 hidden md:block" data-leave-confirm>
          <button
            onClick={() => setShowLeaveConfirm(v => !v)}
            className="font-display text-ink-300 text-xs tracking-wide hover:text-ink-500 transition-colors"
          >
            🐾 Operation: Good Boy
          </button>
          {showLeaveConfirm && (
            <div className="absolute top-full left-0 mt-2 bg-paper-50 border-2 border-ink-border rounded-xl shadow-lg p-4 w-56 z-10">
              <p className="font-body text-sm text-ink mb-3 leading-snug">Leave the game? You can rejoin via the room link.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-red text-white font-display text-sm py-1.5 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >
                  Leave
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 bg-paper-200 text-ink font-display text-sm py-1.5 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >
                  Stay
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: player turn-order pills */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {players.map((p, i) => {
            const isCurrent = p.playerId === currentPlayerId;
            const isMe = p.playerId === me?.playerId;
            const char = getDisplayData(p, SKINS, CHARACTERS);
            return (
              <div key={p.playerId} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-ink-300 text-base leading-none">›</span>}
                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? "bg-paper-100 border-gold shadow-sm"
                    : "bg-paper-200/40 border-ink-border/40"
                }`}>
                  {char?.headshot
                    ? <img src={p.lives === 0 && char.stunned ? char.stunned : char.headshot} alt={p.name} className="w-8 h-8 object-contain shrink-0" />
                    : <span className="w-8 h-8 flex items-center justify-center text-lg">🐱</span>
                  }
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`font-body text-[11px] leading-none truncate max-w-[72px] ${
                      isCurrent ? "text-ink" : "text-ink-500"
                    } ${isMe ? "font-bold" : ""}`}>{p.name}</span>
                    <div className={`flex items-center gap-1.5 leading-none font-mono text-[10px] ${
                      isCurrent ? "text-ink-500" : "text-ink-300"
                    }`}>
                      {/* Lives */}
                      <span className={`flex items-center gap-0.5 ${p.lives <= 3 ? "text-red font-bold" : "text-red/70"}`}>
                        <span className="text-[17px]">♥</span><span>{p.lives}</span>
                      </span>
                      <span className="text-ink-border">·</span>
                      {/* Coins */}
                      <span className="flex items-center gap-0.5">
                        <PawCoin className="w-3.5 h-3.5" /><span className="text-gold-deep">{p.pawTokens ?? 0}</span>
                      </span>
                      <span className="text-ink-border">·</span>
                      {/* Attacks */}
                      <span className="flex items-center gap-0.5">
                        <span>⚔️</span><span>{p.attackTokens?.length ?? 0}</span>
                      </span>
                      <span className="text-ink-border">·</span>
                      {/* Cards in hand */}
                      <span className="flex items-center gap-0.5">
                        <span>🃏</span><span>{p.hand?.length ?? 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: round + zoom */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-ink-300 text-[11px] font-body hidden sm:block">Round {roundNumber}</span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setZoom(z => clampZoom(parseFloat((z - 0.1).toFixed(2))))}
              className="w-6 h-6 rounded flex items-center justify-center text-ink-300 hover:text-ink hover:bg-ink-border/10 transition-colors text-base leading-none">−</button>
            <button onClick={() => setZoom(1)}
              className="text-ink-300 hover:text-ink text-[11px] font-mono w-9 text-center hover:bg-ink-border/10 rounded py-0.5 transition-colors"
              title="Reset zoom">{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(z => clampZoom(parseFloat((z + 0.1).toFixed(2))))}
              className="w-6 h-6 rounded flex items-center justify-center text-ink-300 hover:text-ink hover:bg-ink-border/10 transition-colors text-base leading-none">+</button>
          </div>
        </div>
      </div>

      {/* ── Scrollable canvas ── */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 56,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "auto",
          scrollbarWidth: "none",
          cursor: "grab",
        }}
      >
        {/* Wrapper: always wider/taller than the board + gutter, centred horizontally.
            paddingTop/Bottom place the board at exactly GUTTER from the scroll origin
            so scrollTop=GUTTER puts the board flush at the viewport top on load. */}
        <div style={{
          minWidth:    `max(${BOARD_W * zoom + GUTTER * 2}px, 100%)`,
          minHeight:   `${BOARD_H * zoom + GUTTER + GUTTER + 560}px`,
          display:     "flex",
          justifyContent: "center",
          alignItems:  "flex-start",
          paddingTop:  GUTTER,
          paddingBottom: GUTTER + 560,
          boxSizing:   "border-box",
        }}>
        {/* Board size wrapper */}
        <div style={{ width: BOARD_W * zoom, height: BOARD_H * zoom, position: "relative", flexShrink: 0 }}>
        {/* Board surface — scaled */}
        <div
          ref={boardSurfaceRef}
          style={{
            width: BOARD_W,
            height: BOARD_H,
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            background: "#f3e3bf",
            borderRadius: 16,
            border: "2px solid #362c28",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
            overflow: "hidden",
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

          {/* ══════════════════════════════════
              LEFT HALF — game area
          ══════════════════════════════════ */}

          {/* ── Location (top-left) ── */}
          <div style={{ position: "absolute", top: 60, left: 40, zIndex: 1 }}>
            <div className="text-[9px] text-ink-500 uppercase tracking-[0.12em] font-bold mb-2">
              Location
            </div>
            <LocationBar
              currentLocation={currentLocation}
              lostLocations={lostLocations ?? []}
              totalLocations={(lostLocations?.length ?? 0) + (currentLocation ? 1 : 0) + (locationDeck?.length ?? 0)}
            />
          </div>

          {/* ── Events (right of location) ── */}
          <div style={{ position: "absolute", top: 60, left: 360, zIndex: 1 }}>
            <div className="text-[9px] text-ink-500 uppercase tracking-[0.12em] font-bold mb-2">
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
              canDraw={(enemyDeck?.length ?? 0) > 0 && (enemies?.filter(Boolean).length ?? 0) < 3}
            />
            <EnemyDiscardPile enemyDiscard={enemyDiscard ?? []} />
          </div>

          {/* ── Enemy slots row (row 2) ── */}
          <div style={{ position: "absolute", top: 560, left: 40, display: "flex", gap: 16, zIndex: 1 }}>
            {Array.from({ length: 3 }).map((_, i) =>
              enemies[i] ? (
                <EnemySlot key={enemies[i].id} enemy={enemies[i]} />
              ) : (
                <EmptyEnemySlot
                  key={i}
                  slotIndex={i}
                  isDeckBeingDragged={activeDrag?.draggableType === "enemy_deck_draw"}
                />
              )
            )}
          </div>

          {/* ── Vertical divider ── */}
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 1060,
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
          <div style={{ position: "absolute", top: 60, left: 1090, zIndex: 1 }}>
            <ShopDeckPile count={shopDeck?.length ?? 0} />
          </div>

          {/* ── Payment drop zone ── */}
          <div style={{ position: "absolute", top: 60, left: 1210, zIndex: 1 }}>
            <PaymentDropZone paymentZone={paymentZone} />
          </div>

          {/* ── Shop cards (3-column × 2-row grid) ── */}
          <div style={{ position: "absolute", top: 240, left: 1090, zIndex: 1, width: 552 }}>
            <div className="text-[9px] text-ink-500 uppercase tracking-[0.12em] font-bold mb-3">
              Shop
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(shop ?? []).map((card, i) =>
                card ? (
                  <ShopCard key={card.id} card={card} paymentZone={paymentZone} onNeedConfirm={setPendingPurchase} />
                ) : (
                  <div
                    key={`empty-${i}`}
                    className="rounded-xl border-2 border-dashed border-ink-300/50 bg-paper-200/20 flex items-center justify-center text-ink-300/60 text-sm select-none"
                    style={{ width: 176, height: 258 }}
                  >
                    Sold
                  </div>
                )
              )}
              {(shop ?? []).filter(Boolean).length === 0 && (
                <p className="text-ink-300 text-sm italic col-span-3">Shop is empty.</p>
              )}
            </div>
          </div>

          {/* ── Game log (bottom-right) ── */}
          <div style={{ position: "absolute", bottom: 30, left: 1410, width: 270, zIndex: 1 }}>
            <GameLog log={log} />
          </div>

          {/* ── Other players' cursors (board-relative) ── */}
          {Object.entries(otherCursors).map(([id, cursor]) => (
            <div
              key={id}
              style={{
                position: "absolute",
                left: cursor.x,
                top: cursor.y,
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              <div style={{ transform: `scale(${1 / zoom})`, transformOrigin: "top left" }}>
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
            </div>
          ))}
        </div>{/* end board surface */}
        </div>{/* end board size wrapper */}
        </div>{/* end centering+gutter wrapper */}
      </div>

      {/* ── Fixed player HUD ── */}
      <PlayerHUD
        me={me}
        otherPlayers={otherPlayers}
        paymentZone={paymentZone}
        currentPlayerId={currentPlayerId}
        isMyTurn={isMyTurn}
        handCursors={handCursors}
        myColor={me?.character?.bgFrom ?? "#f59e0b"}
        myName={me?.name ?? ""}
      />

      {/* ── Drag overlay ── */}
      <DragOverlay dropAnimation={null}>
        {activeDrag && (
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            {activeDrag.draggableType === "paw_coin" && (
              <PawCoin className="w-6 h-6 pointer-events-none drop-shadow-lg" />
            )}
            {(activeDrag.draggableType === "pool_token" ||
              activeDrag.draggableType === "staging_token") && (
              <DragChip />
            )}
            {activeDrag.draggableType === "enemy_card" && (() => {
              const enemy = (enemies ?? []).find((e) => e && e.id === activeDrag.enemyId);
              return enemy ? <EnemyCardDisplay enemy={enemy} /> : null;
            })()}
            {activeDrag.draggableType === "enemy_deck_draw" && (
              <div
                className="rounded-xl border-2 border-ink bg-ink-700 flex items-center justify-center shadow-2xl pointer-events-none"
                style={{ width: 286, height: 213 }}
              >
                <span className="text-6xl opacity-60">👾</span>
              </div>
            )}
            {activeDrag.draggableType === "event_deck_draw" && (
              <div
                className="relative rounded-lg border-2 border-plum overflow-hidden shadow-2xl pointer-events-none"
                style={{ width: 213, height: 213 }}
              >
                <img src="/cards/event_back.png" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full" style={{ background: "rgba(180, 150, 210, 0.6)" }} />
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <img src="/cards/event_icon.png" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "rgba(130, 106, 150, 0.55)", mixBlendMode: "color" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DragOverlay>
      {/* ── Confirmation dialog ── */}
      {pendingPurchase && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/60"
          onClick={() => setPendingPurchase(null)}
        >
          <div
            className="bg-paper-50 rounded-lg p-5 shadow-2xl border-2 border-ink-border max-w-xs w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-lg text-ink leading-tight mb-1">{pendingPurchase.name}</div>
            <div className="text-sm text-ink-700 mb-4 flex flex-wrap items-center gap-1">
              This card costs <strong className="inline-flex items-center gap-0.5">{pendingPurchase.cost} <PawCoin className="w-4 h-4" /></strong>, but the payment zone only has <strong className="inline-flex items-center gap-0.5">{paymentZone?.tokens ?? 0} <PawCoin className="w-4 h-4" /></strong>. Buy anyway?
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPendingPurchase(null)}
                className="text-sm text-ink-500 hover:text-ink-700 px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { socket.emit("buy_card", { cardId: pendingPurchase.id }); setPendingPurchase(null); }}
                className="text-sm bg-ink text-white font-bold px-4 py-1.5 rounded-lg hover:bg-ink-700 transition-colors"
              >
                Buy anyway
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </DndContext>
  );
}

// ── Inline sub-components ─────────────────────────────────────────────────────

function PaymentDropZone({ paymentZone }) {
  const { setNodeRef, isOver } = useDroppable({ id: "payment_zone" });
  const count = paymentZone?.tokens ?? 0;
  const displayCount = Math.min(count, 18);

  return (
    <div className="flex flex-col gap-2" style={{ width: 290 }}>
      <div className="text-[9px] text-ink-500 uppercase tracking-[0.12em] font-bold">Payment</div>
      <div
        ref={setNodeRef}
        onPointerDown={(e) => e.stopPropagation()}
        className={`rounded-lg border-2 border-dashed min-h-[72px] p-2.5 transition-all flex flex-wrap gap-1 items-start content-start ${
          isOver
            ? "border-gold bg-gold-soft/40"
            : count > 0
            ? "border-gold/60 bg-gold-soft/20"
            : "border-ink-300/50 bg-paper-200/20"
        }`}
      >
        {count === 0 && (
          <span className={`text-[10px] italic w-full text-center self-center transition-colors ${isOver ? "text-gold font-semibold" : "text-ink-300"}`}>
            {isOver ? "Drop here!" : "Drag coins here to pay"}
          </span>
        )}
        {Array.from({ length: displayCount }).map((_, i) => (
          <PawCoin key={i} className="w-6 h-6" />
        ))}
        {count > 18 && (
          <span className="text-xs text-gold-deep font-bold self-center">+{count - 18}</span>
        )}
      </div>
      {count > 0 && (
        <div className="flex items-center justify-between px-0.5">
          <span className="text-sm font-bold text-gold-deep flex items-center gap-1">{count} <PawCoin className="w-4 h-4" /></span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => socket.emit("clear_payment")}
            className="text-[10px] text-ink-500 hover:text-ink-700 font-semibold transition-colors"
          >
            Return ↩
          </button>
        </div>
      )}
    </div>
  );
}

function ShopCard({ card, paymentZone, onNeedConfirm }) {
  const handleBuy = () => {
    const paid = paymentZone?.tokens ?? 0;
    if (paid >= card.cost) {
      socket.emit("buy_card", { cardId: card.id });
    } else {
      onNeedConfirm(card);
    }
  };
  return (
    <div onPointerDown={(e) => e.stopPropagation()} onClick={handleBuy}>
      <CardComponent card={card} showCost isPlayable />
    </div>
  );
}
