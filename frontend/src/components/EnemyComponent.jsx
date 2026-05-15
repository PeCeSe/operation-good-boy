const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };

export default function EnemyComponent({ enemy, onAttack, availableAttackTypes, isMyTurn }) {
  const hpPct = Math.max(0, (enemy.currentHealth / enemy.maxHealth) * 100);

  return (
    <div className="bg-white border-2 border-red-300 rounded-xl p-3 w-44 flex-shrink-0 shadow-sm">
      <div className="font-bold text-sm text-red-600 mb-1">{enemy.name}</div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-stone-500 mb-0.5">
          <span>HP</span>
          <span>{enemy.currentHealth}/{enemy.maxHealth}</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-400 rounded-full transition-all"
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-stone-500 mb-2">⚔️ Attacks for {enemy.attack}/round</div>

      {enemy.weakTo.length > 0 && (
        <div className="text-xs mb-1">
          <span className="text-green-600 font-semibold">Weak: </span>
          {enemy.weakTo.map((t) => (
            <span key={t} className="mr-1">{ATTACK_ICONS[t]} {t}</span>
          ))}
        </div>
      )}
      {enemy.resistantTo.length > 0 && (
        <div className="text-xs mb-2">
          <span className="text-red-500 font-semibold">Resistant: </span>
          {enemy.resistantTo.map((t) => (
            <span key={t} className="mr-1">{ATTACK_ICONS[t]} {t}</span>
          ))}
        </div>
      )}

      {isMyTurn && (
        <div className="flex flex-wrap gap-1 mt-1">
          {availableAttackTypes.map(([type, amount]) => (
            <button
              key={type}
              onClick={() => onAttack(enemy.id, type)}
              className="text-[10px] bg-red-500 hover:bg-red-400 text-white px-1.5 py-0.5 rounded transition-colors"
            >
              {ATTACK_ICONS[type]} {amount}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
