import PawCoin from "./PawCoin";

const TYPE_CONFIG = {
  move: {
    header:  "bg-move",
    image:   "bg-move-soft",
    label:   "MOVE",
    emoji:   "🐾",
    fallbackImage: "/cards/fallbacks/MoveFallback.png",
  },
  item: {
    header:  "bg-item",
    image:   "bg-item-soft",
    label:   "ITEM",
    emoji:   "📦",
    fallbackImage: "/cards/fallbacks/ItemFallback.png",
  },
  ally: {
    header:  "bg-ally",
    image:   "bg-ally-soft",
    label:   "ALLY",
    emoji:   "🤝",
    fallbackImage: "/cards/fallbacks/AllyFallback.png",
  },
};

function renderDescription(text) {
  const tokens = text.split(/(♥|🪙)/);
  return tokens.map((token, i) => {
    if (token === "♥") return <span key={i} className="text-red">♥</span>;
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
    header:  "bg-ink-700",
    image:   "bg-paper-200",
    label:   card.type ?? "?",
    emoji:   "❓",
  };

  const imgSrc = card.image ?? cfg.fallbackImage ?? null;

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable || isPlaying}
      title={card.flavorText}
      style={{ width: 176, height: 258 }}
      className={`
        flex-shrink-0 flex flex-col rounded-2xl border-2 border-ink-border overflow-hidden shadow-md
        bg-paper-50 text-left select-none
        transition-all duration-300
        ${isPlaying ? "-translate-y-10 scale-110 opacity-0 pointer-events-none" : ""}
        ${isPlayable && !isPlaying ? "hover:-translate-y-2 hover:shadow-xl cursor-pointer" : ""}
        ${!isPlayable && !isPlaying ? "opacity-50 cursor-default" : ""}
      `}
    >
      {/* ── Coloured header: card name in white Bangers ── */}
      <div className={`px-2.5 pt-2 pb-1.5 shrink-0 flex items-center justify-between gap-1 ${cfg.header}`}>
        <span
          className="font-display text-base text-white leading-tight line-clamp-1 block"
          style={{ letterSpacing: "0.03em" }}
        >
          {card.name}
        </span>
        {pack != null && (
          <span className="text-[8px] font-bold bg-white/20 text-white/80 rounded-full px-1.5 leading-tight shrink-0">
            P{pack}
          </span>
        )}
      </div>

      {/* ── Illustration ── */}
      <div
        className={`shrink-0 overflow-hidden flex items-center justify-center ${cfg.image}`}
        style={{ aspectRatio: "3/2" }}
      >
        {imgSrc
          ? <img src={imgSrc} alt={card.name} className="w-full h-full object-contain" />
          : <span className="text-4xl opacity-40">{cfg.emoji}</span>
        }
      </div>

      {/* ── Type label banner ── */}
      <div className={`px-2 py-0.5 text-[9px] font-bold tracking-widest shrink-0 text-center text-white ${cfg.header}`}>
        {cfg.label}
      </div>

      {/* ── Description ── */}
      <div className="px-2.5 pt-1.5 pb-0 text-[10px] font-body text-ink-700 leading-snug flex-1 min-h-0 overflow-hidden">
        {card.description ? renderDescription(card.description) : "—"}
      </div>

      {/* ── Flavor + cost ── */}
      <div className="flex items-end gap-1 px-2.5 pb-2 pt-0.5 shrink-0">
        <div className="flex-1 text-[9px] font-flavor italic text-ink-500 leading-snug line-clamp-2">
          {card.flavorText && `"${card.flavorText}"`}
        </div>
        {showCost && <CostBadge cost={card.cost} />}
      </div>
    </button>
  );
}
