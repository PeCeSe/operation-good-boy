import PawCoin from "./PawCoin";

const TYPE_CONFIG = {
  move: {
    banner: "bg-[#C47A76] text-white",
    image: "bg-[#F5D5D3]",
    border: "border-[#B06560]",
    emoji: "🐾",
    label: "MOVE",
    fallbackImage: "/cards/fallbacks/MoveFallback.png",
  },
  item: {
    banner: "bg-[#C98F3A] text-white",
    image: "bg-[#F5E5C0]",
    border: "border-[#A0712E]",
    emoji: "📦",
    label: "ITEM",
    fallbackImage: "/cards/fallbacks/ItemFallback.png",
  },
  ally: {
    banner: "bg-[#5D8C9E] text-white",
    image: "bg-[#D6E8EF]",
    border: "border-[#4A7080]",
    emoji: "🤝",
    label: "ALLY",
    fallbackImage: "/cards/fallbacks/AllyFallback.png",
  },
};

function renderDescription(text) {
  const tokens = text.split(/(♥|🪙)/);
  return tokens.map((token, i) => {
    if (token === "♥") return <span key={i} className="text-red-400">♥</span>;
    if (token === "🪙") return <PawCoin key={i} />;
    return <span key={i}>{token}</span>;
  });
}

function CostBadge({ cost }) {
  return (
    <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
      <img src="/pawcoin.svg" alt="" className="absolute inset-0 w-full h-full" />
      <span className="relative text-white text-[11px] font-black leading-none" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
        {cost}
      </span>
    </div>
  );
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
      {/* Header: name only — full width */}
      <div className="px-2 pt-2 pb-1 shrink-0">
        <span className="font-bold text-xs leading-tight text-stone-800 line-clamp-1 block">{card.name}</span>
      </div>

      {/* Illustration */}
      {(() => {
        const imgSrc = card.image ?? cfg.fallbackImage;
        return (
          <div className={`shrink-0 overflow-hidden flex items-center justify-center ${cfg.image} ${imgSrc ? "" : "text-4xl"}`} style={{ aspectRatio: "3/2" }}>
            {imgSrc
              ? <img src={imgSrc} alt={card.name} className="w-full h-full object-contain" />
              : cfg.emoji
            }
          </div>
        );
      })()}

      {/* Type banner */}
      <div className={`px-2 py-0.5 text-[9px] font-bold tracking-widest shrink-0 flex items-center ${cfg.banner}`}>
        <div className="flex-1 text-center">{cfg.label}</div>
        {pack != null && (
          <span className="text-[8px] font-bold bg-white/25 rounded-full px-1.5 leading-tight shrink-0">P{pack}</span>
        )}
      </div>

      {/* Effect */}
      <div className="px-2 pt-1 pb-0 text-[10px] text-stone-700 font-medium leading-snug flex-1 min-h-0 overflow-hidden">
        {card.description ? renderDescription(card.description) : "—"}
      </div>

      {/* Bottom: flavor (left) + cost (right) */}
      <div className="flex items-end gap-1 px-2 pb-2 pt-0.5 shrink-0">
        <div className="flex-1 text-[9px] italic text-stone-400 leading-snug line-clamp-2">
          {card.flavorText && `"${card.flavorText}"`}
        </div>
        {showCost && <CostBadge cost={card.cost} />}
      </div>
    </button>
  );
}
