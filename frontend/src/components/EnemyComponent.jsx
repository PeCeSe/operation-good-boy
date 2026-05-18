import { useDroppable } from "@dnd-kit/core";
import socket from "../socket";
import { ATTACK_CONFIG } from "./TokenPool";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };

function TypePill({ label, type }) {
  const cfg =
    type === "weak"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  const prefix = type === "weak" ? "↑" : "↓";
  return (
    <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${cfg}`}>
      {prefix} {ATTACK_ICONS[label]}
    </span>
  );
}

function DamageToken({ token, enemyId }) {
  const cfg = ATTACK_CONFIG[token.type] ?? ATTACK_CONFIG.scratch;
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        socket.emit("remove_from_enemy", { enemyId, tokenId: token.id });
      }}
      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm select-none hover:scale-110 hover:brightness-90 transition-transform ${cfg.bg} ${cfg.border}`}
      title={`${cfg.label} — click to remove`}
    >
      {cfg.icon}
    </button>
  );
}

export default function EnemyComponent({ enemy }) {
  const { setNodeRef, isOver } = useDroppable({ id: enemy.id });

  const damageTokens = enemy.damageTokens ?? [];

  const handleDefeat = (e) => {
    e.stopPropagation();
    socket.emit("defeat_enemy", { enemyId: enemy.id });
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative group w-44 flex-shrink-0 bg-stone-100 rounded-xl shadow-md overflow-hidden flex flex-col border-2 transition-all ${
        isOver ? "border-amber-400 shadow-lg scale-[1.02]" : "border-stone-700"
      }`}
    >
      {/* Hover-only defeat button */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleDefeat}
        className="absolute top-1.5 right-1.5 z-10 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ☠ Defeat
      </button>

      {/* Header */}
      <div className="bg-stone-800 px-2 py-1.5">
        <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">
          Enemy · {enemy.maxHealth} HP
        </div>
        <div className="text-white font-bold text-xs leading-tight">{enemy.name}</div>
      </div>

      {/* Illustration */}
      <div className="h-20 bg-gradient-to-b from-stone-200 to-stone-300 flex items-center justify-center text-5xl">
        {enemy.emoji || "👾"}
      </div>

      {/* Damage token drop zone */}
      <div
        className={`min-h-[2.5rem] px-2 py-1.5 border-b border-stone-200 transition-colors ${
          isOver ? "bg-amber-50" : "bg-white"
        }`}
      >
        {damageTokens.length === 0 ? (
          <div className={`text-[9px] italic transition-colors ${isOver ? "text-amber-400" : "text-stone-300"}`}>
            {isOver ? "Drop here!" : "No damage yet"}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {damageTokens.map((token) => (
              <DamageToken key={token.id} token={token} enemyId={enemy.id} />
            ))}
          </div>
        )}
      </div>

      {/* Ability */}
      <div className="px-2 pt-1.5 pb-1 flex-1">
        {enemy.ability && (
          <div className="text-[10px] text-stone-700 leading-snug">{enemy.ability.description}</div>
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
    </div>
  );
}
