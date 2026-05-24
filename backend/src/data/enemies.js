const ENEMIES = [
  // ── Boss (always last in deck) ────────────────────────────────────────────
  {
    id: "enemy_001",
    name: "Good Boy",
    emoji: "🐕",
    pack: 1,
    maxHealth: 20,
    currentHealth: 20,
    attack: 4,
    cucumberTokensOnSurvive: 2,
    weakTo: [],
    resistantTo: [],
    ability: {
      trigger: "start_of_round",
      description: "Add 1 🥒 to the location.",
    },
    reward: {
      description: "Remove 2 🥒. All heroes gain 1 ❤️.",
    },
    flavorText: "The humans think he's harmless. He is not.",
    placedAttacks: {},
    isBoss: true,
  },

  // ── Pack 1 enemies ────────────────────────────────────────────────────────
  {
    id: "enemy_002",
    name: "Feral Ferret",
    emoji: "🐾",
    pack: 1,
    maxHealth: 6,
    currentHealth: 6,
    attack: 2,
    cucumberTokensOnSurvive: 1,
    weakTo: [],
    resistantTo: [],
    ability: {
      trigger: "on_cucumber_added",
      description: "Each time a 🥒 token is added to the location, active hero loses 2 ❤️.",
    },
    reward: {
      description: "Remove 1 🥒 from location.",
    },
    flavorText: "Unpredictable. Unhinged. Unstoppable.",
    placedAttacks: {},
  },
  {
    id: "enemy_003",
    name: "Prince Ferdinand",
    emoji: "👑",
    pack: 1,
    maxHealth: 5,
    currentHealth: 5,
    attack: 2,
    cucumberTokensOnSurvive: 1,
    weakTo: [],
    resistantTo: [],
    ability: {
      trigger: "on_discard",
      description: "Each time a Stupid Hoomans event or enemy causes a hero to discard a card, that hero loses 1 ❤️.",
    },
    reward: {
      description: "ALL heroes draw a card.",
    },
    flavorText: "He makes the rules. He also breaks them.",
    placedAttacks: {},
  },
  {
    id: "enemy_004",
    name: "Darla",
    emoji: "💅",
    pack: 1,
    maxHealth: 6,
    currentHealth: 6,
    attack: 2,
    cucumberTokensOnSurvive: 1,
    weakTo: [],
    resistantTo: [],
    ability: {
      trigger: "start_of_round",
      description: "Active hero loses 1 ❤️.",
    },
    reward: {
      description: "ALL heroes gain 1 🪙 and 1 ❤️.",
    },
    flavorText: "She's not sorry.",
    placedAttacks: {},
  },
];

module.exports = { ENEMIES };
