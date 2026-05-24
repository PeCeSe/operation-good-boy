import PawCoin from "./PawCoin";

const TYPE_CONFIG = {
  move: {
    banner: "bg-[#C47A76] text-white",
    image: "bg-[#F5D5D3]",
    border: "border-[#B06560]",
    emoji: "🐾",
    label: "MOVE",
    fallbackImage: "/cards/MoveFallback.png",
  },
  item: {
    banner: "bg-[#C98F3A] text-white",
    image: "bg-[#F5E5C0]",
    border: "border-[#A0712E]",
    emoji: "📦",
    label: "ITEM",
  },
  ally: {
    banner: "bg-[#5D8C9E] text-white",
    image: "bg-[#D6E8EF]",
    border: "border-[#4A7080]",
    emoji: "🤝",
    label: "ALLY",
  },
};

function renderDescription(text) {
  return text.split("♥").map((part, i, arr) => (
    <span key={i}>{part}{i < arr.length - 1 && <span className="text-red-400">♥</span>}</span>
  ));
}

function EffectText({ effect }) {
  const parts = [];
  if (effect.attack > 0) parts.push(`+${effect.attack} ⚔️`);
  if (effect.pawcoins > 0) parts.push(<>Gain {effect.pawcoins} <PawCoin />.</>);
  if (effect.special === "draw_card") parts.push("Draw 1 card.");
  if (effect.special === "heal") parts.push("Heal 1 life.");
  if (parts.length === 0) return <>—</>;
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && " "}{p}</span>)}</>;
}

export default function CardComponent({ card, onClick, isPlayable, isPlaying = false, showCost = false, pack }) {
  const cfg = TYPE_CONFIG[card.type] || { banner: "bg-stone-600 text-white", image: "bg-stone-100", border: "border-stone-400", emoji: "❓", label: card.type };

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable || isPlaying}
      title={card.flavorText}
      style={{ width: 176, height: 258 }}
      className={`
        flex-shrink-0 flex flex-col rounded-xl border-2 overflow-hidden shadow-md
        bg-amber-50 text-left select-none
        transition-all duration-300
        ${cfg.border}
        ${isPlaying ? "-translate-y-10 scale-110 opacity-0 pointer-events-none" : ""}
        ${isPlayable && !isPlaying ? "hover:-translate-y-2 hover:shadow-xl cursor-pointer" : ""}
        ${!isPlayable && !isPlaying ? "opacity-50 cursor-default" : ""}
      `}
    >
      {/* Header: name + cost */}
      <div className="flex items-center justify-between gap-1 px-2 pt-2 pb-1 shrink-0">
        <span className="font-bold text-xs leading-tight text-stone-800 line-clamp-2">{card.name}</span>
        {showCost && (
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {card.cost}
          </span>
        )}
      </div>

      {/* Illustration */}
      {(() => {
        const imgSrc = card.image ?? cfg.fallbackImage;
        return (
          <div className={`mx-1.5 rounded-lg shrink-0 overflow-hidden flex items-center justify-center ${cfg.image} ${imgSrc ? "" : "text-4xl"}`} style={{ aspectRatio: "3/2" }}>
            {imgSrc
              ? <img src={imgSrc} alt={card.name} className="w-full h-full object-contain" />
              : cfg.emoji
            }
          </div>
        );
      })()}

      {/* Type banner */}
      <div className={`px-2 py-0.5 text-[9px] font-bold tracking-widest mt-1 shrink-0 flex items-center ${cfg.banner}`}>
        <div className="flex-1 text-center">{cfg.label}</div>
        {pack != null && (
          <span className="text-[8px] font-bold bg-white/25 rounded-full px-1.5 leading-tight shrink-0">P{pack}</span>
        )}
      </div>

      {/* Effect */}
      <div className="px-2 pt-1 pb-0 text-[11px] text-stone-700 font-medium leading-snug flex-1 min-h-0 overflow-hidden">
        {card.description ? renderDescription(card.description) : <EffectText effect={card.effect} />}
      </div>

      {/* Flavor */}
      {card.flavorText && (
        <div className="px-2 pt-0.5 pb-2 text-[9px] italic text-stone-400 leading-snug line-clamp-2 shrink-0">
          "{card.flavorText}"
        </div>
      )}
      {!card.flavorText && <div className="pb-2 shrink-0" />}
    </button>
  );
}
