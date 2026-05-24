import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import CHARACTERS from "../data/characters";

const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"];
const DIFFICULTY_COLORS = ["text-green-600", "text-amber-500", "text-red-500"];

function DifficultySlider({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-center text-stone-700">
        Difficulty:{" "}
        <span className={`font-bold ${DIFFICULTY_COLORS[value]}`}>{DIFFICULTY_LABELS[value]}</span>
      </div>
      <div className="relative flex items-center h-6">
        <div className="absolute left-4 right-4 h-1 bg-stone-200 rounded-full" />
        <div
          className="absolute left-4 h-1 bg-amber-400 rounded-full transition-all duration-200"
          style={{ width: `calc(${value * 50}% - ${value}rem)` }}
        />
        <div className="relative w-full flex justify-between px-4">
          {DIFFICULTY_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => onChange(i)}
              className="flex items-center justify-center w-4 h-4 -mx-2 focus:outline-none"
              title={label}
            >
              <div
                className={`rounded-full border-2 transition-all duration-200 ${
                  i === value
                    ? "w-4 h-4 bg-amber-500 border-amber-500"
                    : "w-3 h-3 bg-white border-stone-300 hover:border-amber-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between px-3">
        {DIFFICULTY_LABELS.map((label, i) => (
          <span
            key={label}
            className={`text-[11px] font-medium cursor-pointer transition-colors ${
              i === value ? DIFFICULTY_COLORS[i] : "text-stone-400 hover:text-stone-500"
            }`}
            onClick={() => onChange(i)}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Lobby({ roomInfo, mySocketId, needsPassword }) {
  const { code } = useParams();
  const [nameInput, setNameInput] = useState(() => localStorage.getItem("ogb_player_name") || "");
  const [nameSent, setNameSent] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [difficulty, setDifficulty] = useState(1);

  const myPlayer = roomInfo?.players.find((p) => p.socketId === mySocketId);
  const isHost = roomInfo?.hostSocketId === mySocketId;
  const allReady = roomInfo?.players.length >= 1 && roomInfo.players.every((p) => p.isReady);

  // Auto-send cached name when we first appear in the room with a default name
  useEffect(() => {
    if (!myPlayer) return;
    const saved = localStorage.getItem("ogb_player_name");
    if (saved && /^Player \d+$/.test(myPlayer.name)) {
      socket.emit("set_name", { name: saved });
      setNameSent(true);
    }
  }, [myPlayer?.playerId]);

  const takenCharacters = new Set(
    (roomInfo?.players || []).map((p) => p.characterId).filter(Boolean)
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSetName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem("ogb_player_name", trimmed);
    socket.emit("set_name", { name: trimmed });
    setNameSent(true);
  };
  const handleSelectCharacter = (characterId) => {
    socket.emit("select_character", { characterId });
  };
  const handleReady = () => socket.emit("player_ready");
  const handleStart = () => socket.emit("game_start", { difficulty: difficulty + 1 });

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
      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-800 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg anim-slide-up">
          Link copied! 🔗
        </div>
      )}
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">🐾</div>
        <h1 className="font-logo text-3xl text-ink" style={{ letterSpacing: "0.04em" }}>Operation: Good Boy</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="font-body font-black text-xl tracking-[0.12em] bg-paper-50 border border-ink-border shadow-sm px-4 py-1 rounded">
            {code}
          </span>
          <button
            onClick={handleCopyLink}
            className="text-sm bg-paper-200 hover:bg-paper-300 text-ink-700 px-3 py-1 rounded transition-colors"
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
                className="bg-white border border-stone-200 shadow-sm rounded-lg overflow-hidden text-center"
              >
                {/* Portrait or placeholder */}
                <div className="relative h-24 flex items-center justify-center bg-white">
                  {char ? (
                    <img
                      src={char.headshot}
                      alt={char.name}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl opacity-40">❓</span>
                  )}
                  {p.isReady && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">✓</div>
                  )}
                  {p.socketId === roomInfo.hostSocketId && (
                    <div className="absolute top-1 left-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Host</div>
                  )}
                </div>
                {/* Info */}
                <div className="p-2">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  {char ? (
                    <>
                      <div className="text-xs font-semibold text-stone-700 truncate">{char.name}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wide">{char.subtitle}</div>
                    </>
                  ) : (
                    <div className="text-xs text-stone-400 italic">No character</div>
                  )}
                  <div className={`text-xs mt-1 font-semibold ${p.isReady ? "text-green-500" : "text-stone-400"}`}>
                    {p.isReady ? "Ready!" : "Not ready"}
                  </div>
                </div>
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
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Choose your cat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CHARACTERS.map((char) => {
            const isSelected = myPlayer?.characterId === char.id;
            const isTaken = takenCharacters.has(char.id) && !isSelected;

            return (
              <button
                key={char.id}
                onClick={() => !isTaken && handleSelectCharacter(char.id)}
                disabled={isTaken}
                className={`text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 p-0 flex flex-col ${
                  isSelected
                    ? "border-amber-400 shadow-lg shadow-amber-200/50 scale-[1.02]"
                    : isTaken
                    ? "border-stone-200 opacity-40 cursor-not-allowed"
                    : "border-transparent hover:border-stone-300 hover:shadow-md hover:scale-[1.01] cursor-pointer"
                }`}
              >
                {/* Portrait */}
                <div
                  className="relative h-56 flex items-end justify-center overflow-hidden"
                  style={{ background: `linear-gradient(160deg, ${char.bgFrom} 0%, ${char.bgTo} 100%)` }}
                >
                  <img
                    src={char.image}
                    alt={char.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: char.objectPosition ?? "center" }}
                  />
                  {/* Name badge at bottom */}
                  <div className="relative z-10 w-full px-3 pb-3 pt-8"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
                  >
                    <div className="text-white font-bold text-base leading-tight">{char.name}</div>
                    <div className="text-white/60 text-xs font-medium tracking-wide uppercase">{char.subtitle}</div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      Selected ✓
                    </div>
                  )}
                  {isTaken && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      Taken
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-white p-4 space-y-3">
                  <p className="text-xs text-stone-500 leading-relaxed">{char.backstory}</p>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400 italic">{char.trait}</div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-500 mb-0.5">Passive</div>
                    <div className="text-xs text-stone-700 font-semibold">⚡ {char.passive}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="max-w-xs mx-auto w-full">
        <DifficultySlider value={difficulty} onChange={setDifficulty} />
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
