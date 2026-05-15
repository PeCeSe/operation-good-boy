import { useState } from "react";
import PlayerHand from "./PlayerHand";

const ATTACK_ICONS = { scratch: "🐾", bite: "🦷", ignore: "🙄", charm: "✨" };
const ATTACK_COLORS = {
  scratch: { active: "border-orange-300 bg-orange-50 text-orange-700", inactive: "border-stone-200 bg-stone-50 text-stone-300" },
  bite:    { active: "border-red-300 bg-red-50 text-red-700",          inactive: "border-stone-200 bg-stone-50 text-stone-300" },
  ignore:  { active: "border-blue-300 bg-blue-50 text-blue-700",       inactive: "border-stone-200 bg-stone-50 text-stone-300" },
  charm:   { active: "border-purple-300 bg-purple-50 text-purple-700", inactive: "border-stone-200 bg-stone-50 text-stone-300" },
};

function ResourceBadge({ icon, amount, colorClass }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base transition-all ${colorClass}`}>
        {amount}
      </div>
      <span className="text-sm leading-none">{icon}</span>
    </div>
  );
}

function PileBadge({ count, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-10 h-10 rounded border-2 border-amber-700 bg-amber-800 flex items-center justify-center font-bold text-sm text-white">
        {count}
      </div>
      <span className="text-[10px] text-stone-400 uppercase tracking-wide leading-none">{label}</span>
    </div>
  );
}

function Lives({ lives, max }) {
  return (
    <div className="flex gap-0.5 flex-wrap justify-end">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-lg leading-none ${i < lives ? "text-red-400" : "text-stone-200"}`}>
          ♥
        </span>
      ))}
    </div>
  );
}

export default function PlayerBoard({ player, isMyTurn, onEndTurn, onDragAttackStart, onDragAttackEnd }) {
  const [showCharacter, setShowCharacter] = useState(false);
  if (!player) return null;

  const { name, character, lives, isStunned, hand, deck, discard, currentPawcoins, currentAttack } = player;

  return (
    <div className={`rounded-xl border-2 shadow-md overflow-hidden transition-all ${isMyTurn ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header: name + lives + chevron */}
      <div className={`flex items-center justify-between px-4 py-2 ${isMyTurn ? "bg-amber-50" : "bg-stone-50"}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{character.emoji}</span>
          <span className="font-bold text-stone-800">{name}</span>
          <span className="text-stone-400 text-xs">(you)</span>
          {isStunned && (
            <span className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
              STUNNED
            </span>
          )}
          {isMyTurn && (
            <span className="text-xs text-amber-600 font-semibold animate-pulse">Your turn!</span>
          )}
          <button
            onClick={() => setShowCharacter((v) => !v)}
            className="ml-1 text-stone-400 hover:text-stone-600 transition-colors flex items-center"
            title={showCharacter ? "Hide character" : "Show character"}
          >
            <span className="text-xs">{showCharacter ? "▲" : "▼"}</span>
          </button>
        </div>
        <Lives lives={lives} max={character.maxLives} />
      </div>

      {/* Collapsible character section */}
      {showCharacter && (
        <div className={`border-t border-stone-100 px-4 py-3 flex gap-4 items-start ${isMyTurn ? "bg-amber-50/60" : "bg-stone-50/60"}`}>
          <div className="w-16 h-20 rounded-lg bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-300 flex items-center justify-center text-4xl flex-shrink-0 shadow-sm">
            {character.emoji}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-stone-800 text-sm">{character.name}</div>
            {character.passiveAbility?.description && (
              <div className="text-xs text-stone-600 mt-1">
                <span className="font-semibold text-stone-500">Passive:</span> {character.passiveAbility.description}
              </div>
            )}
            {character.flavorText && (
              <div className="text-xs text-stone-400 italic mt-1">"{character.flavorText}"</div>
            )}
            <div className="text-xs text-stone-400 mt-1">Max lives: {character.maxLives}</div>
          </div>
        </div>
      )}

      {/* Resources + piles + End Turn */}
      <div className="bg-white border-t border-b border-stone-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Pawcoins */}
        <ResourceBadge
          icon="🪙"
          amount={currentPawcoins}
          colorClass={currentPawcoins > 0 ? "border-amber-300 bg-amber-50 text-amber-700" : "border-stone-200 bg-stone-50 text-stone-300"}
        />

        <div className="w-px h-10 bg-stone-200 flex-shrink-0" />

        {/* Attack types — draggable when > 0 */}
        {Object.entries(currentAttack).map(([type, amount]) => {
          const active = amount > 0 && isMyTurn;
          return (
            <div
              key={type}
              draggable={active}
              onDragStart={active ? (e) => {
                e.dataTransfer.setData("attackType", type);
                e.dataTransfer.effectAllowed = "move";
                onDragAttackStart?.(type);
              } : undefined}
              onDragEnd={active ? () => onDragAttackEnd?.() : undefined}
              className={active ? "cursor-grab active:cursor-grabbing" : ""}
            >
              <ResourceBadge
                icon={ATTACK_ICONS[type]}
                amount={amount}
                colorClass={amount > 0 ? ATTACK_COLORS[type].active : ATTACK_COLORS[type].inactive}
              />
            </div>
          );
        })}

        <div className="w-px h-10 bg-stone-200 flex-shrink-0" />

        {/* Draw + Discard piles */}
        <PileBadge count={deck.length} label="Draw" />
        <PileBadge count={discard.length} label="Discard" />

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

      {/* Hand area */}
      <div className="bg-stone-50 px-4 py-3">
        <PlayerHand hand={hand} isMyTurn={isMyTurn} />
      </div>
    </div>
  );
}
