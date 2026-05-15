const TYPE_STYLES = {
  move: "border-blue-500/60 bg-blue-900/20",
  item: "border-amber-500/60 bg-amber-900/20",
  ally: "border-green-500/60 bg-green-900/20",
};

const TYPE_BADGE = {
  move: "bg-blue-600 text-blue-100",
  item: "bg-amber-600 text-amber-100",
  ally: "bg-green-600 text-green-100",
};

const ATTACK_ICONS = {
  scratch: "🐾",
  bite: "🦷",
  ignore: "🙄",
  charm: "✨",
};

function EffectSummary({ effect }) {
  const parts = [];
  if (effect.attack > 0 && effect.attackType) {
    parts.push(`${ATTACK_ICONS[effect.attackType]} ${effect.attack} ${effect.attackType}`);
  }
  if (effect.pawcoins > 0) parts.push(`🪙 ${effect.pawcoins}`);
  if (effect.special === "draw_card") parts.push("Draw 1 card");
  if (effect.special === "heal") parts.push("Heal 1 life");
  if (effect.special?.startsWith("bite_")) parts.push(`${ATTACK_ICONS.bite} +${effect.special.split("_")[1]} bite`);
  if (effect.special?.startsWith("charm_")) parts.push(`${ATTACK_ICONS.charm} +${effect.special.split("_")[1]} charm`);
  return <span className="text-xs text-slate-300">{parts.join(" · ") || "No effect"}</span>;
}

export default function CardComponent({ card, onClick, isPlayable, showCost = false }) {
  const base = TYPE_STYLES[card.type] || "border-slate-600 bg-slate-800";

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable}
      title={card.flavorText}
      className={`border-2 rounded-lg p-2 text-left w-28 flex-shrink-0 transition-all select-none
        ${base}
        ${isPlayable ? "hover:scale-105 hover:brightness-110 cursor-pointer" : "opacity-60 cursor-default"}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_BADGE[card.type]}`}>
          {card.type}
        </span>
        {showCost && (
          <span className="text-xs font-bold text-amber-400">🪙{card.cost}</span>
        )}
      </div>
      <div className="font-semibold text-xs leading-tight mb-1">{card.name}</div>
      <EffectSummary effect={card.effect} />
      {card.flavorText && (
        <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">{card.flavorText}</div>
      )}
    </button>
  );
}
