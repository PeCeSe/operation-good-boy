export default function LocationBar({ currentLocation, lostLocations }) {
  if (!currentLocation) return null;

  const pct = Math.min(
    100,
    (currentLocation.currentCucumberTokens / currentLocation.maxCucumberTokens) * 100
  );

  const isAlmostFull = pct >= 80;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-bold text-stone-800">{currentLocation.name}</span>
          {currentLocation.flavorText && (
            <span className="text-xs text-stone-400 italic ml-2">{currentLocation.flavorText}</span>
          )}
        </div>
        <span className={`text-sm font-mono ${isAlmostFull ? "text-red-500" : "text-stone-500"}`}>
          🥒 {currentLocation.currentCucumberTokens}/{currentLocation.maxCucumberTokens}
        </span>
      </div>

      <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAlmostFull ? "bg-red-400" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {lostLocations.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
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
