import EventDisplay from "./EventDisplay";
import socket from "../socket";

export default function EventOverlay({ events, isCurrentPlayer, currentPlayerName }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 flex flex-col items-center gap-4">
        <div className="text-lg font-bold text-stone-800">Events This Turn</div>
        <div className="flex flex-wrap gap-3 justify-center">
          <EventDisplay events={events} />
        </div>
        {isCurrentPlayer ? (
          <button
            onClick={() => socket.emit("dismiss_events")}
            className="mt-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-2.5 rounded-lg transition-colors text-sm"
          >
            Done
          </button>
        ) : (
          <div className="text-sm text-stone-500 italic animate-pulse">
            Waiting for {currentPlayerName} to continue…
          </div>
        )}
      </div>
    </div>
  );
}
