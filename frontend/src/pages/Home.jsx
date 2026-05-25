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
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 bg-paper-100">
      <div className="text-center">
        <img src="/Game-logo.png" alt="Operation: Good Boy" className="w-[60vw] max-w-lg mx-auto mb-2" />
        <p className="text-ink-500 font-body mt-2">Three cats. One mission. Zero teamwork skills.</p>
      </div>

      <div className="bg-paper-50 rounded-xl p-8 w-full max-w-sm flex flex-col gap-4 shadow-md border-2 border-ink-border">
        {!showJoin ? (
          <>
            <div>
              <label className="block font-body text-sm text-ink-500 mb-1">Room password (optional)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for public room"
                className="w-full bg-paper-200 border border-ink-border/30 text-ink font-body focus:ring-2 focus:ring-moss/40 outline-none rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleCreate}
              className="bg-moss text-white font-display tracking-wide py-3 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow] w-full"
            >
              Create Room
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="bg-paper-200 text-ink font-display py-3 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow] w-full"
            >
              Join Room
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block font-body text-sm text-ink-500 mb-1">Room code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXX-0000"
                className="w-full bg-paper-200 border border-ink-border/30 text-ink font-body focus:ring-2 focus:ring-moss/40 outline-none rounded px-3 py-2 text-sm font-mono tracking-[0.12em]"
                maxLength={9}
              />
            </div>
            <div>
              <label className="block font-body text-sm text-ink-500 mb-1">Password (if required)</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty if none"
                className="w-full bg-paper-200 border border-ink-border/30 text-ink font-body focus:ring-2 focus:ring-moss/40 outline-none rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleJoin}
              className="bg-moss text-white font-display tracking-wide py-3 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow] w-full"
            >
              Join Room
            </button>
            <button
              onClick={() => setShowJoin(false)}
              className="bg-paper-200 text-ink font-display py-3 rounded-lg border-2 border-ink shadow-[0_2px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow] w-full"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
