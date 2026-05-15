const TYPE_STYLES = {
  move: "border-blue-400/70 bg-blue-50",
  item: "border-amber-400/70 bg-amber-50",
  ally: "border-green-400/70 bg-green-50",
};

const TYPE_BADGE = {
  move: "bg-blue-100 text-blue-700",
  item: "bg-amber-100 text-amber-700",
  ally: "bg-green-100 text-green-700",
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
  return <span className="text-xs text-stone-600">{parts.join(" · ") || "No effect"}</span>;
}

export default function CardComponent({ card, onClick, isPlayable, isPlaying = false, showCost = false }) {
  const base = TYPE_STYLES[card.type] || "border-stone-300 bg-white";

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable || isPlaying}
      title={card.flavorText}
      className={`border-2 rounded-lg p-2 text-left w-28 flex-shrink-0 transition-all duration-300 select-none shadow-sm
        ${base}
        ${isPlaying ? "-translate-y-8 scale-110 opacity-0 pointer-events-none" : ""}
        ${isPlayable && !isPlaying ? "hover:scale-105 hover:-translate-y-1 hover:shadow-md cursor-pointer" : ""}
        ${!isPlayable && !isPlaying ? "opacity-50 cursor-default" : ""}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_BADGE[card.type]}`}>
          {card.type}
        </span>
        {showCost && (
          <span className="text-xs font-bold text-amber-600">🪙{card.cost}</span>
        )}
      </div>
      <div className="font-semibold text-xs leading-tight mb-1 text-stone-800">{card.name}</div>
      <EffectSummary effect={card.effect} />
      {card.flavorText && (
        <div className="text-[10px] text-stone-400 italic mt-1 line-clamp-2">{card.flavorText}</div>
      )}
    </button>
  );
}
