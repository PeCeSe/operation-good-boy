function describeEventEffect(effect) {
  if (!effect) return "Something happens.";
  const parts = [];
  if (effect.damageAll > 0) parts.push(`All players lose ${effect.damageAll} life.`);
  if (effect.cucumberTokens > 0) parts.push(`Add ${effect.cucumberTokens} 🥒 to the location.`);
  if (effect.discardCards > 0) parts.push(`Each player discards ${effect.discardCards} card(s).`);
  if (effect.blockShop) parts.push("Shop is closed this round.");
  if (effect.blockAttack) parts.push("Players cannot attack this round.");
  if (effect.pawcoinPenalty > 0) parts.push(`Players generate ${effect.pawcoinPenalty} fewer 🪙 this round.`);
  return parts.length > 0 ? parts.join(" ") : "No effect.";
}

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
      <div className="bg-indigo-700 px-5 py-3 flex items-center gap-2">
        <span className="text-2xl">📣</span>
        <div>
          <div className="text-[9px] font-bold tracking-widest text-indigo-200 uppercase">Event</div>
          <div className="text-white font-bold text-sm leading-tight">{event.name}</div>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {event.flavorText && (
          <p className="text-xs italic text-stone-400">"{event.flavorText}"</p>
        )}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Effect</div>
          <p className="text-sm text-indigo-900 font-semibold">{describeEventEffect(event.effect)}</p>
        </div>
      </div>
    </div>
  );
}

function EnemyAbilityCard({ item }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
      <div className="bg-stone-800 px-5 py-3 flex items-center gap-2">
        <span className="text-2xl">{item.enemyEmoji || "👾"}</span>
        <div>
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Enemy Ability</div>
          <div className="text-white font-bold text-sm leading-tight">{item.enemyName}</div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-1">Ability</div>
          <p className="text-sm text-stone-800 font-semibold">{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function PhaseOverlay({ pendingPhase, isMyTurn, onAdvance }) {
  if (!pendingPhase) return null;

  const { items, resolvedIndex } = pendingPhase;
  const current = items[resolvedIndex];
  const total = items.length;
  const progress = resolvedIndex + 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Progress dots */}
        {total > 1 && (
          <div className="flex gap-2">
            {items.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < resolvedIndex
                    ? "bg-stone-400"
                    : i === resolvedIndex
                    ? "bg-amber-400 scale-125"
                    : "bg-stone-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Card */}
        {current.kind === "event" ? (
          <EventCard event={current.data} />
        ) : (
          <EnemyAbilityCard item={current} />
        )}

        {/* Counter */}
        <div className="text-stone-400 text-xs">
          {progress} / {total}
        </div>

        {/* Continue button — only active player can advance */}
        {isMyTurn ? (
          <button
            onClick={onAdvance}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors text-sm"
          >
            {resolvedIndex + 1 < total ? "Continue →" : "Start Turn →"}
          </button>
        ) : (
          <div className="text-stone-400 text-sm italic">Waiting for active player…</div>
        )}
      </div>
    </div>
  );
}
