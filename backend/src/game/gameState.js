const { CARDS } = require("../data/cards");
const { ENEMIES } = require("../data/enemies");
const { LOCATIONS } = require("../data/locations");
const { EVENTS } = require("../data/events");
const { CHARACTERS, STARTING_CARDS } = require("../data/characters");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let _cardInstanceId = 1;
function uniqueCard(card) {
  return { ...deepClone(card), id: `${card.id}_${_cardInstanceId++}` };
}

function buildStartingDeck(character) {
  return shuffle(
    character.startingDeck.map((cardId) => uniqueCard(STARTING_CARDS[cardId]))
  );
}

/**
 * difficulty: pack number (1, 2, 3, …)
 *   - shop cards & events: all packs 1..difficulty (cumulative)
 *   - enemies (non-boss): all packs 1..difficulty (cumulative)
 *   - boss: highest-pack boss available up to difficulty
 *   - locations: only the locations whose pack === difficulty
 *     (falls back to pack 1 if none found for that pack)
 */
function initGameState(room, difficulty = 1) {
  const pack = Math.max(1, difficulty);

  // ── Enemies ──────────────────────────────────────────────────────────────
  // Good Boy (enemy_001) is always the boss. Filter regular enemies by pack.
  const allEnemies = deepClone(ENEMIES);
  const goodBoy = allEnemies.find((e) => e.id === "enemy_001");
  const regularEnemies = shuffle(
    allEnemies.filter((e) => e.id !== "enemy_001" && e.pack <= pack)
  );
  const enemyDeck = [...regularEnemies, goodBoy];
  enemyDeck.forEach((e) => { e.damageTokens = []; });

  // ── Locations ────────────────────────────────────────────────────────────
  // Use locations matching the selected pack; fall back to pack 1 if none.
  let packLocations = deepClone(LOCATIONS.filter((l) => l.pack === pack));
  if (packLocations.length === 0) {
    packLocations = deepClone(LOCATIONS.filter((l) => l.pack === 1));
  }
  const locationDeck = packLocations;

  // ── Events & shop ────────────────────────────────────────────────────────
  const eventDeck = shuffle(
    EVENTS.filter((e) => e.pack <= pack)
      .flatMap((e) => Array.from({ length: e.copies ?? 1 }, () => deepClone(e)))
  );
  const shopDeck = shuffle(
    CARDS.filter((c) => c.pack <= pack)
      .flatMap((c) => Array.from({ length: c.copies ?? 1 }, () => uniqueCard(c)))
  );

  const firstLocation = locationDeck.shift();
  firstLocation.currentCucumbers = 0;

  const shop = shopDeck.splice(0, 6);

  const players = room.players.map((lobbyPlayer, idx) => {
    const character = deepClone(CHARACTERS.find((c) => c.id === lobbyPlayer.characterId));
    const drawPile = buildStartingDeck(character);
    const hand = drawPile.splice(0, 5);
    return {
      socketId: lobbyPlayer.socketId,
      playerId: `player_${idx + 1}`,
      name: lobbyPlayer.name,
      character,
      lives: character.maxLives,
      isStunned: false,
      hand,
      drawPile,
      discardPile: [],
      pawTokens: 0,
      attackTokens: [],
      peekCard: null,
    };
  });

  return {
    roomCode: room.code,
    phase: "playing",
    difficulty: pack,
    currentPlayerId: players[0].playerId,
    roundNumber: 1,
    players,
    enemies: [null, null, null],
    enemyDeck,
    enemyDiscard: [],
    currentLocation: firstLocation,
    locationDeck,
    lostLocations: [],
    shop,
    shopDeck,
    eventDeck,
    activeEvents: [],
    eventDiscard: [],
    paymentZone: { playerId: null, tokens: 0, lastPurchase: null },
    log: [],
  };
}

module.exports = { initGameState, shuffle, deepClone };
