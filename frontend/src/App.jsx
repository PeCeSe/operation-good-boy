import { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import socket from "./socket";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

export default function App() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [roomInfo, setRoomInfo] = useState(null);   // lobby state from server
  const [gameState, setGameState] = useState(null);
  const [mySocketId, setMySocketId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let token = localStorage.getItem("ogb_player_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("ogb_player_token", token);
    }
    const roomCodeMatch = window.location.pathname.match(/\/room\/([A-Z0-9-]+)/i);
    const roomCode = roomCodeMatch?.[1]?.toUpperCase() || null;

    socket.auth = { playerToken: token, roomCode };
    socket.connect();

    socket.on("connect", () => setMySocketId(socket.id));

    socket.on("room_created", ({ code }) => navigateRef.current(`/room/${code}`));
    socket.on("room_joined", ({ code }) => navigateRef.current(`/room/${code}`));

    socket.on("room_update", (lobby) => {
      setRoomInfo(lobby);
      setError(null);
    });

    socket.on("game_update", (state) => {
      setGameState(state);
      setError(null);
    });

    socket.on("error", ({ message }) => setError(message));

    return () => socket.disconnect();
  }, []);

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen">
      {error && (
        <div
          className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50 cursor-pointer"
          onClick={clearError}
        >
          {error} ✕
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/room/:code"
          element={
            gameState ? (
              <Game gameState={gameState} mySocketId={mySocketId} />
            ) : (
              <Lobby roomInfo={roomInfo} mySocketId={mySocketId} />
            )
          }
        />
      </Routes>
    </div>
  );
}
