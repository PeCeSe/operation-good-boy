import { useState, useEffect, useRef } from "react";

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

function CardBack({ onFlip, isMyTurn, animClass }) {
  return (
    <div
      className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden select-none ${animClass} ${isMyTurn ? "cursor-pointer hover:scale-[1.02] transition-transform" : "cursor-default"}`}
      style={{ background: "linear-gradient(135deg, #292524 0%, #1c1917 100%)" }}
      onClick={isMyTurn ? onFlip : undefined}
    >
      <div className="h-56 flex flex-col items-center justify-center gap-4 relative px-6">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
        <div className="text-6xl opacity-30 select-none">🐾</div>
        {isMyTurn ? (
          <div className="text-amber-400 text-xs font-bold tracking-widest uppercase animate-pulse">Click to reveal</div>
        ) : (
          <div className="text-stone-600 text-xs font-semibold tracking-widest uppercase">Waiting…</div>
        )}
      </div>
    </div>
  );
}

function TurnStartCard({ item, isMyTurn, onAdvance }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-slide-up">
      <div className="bg-amber-500 px-5 py-4 text-center">
        <div className="text-[9px] font-bold tracking-widest text-amber-100 uppercase mb-1">Round {item.roundNumber}</div>
        <div className="text-2xl font-bold text-white">
          {isMyTurn ? "Your turn!" : `${item.playerName}'s turn`}
        </div>
      </div>
      <div className="px-5 py-6 flex flex-col items-center gap-4">
        <div className="text-5xl">{isMyTurn ? "⚔️" : "👀"}</div>
        {isMyTurn ? (
          <button
            onClick={onAdvance}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg text-sm transition-colors"
          >
            Let's go! →
          </button>
        ) : (
          <div className="text-stone-400 text-sm italic">Waiting for {item.playerName}…</div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-flip-in">
      <div className="bg-indigo-700 px-5 py-3 flex items-center gap-2">
        <span className="text-2xl">📣</span>
        <div>
          <div className="text-[9px] font-bold tracking-widest text-indigo-200 uppercase">Event</div>
          <div className="text-white font-bold text-sm leading-tight">{event.name}</div>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {event.flavorText && <p className="text-xs italic text-stone-400">"{event.flavorText}"</p>}
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
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-flip-in">
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

function EffectResult({ effectResult, isMyTurn, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);

  const { cucumberDelta, locationName, locationCurrent, locationMax, lifeDeltas } = effectResult;
  const hasChanges = cucumberDelta !== 0 || lifeDeltas.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-slide-up">
      <div className="bg-stone-700 px-5 py-3">
        <div className="text-[9px] font-bold tracking-widest text-stone-300 uppercase">Effect applied</div>
      </div>
      <div className="px-5 py-4 space-y-4">
        {!hasChanges && <p className="text-sm text-stone-400 italic text-center">No visible changes.</p>}

        {cucumberDelta !== 0 && (
          <div className="space-y-2">
            <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">{locationName}</div>
            <div className="flex gap-1 flex-wrap items-center">
              {Array.from({ length: locationMax }).map((_, i) => {
                const isNew = cucumberDelta > 0 && i >= locationCurrent - cucumberDelta && i < locationCurrent;
                const isFilled = i < locationCurrent;
                return (
                  <span
                    key={i}
                    className={`text-xl ${isFilled ? "" : "opacity-20"} ${isNew ? "anim-cucumber-pop" : ""}`}
                    style={isNew ? { animationDelay: `${400 + (i - (locationCurrent - cucumberDelta)) * 120}ms`, opacity: 0 } : {}}
                  >
                    🥒
                  </span>
                );
              })}
            </div>
            <div className="text-xs text-stone-400">{locationCurrent} / {locationMax} cucumbers</div>
          </div>
        )}

        {lifeDeltas.map(({ playerId, name, delta, newLives, maxLives, becameStunned }) => {
          const oldLives = newLives - delta;
          return (
            <div key={playerId} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700">{name}</span>
                {becameStunned && <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 rounded px-1">STUNNED!</span>}
                {delta < 0 && <span className="text-xs text-red-500 font-semibold">{delta} life</span>}
                {delta > 0 && <span className="text-xs text-green-600 font-semibold">+{delta} life</span>}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: maxLives }).map((_, i) => {
                  const wasLost = delta < 0 && i >= newLives && i < oldLives;
                  const isFull = i < newLives;
                  return (
                    <span
                      key={i}
                      className={`text-lg leading-none ${wasLost ? "anim-heart-loss text-red-400" : isFull ? "text-red-400" : "text-stone-200"}`}
                      style={wasLost ? { animationDelay: `${400 + (i - newLives) * 100}ms` } : {}}
                    >
                      {isFull || wasLost ? "♥" : "♡"}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {isMyTurn && (
        <div className="px-5 pb-4">
          <button
            onClick={onDone}
            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

export default function PhaseOverlay({ pendingPhase, isMyTurn, onReveal, onAdvance, effectResult, onEffectDone }) {
  const [flippingOut, setFlippingOut] = useState(false);
  const prevRevealedRef = useRef(null);
  const [nonActiveAnimIn, setNonActiveAnimIn] = useState(false);

  const item = pendingPhase ? pendingPhase.items[pendingPhase.resolvedIndex] : null;
  const revealed = pendingPhase?.currentRevealed ?? false;
  const total = pendingPhase?.items.length ?? 0;
  const progress = pendingPhase?.resolvedIndex ?? 0;

  // For non-active players: trigger flip-in anim when revealed transitions false→true
  useEffect(() => {
    const prev = prevRevealedRef.current;
    if (prev === false && revealed === true && !isMyTurn) {
      setNonActiveAnimIn(true);
      const t = setTimeout(() => setNonActiveAnimIn(false), 400);
      return () => clearTimeout(t);
    }
    prevRevealedRef.current = revealed;
  }, [revealed, isMyTurn]);

  // Reset flip state when item changes
  useEffect(() => {
    setFlippingOut(false);
  }, [pendingPhase?.resolvedIndex]);

  if (!pendingPhase && !effectResult) return null;

  const handleFlip = () => {
    if (!isMyTurn || flippingOut || revealed) return;
    setFlippingOut(true);
    setTimeout(() => {
      onReveal();
      setFlippingOut(false);
    }, 220);
  };

  const progressDots = total > 1 ? (
    <div className="flex gap-2 mb-2">
      {pendingPhase.items.map((_, i) => (
        <span key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < progress ? "bg-stone-500" : i === progress ? "bg-amber-400 scale-125" : "bg-stone-700"}`} />
      ))}
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm px-4">
      <div className="flex flex-col items-center gap-4 w-full">
        {effectResult ? (
          <EffectResult effectResult={effectResult} isMyTurn={isMyTurn} onDone={onEffectDone} />
        ) : item?.kind === "turn_start" ? (
          <TurnStartCard item={item} isMyTurn={isMyTurn} onAdvance={onAdvance} />
        ) : !revealed ? (
          <>
            {progressDots}
            <CardBack onFlip={handleFlip} isMyTurn={isMyTurn} animClass={flippingOut ? "anim-flip-out" : ""} />
          </>
        ) : (
          <>
            {progressDots}
            {item?.kind === "event" ? (
              <EventCard event={item.data} />
            ) : (
              <EnemyAbilityCard item={item} />
            )}
            <div className="flex flex-col items-center gap-2">
              {isMyTurn ? (
                <button
                  onClick={onAdvance}
                  className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg text-sm transition-colors"
                >
                  Apply Effect →
                </button>
              ) : (
                <div className="text-stone-300 text-sm italic">Waiting for active player…</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
