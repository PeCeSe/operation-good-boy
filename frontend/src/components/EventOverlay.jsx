import EventDisplay from "./EventDisplay";
import socket from "../socket";

export default function EventOverlay({ events, isCurrentPlayer, currentPlayerName }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70">
      <div className="bg-paper-50 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 flex flex-col items-center gap-4 border-2 border-ink-border">
        <div className="font-display text-xl text-ink" style={{ letterSpacing: "0.04em" }}>Events This Turn</div>
        <div className="flex flex-wrap gap-3 justify-center">
          <EventDisplay events={events} />
        </div>
        {isCurrentPlayer ? (
          <button
            onClick={() => socket.emit("dismiss_events")}
            className="mt-2 bg-moss hover:bg-moss-deep text-white font-bold px-8 py-2.5 rounded-lg transition-colors text-sm"
          >
            Done
          </button>
        ) : (
          <div className="text-sm text-ink-500 italic animate-pulse">
            Waiting for {currentPlayerName} to continue…
          </div>
        )}
      </div>
    </div>
  );
}
