// Persists rooms to Redis/Valkey so games survive a backend restart or redeploy.
// The in-memory Map in roomManager stays the source of truth while the process
// runs; this module only snapshots rooms after changes and restores them on boot.
// Without REDIS_URL (local dev) every function is a no-op.

const Redis = require("ioredis");

const PREFIX = "ogb:room:";
const TTL_SECONDS = 6 * 60 * 60;

let redis = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });
  redis.on("error", (err) => console.error("Redis error:", err.message));
}

const enabled = () => redis !== null;

async function saveRoom(room) {
  if (!redis || !room) return;
  room.savedAt = Date.now();
  try {
    await redis.set(PREFIX + room.code, JSON.stringify(room), "EX", TTL_SECONDS);
  } catch (err) {
    console.error(`Could not save room ${room.code}:`, err.message);
  }
}

async function deleteRoom(code) {
  if (!redis || !code) return;
  try {
    await redis.del(PREFIX + code);
  } catch (err) {
    console.error(`Could not delete room ${code}:`, err.message);
  }
}

async function loadRoom(code) {
  if (!redis || !code) return null;
  try {
    const json = await redis.get(PREFIX + code);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.error(`Could not load room ${code}:`, err.message);
    return null;
  }
}

async function loadAllRooms() {
  if (!redis) return [];
  const rooms = [];
  try {
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(cursor, "MATCH", PREFIX + "*", "COUNT", 100);
      cursor = next;
      if (keys.length) {
        for (const json of await redis.mget(keys)) {
          if (json) rooms.push(JSON.parse(json));
        }
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error("Could not load rooms:", err.message);
  }
  return rooms;
}

module.exports = { enabled, saveRoom, deleteRoom, loadRoom, loadAllRooms };
