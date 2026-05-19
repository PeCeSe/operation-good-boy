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

function ActiveEventCard({ event }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `event_${event.id}`,
    data: { draggableType: "event_card", eventId: event.id },
  });

  const lines = effectLines(event.effect);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex-shrink-0 bg-violet-50 border-2 border-violet-300 rounded-xl overflow-hidden flex flex-col select-none transition-opacity cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-30" : "shadow-sm hover:shadow-md"
      }`}
      style={{ width: 213, height: 213 }}
    >
      <div className="bg-violet-800 px-2 py-1.5">
        <div className="text-[9px] uppercase tracking-widest text-violet-300 font-bold">Event</div>
        <div className="text-white font-bold text-xs leading-tight">{event.name}</div>
      </div>
      <div className="px-2 py-2 flex-1">
        {lines.map((line, i) => (
          <div key={i} className="text-xs text-violet-800 font-semibold leading-snug">{line}</div>
        ))}
        {lines.length === 0 && (
          <div className="text-xs text-violet-400 italic">No effect</div>
        )}
      </div>
      {event.flavorText && (
        <div className="px-2 pb-2 text-[10px] italic text-violet-400 leading-snug">
          "{event.flavorText}"
        </div>
      )}
      <div className="bg-violet-100 px-2 py-1 text-[9px] text-violet-400 text-center">
        drag to discard →
      </div>
    </div>
  );
}

function DiscardZone({ count }) {
  const { setNodeRef, isOver } = useDroppable({ id: "event_discard" });

  return (
    <div
      ref={setNodeRef}
      className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
        isOver
          ? "border-violet-500 bg-violet-100 scale-105"
          : "border-stone-200 bg-stone-50"
      }`}
    >
      <div className="text-lg">{count > 0 ? "🎴" : "🂠"}</div>
      <div className={`text-[9px] font-bold text-center leading-tight ${isOver ? "text-violet-500" : "text-stone-400"}`}>
        {isOver ? "Drop!" : "Discard"}
      </div>
      {count > 0 && (
        <div className="text-[9px] text-stone-400">{count}</div>
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
      <div
        onClick={handleDraw}
        className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
          deckCount > 0
            ? "border-violet-400 bg-violet-50 cursor-pointer hover:bg-violet-100 hover:shadow-md active:scale-95"
            : "border-stone-200 bg-stone-50 cursor-default"
        }`}
      >
        {deckCount > 0 ? (
          <>
            <div className="text-xl">🎴</div>
            <div className="text-[9px] text-violet-600 font-bold uppercase tracking-wide">Events</div>
            <div className="text-sm font-bold text-violet-700">{deckCount}</div>
          </>
        ) : (
          <>
            <div className="text-xl opacity-30">🎴</div>
            <div className="text-[9px] text-stone-300 text-center">Empty</div>
          </>
        )}
      </div>

      {/* Face-up active events */}
      {(activeEvents ?? []).map((event) => (
        <ActiveEventCard key={event.id} event={event} />
      ))}

      {/* Discard pile drop zone */}
      <DiscardZone count={discardCount} />
    </div>
  );
}
