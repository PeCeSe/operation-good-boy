import { useState, useRef } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import PawCoin from "./PawCoin";
import PlayerBoard, { StagingToken } from "./PlayerBoard";
import { ATTACK_CONFIG } from "./TokenPool";
import CHARACTERS from "../data/characters";
import socket from "../socket";

// ── Draggable pawcoin ──────────────────────────────────────────────────────────

function DraggableCoin({ index, onMove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `paw_coin_${index}`,
    data: { draggableType: "paw_coin" },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onMove}
      style={{ touchAction: "none", opacity: isDragging ? 0.3 : 1 }}
      className="shrink-0 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
      title="Click or drag to payment zone"
    >
      <PawCoin className="w-9 h-9" />
    </div>
  );
}

// ── Player tab button ──────────────────────────────────────────────────────────

function PlayerTab({ player, isMe, isActive, isTurn, onClick }) {
  const charData  = CHARACTERS.find(c => c.id === player?.character?.id);
  const isStunned = (player?.lives ?? 1) === 0;
  const headshot  = isStunned && charData?.stunned ? charData.stunned : charData?.headshot;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold
        transition-colors select-none shrink-0 border-2 border-b-0
        ${isActive
          ? "bg-paper-100 text-ink-700 border-ink-border/40 relative z-10"
          : "bg-paper-200/60 text-ink-400 border-transparent hover:text-ink-600 hover:bg-paper-200"
        }
      `}
    >
      {headshot && (
        <img src={headshot} alt={player.name} className="w-5 h-5 object-contain rounded-full shrink-0" />
      )}
      <span>{player.name}</span>
      {isMe && (
        <span className="text-[9px] text-ink-400 font-normal">(YOU)</span>
      )}
      {isTurn && (
        <span className="w-2 h-2 rounded-full bg-moss shrink-0" title="Their turn" />
      )}
    </button>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_DRAWER_H  = 480;
const TAB_BAR_H     = 38; // approximate tab bar height, used for content max-height
const STAGING_W     = 180;
const STAGING_H     = 44;

// ── Main HUD ───────────────────────────────────────────────────────────────────

export default function PlayerHUD({
  me,
  otherPlayers,
  paymentZone,
  currentPlayerId,
  isMyTurn,
}) {
  const [drawerHeight, setDrawerHeight] = useState(MAX_DRAWER_H);
  const [isDragging,   setIsDragging]   = useState(false);
  const [activeTabId,  setActiveTabId]  = useState(null);
  const dragStateRef = useRef(null);

  const { setNodeRef: setStagingRef, isOver: isOverStaging } = useDroppable({ id: "staging" });

  // All players in order — me first, then others
  const allPlayers  = [me, ...(otherPlayers ?? [])].filter(Boolean);
  const showTabs    = allPlayers.length > 1;

  // Active tab defaults to "me"
  const activePlayer = allPlayers.find(p => p.playerId === activeTabId) ?? me ?? allPlayers[0] ?? null;
  const isViewingMe  = activePlayer?.playerId === me?.playerId;

  const lives      = me?.lives ?? 0;
  const maxLives   = me?.character?.maxLives ?? 9;
  const pawTokens  = me?.pawTokens ?? 0;
  const atkTokens  = me?.attackTokens ?? [];
  const isStunned  = lives === 0;

  // ── Handle drag-to-resize ──────────────────────────────────────────────────

  const handlePointerDown = (e) => {
    e.preventDefault();
    const startY      = e.clientY;
    const startHeight = drawerHeight;
    dragStateRef.current = { hasDragged: false };
    setIsDragging(true);

    const onMove = (ev) => {
      const delta = startY - ev.clientY;
      if (Math.abs(delta) > 4) dragStateRef.current.hasDragged = true;
      setDrawerHeight(Math.max(0, Math.min(MAX_DRAWER_H, startHeight + delta)));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  };

  const handleClick = () => {
    if (dragStateRef.current?.hasDragged) return;
    setDrawerHeight(h => h > 0 ? 0 : MAX_DRAWER_H);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">

      {/* ── Drawer handle tab ── */}
      <div className="flex justify-center">
        <button
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          className={`bg-paper-50 border-2 border-b-0 border-ink-border rounded-t-lg px-6 py-0.5 text-ink-400 hover:text-ink transition-colors text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {drawerHeight > 0 ? "▼ Hide" : "▲ Show"}
        </button>
      </div>

      {/* ── Always-visible strip ── */}
      <div className="bg-paper-50 border-t-2 border-ink-border shadow-2xl">
        <div className="flex items-center gap-4 px-5 py-2.5">

          {/* Left: Coins + Attacks */}
          <div className="flex items-center gap-4 shrink-0">

            {/* Pawcoins */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-ink-300 uppercase tracking-widest font-bold">Pawcoins</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit("set_paw_tokens", { tokens: pawTokens + 1 })}
                  className="w-7 h-7 shrink-0 bg-gold border-2 border-gold-deep rounded-full text-white font-bold flex items-center justify-center text-sm leading-none shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >+</button>
                <div
                  className="flex items-center gap-1 overflow-x-auto rounded-lg px-1.5 py-1 border-2 border-dashed border-gold/40 bg-paper-200/20"
                  style={{ width: STAGING_W, minHeight: STAGING_H }}
                >
                  {pawTokens === 0
                    ? <PawCoin className="w-9 h-9 opacity-20" />
                    : Array.from({ length: pawTokens }).map((_, i) => (
                        <DraggableCoin
                          key={i}
                          index={i}
                          onMove={() => {
                            socket.emit("set_paw_tokens", { tokens: Math.max(0, pawTokens - 1) });
                            socket.emit("place_payment", { tokens: (paymentZone?.tokens ?? 0) + 1 });
                          }}
                        />
                      ))
                  }
                </div>
              </div>
            </div>

            {/* Attacks */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-ink-300 uppercase tracking-widest font-bold">Attacks</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit("add_attack_token", { type: "attack" })}
                  className="w-7 h-7 shrink-0 bg-red border-2 border-red-deep rounded-full text-white font-bold flex items-center justify-center text-sm leading-none shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >+</button>
                <div
                  ref={setStagingRef}
                  className={`flex items-center gap-1 overflow-x-auto rounded-lg px-1.5 py-1 border-2 border-dashed transition-colors ${
                    isOverStaging ? "border-red bg-red/5" : "border-ink-300/50 bg-paper-200/20"
                  }`}
                  style={{ width: STAGING_W, minHeight: STAGING_H }}
                >
                  {atkTokens.length === 0
                    ? <div className="w-9 h-9 rounded-full border-2 border-ink-300/25 flex items-center justify-center text-base opacity-25">{ATTACK_CONFIG.attack.icon}</div>
                    : atkTokens.map(t => <StagingToken key={t.id} token={t} />)
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Center: Lives */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative flex gap-0.5 justify-center">
              {/* Slider track */}
              <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ink-300/20 overflow-hidden pointer-events-none">
                <div
                  className="h-full rounded-full bg-red/60 transition-all duration-150"
                  style={{ width: `${maxLives > 1 ? ((lives - 1) / (maxLives - 1)) * 100 : (lives > 0 ? 100 : 0)}%`, float: "right" }}
                />
              </div>
              {Array.from({ length: maxLives }).map((_, i) => {
                const num    = maxLives - i;
                const filled = (maxLives - 1 - i) < lives;
                const handleClick = () => {
                  if (!me?.playerId) return;
                  const newLives = num === lives ? lives - 1 : num;
                  socket.emit("set_lives", { playerId: me.playerId, lives: Math.max(0, newLives) });
                };
                return (
                  <button
                    key={i}
                    onClick={handleClick}
                    className="relative w-11 h-11 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    title={filled ? (num === lives ? "Click to lose a life" : `Set lives to ${num}`) : `Set lives to ${num}`}
                  >
                    <span className={`text-[44px] leading-none select-none ${filled ? "text-red" : "text-ink-300"}`}>♥</span>
                    <span className={`absolute text-[10px] font-bold leading-none ${filled ? "text-white" : "text-ink-500"}`}>{num}</span>
                  </button>
                );
              })}
              {/* STUNNED overlay */}
              {isStunned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold tracking-widest uppercase text-red border-2 border-red px-2.5 py-0.5 rounded bg-paper-50/80" style={{ transform: "rotate(-4deg)", display: "inline-block" }}>
                    STUNNED!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: End Turn */}
          <button
            onClick={() => socket.emit("end_turn")}
            disabled={!isMyTurn}
            className={`shrink-0 font-display px-5 py-2.5 rounded-lg border-2 transition-[transform,box-shadow] ${
              isMyTurn
                ? "bg-moss text-white border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none"
                : "bg-paper-200 text-ink-300 border-ink-300/50 opacity-40 cursor-not-allowed"
            }`}
          >
            End Turn →
          </button>
        </div>
      </div>

      {/* ── Drawer ── */}
      <div
        className="bg-paper-100 border-t border-ink-border/20 overflow-hidden flex flex-col"
        style={{
          height: drawerHeight,
          transition: isDragging ? "none" : "height 200ms ease-out",
        }}
      >
        {/* Tab bar — only shown when there are multiple players */}
        {showTabs && (
          <div className="flex gap-0.5 px-3 pt-2 shrink-0 border-b border-ink-border/30 bg-paper-200/40">
            {allPlayers.map(p => (
              <PlayerTab
                key={p.playerId}
                player={p}
                isMe={p.playerId === me?.playerId}
                isActive={p.playerId === activePlayer?.playerId}
                isTurn={p.playerId === currentPlayerId}
                onClick={() => setActiveTabId(p.playerId)}
              />
            ))}
          </div>
        )}

        {/* Scrollable board content */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: MAX_DRAWER_H - (showTabs ? TAB_BAR_H : 0) }}>
          {activePlayer && (
            <PlayerBoard
              player={activePlayer}
              isMe={isViewingMe}
              isCurrentTurn={activePlayer.playerId === currentPlayerId}
              paymentZone={isViewingMe ? paymentZone : null}
              hideHeader={showTabs}
            />
          )}
        </div>
      </div>
    </div>
  );
}
