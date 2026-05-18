const { shuffle } = require("./gameState");

let _tokenId = 1;

function log(state, msg) {
  state.log = [...state.log.slice(-99), msg];
}

// ── Auto-detection ────────────────────────────────────────────────────────────

function checkWin(state) {
  if (state.enemies.length === 0 && state.enemyDeck.length === 0) {
    state.phase = "victory";
    log(state, "🎉 Victory! Good Boy has been defeated.");
  }
}

function checkLocationLoss(state) {
  if (!state.currentLocation) return;
  if (state.currentLocation.currentCucumbers < state.currentLocation.maxCucumberTokens) return;

  log(state, `💀 ${state.currentLocation.name} has been overrun!`);
  state.lostLocations.push(state.currentLocation);

  if (state.locationDeck.length > 0) {
    state.currentLocation = state.locationDeck.shift();
    state.currentLocation.currentCucumbers = 0;
    log(state, `Falling back to ${state.currentLocation.name}.`);
  } else {
    state.currentLocation = null;
    state.phase = "defeat";
    log(state, "🥒 Defeat. All locations have been lost.");
  }
}

// ── Player stats ──────────────────────────────────────────────────────────────

function setLives(state, playerId, lives) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  p.lives = Math.max(0, Math.min(p.character.maxLives, lives));
  log(state, `${p.name} now has ${p.lives} life.`);
}

function toggleStun(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  p.isStunned = !p.isStunned;
  log(state, `${p.name} is ${p.isStunned ? "now stunned" : "no longer stunned"}.`);
}

function setPawTokens(state, playerId, tokens) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  p.pawTokens = Math.max(0, tokens);
}

// ── Attack tokens ─────────────────────────────────────────────────────────────

const VALID_ATTACK_TYPES = new Set(["scratch", "bite", "charm", "ignore"]);

function addAttackToken(state, playerId, type) {
  if (!VALID_ATTACK_TYPES.has(type)) return;
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  p.attackTokens.push({ id: `tok_${_tokenId++}`, type });
}

function moveTokenToEnemy(state, enemyId, tokenId) {
  let token = null;
  let owner = null;
  for (const p of state.players) {
    const idx = p.attackTokens.findIndex((t) => t.id === tokenId);
    if (idx !== -1) {
      [token] = p.attackTokens.splice(idx, 1);
      owner = p;
      break;
    }
  }
  if (!token) return;
  const enemy = state.enemies.find((e) => e.id === enemyId);
  if (!enemy) { owner.attackTokens.push(token); return; }
  enemy.damageTokens.push(token);
  log(state, `${owner.name} places a ${token.type} token on ${enemy.name}.`);
}

function removeDamageToken(state, enemyId, tokenId) {
  const enemy = state.enemies.find((e) => e.id === enemyId);
  if (!enemy) return;
  enemy.damageTokens = enemy.damageTokens.filter((t) => t.id !== tokenId);
}

// ── Hand / deck management ────────────────────────────────────────────────────

function drawCard(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || p.drawPile.length === 0) return;
  p.hand.push(p.drawPile.shift());
  log(state, `${p.name} drew a card (${p.drawPile.length} remaining).`);
}

function peekDrawTop(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || p.drawPile.length === 0 || p.peekCard) return;
  p.peekCard = p.drawPile.shift();
  log(state, `${p.name} is looking at the top card of their draw pile.`);
}

function peekToHand(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || !p.peekCard) return;
  p.hand.push(p.peekCard);
  p.peekCard = null;
  log(state, `${p.name} took the peeked card into their hand.`);
}

function peekToTop(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || !p.peekCard) return;
  p.drawPile.unshift(p.peekCard);
  p.peekCard = null;
  log(state, `${p.name} returned the card to the top of their draw pile.`);
}

function peekToDiscard(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || !p.peekCard) return;
  p.discardPile.push(p.peekCard);
  p.peekCard = null;
  log(state, `${p.name} sent the peeked card to their discard pile.`);
}

function playCard(state, playerId, cardId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const idx = p.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const card = p.hand.splice(idx, 1)[0];
  p.discardPile.push(card);
  log(state, `${p.name} played ${card.name}.`);
}

function discardCard(state, playerId, cardId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const idx = p.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const card = p.hand.splice(idx, 1)[0];
  p.discardPile.push(card);
  log(state, `${p.name} discarded ${card.name}.`);
}

function retrieveFromDiscard(state, playerId, cardId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const idx = p.discardPile.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const card = p.discardPile.splice(idx, 1)[0];
  p.hand.push(card);
  log(state, `${p.name} retrieved ${card.name} from their discard pile.`);
}

function shuffleDiscard(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || p.discardPile.length === 0) return;
  p.drawPile = [...p.drawPile, ...shuffle(p.discardPile)];
  p.discardPile = [];
  log(state, `${p.name} shuffled their discard pile into their draw pile.`);
}

// ── Shop & payment ────────────────────────────────────────────────────────────

function placePayment(state, playerId, tokens) {
  state.paymentZone = {
    playerId,
    tokens: Math.max(0, tokens),
    lastPurchase: state.paymentZone.lastPurchase,
  };
}

function clearPayment(state) {
  state.paymentZone = { playerId: null, tokens: 0, lastPurchase: state.paymentZone.lastPurchase };
}

function buyCard(state, playerId, cardId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const idx = state.shop.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const card = state.shop.splice(idx, 1)[0];
  p.discardPile.push(card);

  const paid = state.paymentZone.tokens;
  state.paymentZone = { playerId: null, tokens: 0, lastPurchase: { cardName: card.name, paid } };
  log(state, `${p.name} bought ${card.name} (paid ${paid} 🪙).`);

  while (state.shop.length < 6 && state.shopDeck.length > 0) {
    state.shop.push(state.shopDeck.shift());
  }
}

// ── Events ────────────────────────────────────────────────────────────────────

function drawOneEvent(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || state.eventDeck.length === 0) return;
  const event = state.eventDeck.shift();
  state.activeEvents.push(event);
  log(state, `${p.name} drew event: ${event.name}.`);
}

function discardEvent(state, eventId) {
  const idx = state.activeEvents.findIndex((e) => e.id === eventId);
  if (idx === -1) return;
  const [event] = state.activeEvents.splice(idx, 1);
  state.eventDiscard.push(event);
}

// ── Enemies ───────────────────────────────────────────────────────────────────

function defeatEnemy(state, playerId, enemyId) {
  const p = state.players.find((p) => p.playerId === playerId);
  const idx = state.enemies.findIndex((e) => e.id === enemyId);
  if (idx === -1) return;
  const enemy = state.enemies.splice(idx, 1)[0];
  log(state, `${enemy.name} defeated! (by ${p?.name ?? "unknown"})`);

  if (state.enemyDeck.length > 0 && state.enemies.length < 3) {
    const next = state.enemyDeck.shift();
    next.damageTokens = [];
    state.enemies.push(next);
    log(state, `${next.name} enters the fray!`);
  }

  checkWin(state);
}

// ── Location ──────────────────────────────────────────────────────────────────

function setCucumbers(state, count) {
  if (!state.currentLocation) return;
  state.currentLocation.currentCucumbers = Math.max(0, count);
  checkLocationLoss(state);
}

// ── Turn flow ─────────────────────────────────────────────────────────────────

function endTurn(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;

  // Clear staging tokens and paw tokens
  p.attackTokens = [];
  p.pawTokens = 0;

  // Discard hand, draw new hand
  p.discardPile.push(...p.hand);
  p.hand = [];
  const drawCount = p.character.id === "char_streetcat" ? 6 : 5;
  for (let i = 0; i < drawCount; i++) {
    if (p.drawPile.length === 0) {
      if (p.discardPile.length === 0) break;
      p.drawPile = shuffle(p.discardPile);
      p.discardPile = [];
    }
    p.hand.push(p.drawPile.shift());
  }

  // Refill shop
  while (state.shop.length < 6 && state.shopDeck.length > 0) {
    state.shop.push(state.shopDeck.shift());
  }

  log(state, `${p.name} ends their turn.`);

  // Advance to next player
  const idx = state.players.findIndex((pl) => pl.playerId === state.currentPlayerId);
  const next = state.players[(idx + 1) % state.players.length];
  state.currentPlayerId = next.playerId;
  if (idx + 1 >= state.players.length) state.roundNumber += 1;
  log(state, `It's ${next.name}'s turn (Round ${state.roundNumber}).`);
}

module.exports = {
  setLives, toggleStun, setPawTokens,
  addAttackToken, moveTokenToEnemy, removeDamageToken,
  drawCard, peekDrawTop, peekToHand, peekToTop, peekToDiscard,
  playCard, discardCard, retrieveFromDiscard, shuffleDiscard,
  placePayment, clearPayment, buyCard,
  drawOneEvent, discardEvent,
  defeatEnemy,
  setCucumbers,
  endTurn,
};
