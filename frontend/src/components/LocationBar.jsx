import socket from "../socket";

export default function LocationBar({ currentLocation, lostLocations, totalLocations = 3 }) {
  if (!currentLocation) return null;

  const locationNumber = lostLocations.length + 1;
  const { currentCucumbers, maxCucumberTokens, eventsToDraw } = currentLocation;
  const isAlmostFull = currentCucumbers / maxCucumberTokens >= 0.75;

  const handleSlotClick = (i) => {
    if (i < currentCucumbers) {
      socket.emit("set_cucumbers", { count: currentCucumbers - 1 });
    } else {
      socket.emit("set_cucumbers", { count: currentCucumbers + 1 });
    }
  };

  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden shadow-md border-2 border-stone-600 flex flex-col"
      style={{ width: 286, height: 213 }}
    >
      {/* ── Header ── */}
      <div className="bg-stone-800 px-3 py-1.5 flex items-start justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="text-white font-bold text-sm leading-tight truncate">{currentLocation.name}</div>
          <div className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">Location</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-amber-400 font-bold text-base leading-tight">{locationNumber}</div>
          <div className="text-[9px] text-stone-400 leading-tight">of {totalLocations}</div>
        </div>
      </div>

      {/* ── Middle: illustration + events info ── */}
      <div className="flex flex-1 min-h-0">
        {/* Illustration — left ~58% */}
        <div
          className="relative bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center overflow-hidden"
          style={{ width: 165 }}
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
        <div className="flex-1 bg-stone-100 flex flex-col items-center justify-center px-2 gap-2 border-l border-stone-300">
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: Math.min(eventsToDraw, 4) }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center text-base shadow-sm"
              >
                🎴
              </div>
            ))}
          </div>
          <div className="text-[10px] text-stone-600 font-semibold text-center leading-tight">
            Draw {eventsToDraw} event{eventsToDraw !== 1 ? "s" : ""} per turn
          </div>
        </div>
      </div>

      {/* ── Bottom: cucumber token slots ── */}
      <div className="shrink-0 bg-stone-700 px-3 py-1.5 flex items-center gap-1.5">
        <span className="text-[9px] font-bold tracking-widest text-stone-400 uppercase shrink-0">🥒</span>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: maxCucumberTokens }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleSlotClick(i)}
              className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${
                i < currentCucumbers
                  ? ""
                  : "bg-stone-600 border-2 border-stone-500 hover:border-green-400"
              }`}
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
              <span key={loc.id} className="text-[9px] text-stone-500 line-through">{loc.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
