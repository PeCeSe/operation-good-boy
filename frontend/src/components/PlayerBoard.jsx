import PlayerHand from "./PlayerHand";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };
const ATTACK_COLORS = {
  scratch: { active: "border-orange-300 bg-orange-50 text-orange-700", inactive: "border-stone-200 bg-stone-50 text-stone-300" },
  bite:    { active: "border-red-300 bg-red-50 text-red-700",          inactive: "border-stone-200 bg-stone-50 text-stone-300" },
  ignore:  { active: "border-blue-300 bg-blue-50 text-blue-700",       inactive: "border-stone-200 bg-stone-50 text-stone-300" },
  charm:   { active: "border-purple-300 bg-purple-50 text-purple-700", inactive: "border-stone-200 bg-stone-50 text-stone-300" },
};

function ResourceBadge({ icon, amount, colorClass }) {
  const hasAmount = amount > 0;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base transition-all ${colorClass}`}>
        {amount}
      </div>
      <span className="text-sm leading-none">{icon}</span>
    </div>
  );
}

function CardPile({ count, label }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="w-14 h-20 rounded-lg border-2 border-amber-700 bg-amber-800 flex flex-col items-center justify-center gap-1 shadow-md">
        <span className="text-xl">🐾</span>
        <span className="text-white font-bold text-sm">{count}</span>
      </div>
      <span className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function Lives({ lives, max }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-lg leading-none ${i < lives ? "text-red-400" : "text-stone-200"}`}>
          ♥
        </span>
      ))}
    </div>
  );
}

export default function PlayerBoard({ player, isMyTurn, onEndTurn }) {
  if (!player) return null;

  const { name, character, lives, isStunned, hand, deck, discard, currentPawcoins, currentAttack } = player;

  return (
    <div className={`rounded-xl border-2 shadow-md overflow-hidden transition-all ${isMyTurn ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header: name + lives */}
      <div className={`flex items-center justify-between px-4 py-2 ${isMyTurn ? "bg-amber-50" : "bg-stone-50"}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{character.emoji}</span>
          <span className="font-bold text-stone-800">{name}</span>
          <span className="text-stone-400 text-xs">(you)</span>
          {isStunned && <span className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 rounded px-1.5 py-0.5">STUNNED</span>}
          {isMyTurn && <span className="text-xs text-amber-600 font-semibold animate-pulse">Your turn!</span>}
        </div>
        <Lives lives={lives} max={character.maxLives} />
      </div>

      {/* Resources + End Turn */}
      <div className="bg-white border-t border-b border-stone-200 px-4 py-3 flex items-center gap-4">
        {/* Pawcoins */}
        <ResourceBadge
          icon="🪙"
          amount={currentPawcoins}
          colorClass={currentPawcoins > 0 ? "border-amber-300 bg-amber-50 text-amber-700" : "border-stone-200 bg-stone-50 text-stone-300"}
        />
        <div className="w-px h-10 bg-stone-200" />
        {/* Attack types */}
        {Object.entries(currentAttack).map(([type, amount]) => (
          <ResourceBadge
            key={type}
            icon={ATTACK_ICONS[type]}
            amount={amount}
            colorClass={amount > 0 ? ATTACK_COLORS[type].active : ATTACK_COLORS[type].inactive}
          />
        ))}

        {/* End Turn */}
        {isMyTurn && (
          <button
            onClick={onEndTurn}
            className="ml-auto bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2 rounded-lg transition-colors"
          >
            End Turn →
          </button>
        )}
      </div>

      {/* Hand area: draw pile + cards + discard */}
      <div className="bg-stone-50 px-4 py-3 flex items-end gap-3">
        <CardPile count={deck.length} label="Draw" />
        <div className="flex-1 min-w-0">
          <PlayerHand hand={hand} isMyTurn={isMyTurn} />
        </div>
        <CardPile count={discard.length} label="Discard" />
      </div>
    </div>
  );
}
