import { useState, useEffect, useRef } from "react";
import PawCoin from "./PawCoin";

function DescribeEventEffect({ effect }) {
  if (!effect) return <>Something happens.</>;
  const parts = [];
  if (effect.damageAll > 0) parts.push(`All players lose ${effect.damageAll} life.`);
  if (effect.cucumberTokens > 0) parts.push(`Add ${effect.cucumberTokens} 🥒 to the location.`);
  if (effect.discardCards > 0) parts.push(`Each player discards ${effect.discardCards} card(s).`);
  if (effect.blockShop) parts.push("Shop is closed this round.");
  if (effect.blockAttack) parts.push("Players cannot attack this round.");
  if (effect.pawcoinPenalty > 0) parts.push(<>Players generate {effect.pawcoinPenalty} fewer <PawCoin /> this round.</>);
  if (parts.length === 0) return <>No effect.</>;
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && " "}{p}</span>)}</>;
}

function CardBack({ onFlip, isMyTurn, animClass }) {
  return (
    <div
      className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden select-none ${animClass} ${isMyTurn ? "cursor-pointer hover:scale-[1.02] transition-transform" : "cursor-default"}`}
      style={{ background: "linear-gradient(135deg, #2e2318 0%, #1a1208 100%)" }}
      onClick={isMyTurn ? onFlip : undefined}
    >
      <div className="h-56 flex flex-col items-center justify-center gap-4 relative px-6">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
        <div className="text-6xl opacity-30 select-none">🐾</div>
        {isMyTurn ? (
          <div className="text-gold text-xs font-bold tracking-widest uppercase animate-pulse">Click to reveal</div>
        ) : (
          <div className="text-ink-300 text-xs font-semibold tracking-widest uppercase">Waiting…</div>
        )}
      </div>
    </div>
  );
}

function TurnStartCard({ item, isMyTurn, onAdvance }) {
  return (
    <div className="bg-paper-50 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-slide-up border-2 border-ink-border">
      <div className="bg-moss px-5 py-4 text-center">
        <div className="text-[9px] font-bold tracking-widest text-moss-soft uppercase mb-1">Round {item.roundNumber}</div>
        <div className="font-display text-2xl text-white" style={{ letterSpacing: "0.04em" }}>
          {isMyTurn ? "Your turn!" : `${item.playerName}'s turn`}
        </div>
      </div>
      <div className="px-5 py-6 flex flex-col items-center gap-4">
        <div className="text-5xl">{isMyTurn ? "⚔️" : "👀"}</div>
        {isMyTurn ? (
          <button
            onClick={onAdvance}
            className="bg-moss hover:bg-moss-deep text-white font-bold px-8 py-3 rounded-xl shadow-lg text-sm transition-colors"
          >
            Let's go! →
          </button>
        ) : (
          <div className="text-ink-500 text-sm italic">Waiting for {item.playerName}…</div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div className="bg-paper-50 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-flip-in border-2 border-ink-border">
      <div className="bg-plum-deep px-5 py-3 flex items-center gap-2">
        <span className="text-2xl">📣</span>
        <div>
          <div className="text-[9px] font-bold tracking-widest text-plum-soft uppercase">Event</div>
          <div className="font-display text-base text-white leading-tight" style={{ letterSpacing: "0.04em" }}>
            {event.name}
          </div>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {event.flavorText && (
          <p className="text-xs font-flavor italic text-ink-500">"{event.flavorText}"</p>
        )}
        <div className="bg-plum-lighter border border-plum-soft rounded-lg px-3 py-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-plum mb-1">Effect</div>
          <p className="text-sm font-body text-ink-700 font-semibold">
            {event.description || <DescribeEventEffect effect={event.effect} />}
          </p>
        </div>
      </div>
    </div>
  );
}

function EnemyAbilityCard({ item }) {
  return (
    <div className="bg-paper-50 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-flip-in border-2 border-ink-border">
      <div className="bg-brown-deep px-5 py-3 flex items-center gap-2">
        <span className="text-2xl">{item.enemyEmoji || "👾"}</span>
        <div>
          <div className="text-[9px] font-bold tracking-widest text-brown-soft uppercase">Enemy Ability</div>
          <div className="font-display text-base text-white leading-tight" style={{ letterSpacing: "0.04em" }}>
            {item.enemyName}
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="bg-sepia-lighter border border-sepia-soft rounded-lg px-3 py-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-sepia mb-1">Ability</div>
          <p className="text-sm font-body text-ink-700 font-semibold">{item.description}</p>
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
    <div className="bg-paper-50 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden anim-slide-up border-2 border-ink-border">
      <div className="bg-ink-700 px-5 py-3">
        <div className="text-[9px] font-bold tracking-widest text-ink-300 uppercase">Effect applied</div>
      </div>
      <div className="px-5 py-4 space-y-4">
        {!hasChanges && <p className="text-sm text-ink-300 italic text-center">No visible changes.</p>}

        {cucumberDelta !== 0 && (
          <div className="space-y-2">
            <div className="text-[9px] font-bold tracking-widest text-ink-500 uppercase">{locationName}</div>
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
            <div className="text-xs text-ink-500">{locationCurrent} / {locationMax} cucumbers</div>
          </div>
        )}

        {lifeDeltas.map(({ playerId, name, delta, newLives, maxLives, becameStunned }) => {
          const oldLives = newLives - delta;
          return (
            <div key={playerId} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-700">{name}</span>
                {becameStunned && (
                  <span className="text-[10px] font-bold text-red-deep bg-red-soft border border-red rounded px-1">STUNNED!</span>
                )}
                {delta < 0 && <span className="text-xs text-red font-semibold">{delta} life</span>}
                {delta > 0 && <span className="text-xs text-moss font-semibold">+{delta} life</span>}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: maxLives }).map((_, i) => {
                  const wasLost = delta < 0 && i >= newLives && i < oldLives;
                  const isFull = i < newLives;
                  return (
                    <span
                      key={i}
                      className={`text-lg leading-none ${wasLost ? "anim-heart-loss text-red" : isFull ? "text-red" : "text-ink-300"}`}
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
            className="w-full bg-moss hover:bg-moss-deep text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
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

  useEffect(() => {
    const prev = prevRevealedRef.current;
    if (prev === false && revealed === true && !isMyTurn) {
      setNonActiveAnimIn(true);
      const t = setTimeout(() => setNonActiveAnimIn(false), 400);
      return () => clearTimeout(t);
    }
    prevRevealedRef.current = revealed;
  }, [revealed, isMyTurn]);

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
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i < progress ? "bg-ink-500" : i === progress ? "bg-gold scale-125" : "bg-ink-border"
          }`}
        />
      ))}
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/65 backdrop-blur-sm px-4">
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
                  className="bg-moss hover:bg-moss-deep text-white font-bold px-8 py-3 rounded-xl shadow-lg text-sm transition-colors"
                >
                  Apply Effect →
                </button>
              ) : (
                <div className="text-paper-50 text-sm italic">Waiting for active player…</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
