const rooms = new Map();

function generateRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

function createRoom(socketId, password = null, playerToken = null) {
  let code;
  do { code = generateRoomCode(); } while (rooms.has(code));

  rooms.set(code, {
    code,
    password,
    hostSocketId: socketId,
    players: [{ socketId, playerToken, name: `Player 1`, characterId: null, isReady: false }],
    gameState: null,
    lastActivity: Date.now(),
  });

  return code;
}

function joinRoom(socketId, code, password = null, playerToken = null) {
  const room = rooms.get(code);
  if (!room) return { success: false, error: "Room not found." };
  if (room.password && room.password !== password) return { success: false, error: "Wrong password." };

  const existing = room.players.find((p) => p.playerToken && p.playerToken === playerToken);
  if (existing) {
    existing.socketId = socketId;
    room.lastActivity = Date.now();
    return { success: true };
  }

  if (room.gameState) return { success: false, error: "Game already in progress." };
  if (room.players.length >= 4) return { success: false, error: "Room is full." };
  if (room.players.find((p) => p.socketId === socketId)) return { success: true };

  room.players.push({
    socketId,
    playerToken,
    name: `Player ${room.players.length + 1}`,
    characterId: null,
    isReady: false,
  });
  room.lastActivity = Date.now();
  return { success: true };
}

function rejoinRoom(newSocketId, playerToken, code) {
  const room = rooms.get(code);
  if (!room) return { success: false };
  const player = room.players.find((p) => p.playerToken === playerToken);
  if (!player) return { success: false };
  player.socketId = newSocketId;
  if (room.hostSocketId === null) room.hostSocketId = newSocketId;
  room.lastActivity = Date.now();
  return { success: true, hasGame: !!room.gameState };
}

function leaveRoom(socketId) {
  for (const [code, room] of rooms.entries()) {
    const idx = room.players.findIndex((p) => p.socketId === socketId);
    if (idx === -1) continue;

    room.players.splice(idx, 1);
    room.lastActivity = Date.now();

    if (room.players.length === 0) {
      rooms.delete(code);
    } else if (room.hostSocketId === socketId) {
      room.hostSocketId = room.players[0].socketId;
    }
    return code;
  }
  return null;
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.find((p) => p.socketId === socketId)) return room;
  }
  return null;
}

function setCharacter(socketId, characterId) {
  const room = getRoomBySocket(socketId);
  if (!room) return;
  const player = room.players.find((p) => p.socketId === socketId);
  if (player) {
    player.characterId = characterId;
    player.isReady = false;
    room.lastActivity = Date.now();
  }
}

function setReady(socketId) {
  const room = getRoomBySocket(socketId);
  if (!room) return;
  const player = room.players.find((p) => p.socketId === socketId);
  if (player && player.characterId) {
    player.isReady = !player.isReady;
    room.lastActivity = Date.now();
  }
}

function canStart(code) {
  const room = rooms.get(code);
  if (!room || room.gameState) return false;
  const { players } = room;
  return (
    players.length >= 1 &&
    players.length <= 4 &&
    players.every((p) => p.characterId && p.isReady)
  );
}

function getLobbyState(code) {
  const room = rooms.get(code);
  if (!room) return null;
  return {
    code: room.code,
    hostSocketId: room.hostSocketId,
    players: room.players,
    gameInProgress: !!room.gameState,
  };
}

function cleanup() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    if (room.lastActivity < cutoff) rooms.delete(code);
  }
}

module.exports = {
  createRoom,
  joinRoom,
  rejoinRoom,
  leaveRoom,
  getRoom,
  getRoomBySocket,
  setCharacter,
  setReady,
  canStart,
  getLobbyState,
  cleanup,
};
