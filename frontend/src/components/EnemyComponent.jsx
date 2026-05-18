import socket from "../socket";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };
const TOKEN_BG     = { scratch: "bg-orange-200", bite: "bg-red-200",    ignore: "bg-blue-200",   charm: "bg-purple-200" };
const TOKEN_BORDER = { scratch: "border-orange-400", bite: "border-red-400", ignore: "border-blue-400", charm: "border-purple-400" };
const TOKEN_TEXT   = { scratch: "text-orange-700", bite: "text-red-700",   ignore: "text-blue-700",  charm: "text-purple-700" };
const TOKEN_COLORS = {
  scratch: "bg-orange-200 border-orange-400 text-orange-700",
  bite:    "bg-red-200 border-red-400 text-red-700",
  ignore:  "bg-blue-200 border-blue-400 text-blue-700",
  charm:   "bg-purple-200 border-purple-400 text-purple-700",
};

function Token({ type, modifier }) {
  const base = `rounded-full border-2 flex items-center justify-center text-xs ${TOKEN_COLORS[type]}`;
  if (modifier === "weak") {
    return (
      <span className="relative inline-flex w-7 h-7 flex-shrink-0">
        <span className={`absolute w-5 h-5 ${base}`} style={{ top: 0, left: 0 }}>{ATTACK_ICONS[type]}</span>
        <span className={`absolute w-5 h-5 ${base}`} style={{ top: 4, left: 4 }}>{ATTACK_ICONS[type]}</span>
      </span>
    );
  }
  if (modifier === "resist") {
    return (
      <span className={`relative w-6 h-6 rounded-full border-2 ${TOKEN_BORDER[type]} overflow-hidden flex-shrink-0`}>
        <span className={`absolute left-0 top-0 w-1/2 h-full ${TOKEN_BG[type]}`} />
        <span className="absolute right-0 top-0 w-1/2 h-full bg-stone-100" />
        <span className={`absolute inset-0 flex items-center justify-center text-xs ${TOKEN_TEXT[type]}`}>
          {ATTACK_ICONS[type]}
        </span>
      </span>
    );
  }
  return <span className={`w-6 h-6 ${base} flex-shrink-0`}>{ATTACK_ICONS[type]}</span>;
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

export default function EnemyComponent({ enemy }) {
  const currentHealth = enemy.currentHealth ?? enemy.maxHealth;

  const handleHpUp = (e) => {
    e.stopPropagation();
    socket.emit("set_enemy_hp", { enemyId: enemy.id, hp: currentHealth + 1 });
  };

  const handleHpDown = (e) => {
    e.stopPropagation();
    socket.emit("set_enemy_hp", { enemyId: enemy.id, hp: Math.max(0, currentHealth - 1) });
  };

  const handleDefeat = (e) => {
    e.stopPropagation();
    socket.emit("defeat_enemy", { enemyId: enemy.id });
  };

  return (
    <div className="w-44 flex-shrink-0 bg-stone-100 rounded-xl shadow-md overflow-hidden flex flex-col border-2 border-stone-700">
      {/* Header */}
      <div className="bg-stone-800 px-2 py-1.5 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Enemy</div>
          <div className="text-white font-bold text-xs leading-tight">{enemy.name}</div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={handleHpDown}
            className="w-5 h-5 rounded bg-stone-600 hover:bg-stone-500 text-white text-xs font-bold flex items-center justify-center transition-colors"
            title="Decrease HP"
          >
            −
          </button>
          <div className="text-right">
            <div className="text-white font-bold text-lg leading-none">{currentHealth}</div>
            <div className="text-stone-400 text-[9px]">/{enemy.maxHealth}</div>
          </div>
          <button
            onClick={handleHpUp}
            className="w-5 h-5 rounded bg-stone-600 hover:bg-stone-500 text-white text-xs font-bold flex items-center justify-center transition-colors"
            title="Increase HP"
          >
            +
          </button>
        </div>
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

      {/* Weakness / resistance */}
      {((enemy.weakTo?.length > 0) || (enemy.resistantTo?.length > 0)) && (
        <div className="px-2 py-1.5 bg-white border-t border-stone-200 flex flex-wrap gap-1">
          {enemy.weakTo?.map((t) => <TypePill key={`w-${t}`} label={t} type="weak" />)}
          {enemy.resistantTo?.map((t) => <TypePill key={`r-${t}`} label={t} type="resist" />)}
        </div>
      )}

      {/* Defeat button */}
      <button
        onClick={handleDefeat}
        className="mx-2 mb-2 mt-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-1.5 rounded-lg transition-colors"
      >
        Defeat ✓
      </button>
    </div>
  );
}
