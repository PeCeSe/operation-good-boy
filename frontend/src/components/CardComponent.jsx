import PawCoin from "./PawCoin";

const TYPE_CONFIG = {
  move: {
    banner: "bg-move text-white",
    image:  "bg-move-light",
    border: "border-move-dark",
    emoji:  "🐾",
    label:  "MOVE",
    fallbackImage: "/cards/fallbacks/MoveFallback.png",
  },
  item: {
    banner: "bg-item text-white",
    image:  "bg-item-light",
    border: "border-item-dark",
    emoji:  "📦",
    label:  "ITEM",
    fallbackImage: "/cards/fallbacks/ItemFallback.png",
  },
  ally: {
    banner: "bg-ally text-white",
    image:  "bg-ally-light",
    border: "border-ally-dark",
    emoji:  "🤝",
    label:  "ALLY",
    fallbackImage: "/cards/fallbacks/AllyFallback.png",
  },
};

function renderDescription(text) {
  const tokens = text.split(/(♥|🪙)/);
  return tokens.map((token, i) => {
    if (token === "♥") return <span key={i} className="text-red-500">♥</span>;
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
  const cfg = TYPE_CONFIG[card.type] || {
    banner: "bg-ink-500 text-white",
    image:  "bg-paper-dark",
    border: "border-ink-500",
    emoji:  "❓",
    label:  card.type,
  };

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable || isPlaying}
      title={card.flavorText}
      style={{ width: 176, height: 258 }}
      className={`
        flex-shrink-0 flex flex-col rounded-2xl border-2 overflow-hidden shadow-md
        bg-paper text-left select-none
        transition-all duration-300
        ${cfg.border}
        ${isPlaying ? "-translate-y-10 scale-110 opacity-0 pointer-events-none" : ""}
        ${isPlayable && !isPlaying ? "hover:-translate-y-2 hover:shadow-xl cursor-pointer" : ""}
        ${!isPlayable && !isPlaying ? "opacity-50 cursor-default" : ""}
      `}
    >
      {/* Header: name */}
      <div className="px-2 pt-2 pb-1 shrink-0">
        <span className="font-display text-sm leading-tight text-ink line-clamp-1 block" style={{ letterSpacing: "0.03em" }}>{card.name}</span>
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

      {/* Description */}
      <div className="px-2 pt-1 pb-0 text-[10px] font-body font-semibold text-ink-300 leading-snug flex-1 min-h-0 overflow-hidden">
        {card.description ? renderDescription(card.description) : "—"}
      </div>

      {/* Bottom: flavor + cost */}
      <div className="flex items-end gap-1 px-2 pb-2 pt-0.5 shrink-0">
        <div className="flex-1 text-[9px] font-flavor italic text-ink-200 leading-snug line-clamp-2">
          {card.flavorText && `"${card.flavorText}"`}
        </div>
        {showCost && <CostBadge cost={card.cost} />}
      </div>
    </button>
  );
}
