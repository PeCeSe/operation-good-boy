import { useDraggable } from "@dnd-kit/core";

export function EnemyCardDisplay({ enemy, isOver = false, pack }) {
  return (
    <div
      className={`relative rounded-xl shadow-md overflow-hidden flex flex-col border-2 transition-all ${
        isOver ? "border-amber-400" : "border-ink"
      }`}
      style={{ width: 286, height: 213, background: "#fbf1da" }}
    >
      {/* Dark ink header */}
      <div className="bg-ink px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="font-display text-base text-white leading-tight truncate" style={{ letterSpacing: "0.04em" }}>{enemy.name}</div>
          <div className="text-[9px] font-bold tracking-widest text-ink-50 uppercase">Enemy</div>
        </div>
        {pack != null && (
          <span className="text-[8px] font-bold bg-white/15 text-ink-50 rounded-full px-1.5 py-0.5 shrink-0">P{pack}</span>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Ability + reward */}
        <div className="flex flex-col px-2.5 py-2 min-w-0" style={{ width: 152 }}>
          <div className="flex-1 min-h-0 overflow-hidden">
            {enemy.ability ? (
              <div className="text-[11px] font-body text-ink-300 leading-snug line-clamp-4">{enemy.ability.description}</div>
            ) : (
              <div className="text-[11px] font-body text-ink-100 italic">No ability.</div>
            )}
          </div>
          <div className="shrink-0 mt-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="h-px flex-1 bg-ink-100" />
              <span className="text-[8px] font-bold tracking-widest text-ink-200 uppercase">Reward</span>
              <div className="h-px flex-1 bg-ink-100" />
            </div>
            <div className="text-[11px] font-body text-ink-300 leading-snug line-clamp-2">{enemy.reward?.description}</div>
          </div>
        </div>

        {/* Illustration area — warm sepia gradient */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden border-l border-ink-50" style={{ background: "linear-gradient(to bottom, #e7cf99, #d4a96a)" }}>
          {enemy.image
            ? <img src={enemy.image} alt={enemy.name} className="w-full h-full object-cover" />
            : <span className="text-5xl">{enemy.emoji || "👾"}</span>
          }
          <div className="absolute bottom-2 right-2 flex items-center justify-center w-9 h-9">
            <span className="absolute text-red-500 text-[2.2rem] leading-none" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>♥</span>
            <span className="relative text-white font-bold text-sm leading-none z-10" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{enemy.maxHealth}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnemyComponent({ enemy, isOver = false }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `enemy_drag_${enemy.id}`,
    data: { draggableType: "enemy_card", enemyId: enemy.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: "none", opacity: isDragging ? 0.4 : 1, cursor: "grab" }}
    >
      <EnemyCardDisplay enemy={enemy} isOver={isOver} />
    </div>
  );
}
