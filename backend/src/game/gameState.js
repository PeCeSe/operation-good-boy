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
function uniqueCard(card, seq) {
  return { ...deepClone(card), id: `${card.id}_${seq._next++}` };
}

function buildStartingDeck(character, seq) {
  return shuffle(
    character.startingDeck.map((cardId) => uniqueCard(STARTING_CARDS[cardId], seq))
  );
}

function initGameState(room) {
  // Per-game sequence counter — avoids ID collisions between concurrent games
  const seq = { _next: 1 };

  const allEnemies = deepClone(ENEMIES);
  const boss = allEnemies.find((e) => e.isBoss);
  const regularEnemies = shuffle(allEnemies.filter((e) => !e.isBoss));
  const enemyDeck = boss ? [...regularEnemies, boss] : regularEnemies;

  const locationDeck = deepClone(LOCATIONS);
  const eventDeck = shuffle(
    EVENTS.flatMap((e) =>
      Array.from({ length: e.copies ?? 1 }, (_, i) => ({ ...deepClone(e), id: `${e.id}_${i + 1}` }))
    )
  );
  const shopDeck = shuffle(
    CARDS.flatMap((c) =>
      Array.from({ length: c.copies ?? 1 }, () => uniqueCard(c, seq))
    )
  );

  const firstLocation = locationDeck.shift();
  firstLocation.currentCucumbers = 0;

  const enemies = [];

  const shop = shopDeck.splice(0, 6);

  const players = room.players.map((lobbyPlayer, idx) => {
    const character = deepClone(CHARACTERS.find((c) => c.id === lobbyPlayer.characterId));
    const drawPile = buildStartingDeck(character, seq);
    const hand = drawPile.splice(0, 5);
    return {
      socketId: lobbyPlayer.socketId,
      playerId: `player_${idx + 1}`,
      name: lobbyPlayer.name,
      character,
      skinId: lobbyPlayer.skinId ?? null,
      lives: character.maxLives,
      isStunned: false,
      hand,
      drawPile,
      discardPile: [],
      pawTokens: 0,
      attackTokens: [],
      peekCard: null,
      cardPositions: {},
      zOrder: [],
      handLayout: "tidy",
      cardOrder: [],
      stats: {
        damageDealt: 0,
        coinsEarned: 0,
        cucumbersAdded: 0,
        cucumbersRemoved: 0,
        timesStunned: 0,
        cardsBought: 0,
        livesHealed: 0,
        enemiesDefeated: 0,
      },
    };
  });

  return {
    roomCode: room.code,
    totalEnemies: enemyDeck.length,
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
    eventDiscard: [],
    paymentZone: { playerId: null, tokens: 0, lastPurchase: null },
    log: [],
  };
}

module.exports = { initGameState, shuffle, deepClone };
