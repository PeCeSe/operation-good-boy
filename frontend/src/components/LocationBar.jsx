import { useState } from "react";
import socket from "../socket";

export default function LocationBar({ currentLocation, lostLocations = [], locationDeck = [], totalLocations, onSlotClick }) {
  const [hovered, setHovered] = useState(false);
  if (!currentLocation) return null;

  // Reference/preview mode (e.g. the /cards page) passes onSlotClick and should
  // not show live navigation arrows.
  const isReference = !!onSlotClick;

  const locationNumber = lostLocations.length + 1;
  const total = totalLocations ?? (lostLocations.length + 1 + locationDeck.length);
  const canRetreat = !isReference && lostLocations.length > 0;
  const canAdvance = !isReference && locationDeck.length > 0;

  const { currentCucumbers, maxCucumberTokens, eventsToDraw } = currentLocation;

  const handleSlotClick = (i) => {
    const count = i < currentCucumbers ? currentCucumbers - 1 : currentCucumbers + 1;
    if (onSlotClick) {
      onSlotClick(count);
    } else {
      socket.emit("set_cucumbers", { count });
    }
  };

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: 286, height: 213 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left arrow — go back to the previous location */}
      {hovered && canRetreat && (
        <button
          onClick={() => socket.emit("retreat_location")}
          title="Go back to previous location"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-7 h-7 rounded-full bg-paper-50 border-2 border-ink-border shadow-md flex items-center justify-center text-ink hover:bg-paper-200 transition-colors"
          style={{ fontSize: 14 }}
        >
          ‹
        </button>
      )}

      {/* Right arrow — move on to the next location */}
      {hovered && canAdvance && (
        <button
          onClick={() => socket.emit("advance_location")}
          title="Move on to next location"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-7 h-7 rounded-full bg-sepia text-white border-2 border-sepia-deep shadow-md flex items-center justify-center hover:bg-sepia-deep transition-colors"
          style={{ fontSize: 14 }}
        >
          ›
        </button>
      )}

      {/* Card */}
      <div className="rounded-lg overflow-hidden shadow-md border-2 border-ink-border flex flex-col h-full">
        {/* ── Header ── */}
        <div className="bg-sepia-deep px-3 py-1.5 flex items-start justify-between gap-2 shrink-0 border-b-2 border-ink-border">
          <div className="min-w-0">
            <div className="font-display text-base text-white leading-tight truncate">
              {currentLocation.name}
            </div>
            <div className="text-[9px] font-body font-black tracking-[0.12em] text-sepia-soft uppercase">Location</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-lg leading-tight text-sepia-soft">
              {locationNumber}
            </div>
            <div className="text-[9px] text-sepia-soft/70 leading-tight">of {total}</div>
          </div>
        </div>

        {/* ── Middle: illustration + events info ── */}
        <div className="flex flex-1 min-h-0">
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{ width: 165, background: "linear-gradient(135deg, #ede0c0, #c7a789)" }}
          >
            {currentLocation.image
              ? <img src={currentLocation.image} alt={currentLocation.name} className="w-full h-full object-cover" />
              : (
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <span className="text-4xl">🏘️</span>
                </div>
              )
            }
          </div>

          <div
            className="flex-1 flex flex-col items-center justify-center px-2 gap-2 border-l border-sepia-soft/40"
            style={{ background: "#f5f0d8" }}
          >
            <div className="flex gap-1.5 justify-center">
              {Array.from({ length: Math.min(eventsToDraw, 4) }).map((_, i) => (
                <div
                  key={i}
                  className="relative w-10 h-10 rounded-sm overflow-hidden border border-plum shadow-sm flex-shrink-0"
                >
                  <img src="/cards/event_back.png" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-6 h-6 rounded-full" style={{ background: "rgba(180,150,210,0.6)" }} />
                    <img src="/cards/event_icon.png" className="relative w-5 h-5 object-contain" style={{ filter: "saturate(0.6) brightness(0.85)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-body font-semibold text-center leading-tight text-sepia-deep">
              Draw {eventsToDraw} event{eventsToDraw !== 1 ? "s" : ""} per turn
            </div>
          </div>
        </div>

        {/* ── Bottom: cucumber token slots ── */}
        <div
          className="shrink-0 px-3 py-1.5 flex items-center gap-1.5 border-t-2 border-ink-border"
          style={{ background: "#3d240e" }}
        >
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase shrink-0 text-sepia-soft">🥒</span>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: maxCucumberTokens }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleSlotClick(i)}
                className="w-5 h-5 rounded-full transition-all hover:scale-110"
                style={
                  i < currentCucumbers
                    ? {}
                    : { background: "#5c3a1e", border: "2px solid #7a5030" }
                }
              >
                {i < currentCucumbers && (
                  <img src="/cucumber.svg" alt="🥒" className="w-full h-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
