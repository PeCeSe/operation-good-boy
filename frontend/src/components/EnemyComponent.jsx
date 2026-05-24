import { useDraggable } from "@dnd-kit/core";

export function EnemyCardDisplay({ enemy, isOver = false }) {
  return (
    <div
      className={`relative bg-stone-50 rounded-xl shadow-md overflow-hidden flex flex-col border-2 transition-all ${
        isOver ? "border-amber-400" : "border-stone-600"
      }`}
      style={{ width: 286, height: 213 }}
    >
      <div className="bg-stone-800 px-3 py-1.5 flex items-start justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm leading-tight truncate">{enemy.name}</div>
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Enemy</div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col px-2.5 py-2 min-w-0" style={{ width: 152 }}>
          <div className="flex-1 min-h-0 overflow-hidden">
            {enemy.ability ? (
              <div className="text-[11px] text-stone-700 leading-snug line-clamp-4">{enemy.ability.description}</div>
            ) : (
              <div className="text-[11px] text-stone-400 italic">No ability.</div>
            )}
          </div>
          <div className="shrink-0 mt-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="h-px flex-1 bg-stone-400" />
              <span className="text-[8px] font-bold tracking-widest text-stone-500 uppercase">Reward</span>
              <div className="h-px flex-1 bg-stone-400" />
            </div>
            <div className="text-[11px] text-stone-600 leading-snug line-clamp-2">{enemy.reward?.description}</div>
          </div>
        </div>

        <div className="relative flex-1 bg-gradient-to-b from-stone-200 to-stone-300 flex items-center justify-center">
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
