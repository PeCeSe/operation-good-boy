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

export default function Lobby({ roomInfo, mySocketId, needsPassword }) {
  const { code } = useParams();
  const [nameInput, setNameInput] = useState("");
  const [nameSent, setNameSent] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const myPlayer = roomInfo?.players.find((p) => p.socketId === mySocketId);
  const isHost = roomInfo?.hostSocketId === mySocketId;
  const allReady = roomInfo?.players.length >= 1 && roomInfo.players.every((p) => p.isReady);

  const takenCharacters = new Set(
    (roomInfo?.players || []).map((p) => p.characterId).filter(Boolean)
  );

  const handleCopyLink = () => navigator.clipboard.writeText(window.location.href);
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

  if (!roomInfo && needsPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-8 w-full max-w-sm flex flex-col gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h2 className="text-xl font-bold text-amber-600">Password required</h2>
            <p className="text-stone-500 text-sm mt-1">This room is password protected.</p>
          </div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && socket.emit("join_room", { code, password: passwordInput })}
            placeholder="Enter room password"
            className="bg-stone-100 border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            autoFocus
          />
          <button
            onClick={() => socket.emit("join_room", { code, password: passwordInput })}
            disabled={!passwordInput}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-stone-500">Connecting to room {code}…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">🐾</div>
        <h1 className="text-3xl font-bold text-amber-600">Operation: Good Boy</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="font-mono text-xl tracking-widest bg-white border border-stone-200 shadow-sm px-4 py-1 rounded">
            {code}
          </span>
          <button
            onClick={handleCopyLink}
            className="text-sm bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1 rounded transition-colors"
          >
            Copy invite link
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
          className="flex-1 bg-stone-100 border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={handleSetName}
          disabled={!nameInput.trim()}
          className="bg-stone-200 hover:bg-stone-300 text-stone-700 disabled:opacity-40 px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          {nameSent ? "✓" : "Set"}
        </button>
      </div>

      {/* Players */}
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">
          Players ({roomInfo.players.length}/4)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {roomInfo.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            return (
              <div
                key={p.socketId}
                className="bg-white border border-stone-200 shadow-sm rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-1">{char ? char.emoji : "❓"}</div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-stone-500">{char ? char.name : "No character"}</div>
                <div
                  className={`text-xs mt-1 font-semibold ${p.isReady ? "text-green-400" : "text-stone-400"}`}
                >
                  {p.isReady ? "Ready" : "Not ready"}
                </div>
                {p.socketId === roomInfo.hostSocketId && (
                  <div className="text-xs text-amber-600 mt-1">Host</div>
                )}
              </div>
            );
          })}
          {Array.from({ length: 4 - roomInfo.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-stone-100 rounded-lg p-3 text-center border border-dashed border-stone-200"
            >
              <div className="text-stone-400 text-sm">Waiting…</div>
            </div>
          ))}
        </div>
      </div>

      {/* Character select */}
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Choose your cat</h2>
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
                    ? "border-amber-400 bg-amber-50"
                    : isTaken
                    ? "border-stone-200 bg-stone-100 opacity-50 cursor-not-allowed"
                    : "border-stone-300 bg-white hover:border-amber-400/50 hover:bg-stone-200"
                }`}
              >
                <div className="text-4xl mb-2">{char.emoji}</div>
                <div className="font-bold text-base">{char.name}</div>
                <div className="text-sm text-amber-600 mt-1">⚡ {char.passive}</div>
                <div className="text-xs text-stone-500 mt-2 italic">{char.flavor}</div>
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
              ? "bg-stone-300 hover:bg-stone-200 text-stone-700"
              : "bg-stone-200 text-stone-700 opacity-50 cursor-not-allowed"
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
                ? "bg-amber-500 hover:bg-amber-400 text-white"
                : "bg-stone-200 text-stone-700 opacity-50 cursor-not-allowed"
            }`}
          >
            Start Game 🐾
          </button>
        )}
      </div>

      {!allReady && roomInfo.players.length < 2 && (
        <p className="text-center text-stone-400 text-sm">Select a character and ready up to start.</p>
      )}
    </div>
  );
}
