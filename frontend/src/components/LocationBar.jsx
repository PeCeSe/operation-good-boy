export default function LocationBar({ currentLocation, lostLocations, totalLocations = 3 }) {
  if (!currentLocation) return null;

  const locationNumber = lostLocations.length + 1;
  const { currentCucumberTokens, maxCucumberTokens, eventsToDraw } = currentLocation;
  const isAlmostFull = currentCucumberTokens / maxCucumberTokens >= 0.75;

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-stone-100 border-b border-stone-200">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          Location {locationNumber}/{totalLocations}
        </span>
        <span className="text-xs font-semibold text-purple-600">
          📣 {eventsToDraw} event{eventsToDraw > 1 ? "s" : ""} per round
        </span>
      </div>

      {/* Image placeholder */}
      <div className="h-24 bg-gradient-to-b from-stone-100 to-stone-200 flex flex-col items-center justify-center gap-1">
        <div className="text-2xl font-bold text-stone-700">{currentLocation.name}</div>
        {currentLocation.flavorText && (
          <div className="text-xs text-stone-400 italic">"{currentLocation.flavorText}"</div>
        )}
      </div>

      {/* Cucumber slots */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${isAlmostFull ? "text-red-500" : "text-stone-500"}`}>
            🥒 Cucumber tokens
          </span>
          <span className={`text-xs font-mono ${isAlmostFull ? "text-red-500" : "text-stone-400"}`}>
            {currentCucumberTokens}/{maxCucumberTokens}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: maxCucumberTokens }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-base transition-all ${
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
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {lostLocations.map((loc) => (
            <span key={loc.id} className="text-xs text-stone-400 line-through">
              {loc.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
