const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };

function HPHeart({ current, max }) {
  const pct = Math.max(0, current / max);
  const color = pct > 0.5 ? "text-red-500" : pct > 0.25 ? "text-orange-500" : "text-red-800";
  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
      <div className={`relative text-5xl leading-none ${color}`}>
        ♥
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base leading-none mt-1">
          {current}
        </span>
      </div>
      <span className="text-[10px] text-stone-400">/ {max}</span>
    </div>
  );
}

function TypePill({ label, type }) {
  const colors =
    type === "weak"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  const prefix = type === "weak" ? "↑" : "↓";
  return (
    <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${colors}`}>
      {prefix} {ATTACK_ICONS[label]}
    </span>
  );
}

function PlacedToken({ type, amount }) {
  if (!amount || amount === 0) return null;
  return (
    <span className="text-[10px] bg-stone-700 text-white rounded px-1.5 py-0.5 font-mono">
      {ATTACK_ICONS[type]}{amount}
    </span>
  );
}

export default function EnemyComponent({ enemy, onAttack, availableAttackTypes, isMyTurn }) {
  const placed = enemy.placedAttacks || {};
  const hasPlaced = Object.values(placed).some((v) => v > 0);

  return (
    <div className="w-44 flex-shrink-0 bg-stone-100 border-2 border-stone-700 rounded-xl shadow-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-stone-800 px-2 py-1.5 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Enemy</div>
          <div className="text-white font-bold text-xs leading-tight">{enemy.name}</div>
        </div>
        <HPHeart current={enemy.currentHealth} max={enemy.maxHealth} />
      </div>

      {/* Illustration */}
      <div className="h-24 bg-gradient-to-b from-stone-200 to-stone-300 flex items-center justify-center text-5xl">
        {enemy.emoji || "👾"}
      </div>

      {/* Ability */}
      <div className="px-2 pt-2 pb-1 flex-1">
        {enemy.ability && (
          <div className="text-[10px] text-stone-700 leading-snug">
            {enemy.ability.description}
          </div>
        )}
        {enemy.flavorText && (
          <div className="mt-1 text-[9px] italic text-stone-400 leading-snug">"{enemy.flavorText}"</div>
        )}
      </div>

      {/* Reward */}
      <div className="mx-2 border-t-2 border-stone-600 mt-1" />
      <div className="px-2 py-1.5 bg-stone-200">
        <div className="text-[9px] font-bold tracking-widest text-stone-500 uppercase mb-0.5">Reward</div>
        <div className="text-[10px] text-stone-700 leading-snug">{enemy.reward?.description}</div>
      </div>

      {/* Weakness / resistance + placed tokens */}
      <div className="px-2 py-1.5 bg-white border-t border-stone-200 flex flex-wrap gap-1 items-center">
        {enemy.weakTo?.map((t) => <TypePill key={`w-${t}`} label={t} type="weak" />)}
        {enemy.resistantTo?.map((t) => <TypePill key={`r-${t}`} label={t} type="resist" />)}
        {hasPlaced && Object.entries(placed).map(([t, n]) => <PlacedToken key={t} type={t} amount={n} />)}
      </div>

      {/* Attack buttons */}
      {isMyTurn && availableAttackTypes.length > 0 && (
        <div className="px-2 pb-2 pt-1 flex flex-wrap gap-1">
          {availableAttackTypes.map(([type, amount]) => (
            <button
              key={type}
              onClick={() => onAttack(enemy.id, type)}
              className="text-[10px] bg-stone-700 hover:bg-stone-600 text-white px-2 py-1 rounded transition-colors font-semibold"
            >
              {ATTACK_ICONS[type]} {amount}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
