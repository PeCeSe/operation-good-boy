export default function LocationBar({ currentLocation, lostLocations }) {
  if (!currentLocation) return null;

  const pct = Math.min(
    100,
    (currentLocation.currentCucumberTokens / currentLocation.maxCucumberTokens) * 100
  );

  const isAlmostFull = pct >= 80;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-bold text-slate-200">{currentLocation.name}</span>
          {currentLocation.flavorText && (
            <span className="text-xs text-slate-500 italic ml-2">{currentLocation.flavorText}</span>
          )}
        </div>
        <span className={`text-sm font-mono ${isAlmostFull ? "text-red-400" : "text-slate-400"}`}>
          🥒 {currentLocation.currentCucumberTokens}/{currentLocation.maxCucumberTokens}
        </span>
      </div>

      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAlmostFull ? "bg-red-500" : "bg-green-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {lostLocations.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {lostLocations.map((loc) => (
            <span key={loc.id} className="text-xs text-slate-600 line-through">
              {loc.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
