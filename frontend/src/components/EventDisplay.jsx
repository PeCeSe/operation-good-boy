import PawCoin from "./PawCoin";

function effectLines(effect) {
  const lines = [];
  if (effect.damageAll > 0) lines.push(`All players lose ${effect.damageAll} life.`);
  if (effect.cucumberTokens > 0) lines.push(`+${effect.cucumberTokens} 🥒 to location.`);
  if (effect.discardCards > 0) lines.push(`Each player discards ${effect.discardCards} card(s).`);
  if (effect.blockShop) lines.push("Shop is closed.");
  if (effect.blockAttack) lines.push("Attacks blocked.");
  if (effect.pawcoinPenalty > 0) lines.push(<>-{effect.pawcoinPenalty} <PawCoin /> per player.</>);
  return lines;
}

function EventCard({ event }) {
  const lines = effectLines(event.effect);
  return (
    <div className="w-36 flex-shrink-0 bg-purple-50 border-2 border-purple-300 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-purple-700 px-2 py-1 text-center">
        <span className="text-[9px] font-bold tracking-widest text-purple-200 uppercase">Event</span>
      </div>

      {/* Image placeholder */}
      <div className="h-20 bg-gradient-to-b from-purple-100 to-purple-200 flex items-center justify-center text-4xl">
        📣
      </div>

      {/* Name */}
      <div className="px-2 pt-2 pb-1">
        <div className="font-bold text-xs text-purple-900 leading-tight">{event.name}</div>
      </div>

      {/* Effects */}
      {lines.length > 0 && (
        <div className="px-2 pb-1 space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className="text-[10px] text-stone-700">{line}</div>
          ))}
        </div>
      )}

      {/* Flavor */}
      {event.flavorText && (
        <>
          <div className="mx-2 border-t border-purple-200" />
          <div className="px-2 pt-1 pb-2 text-[9px] italic text-stone-400 leading-snug">
            "{event.flavorText}"
          </div>
        </>
      )}
      {!event.flavorText && <div className="pb-2" />}
    </div>
  );
}

export default function EventDisplay({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="flex gap-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
