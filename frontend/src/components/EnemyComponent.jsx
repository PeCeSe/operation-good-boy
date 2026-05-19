import socket from "../socket";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };

function TypePill({ label, type }) {
  const cfg =
    type === "weak"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  return (
    <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${cfg}`}>
      {type === "weak" ? "↑" : "↓"} {ATTACK_ICONS[label]}
    </span>
  );
}

export default function EnemyComponent({ enemy, isOver = false, showControls = true }) {
  const handleDefeat = (e) => {
    e.stopPropagation();
    socket.emit("defeat_enemy", { enemyId: enemy.id });
  };

  return (
    <div
      className={`relative group w-full bg-stone-100 rounded-xl shadow-md overflow-hidden flex flex-col border-2 transition-all ${
        isOver ? "border-amber-400" : "border-stone-700"
      }`}
    >
      {showControls && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDefeat}
          className="absolute top-1.5 right-1.5 z-10 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ☠ Defeat
        </button>
      )}

      <div className="bg-stone-800 px-2 py-1.5">
        <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">
          Enemy · {enemy.maxHealth} HP
        </div>
        <div className="text-white font-bold text-sm leading-tight">{enemy.name}</div>
      </div>

      <div className="h-32 bg-gradient-to-b from-stone-200 to-stone-300 flex items-center justify-center text-6xl">
        {enemy.emoji || "👾"}
      </div>

      <div className="px-3 pt-2 pb-1 flex-1">
        {enemy.ability && (
          <div className="text-xs text-stone-700 leading-snug">{enemy.ability.description}</div>
        )}
        {enemy.flavorText && (
          <div className="mt-1.5 text-[10px] italic text-stone-400 leading-snug">
            "{enemy.flavorText}"
          </div>
        )}
      </div>

      <div className="mx-2 border-t-2 border-stone-600 mt-1" />
      <div className="px-3 py-2 bg-stone-200">
        <div className="text-[9px] font-bold tracking-widest text-stone-500 uppercase mb-0.5">Reward</div>
        <div className="text-xs text-stone-700 leading-snug">{enemy.reward?.description}</div>
      </div>

      {((enemy.weakTo?.length > 0) || (enemy.resistantTo?.length > 0)) && (
        <div className="px-3 py-2 bg-white border-t border-stone-200 flex flex-wrap gap-1">
          {enemy.weakTo?.map((t) => <TypePill key={`w-${t}`} label={t} type="weak" />)}
          {enemy.resistantTo?.map((t) => <TypePill key={`r-${t}`} label={t} type="resist" />)}
        </div>
      )}
    </div>
  );
}
