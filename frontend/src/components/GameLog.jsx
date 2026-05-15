import { useEffect, useRef } from "react";

export default function GameLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = bottomRef.current;
    if (el) el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, [log]);

  return (
    <div className="bg-stone-200/60 border border-stone-200 rounded-xl p-3 h-36 overflow-y-auto">
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Log</h3>
      {log.length === 0 ? (
        <p className="text-stone-400 text-xs italic">Nothing yet…</p>
      ) : (
        <ul className="space-y-0.5">
          {log.map((entry, i) => (
            <li key={i} className="text-xs text-stone-600">
              {entry}
            </li>
          ))}
        </ul>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
