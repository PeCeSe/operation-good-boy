import socket from "../socket";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };

function TypePill({ label, type }) {
  const cfg =
    type === "weak"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  return (
    <span className={`text-[9px] font-semibold border rounded px-1 py-0.5 ${cfg}`}>
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
      className={`relative group w-full bg-stone-50 rounded-xl shadow-md overflow-hidden flex flex-col border-2 transition-all ${
        isOver ? "border-amber-400" : "border-stone-600"
      }`}
      style={{ height: 213 }}
    >
      {/* ── Header ── */}
      <div className="bg-stone-800 px-3 py-1.5 flex items-start justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm leading-tight truncate">{enemy.name}</div>
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Enemy</div>
        </div>
        {((enemy.weakTo?.length > 0) || (enemy.resistantTo?.length > 0)) && (
          <div className="flex flex-wrap gap-0.5 justify-end shrink-0 pt-0.5">
            {enemy.weakTo?.map((t) => <TypePill key={`w-${t}`} label={t} type="weak" />)}
            {enemy.resistantTo?.map((t) => <TypePill key={`r-${t}`} label={t} type="resist" />)}
          </div>
        )}
      </div>

      {/* ── Body: left text | right illustration ── */}
      <div className="flex flex-1 min-h-0">
        {/* Left: ability + reward */}
        <div className="flex flex-col px-2.5 py-2 min-w-0" style={{ width: 152 }}>
          <div className="flex-1 min-h-0 overflow-hidden">
            {enemy.ability ? (
              <div className="text-[11px] text-stone-700 leading-snug line-clamp-4">{enemy.ability.description}</div>
            ) : (
              <div className="text-[11px] text-stone-400 italic">No ability.</div>
            )}
          </div>
          {/* Reward section */}
          <div className="shrink-0 mt-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="h-px flex-1 bg-stone-400" />
              <span className="text-[8px] font-bold tracking-widest text-stone-500 uppercase">Reward</span>
              <div className="h-px flex-1 bg-stone-400" />
            </div>
            <div className="text-[11px] text-stone-600 leading-snug line-clamp-2">{enemy.reward?.description}</div>
          </div>
        </div>

        {/* Right: illustration + HP badge */}
        <div className="relative flex-1 bg-gradient-to-b from-stone-200 to-stone-300 flex items-center justify-center">
          {enemy.image
            ? <img src={enemy.image} alt={enemy.name} className="w-full h-full object-cover" />
            : <span className="text-5xl">{enemy.emoji || "👾"}</span>
          }
          {/* HP heart badge */}
          <div className="absolute bottom-2 right-2 flex items-center justify-center w-9 h-9 shadow-lg">
            <span className="absolute text-red-500 text-[2.2rem] leading-none" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}>♥</span>
            <span className="relative text-white font-bold text-sm leading-none z-10" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{enemy.maxHealth}</span>
          </div>
          {/* Defeat button */}
          {showControls && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleDefeat}
              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ☠
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
