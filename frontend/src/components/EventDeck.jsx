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
      className={`flex-shrink-0 bg-stone-900 border-2 border-stone-600 rounded-xl overflow-hidden flex flex-col select-none transition-opacity cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-30" : "shadow-md hover:shadow-lg"
      }`}
      style={{ width: 213, height: 213, touchAction: "none" }}
    >
      {/* Header */}
      <div className="px-3 py-1.5 flex items-center gap-2 shrink-0 bg-stone-900">
        <div className="w-6 h-6 rounded-full bg-stone-700 border border-stone-500 flex items-center justify-center text-xs shrink-0">😾</div>
        <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">Stupid Hooman</div>
      </div>

      {/* Illustration */}
      <div className="relative flex-1 min-h-0 bg-gradient-to-b from-stone-700 to-stone-800 flex items-center justify-center overflow-hidden">
        {event.image
          ? <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
          : <span className="text-5xl opacity-40">🐾</span>
        }
      </div>

      {/* Bottom text block */}
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
