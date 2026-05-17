import PawCoin from "./PawCoin";

const TYPE_CONFIG = {
  move: {
    banner: "bg-green-700 text-white",
    image: "bg-green-100",
    border: "border-green-800",
    emoji: "🐾",
    label: "MOVE",
  },
  item: {
    banner: "bg-amber-800 text-white",
    image: "bg-amber-100",
    border: "border-amber-900",
    emoji: "📦",
    label: "ITEM",
  },
  ally: {
    banner: "bg-indigo-700 text-white",
    image: "bg-indigo-100",
    border: "border-indigo-900",
    emoji: "🤝",
    label: "ALLY",
  },
};

const ATTACK_ICONS = {
  scratch: "🐾",
  bite: "🦷",
  ignore: "🙄",
  charm: "✨",
};

function EffectText({ effect }) {
  const parts = [];
  if (effect.attack > 0 && effect.attackType)
    parts.push(`+${effect.attack} ${ATTACK_ICONS[effect.attackType]} ${effect.attackType}`);
  if (effect.pawcoins > 0) parts.push(<>Gain {effect.pawcoins} <PawCoin />.</>);
  if (effect.special === "draw_card") parts.push("Draw 1 card.");
  if (effect.special === "heal") parts.push("Heal 1 life.");
  if (effect.special?.startsWith("bite_")) parts.push(`+${effect.special.split("_")[1]} 🦷 bite`);
  if (effect.special?.startsWith("charm_")) parts.push(`+${effect.special.split("_")[1]} ✨ charm`);
  if (parts.length === 0) return <>—</>;
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && " "}{p}</span>)}</>;
}

export default function CardComponent({ card, onClick, isPlayable, isPlaying = false, showCost = false }) {
  const cfg = TYPE_CONFIG[card.type] || { banner: "bg-stone-600 text-white", image: "bg-stone-100", border: "border-stone-400", emoji: "❓", label: card.type };

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable || isPlaying}
      title={card.flavorText}
      className={`
        w-40 flex-shrink-0 rounded-xl border-2 overflow-hidden shadow-md
        bg-amber-50 text-left select-none
        transition-all duration-300
        ${cfg.border}
        ${isPlaying ? "-translate-y-10 scale-110 opacity-0 pointer-events-none" : ""}
        ${isPlayable && !isPlaying ? "hover:-translate-y-2 hover:shadow-xl cursor-pointer" : ""}
        ${!isPlayable && !isPlaying ? "opacity-50 cursor-default" : ""}
      `}
    >
      {/* Header: name + cost */}
      <div className="flex items-start justify-between gap-1 px-2 pt-2 pb-1">
        <span className="font-bold text-xs leading-tight text-stone-800">{card.name}</span>
        {showCost && (
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {card.cost}
          </span>
        )}
      </div>

      {/* Image placeholder */}
      <div className={`mx-1.5 rounded-lg h-24 flex items-center justify-center text-5xl ${cfg.image}`}>
        {cfg.emoji}
      </div>

      {/* Type banner */}
      <div className={`text-center py-0.5 text-[9px] font-bold tracking-widest mt-1.5 ${cfg.banner}`}>
        {cfg.label}
      </div>

      {/* Effect */}
      <div className="px-2 pt-1.5 text-xs text-stone-700 font-medium leading-snug">
        <EffectText effect={card.effect} />
      </div>

      {/* Divider + flavor */}
      {card.flavorText && (
        <>
          <div className="mx-2 mt-1 border-t border-stone-300" />
          <div className="px-2 pt-1 pb-2 text-[10px] italic text-stone-400 leading-snug line-clamp-2">
            "{card.flavorText}"
          </div>
        </>
      )}
      {!card.flavorText && <div className="pb-2" />}
    </button>
  );
}
