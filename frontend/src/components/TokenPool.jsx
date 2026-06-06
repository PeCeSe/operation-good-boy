import { useDraggable } from "@dnd-kit/core";

// ── Attack token art — SINGLE SOURCE OF TRUTH ───────────────────────────────
// To swap the attack token, change ONLY this path (or replace the file it points
// to in /public). Everywhere in the app renders the <AttackToken> component below,
// so nothing else needs to change.
export const ATTACK_TOKEN_SRC = "/AttackToken.png";

// The illustration is self-contained (transparent background, its own shape), so
// it renders as an image and fills the token — no coloured chip behind it.
export function AttackToken({ className = "" }) {
  return (
    <img
      src={ATTACK_TOKEN_SRC}
      alt="Attack"
      draggable={false}
      className={`object-contain select-none pointer-events-none ${className}`}
    />
  );
}

export const ATTACK_CONFIG = {
  attack: { bg: "bg-red-soft", border: "border-red", text: "text-red-deep", label: "Attack" },
};

function PoolChip() {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "pool_attack",
    data: { draggableType: "pool_token", attackType: "attack" },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-11 h-11 flex items-center justify-center select-none transition-all ${
        isDragging ? "opacity-30 scale-95" : "cursor-grab active:cursor-grabbing hover:scale-110"
      }`}
      style={{ touchAction: "none" }}
      title="Drag to add attack token"
    >
      <AttackToken className="w-11 h-11" />
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
