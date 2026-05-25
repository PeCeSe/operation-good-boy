import { useDraggable } from "@dnd-kit/core";

export const ATTACK_CONFIG = {
  attack: { bg: "bg-red-soft", border: "border-red", text: "text-red-deep", icon: "⚔️", label: "Attack" },
};

function PoolChip() {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "pool_attack",
    data: { draggableType: "pool_token", attackType: "attack" },
  });

  const cfg = ATTACK_CONFIG.attack;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg select-none transition-all ${cfg.bg} ${cfg.border} ${
        isDragging ? "opacity-30 scale-95" : "cursor-grab active:cursor-grabbing hover:scale-110 shadow-sm"
      }`}
      style={{ touchAction: "none" }}
      title="Drag to add attack token"
    >
      {cfg.icon}
    </div>
  );
}

export default function TokenPool() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-paper-50 border border-ink-border/20 rounded-xl">
      <span className="text-[10px] text-ink-500 uppercase tracking-wide font-bold shrink-0">Attack pool</span>
      <div className="flex gap-2">
        <PoolChip />
      </div>
      <span className="text-[10px] text-ink-300 italic hidden sm:block">Drag to staging → drag staging to enemy</span>
    </div>
  );
}
