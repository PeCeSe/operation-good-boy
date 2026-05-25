import { useState } from "react";
import { createPortal } from "react-dom";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import socket from "../socket";
import { renderDescription } from "../utils/renderDescription";

export function EventCardDisplay({ event, isDragging = false, pack }) {
  const effectText = event.description ?? null;
  return (
    <div
      className={`flex-shrink-0 border-2 border-ink-border rounded-lg overflow-hidden flex flex-col select-none transition-opacity bg-paper-50 ${
        isDragging ? "opacity-30" : "shadow-md"
      }`}
      style={{ width: 213, height: 213 }}
    >
      {/* ── Header: Stupid Hooman + EVENT sublabel (like location/enemy) ── */}
      <div className="px-3 py-1.5 flex items-start justify-between gap-2 shrink-0 border-b-2 border-ink-border" style={{ background: "#826a96" }}>
        <div className="min-w-0">
          <div className="font-display text-base text-white leading-tight">Stupid Hooman</div>
          <div className="text-[9px] font-body font-black tracking-[0.12em] text-white/70 uppercase">Event</div>
        </div>
        {pack != null && (
          <span className="text-[8px] font-bold bg-white/20 text-white/70 rounded-full px-1.5 py-0.5 leading-tight shrink-0">
            P{pack}
          </span>
        )}
      </div>

      {/* ── Image area ── */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden border-b-2 border-ink-border" style={{ background: "#4f3f63" }}>
        {event.image
          ? <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
          : <span className="text-5xl opacity-20">🐾</span>
        }
      </div>

      {/* ── Bottom: card name + effect ── */}
      <div className="shrink-0 bg-paper-50" style={{ minHeight: 68 }}>
        <div className="px-3 pt-2 pb-2">
          <div className="font-display text-sm text-ink leading-tight">
            {event.name}
          </div>
          <div className="text-[10px] font-body text-ink-700 leading-snug mt-0.5 line-clamp-2">
            {effectText
              ? renderDescription(effectText)
              : (event.flavorText ? `"${event.flavorText}"` : "No effect")}
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
  const [showBrowse, setShowBrowse] = useState(false);
  const topEvent = eventDiscard?.[count - 1] ?? null;

  return (
    <>
      <div
        ref={setNodeRef}
        onClick={() => count > 0 && setShowBrowse(true)}
        className={`relative flex-shrink-0 rounded-lg transition-all ${
          isOver ? "ring-2 ring-plum ring-offset-1" : ""
        } ${count > 0 ? "cursor-pointer hover:opacity-90" : "cursor-default"}`}
        style={{ width: 213, height: 213 }}
      >
        {count > 2 && (
          <div
            className="absolute rounded-lg border-2 border-plum overflow-hidden"
            style={{ width: 213, height: 213, top: 6, left: 6 }}
          >
            <img src="/cards/event_back.png" className="w-full h-full object-cover opacity-80" />
          </div>
        )}
        {count > 1 && (
          <div
            className="absolute rounded-lg border-2 border-plum overflow-hidden"
            style={{ width: 213, height: 213, top: 3, left: 3 }}
          >
            <img src="/cards/event_back.png" className="w-full h-full object-cover opacity-90" />
          </div>
        )}
        <div className="absolute top-0 left-0" style={{ zIndex: 2 }}>
          {topEvent ? (
            <EventCardDisplay event={topEvent} />
          ) : (
            <div
              className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                isOver
                  ? "border-plum bg-plum-lighter"
                  : "border-ink-border bg-paper-200"
              }`}
              style={{ width: 213, height: 213 }}
            >
              <span className="text-3xl opacity-30">🎴</span>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${isOver ? "text-plum" : "text-ink-300"}`}>
                {isOver ? "Drop!" : "Discard"}
              </span>
            </div>
          )}
        </div>
        {count > 0 && (
          <div
            className="absolute top-2 right-2 bg-ink text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow"
            style={{ zIndex: 10 }}
          >
            {count}
          </div>
        )}
      </div>

      {showBrowse && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60"
          onClick={() => setShowBrowse(false)}
        >
          <div
            className="bg-paper-50 rounded-lg p-4 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border-2 border-ink-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-ink-700">Event Discard ({count} cards)</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { socket.emit("shuffle_event_discard"); setShowBrowse(false); }}
                  className="text-xs bg-plum-lighter hover:bg-plum-soft border border-plum text-plum-deep font-semibold rounded-lg px-3 py-1.5 transition-colors"
                  title="Shuffle discard pile back to bottom of event deck"
                >
                  Shuffle back ↺
                </button>
                <button
                  onClick={() => setShowBrowse(false)}
                  className="text-ink-300 hover:text-ink-700 text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-3">
                {[...eventDiscard].reverse().map((event, i) => (
                  <div key={event.id} className="relative">
                    <EventCardDisplay event={event} />
                    <div className="absolute top-2 left-2 bg-ink/80 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow z-10">
                      {count - i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function EventDeck({ eventDeck, activeEvents, eventDiscard }) {
  const deckCount = eventDeck?.length ?? 0;
  const discardCount = eventDiscard?.length ?? 0;

  const { attributes, listeners, setNodeRef: setDeckRef, isDragging: isDeckDragging } = useDraggable({
    id: "event_deck_draw",
    data: { draggableType: "event_deck_draw" },
    disabled: deckCount === 0,
  });

  const handleDraw = () => {
    if (deckCount > 0) socket.emit("draw_event");
  };

  return (
    <div className="flex items-start gap-2 flex-wrap">
      {/* Draw pile */}
      <button
        ref={setDeckRef}
        {...listeners}
        {...attributes}
        onClick={handleDraw}
        disabled={deckCount === 0}
        className={`relative flex-shrink-0 rounded-lg border-2 overflow-hidden select-none transition-all ${
          deckCount > 0
            ? "border-plum cursor-pointer active:scale-95 hover:brightness-105"
            : "border-ink-border cursor-default opacity-60"
        } ${isDeckDragging ? "opacity-40" : ""}`}
        style={{ width: 213, height: 213, touchAction: "none" }}
        title={deckCount > 0 ? "Click or drag to draw an event" : "Event deck empty"}
      >
        {deckCount > 0 ? (
          <>
            {/* Card back background */}
            <img src="/cards/event_back.png" alt="Event deck" className="absolute inset-0 w-full h-full object-cover" />
            {/* Centered icon group */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Soft purple glow circle behind icon */}
              <div className="absolute w-28 h-28 rounded-full" style={{ background: "rgba(180, 150, 210, 0.6)" }} />
              {/* Icon */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <img src="/cards/event_icon.png" alt="" className="w-full h-full object-contain" />
                {/* Purple color wash to blend into card */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: "rgba(130, 106, 150, 0.55)", mixBlendMode: "color" }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-paper-200 flex items-center justify-center">
            <span className="text-4xl opacity-30">🎴</span>
          </div>
        )}
        {deckCount > 0 && (
          <span className="absolute top-2 right-2 bg-ink text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
            {deckCount}
          </span>
        )}
      </button>

      {/* Active event slot */}
      {activeEvents?.[0] ? (
        <ActiveEventCard key={activeEvents[0].id} event={activeEvents[0]} />
      ) : (
        <div
          className="flex-shrink-0 rounded-lg border-2 border-dashed border-ink-border bg-paper-200 flex items-center justify-center text-ink-300 text-xs select-none"
          style={{ width: 213, height: 213 }}
        >
          Active event
        </div>
      )}

      {/* Discard pile */}
      <DiscardZone count={discardCount} eventDiscard={eventDiscard} />
    </div>
  );
}
