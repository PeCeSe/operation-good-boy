function SingleEvent({ event }) {
  const effects = [];
  const { effect } = event;
  if (effect.damageAll > 0) effects.push(`All players lose ${effect.damageAll} life`);
  if (effect.cucumberTokens > 0) effects.push(`+${effect.cucumberTokens} 🥒`);
  if (effect.discardCards > 0) effects.push(`Each player discards ${effect.discardCards} card(s)`);
  if (effect.blockShop) effects.push("Shop closed");
  if (effect.blockAttack) effects.push("Attacks blocked");
  if (effect.pawcoinPenalty > 0) effects.push(`-${effect.pawcoinPenalty} 🪙 per player`);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex-1 min-w-0">
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">📣</span>
        <div className="min-w-0">
          <div className="font-bold text-purple-800 text-sm leading-tight">{event.name}</div>
          {effects.length > 0 && (
            <div className="text-xs text-purple-600 mt-0.5">{effects.join(" · ")}</div>
          )}
          {event.flavorText && (
            <div className="text-xs text-stone-400 italic mt-1">"{event.flavorText}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventDisplay({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="flex gap-2">
      {events.map((event) => (
        <SingleEvent key={event.id} event={event} />
      ))}
    </div>
  );
}
