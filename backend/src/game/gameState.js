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

function initGameState(room) {
  const allEnemies = deepClone(ENEMIES);
  const goodBoy = allEnemies.find((e) => e.id === "enemy_001");
  const otherEnemies = shuffle(allEnemies.filter((e) => e.id !== "enemy_001"));
  const enemyDeck = [...otherEnemies, goodBoy];

  const locationDeck = deepClone(LOCATIONS);
  const eventDeck = shuffle(deepClone(EVENTS));
  const shopDeck = shuffle(CARDS.map((c) => uniqueCard(c)));

  const firstLocation = locationDeck.shift();
  firstLocation.currentCucumbers = 0;

  const enemies = enemyDeck.splice(0, Math.min(3, enemyDeck.length));
  enemies.forEach((e) => { e.damageTokens = []; });

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
    currentPlayerId: players[0].playerId,
    roundNumber: 1,
    players,
    enemies,
    enemyDeck,
    currentLocation: firstLocation,
    locationDeck,
    lostLocations: [],
    shop,
    shopDeck,
    eventDeck,
    activeEvents: [],
    paymentZone: { playerId: null, tokens: 0, lastPurchase: null },
    log: [],
  };
}

module.exports = { initGameState, shuffle, deepClone };
