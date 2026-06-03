import { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import socket from "./socket";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Cards from "./pages/Cards";

export default function App() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [roomInfo, setRoomInfo] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [mySocketId, setMySocketId] = useState(null);
  const [error, setError] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    let token = localStorage.getItem("ogb_player_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("ogb_player_token", token);
    }
    const roomCodeMatch = window.location.pathname.match(/\/room\/([A-Z0-9-]+)/i);
    const roomCode = roomCodeMatch?.[1]?.toUpperCase() || null;

    socket.auth = { playerToken: token, roomCode, playerName: localStorage.getItem("ogb_player_name") || null };
    socket.connect();

    socket.on("connect", () => setMySocketId(socket.id));

    socket.on("room_created", ({ code }) => { setGameState(null); navigateRef.current(`/room/${code}`); });
    socket.on("room_joined", ({ code }) => { setGameState(null); setNeedsPassword(false); navigateRef.current(`/room/${code}`); });
    socket.on("room_requires_password", () => setNeedsPassword(true));

    socket.on("room_update", (lobby) => {
      setMySocketId(socket.id);
      setRoomInfo(lobby);
      setError(null);
    });

    socket.on("game_update", (state) => {
      setMySocketId(socket.id);
      setGameState(state);
      setError(null);
    });

    socket.on("error", ({ message }) => setError(message));

    // On mobile, browsers kill the WebSocket when the tab is backgrounded.
    // Force a reconnect when the tab becomes visible again.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        socket.connect();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      socket.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen">
      {/* Alpha banner — flush left edge, behind drawer (z-30 < drawer z-40) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[30] select-none group">
        <div
          className="bg-gold text-ink font-bold tracking-widest uppercase cursor-default"
          style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", fontSize: 9, padding: "10px 3px", letterSpacing: "0.15em" }}
        >
          Alpha
        </div>
        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-ink text-paper-100 font-body text-xs rounded-lg px-3 py-2.5 shadow-lg leading-relaxed">
            <div className="font-bold mb-1">🐾 You found the alpha tag!</div>
            This game is a work in progress — cards, rules, art, and balance are all subject to change at any moment. Things may break. Cats may misbehave. Thanks for playing anyway! 🐱
          </div>
          {/* little arrow pointing left */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-ink" />
        </div>
      </div>

      {error && (
        <div
          className="fixed top-4 right-4 bg-red text-white font-body text-sm px-4 py-2.5 rounded-lg border-2 border-red-deep shadow-[0_2px_0_#271d14] z-50 cursor-pointer flex items-center gap-2"
          onClick={clearError}
        >
          <span>⚠️</span>
          <span>{error}</span>
          <span className="opacity-60 ml-1">✕</span>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cards" element={<Cards />} />
        <Route
          path="/room/:code"
          element={
            gameState ? (
              <Game gameState={gameState} mySocketId={mySocketId} />
            ) : (
              <Lobby roomInfo={roomInfo} mySocketId={mySocketId} needsPassword={needsPassword} />
            )
          }
        />
      </Routes>
    </div>
  );
}
