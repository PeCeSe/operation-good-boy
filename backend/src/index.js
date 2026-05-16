const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const roomManager = require("./game/roomManager");
const { rejoinRoom, setName } = roomManager;
const { initGameState } = require("./game/gameState");
const { startRound, advancePhase, playCard, attackEnemy, buyCard, endTurn } = require("./game/turnLogic");

const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const app = express();
app.use(cors({ origin: allowedOrigins }));
app.get("/health", (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

function emitRoomUpdate(code) {
  const lobby = roomManager.getLobbyState(code);
  if (lobby) io.to(code).emit("room_update", lobby);
}

function emitGameUpdate(code) {
  const room = roomManager.getRoom(code);
  if (room && room.gameState) {
    io.to(code).emit("game_update", room.gameState);
    if (room.gameState.phase === "victory" || room.gameState.phase === "defeat") {
      io.to(code).emit("game_over", { phase: room.gameState.phase });
    }
  }
}

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  const { playerToken, roomCode } = socket.handshake.auth || {};
  if (playerToken && roomCode) {
    const rejoin = rejoinRoom(socket.id, playerToken, roomCode);
    if (rejoin.success) {
      socket.join(roomCode);
      emitRoomUpdate(roomCode);
      if (rejoin.hasGame) emitGameUpdate(roomCode);
      console.log(`Rejoined: ${socket.id} → room ${roomCode}`);
    } else {
      const join = roomManager.joinRoom(socket.id, roomCode, null, playerToken);
      if (join.success) {
        socket.join(roomCode);
        socket.emit("room_joined", { code: roomCode });
        emitRoomUpdate(roomCode);
        console.log(`Auto-joined: ${socket.id} → room ${roomCode}`);
      } else if (join.error === "Wrong password.") {
        socket.emit("room_requires_password", { code: roomCode });
      } else if (join.error) {
        socket.emit("error", { message: join.error });
      }
    }
  }

  socket.on("create_room", ({ password } = {}) => {
    const code = roomManager.createRoom(socket.id, password || null, playerToken);
    socket.join(code);
    socket.emit("room_created", { code });
    emitRoomUpdate(code);
  });

  socket.on("join_room", ({ code, password } = {}) => {
    const result = roomManager.joinRoom(socket.id, code, password || null, playerToken);
    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }
    socket.join(code);
    socket.emit("room_joined", { code });
    emitRoomUpdate(code);
  });

  socket.on("set_name", ({ name } = {}) => {
    if (!name) return;
    setName(socket.id, name);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) emitRoomUpdate(room.code);
  });

  socket.on("select_character", ({ characterId } = {}) => {
    roomManager.setCharacter(socket.id, characterId);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) emitRoomUpdate(room.code);
  });

  socket.on("player_ready", () => {
    roomManager.setReady(socket.id);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) emitRoomUpdate(room.code);
  });

  socket.on("game_start", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return socket.emit("error", { message: "Room not found." });
    if (room.hostSocketId !== socket.id) return socket.emit("error", { message: "Only the host can start." });
    if (!roomManager.canStart(room.code)) return socket.emit("error", { message: "Not all players are ready." });

    let gameState = initGameState(room);
    gameState = startRound(gameState);
    room.gameState = gameState;
    emitGameUpdate(room.code);
  });

  socket.on("advance_phase", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) return socket.emit("error", { message: "No game in progress." });

    const player = room.gameState.players.find((p) => p.socketId === socket.id);
    if (!player) return socket.emit("error", { message: "You are not in this game." });

    const { state, error } = advancePhase(room.gameState, player.playerId);
    room.gameState = state;
    if (error) return socket.emit("error", { message: error });
    emitGameUpdate(room.code);
  });

  socket.on("play_card", ({ cardId } = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) return socket.emit("error", { message: "No game in progress." });
    if (room.gameState.pendingPhase) return socket.emit("error", { message: "Resolve the current phase first." });

    const player = room.gameState.players.find((p) => p.socketId === socket.id);
    if (!player) return socket.emit("error", { message: "You are not in this game." });

    const { state, error } = playCard(room.gameState, player.playerId, cardId);
    room.gameState = state;
    if (error) return socket.emit("error", { message: error });
    emitGameUpdate(room.code);
  });

  socket.on("attack_enemy", ({ enemyId, attackType } = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) return socket.emit("error", { message: "No game in progress." });
    if (room.gameState.pendingPhase) return socket.emit("error", { message: "Resolve the current phase first." });

    const player = room.gameState.players.find((p) => p.socketId === socket.id);
    if (!player) return socket.emit("error", { message: "You are not in this game." });

    const { state, error } = attackEnemy(room.gameState, player.playerId, enemyId, attackType);
    room.gameState = state;
    if (error) return socket.emit("error", { message: error });
    emitGameUpdate(room.code);
  });

  socket.on("buy_card", ({ cardId } = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) return socket.emit("error", { message: "No game in progress." });
    if (room.gameState.pendingPhase) return socket.emit("error", { message: "Resolve the current phase first." });

    const player = room.gameState.players.find((p) => p.socketId === socket.id);
    if (!player) return socket.emit("error", { message: "You are not in this game." });

    const { state, error } = buyCard(room.gameState, player.playerId, cardId);
    room.gameState = state;
    if (error) return socket.emit("error", { message: error });
    emitGameUpdate(room.code);
  });

  socket.on("end_turn", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) return socket.emit("error", { message: "No game in progress." });
    if (room.gameState.pendingPhase) return socket.emit("error", { message: "Resolve the current phase first." });

    const player = room.gameState.players.find((p) => p.socketId === socket.id);
    if (!player) return socket.emit("error", { message: "You are not in this game." });

    const { state, error } = endTurn(room.gameState, player.playerId);
    room.gameState = state;
    if (error) return socket.emit("error", { message: error });
    emitGameUpdate(room.code);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) emitRoomUpdate(room.code);
  });
});

setInterval(() => roomManager.cleanup(), 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
