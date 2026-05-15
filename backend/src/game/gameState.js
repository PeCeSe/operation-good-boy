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

function buildStartingDeck(character) {
  return shuffle(
    character.startingDeck.map((cardId) => deepClone(STARTING_CARDS[cardId]))
  );
}

function initGameState(room) {
  const allEnemies = deepClone(ENEMIES);
  const goodBoy = allEnemies.find((e) => e.id === "enemy_001");
  const otherEnemies = shuffle(allEnemies.filter((e) => e.id !== "enemy_001"));
  const enemyDeck = [...otherEnemies, goodBoy]; // Good Boy at the bottom

  const locationDeck = deepClone(LOCATIONS);
  const eventDeck = shuffle(deepClone(EVENTS));
  const shopDeck = shuffle(deepClone(CARDS));

  const initialEnemies = enemyDeck.splice(0, Math.min(3, enemyDeck.length));
  const shop = shopDeck.splice(0, 6);

  const players = room.players.map((lobbyPlayer, idx) => {
    const character = deepClone(CHARACTERS.find((c) => c.id === lobbyPlayer.characterId));
    const deck = buildStartingDeck(character);
    const hand = deck.splice(0, 5);

    return {
      socketId: lobbyPlayer.socketId,
      playerId: `player_${idx + 1}`,
      name: lobbyPlayer.name,
      character,
      lives: character.maxLives,
      isStunned: false,
      hand,
      deck,
      discard: [],
      currentPawcoins: 0,
      currentAttack: { scratch: 0, bite: 0, ignore: 0, charm: 0 },
      isReady: false,
    };
  });

  return {
    roomCode: room.code,
    phase: "playing",
    turn: {
      currentPlayerId: players[0].playerId,
      roundNumber: 1,
    },
    blockShop: false,
    blockAttack: false,
    pawcoinPenalty: 0,
    players,
    enemies: initialEnemies,
    enemyDeck,
    currentLocation: locationDeck.shift(),
    locationDeck,
    lostLocations: [],
    currentEvent: null,
    eventDeck,
    shop,
    shopDeck,
    log: [],
  };
}

module.exports = { initGameState, shuffle, deepClone };
