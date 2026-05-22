import { useDraggable } from "@dnd-kit/core";

export const ATTACK_CONFIG = {
  scratch: { bg: "bg-orange-200", border: "border-orange-400", text: "text-orange-700", icon: "🐾", label: "Scratch" },
  bite:    { bg: "bg-red-200",    border: "border-red-400",    text: "text-red-700",    icon: "🦷", label: "Bite"    },
  charm:   { bg: "bg-pink-200",   border: "border-pink-400",   text: "text-pink-700",   icon: "✨", label: "Charm"   },
  ignore:  { bg: "bg-slate-200",  border: "border-slate-400",  text: "text-slate-600",  icon: "🙄", label: "Ignore"  },
};

function PoolChip({ attackType }) {
  const cfg = ATTACK_CONFIG[attackType];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool_${attackType}`,
    data: { draggableType: "pool_token", attackType },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg select-none transition-all ${cfg.bg} ${cfg.border} ${
        isDragging ? "opacity-30 scale-95" : "cursor-grab active:cursor-grabbing hover:scale-110 shadow-sm"
      }`}
      style={{ touchAction: "none" }}
      title={`Drag to add ${cfg.label} token`}
    >
      {cfg.icon}
    </div>
  );
}

export default function TokenPool() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl">
      <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold shrink-0">Attack pool</span>
      <div className="flex gap-2">
        {Object.keys(ATTACK_CONFIG).map((type) => (
          <PoolChip key={type} attackType={type} />
        ))}
      </div>
      <span className="text-[10px] text-stone-300 italic hidden sm:block">Drag to staging → drag staging to enemy</span>
    </div>
  );
}
