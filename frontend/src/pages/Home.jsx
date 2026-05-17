import { useState } from "react";
import socket from "../socket";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [password, setPassword] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  const handleCreate = () => {
    socket.emit("create_room", { password: password || undefined });
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    socket.emit("join_room", { code: joinCode.trim().toUpperCase(), password: password || undefined });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <div className="text-center">
        <img src="/Game-logo.png" alt="Operation: Good Boy" className="w-[60vw] max-w-lg mx-auto mb-2" />
        <p className="text-stone-400 mt-2">Three cats. One mission. Zero teamwork skills.</p>
      </div>

      <div className="bg-white rounded-xl p-8 w-full max-w-sm flex flex-col gap-4 shadow-sm border border-stone-200">
        {!showJoin ? (
          <>
            <div>
              <label className="block text-sm text-stone-500 mb-1">Room password (optional)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for public room"
                className="w-full bg-stone-100 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 border border-stone-200"
              />
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Create Room
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 py-3 rounded-lg transition-colors font-medium"
            >
              Join Room
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm text-stone-500 mb-1">Room code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXX-0000"
                className="w-full bg-stone-100 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 font-mono tracking-widest border border-stone-200"
                maxLength={9}
              />
            </div>
            <div>
              <label className="block text-sm text-stone-500 mb-1">Password (if required)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty if none"
                className="w-full bg-stone-100 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 border border-stone-200"
              />
            </div>
            <button
              onClick={handleJoin}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Join Room
            </button>
            <button
              onClick={() => setShowJoin(false)}
              className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 py-3 rounded-lg transition-colors font-medium"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
