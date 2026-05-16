import { useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const CHARACTERS = [
  {
    id: "char_persian",
    name: "Lady Fluffington III",
    subtitle: "The Persian",
    emoji: "😤",
    image: "/characters/fluffington.png",
    bgFrom: "#7c3aed",
    bgTo: "#4c1d95",
    accentColor: "violet",
    passive: "When taking damage, generate 1 charm attack.",
    backstory: "A tortoiseshell Persian of impeccable breeding and absolutely unquestionable importance. Three weeks of beauty sleep, ruined by that dog's insufferable barking. She arrived on the battlefield not because she was asked — she simply decided.",
    trait: "Serene. Entitled. Unstoppable.",
  },
  {
    id: "char_streetcat",
    name: "Ace",
    subtitle: "The Street Cat",
    emoji: "😎",
    image: "/characters/ace.png",
    bgFrom: "#0f766e",
    bgTo: "#134e4a",
    accentColor: "teal",
    objectPosition: "center -4px",
    passive: "Draw 1 extra card at the start of each turn.",
    backstory: "Scrappy, lean, and weathered in all the right ways. Ace had claimed that sunny patch in Good Boy's garden fair and square. Now that spot is gone. This isn't just a mission — it's personal.",
    trait: "Resourceful. Cool. Always lands on their feet.",
  },
  {
    id: "char_kitten",
    name: "Noodle",
    subtitle: "The Chaos Kitten",
    emoji: "🐱",
    image: "/characters/noodle.png",
    bgFrom: "#b45309",
    bgTo: "#78350f",
    accentColor: "amber",
    passive: "When buying a card, gain 1 pawcoin refund.",
    backstory: "Approximately five brain cells, all pointed at one thing: that squeaky toy. Good Boy took it. Noodle does not understand strategy or self-preservation, but she is extremely enthusiastic, and honestly? That might be enough.",
    trait: "Chaotic. Tiny. Absolutely feral.",
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
                <div className="text-xs text-stone-500">{char ? char.subtitle : "No character"}</div>
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
                className={`text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
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
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 italic">{char.trait}</div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-0.5">Passive</div>
                    <div className="text-xs text-stone-700 font-semibold">⚡ {char.passive}</div>
                  </div>
                </div>
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
