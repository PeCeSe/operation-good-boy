const { shuffle } = require("./gameState");

let _tokenId = 1;

function log(state, msg) {
  state.log = [...state.log.slice(-99), { msg, time: Date.now() }];
}

// ── Auto-detection ────────────────────────────────────────────────────────────

function checkWin(state) {
  if (state.enemies.every((e) => !e) && state.enemyDeck.length === 0) {
    state.phase = "victory";
    // Not every level has a boss — keep this neutral so it reads correctly on
    // boss-less levels (e.g. level 1). Boss-specific flavor can come later.
    log(state, "🎉 Victory! All enemies have been defeated.");
  }
}

function checkLocationLoss(state) {
  if (!state.currentLocation) return;
  if (state.currentLocation.currentCucumbers < state.currentLocation.maxCucumberTokens) return;
  // Locations no longer auto-advance when overrun — the player switches manually.
  // Defeat only triggers when the LAST remaining location is fully filled.
  if (state.locationDeck.length > 0) return;

  state.phase = "defeat";
  log(state, "🥒 Defeat. The last location has been overrun.");
}

// ── Player stats ──────────────────────────────────────────────────────────────

function setLives(state, playerId, lives) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const clamped = Math.max(0, Math.min(p.character.maxLives, lives));
  if (clamped > p.lives) p.stats.livesHealed += clamped - p.lives;
  p.lives = clamped;
  log(state, `${p.name} now has ${p.lives} life.`);
}

function toggleStun(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  p.isStunned = !p.isStunned;
  if (p.isStunned) p.stats.timesStunned++;
  log(state, `${p.name} is ${p.isStunned ? "now stunned" : "no longer stunned"}.`);
}

function setPawTokens(state, playerId, tokens) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const next = Math.max(0, tokens);
  if (next > p.pawTokens) p.stats.coinsEarned += next - p.pawTokens;
  p.pawTokens = next;
}

// ── Attack tokens ─────────────────────────────────────────────────────────────

const VALID_ATTACK_TYPES = new Set(["attack"]);

function addAttackToken(state, playerId, type) {
  if (!VALID_ATTACK_TYPES.has(type)) return;
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  p.attackTokens.push({ id: `tok_${_tokenId++}`, type: "attack" });
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
  const enemy = state.enemies.find((e) => e && e.id === enemyId);
  if (!enemy) { owner.attackTokens.push(token); return; }
  enemy.damageTokens.push(token);
  owner.stats.damageDealt++;
  log(state, `${owner.name} places an attack token on ${enemy.name}.`);
}

function removeDamageToken(state, enemyId, tokenId) {
  const enemy = state.enemies.find((e) => e && e.id === enemyId);
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

function returnCardToDeck(state, playerId, cardId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const idx = p.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const [card] = p.hand.splice(idx, 1);
  p.drawPile.unshift(card);
  log(state, `${p.name} returned a card to the top of their draw pile.`);
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
  const { playerId, tokens } = state.paymentZone;
  if (playerId && tokens > 0) {
    const p = state.players.find((p) => p.playerId === playerId);
    if (p) p.pawTokens = (p.pawTokens ?? 0) + tokens;
  }
  state.paymentZone = { playerId: null, tokens: 0, lastPurchase: state.paymentZone.lastPurchase };
}

function buyCard(state, playerId, cardId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;
  const idx = state.shop.findIndex((c) => c && c.id === cardId);
  if (idx === -1) return;
  const card = state.shop[idx];
  state.shop[idx] = null;
  p.discardPile.push(card);
  p.stats.cardsBought++;

  const paid = state.paymentZone.tokens;
  const change = Math.max(0, paid - card.cost);
  // Leave change in the payment zone so the player can spend it on the next card
  state.paymentZone = { playerId: change > 0 ? state.paymentZone.playerId : null, tokens: change, lastPurchase: { cardName: card.name, paid: paid - change } };
  log(state, `${p.name} bought ${card.name} (paid ${paid - change} 🪙${change > 0 ? `, ${change} 🪙 left in zone` : ""}).`);
}

// ── Events ────────────────────────────────────────────────────────────────────

function drawOneEvent(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p || state.eventDeck.length === 0) return;
  const event = state.eventDeck.shift();
  state.eventDiscard.push(event);
  log(state, `${p.name} drew event: ${event.name}.`);
}

function discardEvent(state, eventId) {
  const idx = state.activeEvents.findIndex((e) => e.id === eventId);
  if (idx === -1) return;
  const [event] = state.activeEvents.splice(idx, 1);
  state.eventDiscard.push(event);
}

function shuffleEventDiscard(state) {
  if (state.eventDiscard.length === 0) return;
  const shuffled = shuffle(state.eventDiscard);
  state.eventDeck = [...state.eventDeck, ...shuffled];
  state.eventDiscard = [];
  log(state, `Event discard shuffled back into the event deck.`);
}

// ── Enemies ───────────────────────────────────────────────────────────────────

// Monday (0) and Tuesday (1) are one-enemy-at-a-time levels; later levels
// open up all three slots.
function maxEnemySlots(state) {
  return (state.difficulty ?? 0) <= 1 ? 1 : 3;
}

function drawEnemy(state, slotIndex) {
  if (state.enemyDeck.length === 0) return;
  const slots = maxEnemySlots(state);
  const occupiedCount = state.enemies.filter(Boolean).length;
  if (occupiedCount >= slots) return;

  let targetSlot;
  if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < slots && !state.enemies[slotIndex]) {
    targetSlot = slotIndex;
  } else {
    targetSlot = state.enemies.findIndex((e) => !e);
    if (targetSlot === -1) return;
  }

  const enemy = state.enemyDeck.shift();
  enemy.damageTokens = [];
  state.enemies[targetSlot] = enemy;
  log(state, `${enemy.name} enters the fray!`);
}

function defeatEnemy(state, playerId, enemyId) {
  const p = state.players.find((p) => p.playerId === playerId);
  const idx = state.enemies.findIndex((e) => e && e.id === enemyId);
  if (idx === -1) return;
  const enemy = state.enemies[idx];
  state.enemies[idx] = null;
  state.enemyDiscard = state.enemyDiscard ?? [];
  state.enemyDiscard.push(enemy);
  if (p) p.stats.enemiesDefeated++;
  log(state, `${enemy.name} defeated! (by ${p?.name ?? "unknown"})`);
  checkWin(state);
}

// ── Location ──────────────────────────────────────────────────────────────────

function setCucumbers(state, count, playerId) {
  if (!state.currentLocation) return;
  const prev = state.currentLocation.currentCucumbers ?? 0;
  const next = Math.max(0, count);
  if (playerId) {
    const p = state.players.find((p) => p.playerId === playerId);
    if (p) {
      if (next > prev) p.stats.cucumbersAdded   += next - prev;
      if (next < prev) p.stats.cucumbersRemoved += prev - next;
    }
  }
  state.currentLocation.currentCucumbers = next;
  // Filling a location with cucumbers is a forced loss — it falls back to the
  // next location, or triggers defeat if none remain. (Manual navigation via
  // the arrows is separate and voluntary.)
  checkLocationLoss(state);
}

// Manual navigation between locations. The location the player moves to becomes
// the active one (interactive, agurker can be added). Cucumber counts are kept
// per-location so moving back and forth doesn't reset progress.
function advanceLocation(state) {
  if (!state.currentLocation || state.locationDeck.length === 0) return;
  state.lostLocations.push(state.currentLocation);
  const next = state.locationDeck.shift();
  if (next.currentCucumbers == null) next.currentCucumbers = 0;
  state.currentLocation = next;
  log(state, `Moved on to ${next.name}.`);
}

function retreatLocation(state) {
  if (!state.currentLocation || state.lostLocations.length === 0) return;
  state.locationDeck.unshift(state.currentLocation);
  state.currentLocation = state.lostLocations.pop();
  log(state, `Went back to ${state.currentLocation.name}.`);
}

// ── Turn flow ─────────────────────────────────────────────────────────────────

function endTurn(state, playerId) {
  const p = state.players.find((p) => p.playerId === playerId);
  if (!p) return;

  // Clear staging tokens, paw tokens, and any leftover payment zone coins
  p.attackTokens = [];
  p.pawTokens = 0;
  if (state.paymentZone.playerId === playerId) {
    state.paymentZone = { playerId: null, tokens: 0, lastPurchase: state.paymentZone.lastPurchase };
  }

  // Discard hand, draw new hand
  p.discardPile.push(...p.hand);
  p.hand = [];
  const drawCount = 5;
  for (let i = 0; i < drawCount; i++) {
    if (p.drawPile.length === 0) {
      if (p.discardPile.length === 0) break;
      p.drawPile = shuffle(p.discardPile);
      p.discardPile = [];
    }
    p.hand.push(p.drawPile.shift());
  }

  // Refill shop: fill null slots in-place, then append if still under 6
  state.shop = state.shop.map(slot => {
    if (slot !== null) return slot;
    return state.shopDeck.length > 0 ? state.shopDeck.shift() : null;
  });
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
  playCard, discardCard, retrieveFromDiscard, shuffleDiscard, returnCardToDeck,
  placePayment, clearPayment, buyCard,
  drawOneEvent, discardEvent, shuffleEventDiscard,
  drawEnemy, defeatEnemy,
  setCucumbers, advanceLocation, retreatLocation,
  endTurn,
};
