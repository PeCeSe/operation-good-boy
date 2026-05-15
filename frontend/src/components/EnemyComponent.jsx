import { useState } from "react";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };
const TOKEN_COLORS = {
  scratch: "bg-orange-200 border-orange-400 text-orange-700",
  bite:    "bg-red-200 border-red-400 text-red-700",
  ignore:  "bg-blue-200 border-blue-400 text-blue-700",
  charm:   "bg-purple-200 border-purple-400 text-purple-700",
};

function calcEffective(placed, weakTo, resistantTo) {
  return Object.entries(placed).reduce((sum, [type, n]) => {
    if (weakTo.includes(type)) return sum + n * 2;
    if (resistantTo.includes(type)) return sum + Math.floor(n / 2);
    return sum + n;
  }, 0);
}

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
      <span className={`w-6 h-6 ${base} opacity-35 flex-shrink-0`}>{ATTACK_ICONS[type]}</span>
    );
  }
  return <span className={`w-6 h-6 ${base} flex-shrink-0`}>{ATTACK_ICONS[type]}</span>;
}

function AttackTokens({ placedAttacks, maxHealth, weakTo = [], resistantTo = [] }) {
  const placed = placedAttacks || {};
  const hasAny = Object.values(placed).some((v) => v > 0);
  const effectiveDamage = calcEffective(placed, weakTo, resistantTo);

  return (
    <div className="px-2 py-2 bg-stone-50 border-t border-stone-200 min-h-[3rem]">
      {hasAny ? (
        <>
          <div className="flex flex-wrap gap-1 mb-1 items-center">
            {Object.entries(placed).flatMap(([type, count]) => {
              const modifier = weakTo.includes(type) ? "weak" : resistantTo.includes(type) ? "resist" : "normal";
              return Array.from({ length: count }).map((_, i) => (
                <Token key={`${type}-${i}`} type={type} modifier={modifier} />
              ));
            })}
          </div>
          <div className="text-[10px] text-stone-400">{effectiveDamage} / {maxHealth} damage</div>
        </>
      ) : (
        <div className="text-[10px] text-stone-300 italic">No attacks placed yet</div>
      )}
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

export default function EnemyComponent({ enemy, onAttack, availableAttackTypes, isMyTurn, draggingAttackType }) {
  const [dragOver, setDragOver] = useState(false);
  const placed = enemy.placedAttacks || {};
  const isDropTarget = isMyTurn && !!draggingAttackType;

  const handleDragOver = (e) => {
    if (!isDropTarget) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData("text/plain");
    if (type) onAttack(enemy.id, type);
  };

  return (
    <div
      className={`w-44 flex-shrink-0 bg-stone-100 rounded-xl shadow-md overflow-hidden flex flex-col transition-all border-2 ${
        dragOver
          ? "border-amber-400 shadow-lg scale-105"
          : isDropTarget
          ? "border-amber-300 border-dashed"
          : "border-stone-700"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="bg-stone-800 px-2 py-1.5 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Enemy</div>
          <div className="text-white font-bold text-xs leading-tight">{enemy.name}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-white font-bold text-lg leading-none">{enemy.maxHealth}</div>
          <div className="text-stone-400 text-[9px]">HP</div>
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

      {/* Placed attack tokens */}
      <AttackTokens placedAttacks={enemy.placedAttacks} maxHealth={enemy.maxHealth} weakTo={enemy.weakTo} resistantTo={enemy.resistantTo} />

      {/* Drop hint */}
      {isDropTarget && (
        <div className="px-2 py-1.5 bg-amber-50 border-t border-amber-200 text-center text-[10px] text-amber-500 font-semibold">
          Drop attack here
        </div>
      )}
    </div>
  );
}
