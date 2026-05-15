export default function EventDisplay({ event }) {
  if (!event) return null;

  const effects = [];
  const { effect } = event;
  if (effect.damageAll > 0) effects.push(`All players lose ${effect.damageAll} life`);
  if (effect.cucumberTokens > 0) effects.push(`+${effect.cucumberTokens} 🥒`);
  if (effect.discardCards > 0) effects.push(`Each player discards ${effect.discardCards} card(s)`);
  if (effect.blockShop) effects.push("Shop closed");
  if (effect.blockAttack) effects.push("Attacks blocked");
  if (effect.pawcoinPenalty > 0) effects.push(`-${effect.pawcoinPenalty} 🪙 per player`);

  return (
    <div className="bg-purple-900/40 border border-purple-600/40 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📣</span>
        <div>
          <div className="font-bold text-purple-200 text-sm">{event.name}</div>
          {effects.length > 0 && (
            <div className="text-xs text-purple-300 mt-0.5">{effects.join(" · ")}</div>
          )}
          {event.flavorText && (
            <div className="text-xs text-slate-500 italic mt-1">{event.flavorText}</div>
          )}
        </div>
      </div>
    </div>
  );
}
