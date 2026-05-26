const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const roomManager = require("./game/roomManager");
const { rejoinRoom, setName, setSkin } = roomManager;
const { initGameState } = require("./game/gameState");
const actions = require("./game/actions");
const { CARDS } = require("./data/cards");
const { CHARACTERS, STARTING_CARDS } = require("./data/characters");
const { ENEMIES } = require("./data/enemies");
const { EVENTS } = require("./data/events");
const { LOCATIONS } = require("./data/locations");

const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const app = express();
app.use(cors({ origin: allowedOrigins }));
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/api/gamedata", (_, res) => {
  res.json({ cards: CARDS, characters: CHARACTERS, startingCards: STARTING_CARDS, enemies: ENEMIES, events: EVENTS, locations: LOCATIONS });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

function emitRoomUpdate(code) {
  const lobby = roomManager.getLobbyState(code);
  if (lobby) io.to(code).emit("room_update", lobby);
}

function emitGameUpdate(code) {
  const room = roomManager.getRoom(code);
  if (room?.gameState) {
    io.to(code).emit("game_update", room.gameState);
    if (room.gameState.phase === "victory" || room.gameState.phase === "defeat") {
      io.to(code).emit("game_over", { phase: room.gameState.phase });
    }
  }
}

// Wraps an action: finds room + game, runs action fn, broadcasts update.
function withGame(socket, actionFn) {
  const room = roomManager.getRoomBySocket(socket.id);
  if (!room?.gameState) return socket.emit("error", { message: "No game in progress." });
  if (room.gameState.phase !== "playing") return;
  try {
    actionFn(room.gameState, room);
    emitGameUpdate(room.code);
  } catch (err) {
    console.error("withGame error:", err);
    socket.emit("error", { message: "Server error processing action." });
  }
}

// Resolve the calling player's playerId from their socket.
function getPlayerId(gameState, socketId) {
  return gameState.players.find((p) => p.socketId === socketId)?.playerId ?? null;
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
    } else {
      const join = roomManager.joinRoom(socket.id, roomCode, null, playerToken);
      if (join.success) {
        socket.join(roomCode);
        socket.emit("room_joined", { code: roomCode });
        emitRoomUpdate(roomCode);
      } else if (join.error === "Wrong password.") {
        socket.emit("room_requires_password", { code: roomCode });
      } else if (join.error) {
        socket.emit("error", { message: join.error });
      }
    }
  }

  // ── Lobby ───────────────────────────────────────────────────────────────────

  socket.on("create_room", ({ password } = {}) => {
    const leftCode = roomManager.leaveRoom(socket.id);
    if (leftCode) {
      socket.leave(leftCode);
      emitRoomUpdate(leftCode);
    }
    const code = roomManager.createRoom(socket.id, password || null, playerToken);
    socket.join(code);
    socket.emit("room_created", { code });
    emitRoomUpdate(code);
  });

  socket.on("join_room", ({ code, password } = {}) => {
    const currentRoom = roomManager.getRoomBySocket(socket.id);
    if (currentRoom && currentRoom.code !== code) {
      const leftCode = roomManager.leaveRoom(socket.id);
      if (leftCode) {
        socket.leave(leftCode);
        emitRoomUpdate(leftCode);
      }
    }
    const result = roomManager.joinRoom(socket.id, code, password || null, playerToken);
    if (!result.success) return socket.emit("error", { message: result.error });
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

  socket.on("select_skin", ({ skinId } = {}) => {
    setSkin(socket.id, skinId ?? null);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) emitRoomUpdate(room.code);
  });

  socket.on("player_ready", () => {
    roomManager.setReady(socket.id);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) emitRoomUpdate(room.code);
  });

  socket.on("game_start", ({ difficulty = 1 } = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return socket.emit("error", { message: "Room not found." });
    if (room.hostSocketId !== socket.id) return socket.emit("error", { message: "Only the host can start." });
    if (!roomManager.canStart(room.code)) return socket.emit("error", { message: "Not all players are ready." });
    room.gameState = initGameState(room, difficulty);
    emitGameUpdate(room.code);
  });

  // ── Player stats ────────────────────────────────────────────────────────────

  // playerId can be self or another player (co-op — anyone can adjust anyone)
  socket.on("set_lives", ({ playerId, lives } = {}) => {
    withGame(socket, (gs) => actions.setLives(gs, playerId, lives));
  });

  socket.on("toggle_stun", ({ playerId } = {}) => {
    withGame(socket, (gs) => actions.toggleStun(gs, playerId));
  });

  socket.on("set_paw_tokens", ({ tokens } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.setPawTokens(gs, playerId, tokens);
    });
  });

  // ── Hand / deck ─────────────────────────────────────────────────────────────

  socket.on("draw_card", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.drawCard(gs, playerId);
    });
  });

  socket.on("peek_draw_top", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.peekDrawTop(gs, playerId);
    });
  });

  socket.on("peek_to_hand", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.peekToHand(gs, playerId);
    });
  });

  socket.on("peek_to_top", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.peekToTop(gs, playerId);
    });
  });

  socket.on("peek_to_discard", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.peekToDiscard(gs, playerId);
    });
  });

  socket.on("play_card", ({ cardId } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.playCard(gs, playerId, cardId);
    });
  });

  socket.on("discard_card", ({ cardId } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.discardCard(gs, playerId, cardId);
    });
  });

  socket.on("retrieve_from_discard", ({ cardId } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.retrieveFromDiscard(gs, playerId, cardId);
    });
  });

  socket.on("shuffle_discard", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.shuffleDiscard(gs, playerId);
    });
  });

  socket.on("return_card_to_deck", ({ cardId } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId && cardId) actions.returnCardToDeck(gs, playerId, cardId);
    });
  });

  // ── Shop & payment ──────────────────────────────────────────────────────────

  socket.on("place_payment", ({ tokens } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.placePayment(gs, playerId, tokens);
    });
  });

  socket.on("clear_payment", () => {
    withGame(socket, (gs) => actions.clearPayment(gs));
  });

  socket.on("buy_card", ({ cardId } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.buyCard(gs, playerId, cardId);
    });
  });

  // ── Events ──────────────────────────────────────────────────────────────────

  socket.on("draw_event", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.drawOneEvent(gs, playerId);
    });
  });

  socket.on("discard_event", ({ eventId } = {}) => {
    withGame(socket, (gs) => {
      if (eventId) actions.discardEvent(gs, eventId);
    });
  });

  socket.on("shuffle_event_discard", () => {
    withGame(socket, (gs) => actions.shuffleEventDiscard(gs));
  });

  // ── Enemies ─────────────────────────────────────────────────────────────────

  socket.on("add_attack_token", ({ type } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId && type) actions.addAttackToken(gs, playerId, type);
    });
  });

  socket.on("move_token_to_enemy", ({ enemyId, tokenId } = {}) => {
    withGame(socket, (gs) => actions.moveTokenToEnemy(gs, enemyId, tokenId));
  });

  socket.on("remove_from_enemy", ({ enemyId, tokenId } = {}) => {
    withGame(socket, (gs) => actions.removeDamageToken(gs, enemyId, tokenId));
  });

  socket.on("draw_enemy", ({ slotIndex } = {}) => {
    withGame(socket, (gs) => actions.drawEnemy(gs, slotIndex));
  });

  socket.on("defeat_enemy", ({ enemyId } = {}) => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      actions.defeatEnemy(gs, playerId, enemyId);
    });
  });

  // ── Location ────────────────────────────────────────────────────────────────

  socket.on("set_cucumbers", ({ count } = {}) => {
    withGame(socket, (gs) => actions.setCucumbers(gs, count));
  });

  // ── Turn ────────────────────────────────────────────────────────────────────

  socket.on("end_turn", () => {
    withGame(socket, (gs) => {
      const playerId = getPlayerId(gs, socket.id);
      if (playerId) actions.endTurn(gs, playerId);
    });
  });

  // ── Card positions (hand organisation, synced so others can see) ────────────

  socket.on("update_card_positions", ({ cardPositions, zOrder } = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room?.gameState) return;
    const p = room.gameState.players.find((pl) => pl.socketId === socket.id);
    if (!p) return;
    p.cardPositions = cardPositions ?? {};
    p.zOrder = zOrder ?? [];
    emitGameUpdate(room.code);
  });

  socket.on("update_hand_layout", ({ handLayout, cardOrder } = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room?.gameState) return;
    const p = room.gameState.players.find((pl) => pl.socketId === socket.id);
    if (!p) return;
    if (handLayout && ["free", "tidy", "sorted"].includes(handLayout)) {
      p.handLayout = handLayout;
    }
    if (Array.isArray(cardOrder)) p.cardOrder = cardOrder;
    emitGameUpdate(room.code);
  });

  // ── Cursors ─────────────────────────────────────────────────────────────────

  socket.on("cursor_move", ({ x, y, name, color }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    socket.to(room.code).emit("cursor_update", { socketId: socket.id, x, y, name, color });
  });

  socket.on("cursor_leave", () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;
    socket.to(room.code).emit("cursor_leave", { socketId: socket.id });
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      socket.to(room.code).emit("cursor_leave", { socketId: socket.id });
      emitRoomUpdate(room.code);
    }
  });
});

setInterval(() => roomManager.cleanup(), 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
