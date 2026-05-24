import { useState } from "react";
import CHARACTERS from "../data/characters";
import { ATTACK_CONFIG } from "./TokenPool";
import PlayerBoard from "./PlayerBoard";

function OtherPlayerChip({ player, isCurrentTurn }) {
  const charData = CHARACTERS.find((c) => c.id === player.character?.id);
  const maxLives = player.character?.maxLives ?? 9;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-colors ${
        isCurrentTurn ? "border-moss bg-moss-soft/30" : "border-ink-border bg-paper-50"
      }`}
    >
      {charData?.headshot ? (
        <img
          src={player.isStunned && charData.stunned ? charData.stunned : charData.headshot}
          alt={player.name}
          className="w-8 h-8 object-contain shrink-0"
        />
      ) : (
        <span className="text-lg">{player.character?.emoji}</span>
      )}
      <div className="min-w-0">
        <div className="text-xs font-bold truncate text-ink">{player.name}</div>
        {isCurrentTurn && (
          <div className="text-[10px] text-moss font-bold uppercase tracking-wide animate-pulse">
            Their turn
          </div>
        )}
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span
              key={i}
              className={`text-[10px] leading-none ${i < (player.lives ?? 0) ? "text-red" : "text-ink-300"}`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>
      {(player.attackTokens ?? []).length > 0 && (
        <div className="flex gap-0.5 flex-wrap max-w-[60px]">
          {(player.attackTokens ?? []).slice(0, 6).map((t) => {
            const cfg = ATTACK_CONFIG[t.type] ?? ATTACK_CONFIG.scratch;
            return (
              <span
                key={t.id}
                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${cfg.bg} ${cfg.border}`}
              >
                {cfg.icon}
              </span>
            );
          })}
        </div>
      )}
      <span className="text-[10px] text-ink-300 shrink-0">🃏 {player.hand?.length ?? 0}</span>
    </div>
  );
}

export default function PlayerHUD({
  me,
  otherPlayers,
  paymentZone,
  currentPlayerId,
  isMyTurn,
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-paper-100 border-t-2 border-ink-border shadow-2xl">
      {/* Toggle bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-ink-border/30 bg-paper-50">
        <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
          {otherPlayers.map((p) => (
            <OtherPlayerChip
              key={p.playerId}
              player={p}
              isCurrentTurn={p.playerId === currentPlayerId}
            />
          ))}
          {otherPlayers.length === 0 && (
            <span className="text-xs text-ink-300 italic">Solo game</span>
          )}
        </div>
        {isMyTurn && (
          <span className="text-moss font-semibold text-sm animate-pulse shrink-0">
            Your turn!
          </span>
        )}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="shrink-0 text-xs text-ink-500 hover:text-ink border border-ink-border bg-paper-50 rounded-lg px-3 py-1.5 transition-colors"
        >
          {isOpen ? "▼ Hide board" : "▲ Show board"}
        </button>
      </div>

      {/* Player board */}
      {me && (
        <div className="overflow-y-auto" style={{ maxHeight: 480, display: isOpen ? undefined : "none" }}>
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
