export default function LocationBar({ currentLocation, lostLocations, totalLocations = 3 }) {
  if (!currentLocation) return null;

  const locationNumber = lostLocations.length + 1;
  const { currentCucumberTokens, maxCucumberTokens, eventsToDraw } = currentLocation;
  const isAlmostFull = currentCucumberTokens / maxCucumberTokens >= 0.75;

  return (
    <div className="w-52 flex-shrink-0 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-100 border-b border-stone-200">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          {locationNumber}/{totalLocations}
        </span>
        <span className="text-xs font-semibold text-purple-600">
          📣 ×{eventsToDraw}
        </span>
      </div>

      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-b from-stone-100 to-stone-200 flex flex-col items-center justify-center gap-1 px-3">
        <div className="text-base font-bold text-stone-700 text-center leading-tight">{currentLocation.name}</div>
        {currentLocation.flavorText && (
          <div className="text-[10px] text-stone-400 italic text-center">"{currentLocation.flavorText}"</div>
        )}
      </div>

      {/* Cucumber slots */}
      <div className="px-3 py-2.5">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: maxCucumberTokens }).map((_, i) => (
            <div
              key={i}
              className={`h-7 rounded border-2 flex items-center justify-center text-sm transition-all ${
                i < currentCucumberTokens
                  ? isAlmostFull
                    ? "border-red-300 bg-red-50"
                    : "border-green-300 bg-green-50"
                  : "border-stone-200 bg-stone-50"
              }`}
            >
              {i < currentCucumberTokens ? "🥒" : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Lost locations */}
      {lostLocations.length > 0 && (
        <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
          {lostLocations.map((loc) => (
            <span key={loc.id} className="text-[10px] text-stone-400 line-through">
              {loc.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
