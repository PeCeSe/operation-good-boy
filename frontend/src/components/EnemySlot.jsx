import { useDroppable } from "@dnd-kit/core";
import EnemyComponent, { EnemyCardDisplay } from "./EnemyComponent";
import { ATTACK_CONFIG } from "./TokenPool";
import socket from "../socket";

function DamageTokenChip({ token, enemyId }) {
  const cfg = ATTACK_CONFIG[token.type] ?? ATTACK_CONFIG.scratch;
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        socket.emit("remove_from_enemy", { enemyId, tokenId: token.id });
      }}
      className={`w-9 h-9 rounded-full border-2 text-lg flex items-center justify-center hover:scale-110 hover:brightness-90 transition-transform select-none ${cfg.bg} ${cfg.border}`}
      title={`${cfg.label} — click to remove`}
    >
      {cfg.icon}
    </button>
  );
}

export default function EnemySlot({ enemy }) {
  const { setNodeRef, isOver } = useDroppable({ id: enemy.id });
  const damageTokens = enemy.damageTokens ?? [];

  return (
    <div ref={setNodeRef} className="flex flex-col gap-2" style={{ width: 286 }}>
      <EnemyComponent enemy={enemy} isOver={isOver} />

      {/* Token drop area below enemy card */}
      <div
        className={`min-h-16 rounded-xl border-2 border-dashed p-2 flex flex-wrap gap-1.5 transition-all ${
          isOver
            ? "border-red bg-red-soft/20 scale-[1.02]"
            : "border-ink-300/50 bg-paper-200/20"
        }`}
      >
        {damageTokens.map((t) => (
          <DamageTokenChip key={t.id} token={t} enemyId={enemy.id} />
        ))}
        {damageTokens.length === 0 && (
          <span
            className={`text-[10px] italic self-center transition-colors ${
              isOver ? "text-red" : "text-ink-300"
            }`}
          >
            {isOver ? "Drop!" : "Attack tokens"}
          </span>
        )}
      </div>
    </div>
  );
}
