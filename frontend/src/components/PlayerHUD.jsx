import { useState } from "react";
import PawCoin from "./PawCoin";
import PlayerBoard from "./PlayerBoard";
import socket from "../socket";

export default function PlayerHUD({
  me,
  otherPlayers,
  paymentZone,
  currentPlayerId,
  isMyTurn,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const lives      = me?.lives ?? 0;
  const maxLives   = me?.character?.maxLives ?? 9;
  const pawTokens  = me?.pawTokens ?? 0;
  const atkTokens  = me?.attackTokens ?? [];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">

      {/* ── Drawer handle tab ── */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="bg-paper-50 border-2 border-b-0 border-ink-border rounded-t-lg px-6 py-0.5 text-ink-400 hover:text-ink transition-colors text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-[0_-2px_6px_rgba(0,0,0,0.06)]"
        >
          {isOpen ? "▼ Hide" : "▲ Show"}
        </button>
      </div>

      {/* ── Always-visible strip ── */}
      <div className="bg-paper-50 border-t-2 border-ink-border shadow-2xl">
        <div className="flex items-center gap-4 px-5 py-2.5">

          {/* Left: Coins + Attacks */}
          <div className="flex items-center gap-5 shrink-0">

            {/* Pawcoins */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-ink-300 uppercase tracking-widest font-bold">Pawcoins</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit("set_paw_tokens", { tokens: pawTokens + 1 })}
                  disabled={!isMyTurn}
                  className="w-6 h-6 bg-gold border-2 border-gold-deep rounded-full text-white font-bold flex items-center justify-center text-sm leading-none disabled:opacity-40 shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >+</button>
                <PawCoin className="w-5 h-5" />
                <span className="text-sm font-bold text-gold-deep min-w-[12px]">{pawTokens}</span>
              </div>
            </div>

            {/* Attacks */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-ink-300 uppercase tracking-widest font-bold">Attacks</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit("add_attack_token", { type: "attack" })}
                  disabled={!isMyTurn}
                  className="w-6 h-6 bg-red border-2 border-red-deep rounded-full text-white font-bold flex items-center justify-center text-sm leading-none disabled:opacity-40 shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >+</button>
                {atkTokens.length === 0
                  ? <span className="text-[10px] text-ink-300 italic">Empty</span>
                  : <div className="flex gap-0.5 flex-wrap max-w-[80px]">
                      {atkTokens.map(t => (
                        <span key={t.id} className="text-sm">⚔️</span>
                      ))}
                    </div>
                }
              </div>
            </div>
          </div>

          {/* Center: Lives */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative flex gap-0.5 flex-wrap justify-center">
              {/* Slider track behind the hearts — inset-x-4 = half-heart, so track goes center-to-center */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ink-300/20 overflow-hidden pointer-events-none">
                <div
                  className="h-full rounded-full bg-red/60 transition-all duration-150"
                  style={{ width: `${maxLives > 1 ? ((lives - 1) / (maxLives - 1)) * 100 : (lives > 0 ? 100 : 0)}%`, float: "right" }}
                />
              </div>
              {Array.from({ length: maxLives }).map((_, i) => {
                const num = maxLives - i;          // 9 → 1, left to right
                const filled = (maxLives - 1 - i) < lives; // "9" goes grey first
                const handleClick = () => {
                  if (!me?.playerId) return;
                  // clicking the leftmost filled heart → decrease; otherwise set to that number
                  const newLives = num === lives ? lives - 1 : num;
                  socket.emit("set_lives", { playerId: me.playerId, lives: Math.max(0, newLives) });
                };
                return (
                  <button
                    key={i}
                    onClick={handleClick}
                    className="relative w-8 h-8 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    title={filled ? (num === lives ? "Click to lose a life" : `Set lives to ${num}`) : `Set lives to ${num}`}
                  >
                    <span className={`text-[32px] leading-none select-none ${filled ? "text-red" : "text-ink-300/30"}`}>♥</span>
                    <span className={`absolute text-[9px] font-bold leading-none ${filled ? "text-white" : "text-ink-300/50"}`}>{num}</span>
                  </button>
                );
              })}
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

      {/* ── Expanded: PlayerBoard ── */}
      {me && isOpen && (
        <div className="bg-paper-100 border-t border-ink-border/20 overflow-y-auto" style={{ maxHeight: 480 }}>
          <PlayerBoard
            player={me}
            isMe={true}
            isCurrentTurn={isMyTurn}
            paymentZone={paymentZone}
          />
        </div>
      )}
    </div>
  );
}
