import PawCoin from "./PawCoin";
import { renderDescription } from "../utils/renderDescription";

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

// Dividers use same colour + weight as the card outline


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

export default function CardComponent({ card, onClick, isPlayable, isPlaying = false, showCost = false, pack, forceFullOpacity = false, className = "" }) {
  const cfg = TYPE_CONFIG[card.type] || {
    header:  "bg-ink-700",
    image:   "bg-paper-200",
    label:   card.type ?? "?",
    emoji:   "❓",
  };

  const imgSrc = card.image ?? cfg.fallbackImage ?? null;
  // Hide flavor text when description is long so it doesn't get clipped.
  // Cost badge moves to an absolute position in that case.
  const isLongDesc = (card.description?.length ?? 0) > 75;

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable || isPlaying}
      title={card.flavorText}
      style={{ width: 176, height: 258 }}
      className={`
        relative flex-shrink-0 flex flex-col rounded-lg border-2 border-ink-border overflow-hidden shadow-md
        bg-paper-50 text-left select-none
        transition-all duration-300
        ${isPlaying ? "-translate-y-10 scale-110 opacity-0 pointer-events-none" : ""}
        ${isPlayable && !isPlaying ? `hover:-translate-y-2 hover:shadow-xl ${className || "cursor-pointer"}` : ""}
        ${!isPlayable && !isPlaying ? `${forceFullOpacity ? "" : "opacity-50"} cursor-default` : ""}
        ${className}
      `}
    >
      {/* ── Coloured header: card name in Patrick Hand SC ── */}
      <div className={`px-2.5 shrink-0 flex items-center justify-between gap-1 border-b-2 border-ink-border ${cfg.header}`} style={{ paddingTop: "0.2rem", paddingBottom: "0.2rem" }}>
        <span className="font-display text-base text-white leading-tight line-clamp-1 block">
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
      <div className={`px-2 py-0.5 text-[9px] font-body font-black tracking-[0.12em] shrink-0 text-center text-white border-t-2 border-b-2 border-ink-border ${cfg.header}`}>
        {cfg.label}
      </div>

      {/* ── Description ── */}
      <div className={`px-2.5 pt-1.5 text-[10px] font-body text-ink-700 leading-snug flex-1 min-h-0 overflow-hidden pb-0`}>
        {isLongDesc && card.cost > 0 && (
          <div className="float-right ml-1 mb-1">
            <CostBadge cost={card.cost} />
          </div>
        )}
        {card.description ? renderDescription(card.description) : "—"}
      </div>

      {/* ── Flavor + cost — hidden when description is long ── */}
      {!isLongDesc && (
        <div className="flex items-end gap-1 px-2.5 pb-2 pt-1 shrink-0">
          <div className="flex-1 text-[9px] font-flavor italic text-ink-500 leading-snug line-clamp-2">
            {card.flavorText && `"${card.flavorText}"`}
          </div>
          {card.cost > 0 && <CostBadge cost={card.cost} />}
        </div>
      )}
    </button>
  );
}
