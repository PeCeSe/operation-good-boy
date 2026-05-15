const { shuffle } = require("./gameState");

function log(state, msg) {
  state.log = [...state.log.slice(-99), msg];
}

function drawCards(player, count) {
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) {
      if (player.discard.length === 0) break;
      player.deck = shuffle(player.discard);
      player.discard = [];
    }
    player.hand.push(player.deck.shift());
  }
}

function calcDamage(base, attackType, enemy) {
  if (enemy.weakTo.includes(attackType)) return base * 2;
  if (enemy.resistantTo.includes(attackType)) return Math.floor(base / 2);
  return base;
}

function applyEventEffect(state, event) {
  const e = event.effect;
  state.blockShop = e.blockShop;
  state.blockAttack = e.blockAttack;
  state.pawcoinPenalty = e.pawcoinPenalty;

  if (e.cucumberTokens > 0) {
    state.currentLocation.currentCucumberTokens += e.cucumberTokens;
    log(state, `Event: +${e.cucumberTokens} 🥒 to ${state.currentLocation.name}.`);
  }

  if (e.damageAll > 0) {
    state.players.forEach((p) => {
      p.lives = Math.max(0, p.lives - e.damageAll);
    });
    log(state, `Event: All players lose ${e.damageAll} life.`);
  }

  if (e.discardCards > 0) {
    state.players.forEach((p) => {
      const n = Math.min(e.discardCards, p.hand.length);
      const discarded = p.hand.splice(0, n);
      p.discard.push(...discarded);
    });
    log(state, `Event: Each player discards ${e.discardCards} card(s).`);
  }

  if (e.blockShop) log(state, `Event: Shop is closed this round.`);
  if (e.blockAttack) log(state, `Event: Players cannot attack this round.`);
  if (e.pawcoinPenalty > 0) log(state, `Event: Each player generates ${e.pawcoinPenalty} fewer pawcoin(s) this round.`);
}

function applyEnemyAbility(state, enemy) {
  const e = enemy.ability?.effect;
  if (!e) return;

  const activePlayer = state.players.find((p) => p.playerId === state.turn.currentPlayerId);

  if (e.addCucumber > 0) {
    state.currentLocation.currentCucumberTokens = Math.min(
      state.currentLocation.maxCucumberTokens,
      state.currentLocation.currentCucumberTokens + e.addCucumber
    );
    log(state, `${enemy.name}: +${e.addCucumber} 🥒 to ${state.currentLocation.name}.`);
  }
  if (e.damageAll > 0) {
    state.players.forEach((p) => { p.lives = Math.max(0, p.lives - e.damageAll); });
    log(state, `${enemy.name}: all players lose ${e.damageAll} life.`);
  }
  if (e.damageActive > 0 && activePlayer) {
    activePlayer.lives = Math.max(0, activePlayer.lives - e.damageActive);
    log(state, `${enemy.name}: ${activePlayer.name} loses ${e.damageActive} life.`);
  }
  if (e.discardActive > 0 && activePlayer) {
    const n = Math.min(e.discardActive, activePlayer.hand.length);
    activePlayer.discard.push(...activePlayer.hand.splice(0, n));
    log(state, `${enemy.name}: ${activePlayer.name} discards ${n} card(s).`);
  }
  if (e.discardAll > 0) {
    state.players.forEach((p) => {
      const n = Math.min(e.discardAll, p.hand.length);
      p.discard.push(...p.hand.splice(0, n));
    });
    log(state, `${enemy.name}: all players discard ${e.discardAll} card(s).`);
  }
}

function applyEnemyReward(state, enemy, activePlayer) {
  const r = enemy.reward;
  if (!r) return;

  if (r.pawcoins > 0) {
    activePlayer.currentPawcoins += r.pawcoins;
    log(state, `Reward: ${activePlayer.name} gains ${r.pawcoins} 🪙.`);
  }
  if (r.removeCucumbers > 0 && state.currentLocation) {
    const removed = Math.min(r.removeCucumbers, state.currentLocation.currentCucumberTokens);
    state.currentLocation.currentCucumberTokens -= removed;
    if (removed > 0) log(state, `Reward: removed ${removed} 🥒 from ${state.currentLocation.name}.`);
  }
  if (r.healAll > 0) {
    state.players.forEach((p) => { p.lives = Math.min(p.character.maxLives, p.lives + r.healAll); });
    log(state, `Reward: all players gain ${r.healAll} life.`);
  }
  if (r.drawCardsAll > 0) {
    state.players.forEach((p) => drawCards(p, r.drawCardsAll));
    log(state, `Reward: all players draw ${r.drawCardsAll} card(s).`);
  }
  if (r.drawCardsActive > 0) {
    drawCards(activePlayer, r.drawCardsActive);
    log(state, `Reward: ${activePlayer.name} draws ${r.drawCardsActive} card(s).`);
  }
}

function startRound(state) {
  // Reset per-round flags
  state.blockShop = false;
  state.blockAttack = false;
  state.pawcoinPenalty = 0;

  // Draw events (count based on current location)
  const eventsToDraw = state.currentLocation?.eventsToDraw || 1;
  const drawnEvents = [];
  for (let i = 0; i < eventsToDraw && state.eventDeck.length > 0; i++) {
    drawnEvents.push(state.eventDeck.shift());
  }
  state.currentEvents = drawnEvents;
  drawnEvents.forEach((event) => {
    log(state, `📣 Event: "${event.name}" — ${event.flavorText}`);
    applyEventEffect(state, event);
  });

  // Draw enemy if board has fewer than 3
  while (state.enemies.length < 3 && state.enemyDeck.length > 0) {
    const enemy = state.enemyDeck.shift();
    state.enemies.push(enemy);
    log(state, `New enemy appeared: ${enemy.name}!`);
  }

  // Apply start_of_round enemy abilities
  state.enemies.forEach((enemy) => {
    if (enemy.ability?.trigger === "start_of_round") {
      applyEnemyAbility(state, enemy);
    }
  });

  if (state.enemies.length > 0) {
    const names = state.enemies.map((e) => e.name).join(", ");
    log(state, `Enemies on the board: ${names}.`);
  }

  return state;
}

function handleStunnedPlayer(state, playerId) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player || !player.isStunned) return state;

  const discardCount = Math.floor(player.hand.length / 2);
  const discarded = player.hand.splice(0, discardCount);
  player.discard.push(...discarded);

  state.currentLocation.currentCucumberTokens += 1;
  player.lives = player.character.maxLives;
  player.isStunned = false;

  log(state, `${player.name} is recovering from stun: discarded ${discardCount} card(s), +1 🥒.`);
  return state;
}

function playCard(state, playerId, cardId) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return { state, error: "Player not found." };
  if (state.turn.currentPlayerId !== playerId) return { state, error: "Not your turn." };

  const cardIdx = player.hand.findIndex((c) => c.id === cardId);
  if (cardIdx === -1) return { state, error: "Card not in hand." };

  const card = player.hand.splice(cardIdx, 1)[0];
  player.discard.push(card);

  const { attack, attackType, pawcoins, special } = card.effect;

  // Apply pawcoins (minus any event penalty)
  const earnedCoins = Math.max(0, pawcoins - state.pawcoinPenalty);
  player.currentPawcoins += earnedCoins;

  // Apply attack
  if (attack > 0 && attackType) {
    player.currentAttack[attackType] = (player.currentAttack[attackType] || 0) + attack;
  }

  // Handle compound specials for multi-attack cards (Pounce: bite_1, Laser Pointer: charm_1)
  if (special && special.startsWith("bite_")) {
    const bonus = parseInt(special.split("_")[1]);
    player.currentAttack.bite = (player.currentAttack.bite || 0) + bonus;
  }
  if (special && special.startsWith("charm_")) {
    const bonus = parseInt(special.split("_")[1]);
    player.currentAttack.charm = (player.currentAttack.charm || 0) + bonus;
  }

  // Standard specials
  if (special === "draw_card") {
    drawCards(player, 1);
    log(state, `${player.name} played ${card.name} and drew a card.`);
  } else if (special === "heal") {
    player.lives = Math.min(player.character.maxLives, player.lives + 1);
    log(state, `${player.name} played ${card.name} and healed 1 life.`);
  } else {
    log(state, `${player.name} played ${card.name}.`);
  }

  return { state, error: null };
}

function attackEnemy(state, playerId, enemyId, attackType) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return { state, error: "Player not found." };
  if (state.turn.currentPlayerId !== playerId) return { state, error: "Not your turn." };
  if (state.blockAttack) return { state, error: "Attacks are blocked this round." };

  const attackAmount = 1;
  if ((player.currentAttack[attackType] || 0) <= 0) return { state, error: `No ${attackType} attack available.` };

  const enemyIdx = state.enemies.findIndex((e) => e.id === enemyId);
  if (enemyIdx === -1) return { state, error: "Enemy not found." };

  const enemy = state.enemies[enemyIdx];
  const damage = calcDamage(attackAmount, attackType, enemy);
  enemy.currentHealth = Math.max(0, enemy.currentHealth - damage);
  enemy.placedAttacks = enemy.placedAttacks || { scratch: 0, bite: 0, ignore: 0, charm: 0 };
  enemy.placedAttacks[attackType] = (enemy.placedAttacks[attackType] || 0) + attackAmount;
  player.currentAttack[attackType] -= 1;

  const modifier =
    enemy.weakTo.includes(attackType) ? " (WEAK — double damage!)" :
    enemy.resistantTo.includes(attackType) ? " (resistant — half damage)" : "";
  log(state, `${player.name} used ${attackType} on ${enemy.name} for ${damage} damage${modifier}.`);

  if (enemy.currentHealth <= 0) {
    state.enemies.splice(enemyIdx, 1);
    log(state, `${enemy.name} defeated! ${enemy.reward.description}`);
    applyEnemyReward(state, enemy, player);

    // Refill board
    if (state.enemyDeck.length > 0 && state.enemies.length < 3) {
      const next = state.enemyDeck.shift();
      state.enemies.push(next);
      log(state, `${next.name} enters the fray!`);
    }
  }

  return { state, error: null };
}

function buyCard(state, playerId, cardId) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return { state, error: "Player not found." };
  if (state.turn.currentPlayerId !== playerId) return { state, error: "Not your turn." };
  if (state.blockShop) return { state, error: "Shop is closed this round." };

  const shopIdx = state.shop.findIndex((c) => c.id === cardId);
  if (shopIdx === -1) return { state, error: "Card not in shop." };

  const card = state.shop[shopIdx];
  if (player.currentPawcoins < card.cost) return { state, error: "Not enough pawcoins." };

  player.currentPawcoins -= card.cost;
  state.shop.splice(shopIdx, 1);
  player.discard.push(card);

  // Refill shop
  if (state.shopDeck.length > 0) {
    state.shop.splice(shopIdx, 0, state.shopDeck.shift());
  }

  // Kitten passive: refund 1 pawcoin on buy
  if (player.character.id === "char_kitten") {
    player.currentPawcoins += 1;
    log(state, `${player.name} bought ${card.name} (+1 pawcoin refund from passive).`);
  } else {
    log(state, `${player.name} bought ${card.name}.`);
  }

  return { state, error: null };
}

function advanceToNextPlayer(state) {
  const idx = state.players.findIndex((p) => p.playerId === state.turn.currentPlayerId);
  const nextIdx = (idx + 1) % state.players.length;
  state.turn.currentPlayerId = state.players[nextIdx].playerId;
  return nextIdx === 0; // true = full round complete
}

function checkWinLose(state) {
  if (state.enemies.length === 0 && state.enemyDeck.length === 0) {
    state.phase = "victory";
    log(state, "🎉 Victory! Good Boy has been defeated. The neighborhood is safe... for now.");
    return true;
  }
  return false;
}

function endRound(state) {
  // Enemies add cucumber tokens for surviving the round
  state.enemies.forEach((enemy) => {
    state.currentLocation.currentCucumberTokens += enemy.cucumberTokensOnSurvive;
  });
  if (state.enemies.length > 0) {
    log(state, `Surviving enemies add cucumber tokens to ${state.currentLocation.name}.`);
  }

  // Check for knocked-out players (lives === 0)
  state.players.forEach((p) => {
    if (p.lives === 0 && !p.isStunned) {
      p.isStunned = true;
      log(state, `${p.name} was knocked out and will be stunned next round!`);
    }
  });

  // Check location loss
  if (state.currentLocation.currentCucumberTokens >= state.currentLocation.maxCucumberTokens) {
    log(state, `💀 ${state.currentLocation.name} is lost!`);
    state.lostLocations.push(state.currentLocation);

    if (state.locationDeck.length > 0) {
      state.currentLocation = state.locationDeck.shift();
      log(state, `Moving to ${state.currentLocation.name}.`);
    } else {
      state.currentLocation = null;
      state.phase = "defeat";
      log(state, "🥒 Defeat. All locations have been lost.");
      return state;
    }
  }

  if (checkWinLose(state)) return state;

  // Start next round
  state.turn.roundNumber += 1;
  state.turn.currentPlayerId = state.players[0].playerId;
  log(state, `--- Round ${state.turn.roundNumber} begins ---`);
  startRound(state);

  return state;
}

function endTurn(state, playerId) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return { state, error: "Player not found." };
  if (state.turn.currentPlayerId !== playerId) return { state, error: "Not your turn." };

  // Discard hand, reset resources
  player.discard.push(...player.hand);
  player.hand = [];
  player.currentPawcoins = 0;
  player.currentAttack = { scratch: 0, bite: 0, ignore: 0, charm: 0 };

  // Street Cat passive: draw 6 instead of 5
  const drawCount = player.character.id === "char_streetcat" ? 6 : 5;
  drawCards(player, drawCount);

  log(state, `${player.name} ends their turn.`);

  const roundComplete = advanceToNextPlayer(state);

  if (roundComplete) {
    endRound(state);
  } else {
    // Handle stun at start of next player's turn
    const nextPlayer = state.players.find((p) => p.playerId === state.turn.currentPlayerId);
    if (nextPlayer && nextPlayer.isStunned) {
      handleStunnedPlayer(state, nextPlayer.playerId);
    }
  }

  return { state, error: null };
}

function startTurn(state, playerId) {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return state;
  if (player.isStunned) {
    handleStunnedPlayer(state, playerId);
  }
  return state;
}

module.exports = { startRound, playCard, attackEnemy, buyCard, endTurn, startTurn };
