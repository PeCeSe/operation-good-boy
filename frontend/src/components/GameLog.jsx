import { useEffect, useRef } from "react";

export default function GameLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="bg-slate-800/60 rounded-xl p-3 h-36 overflow-y-auto">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Log</h3>
      {log.length === 0 ? (
        <p className="text-slate-600 text-xs italic">Nothing yet…</p>
      ) : (
        <ul className="space-y-0.5">
          {log.map((entry, i) => (
            <li key={i} className="text-xs text-slate-400">
              {entry}
            </li>
          ))}
        </ul>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
