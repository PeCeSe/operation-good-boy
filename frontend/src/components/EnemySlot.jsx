import { useDroppable } from "@dnd-kit/core";
import EnemyComponent from "./EnemyComponent";
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
    <div ref={setNodeRef} className="flex flex-col gap-2" style={{ width: 213 }}>
      <EnemyComponent enemy={enemy} isOver={isOver} />

      {/* Token drop area below enemy card */}
      <div
        className={`min-h-16 rounded-xl border-2 border-dashed p-2 flex flex-wrap gap-1.5 transition-all ${
          isOver
            ? "border-amber-400 bg-amber-50 scale-[1.02]"
            : "border-stone-400/40 bg-stone-900/5"
        }`}
      >
        {damageTokens.map((t) => (
          <DamageTokenChip key={t.id} token={t} enemyId={enemy.id} />
        ))}
        {damageTokens.length === 0 && (
          <span
            className={`text-[10px] italic self-center transition-colors ${
              isOver ? "text-amber-500" : "text-stone-400"
            }`}
          >
            {isOver ? "Drop!" : "Attack tokens"}
          </span>
        )}
      </div>
    </div>
  );
}
