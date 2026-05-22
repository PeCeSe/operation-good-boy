import { useDraggable, useDroppable } from "@dnd-kit/core";
import socket from "../socket";

function effectLines(effect) {
  if (!effect) return [];
  const lines = [];
  if (effect.damageAll > 0)      lines.push(`All players lose ${effect.damageAll} ♥`);
  if (effect.cucumberTokens > 0) lines.push(`Add ${effect.cucumberTokens} 🥒`);
  if (effect.discardCards > 0)   lines.push(`Each player discards ${effect.discardCards} card${effect.discardCards > 1 ? "s" : ""}`);
  if (effect.pawcoinPenalty > 0) lines.push(`-${effect.pawcoinPenalty} 🪙 per player`);
  if (effect.blockShop)          lines.push("Shop is closed this turn");
  if (effect.blockAttack)        lines.push("No attacks this turn");
  if (effect.special)            lines.push(effect.special);
  return lines;
}

export function EventCardDisplay({ event, isDragging = false }) {
  const lines = effectLines(event.effect);
  return (
    <div
      className={`flex-shrink-0 bg-stone-900 border-2 border-stone-600 rounded-xl overflow-hidden flex flex-col select-none transition-opacity ${
        isDragging ? "opacity-30" : "shadow-md"
      }`}
      style={{ width: 213, height: 213 }}
    >
      <div className="px-3 py-1.5 flex items-center gap-2 shrink-0 bg-stone-900">
        <div className="w-6 h-6 rounded-full bg-stone-700 border border-stone-500 flex items-center justify-center text-xs shrink-0">😾</div>
        <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">Stupid Hooman</div>
      </div>
      <div className="relative flex-1 min-h-0 bg-gradient-to-b from-stone-700 to-stone-800 flex items-center justify-center overflow-hidden">
        {event.image
          ? <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
          : <span className="text-5xl opacity-40">🐾</span>
        }
      </div>
      <div className="shrink-0 bg-stone-100" style={{ minHeight: 72 }}>
        <div className="flex items-center gap-1.5 px-3 pt-1.5">
          <div className="h-px flex-1 bg-stone-400" />
          <span className="text-[8px] font-bold tracking-widest text-stone-500 uppercase">Event</span>
          <div className="h-px flex-1 bg-stone-400" />
        </div>
        <div className="px-3 pb-2 pt-0.5">
          <div className="font-bold text-xs text-stone-800 leading-tight">{event.name}</div>
          <div className="text-[10px] text-stone-600 leading-snug mt-0.5 line-clamp-2">
            {lines.join(" · ") || (event.flavorText ? `"${event.flavorText}"` : "No effect")}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveEventCard({ event }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `event_${event.id}`,
    data: { draggableType: "event_card", eventId: event.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      <EventCardDisplay event={event} isDragging={isDragging} />
    </div>
  );
}

function DiscardZone({ count, eventDiscard }) {
  const { setNodeRef, isOver } = useDroppable({ id: "event_discard" });
  const topEvent = eventDiscard?.[count - 1] ?? null;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex-shrink-0 rounded-xl transition-all ${isOver ? "ring-2 ring-violet-400 ring-offset-1" : ""}`}
      style={{ width: 213, height: 213 }}
    >
      {/* Stack illusion */}
      {count > 2 && <div className="absolute rounded-xl border-2 border-stone-300 bg-stone-200" style={{ width: 213, height: 213, top: 6, left: 6 }} />}
      {count > 1 && <div className="absolute rounded-xl border-2 border-stone-300 bg-stone-200" style={{ width: 213, height: 213, top: 3, left: 3 }} />}
      <div className="absolute top-0 left-0" style={{ zIndex: 2 }}>
        {topEvent ? (
          <EventCardDisplay event={topEvent} />
        ) : (
          <div
            className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
              isOver ? "border-violet-400 bg-violet-50" : "border-stone-300 bg-stone-50"
            }`}
            style={{ width: 213, height: 213 }}
          >
            <span className="text-3xl opacity-30">🎴</span>
            <span className={`text-[9px] font-bold uppercase tracking-wide ${isOver ? "text-violet-500" : "text-stone-400"}`}>
              {isOver ? "Drop!" : "Discard"}
            </span>
          </div>
        )}
      </div>
      {count > 0 && (
        <div className="absolute top-2 right-2 bg-stone-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow" style={{ zIndex: 10 }}>
          {count}
        </div>
      )}
    </div>
  );
}

export default function EventDeck({ eventDeck, activeEvents, eventDiscard }) {
  const deckCount = eventDeck?.length ?? 0;
  const discardCount = eventDiscard?.length ?? 0;

  const handleDraw = () => {
    if (deckCount > 0) socket.emit("draw_event");
  };

  return (
    <div className="flex items-start gap-2 flex-wrap">
      {/* Draw pile */}
      <button
        onClick={handleDraw}
        disabled={deckCount === 0}
        className={`relative flex-shrink-0 rounded-xl border-2 flex items-center justify-center select-none transition-all ${
          deckCount > 0
            ? "border-violet-400 bg-violet-800 hover:bg-violet-700 cursor-pointer active:scale-95"
            : "border-stone-300 bg-stone-200 cursor-default opacity-60"
        }`}
        style={{ width: 213, height: 213 }}
        title={deckCount > 0 ? "Draw an event" : "Event deck empty"}
      >
        <span className="text-6xl opacity-70">🎴</span>
        {deckCount > 0 && (
          <span className="absolute top-2 right-2 bg-stone-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
            {deckCount}
          </span>
        )}
      </button>

      {/* Face-up active events */}
      {(activeEvents ?? []).map((event) => (
        <ActiveEventCard key={event.id} event={event} />
      ))}

      {/* Discard pile drop zone */}
      <DiscardZone count={discardCount} eventDiscard={eventDiscard} />
    </div>
  );
}
