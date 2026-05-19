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
      style={{ height: 213 }}
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

      <div className="bg-stone-800 px-3 py-1 flex items-center justify-between gap-2">
        <div className="text-white font-bold text-sm leading-tight truncate">{enemy.name}</div>
        <div className="text-[9px] font-bold tracking-wide text-stone-400 uppercase shrink-0">{enemy.maxHealth} HP</div>
      </div>

      <div className="h-[90px] bg-gradient-to-b from-stone-200 to-stone-300 flex items-center justify-center text-5xl shrink-0">
        {enemy.emoji || "👾"}
      </div>

      <div className="px-3 pt-1.5 pb-0 flex-1 min-h-0 overflow-hidden">
        {enemy.ability && (
          <div className="text-[11px] text-stone-700 leading-snug line-clamp-2">{enemy.ability.description}</div>
        )}
        {enemy.flavorText && (
          <div className="mt-1 text-[10px] italic text-stone-400 leading-snug line-clamp-1">
            "{enemy.flavorText}"
          </div>
        )}
      </div>

      <div className="shrink-0">
        <div className="mx-3 border-t border-stone-400" />
        <div className="px-3 py-1 bg-stone-200 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[8px] font-bold tracking-widest text-stone-500 uppercase">Reward</div>
            <div className="text-[11px] text-stone-700 leading-snug line-clamp-1">{enemy.reward?.description}</div>
          </div>
          {((enemy.weakTo?.length > 0) || (enemy.resistantTo?.length > 0)) && (
            <div className="flex flex-wrap gap-0.5 justify-end shrink-0">
              {enemy.weakTo?.map((t) => <TypePill key={`w-${t}`} label={t} type="weak" />)}
              {enemy.resistantTo?.map((t) => <TypePill key={`r-${t}`} label={t} type="resist" />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
