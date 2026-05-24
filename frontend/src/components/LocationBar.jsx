import socket from "../socket";

export default function LocationBar({ currentLocation, lostLocations, totalLocations = 3, onSlotClick }) {
  if (!currentLocation) return null;

  const locationNumber = lostLocations.length + 1;
  const { currentCucumbers, maxCucumberTokens, eventsToDraw } = currentLocation;

  const handleSlotClick = (i) => {
    if (onSlotClick) {
      onSlotClick(i < currentCucumbers ? currentCucumbers - 1 : currentCucumbers + 1);
    } else {
      socket.emit("set_cucumbers", { count: i < currentCucumbers ? currentCucumbers - 1 : currentCucumbers + 1 });
    }
  };

  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden shadow-md border-2 border-ink-border flex flex-col"
      style={{ width: 286, height: 213 }}
    >
      {/* ── Header — sepia brown ── */}
      <div className="bg-sepia-deep px-3 py-1.5 flex items-start justify-between gap-2 shrink-0 border-b" style={{ borderColor: "rgba(39,29,20,0.4)" }}>
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
          <div className="text-[9px] text-sepia-soft/70 leading-tight">of {totalLocations}</div>
        </div>
      </div>

      {/* ── Middle: illustration + events info ── */}
      <div className="flex flex-1 min-h-0">
        {/* Illustration — sepia gradient fallback */}
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
          {currentLocation.flavorText && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/50 to-transparent px-2 pb-1">
              <div className="text-[9px] font-flavor italic text-white/80 leading-tight line-clamp-2">
                "{currentLocation.flavorText}"
              </div>
            </div>
          )}
        </div>

        {/* Events info */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-2 gap-2 border-l border-sepia-soft/40"
          style={{ background: "#f5f0d8" }}
        >
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: Math.min(eventsToDraw, 4) }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg bg-plum-deep flex items-center justify-center text-base shadow-sm"
              >
                🎴
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
        className="shrink-0 px-3 py-1.5 flex items-center gap-1.5 border-t"
        style={{ background: "#3d240e", borderColor: "rgba(39,29,20,0.5)" }}
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
        {lostLocations.length > 0 && (
          <div className="ml-auto flex gap-1">
            {lostLocations.map((loc) => (
              <span key={loc.id} className="text-[9px] line-through text-sepia-soft/50">
                {loc.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
