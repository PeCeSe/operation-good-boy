import { useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const CHARACTERS = [
  {
    id: "char_persian",
    name: "The Persian",
    emoji: "😤",
    passive: "When taking damage, generate 1 charm attack.",
    flavor: "She hasn't slept in three weeks. She is DONE.",
  },
  {
    id: "char_streetcat",
    name: "The Street Cat",
    emoji: "😎",
    passive: "Draw 1 extra card at the start of each turn.",
    flavor: "Just wants to nap in that sunny spot. Is that so much to ask.",
  },
  {
    id: "char_kitten",
    name: "The Kitten",
    emoji: "🐱",
    passive: "When buying a card, gain 1 pawcoin refund.",
    flavor: "The squeaky toy. IT'S SO UNFAIR.",
  },
];

export default function Lobby({ roomInfo, mySocketId }) {
  const { code } = useParams();
  const [nameInput, setNameInput] = useState("");
  const [nameSent, setNameSent] = useState(false);

  const myPlayer = roomInfo?.players.find((p) => p.socketId === mySocketId);
  const isHost = roomInfo?.hostSocketId === mySocketId;
  const allReady = roomInfo?.players.length >= 1 && roomInfo.players.every((p) => p.isReady);

  const takenCharacters = new Set(
    (roomInfo?.players || []).map((p) => p.characterId).filter(Boolean)
  );

  const handleCopyCode = () => navigator.clipboard.writeText(code);
  const handleSetName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    socket.emit("set_name", { name: trimmed });
    setNameSent(true);
  };
  const handleSelectCharacter = (characterId) => {
    socket.emit("select_character", { characterId });
  };
  const handleReady = () => socket.emit("player_ready");
  const handleStart = () => socket.emit("game_start");

  if (!roomInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Connecting to room {code}…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">🐾</div>
        <h1 className="text-3xl font-bold text-amber-400">Operation: Good Boy</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="font-mono text-xl tracking-widest bg-slate-800 px-4 py-1 rounded">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Name input */}
      <div className="flex gap-2 items-center max-w-sm mx-auto w-full">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => { setNameInput(e.target.value); setNameSent(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleSetName()}
          placeholder={myPlayer?.name || "Your name…"}
          maxLength={20}
          className="flex-1 bg-slate-800 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={handleSetName}
          disabled={!nameInput.trim()}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          {nameSent ? "✓" : "Set"}
        </button>
      </div>

      {/* Players */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-3">
          Players ({roomInfo.players.length}/4)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {roomInfo.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            return (
              <div
                key={p.socketId}
                className="bg-slate-800 rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-1">{char ? char.emoji : "❓"}</div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-slate-400">{char ? char.name : "No character"}</div>
                <div
                  className={`text-xs mt-1 font-semibold ${p.isReady ? "text-green-400" : "text-slate-500"}`}
                >
                  {p.isReady ? "Ready" : "Not ready"}
                </div>
                {p.socketId === roomInfo.hostSocketId && (
                  <div className="text-xs text-amber-400 mt-1">Host</div>
                )}
              </div>
            );
          })}
          {Array.from({ length: 4 - roomInfo.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-slate-800/40 rounded-lg p-3 text-center border border-dashed border-slate-700"
            >
              <div className="text-slate-600 text-sm">Waiting…</div>
            </div>
          ))}
        </div>
      </div>

      {/* Character select */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-3">Choose your cat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHARACTERS.map((char) => {
            const isSelected = myPlayer?.characterId === char.id;
            const isTaken = takenCharacters.has(char.id) && !isSelected;

            return (
              <button
                key={char.id}
                onClick={() => !isTaken && handleSelectCharacter(char.id)}
                disabled={isTaken}
                className={`text-left rounded-xl p-4 border-2 transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/10"
                    : isTaken
                    ? "border-slate-700 bg-slate-800/40 opacity-50 cursor-not-allowed"
                    : "border-slate-600 bg-slate-800 hover:border-amber-400/50 hover:bg-slate-700"
                }`}
              >
                <div className="text-4xl mb-2">{char.emoji}</div>
                <div className="font-bold text-base">{char.name}</div>
                <div className="text-sm text-amber-300 mt-1">⚡ {char.passive}</div>
                <div className="text-xs text-slate-400 mt-2 italic">{char.flavor}</div>
                {isTaken && (
                  <div className="text-xs text-red-400 mt-2 font-semibold">Taken</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleReady}
          disabled={!myPlayer?.characterId}
          className={`px-6 py-3 rounded-lg font-bold transition-colors ${
            myPlayer?.isReady
              ? "bg-green-500 hover:bg-green-400 text-white"
              : myPlayer?.characterId
              ? "bg-slate-600 hover:bg-slate-500"
              : "bg-slate-700 opacity-50 cursor-not-allowed"
          }`}
        >
          {myPlayer?.isReady ? "✓ Ready!" : "Ready"}
        </button>

        {isHost && (
          <button
            onClick={handleStart}
            disabled={!allReady}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              allReady
                ? "bg-amber-500 hover:bg-amber-400 text-slate-900"
                : "bg-slate-700 opacity-50 cursor-not-allowed"
            }`}
          >
            Start Game 🐾
          </button>
        )}
      </div>

      {!allReady && roomInfo.players.length < 2 && (
        <p className="text-center text-slate-500 text-sm">Select a character and ready up to start.</p>
      )}
    </div>
  );
}
