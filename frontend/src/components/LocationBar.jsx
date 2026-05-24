import socket from "../socket";

export default function LocationBar({ currentLocation, lostLocations, totalLocations = 3, onSlotClick }) {
  if (!currentLocation) return null;

  const locationNumber = lostLocations.length + 1;
  const { currentCucumbers, maxCucumberTokens, eventsToDraw } = currentLocation;
  const isAlmostFull = currentCucumbers / maxCucumberTokens >= 0.75;

  const handleSlotClick = (i) => {
    if (onSlotClick) {
      onSlotClick(i < currentCucumbers ? currentCucumbers - 1 : currentCucumbers + 1);
    } else {
      socket.emit("set_cucumbers", { count: i < currentCucumbers ? currentCucumbers - 1 : currentCucumbers + 1 });
    }
  };

  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden shadow-md border-2 flex flex-col"
      style={{ width: 286, height: 213, borderColor: "#5c3a1e", background: "#fbf1da" }}
    >
      {/* ── Header — warm sepia brown ── */}
      <div className="px-3 py-1.5 flex items-start justify-between gap-2 shrink-0" style={{ background: "#5c3a1e" }}>
        <div className="min-w-0">
          <div className="font-display text-base text-white leading-tight truncate" style={{ letterSpacing: "0.04em" }}>{currentLocation.name}</div>
          <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#d4a96a" }}>Location</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg leading-tight" style={{ color: "#f0d9a4", letterSpacing: "0.04em" }}>{locationNumber}</div>
          <div className="text-[9px] leading-tight" style={{ color: "#d4a96a" }}>of {totalLocations}</div>
        </div>
      </div>

      {/* ── Middle: illustration + events info ── */}
      <div className="flex flex-1 min-h-0">
        {/* Illustration — left ~58% */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ width: 165, background: "linear-gradient(135deg, #e7cf99, #c8a060)" }}
        >
          {currentLocation.image
            ? <img src={currentLocation.image} alt={currentLocation.name} className="w-full h-full object-cover" />
            : (
              <div className="flex flex-col items-center gap-1 opacity-40">
                <span className="text-4xl">🏘️</span>
              </div>
            )
          }
          {currentLocation.flavorText && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 pb-1">
              <div className="text-[9px] italic text-white/80 leading-tight line-clamp-2">"{currentLocation.flavorText}"</div>
            </div>
          )}
        </div>

        {/* Events info — right ~42% */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 gap-2 border-l" style={{ background: "#f5e6c8", borderColor: "#d4a96a" }}>
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: Math.min(eventsToDraw, 4) }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-sm"
                style={{ background: "#4f3f63" }}
              >
                🎴
              </div>
            ))}
          </div>
          <div className="text-[10px] font-semibold text-center leading-tight" style={{ color: "#5c3a1e" }}>
            Draw {eventsToDraw} event{eventsToDraw !== 1 ? "s" : ""} per turn
          </div>
        </div>
      </div>

      {/* ── Bottom: cucumber token slots ── */}
      <div className="shrink-0 px-3 py-1.5 flex items-center gap-1.5" style={{ background: "#3d240e" }}>
        <span className="text-[9px] font-bold tracking-widest uppercase shrink-0" style={{ color: "#d4a96a" }}>🥒</span>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: maxCucumberTokens }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleSlotClick(i)}
              className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${
                i < currentCucumbers
                  ? ""
                  : "border-2 hover:border-green-400"
              }`}
              style={i < currentCucumbers ? {} : { background: "#5c3a1e", borderColor: "#7a5030" }}
            >
              {i < currentCucumbers && (
                <img src="/cucumber.svg" alt="🥒" className="w-full h-full" />
              )}
            </button>
          ))}
        </div>
        {lostLocations.length > 0 && (
          <div className="ml-auto flex gap-1">
            {lostLocations.map((loc) => (
              <span key={loc.id} className="text-[9px] line-through" style={{ color: "#7a5030" }}>{loc.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
