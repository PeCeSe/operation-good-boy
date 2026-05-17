import { useEffect, useRef, useState } from "react";

export default function GameLog({ log }) {
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = bottomRef.current;
    if (el) el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, [log, open]);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-stone-100 hover:bg-stone-200 transition-colors text-left"
      >
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
          Log {log.length > 0 && `(${log.length})`}
        </span>
        <span className="text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="h-48 overflow-y-auto bg-stone-50 px-3 py-2">
          {log.length === 0 ? (
            <p className="text-stone-400 text-xs italic">Nothing yet…</p>
          ) : (
            <ul className="space-y-0.5">
              {log.map((entry, i) => (
                <li key={i} className="text-xs text-stone-600">{entry}</li>
              ))}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
