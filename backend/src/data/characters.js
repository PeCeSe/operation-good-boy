// Basic starting cards — not in the shop, character-specific
const STARTING_CARDS = {
  persian_claw: {
    id: "persian_claw",
    name: "Delicate Swipe",
    type: "move",
    cost: 0,
    effect: { attack: 1, attackType: "scratch", pawcoins: 0, special: null },
    flavorText: "Precise. Disdainful.",
  },
  persian_kibble: {
    id: "persian_kibble",
    name: "Premium Kibble",
    type: "item",
    cost: 0,
    effect: { attack: 0, attackType: null, pawcoins: 1, special: null },
    flavorText: "Only the finest.",
  },
  streetcat_claw: {
    id: "streetcat_claw",
    name: "Street Claw",
    type: "move",
    cost: 0,
    effect: { attack: 1, attackType: "scratch", pawcoins: 0, special: null },
    flavorText: "Tested in the field.",
  },
  streetcat_kibble: {
    id: "streetcat_kibble",
    name: "Scavenged Kibble",
    type: "item",
    cost: 0,
    effect: { attack: 0, attackType: null, pawcoins: 1, special: null },
    flavorText: "Found it. It's fine.",
  },
  kitten_claw: {
    id: "kitten_claw",
    name: "Tiny Swipe",
    type: "move",
    cost: 0,
    effect: { attack: 1, attackType: "scratch", pawcoins: 0, special: null },
    flavorText: "Maximum effort.",
  },
  kitten_kibble: {
    id: "kitten_kibble",
    name: "Kibble",
    type: "item",
    cost: 0,
    effect: { attack: 0, attackType: null, pawcoins: 1, special: null },
    flavorText: "It's all about the kibble.",
  },
};

const CHARACTERS = [
  {
    id: "char_persian",
    name: "The Persian",
    emoji: "😤",
    maxLives: 9,
    startingDeck: [
      ...Array(7).fill("persian_claw"),
      ...Array(3).fill("persian_kibble"),
    ],
    passiveAbility: {
      description: "When taking damage, generate 1 charm attack.",
      trigger: "on_damage",
    },
    flavorText: "She hasn't slept in three weeks. She is DONE.",
  },
  {
    id: "char_streetcat",
    name: "The Street Cat",
    emoji: "😎",
    maxLives: 9,
    startingDeck: [
      ...Array(7).fill("streetcat_claw"),
      ...Array(3).fill("streetcat_kibble"),
    ],
    passiveAbility: {
      description: "Draw 1 extra card at the start of each turn.",
      trigger: "on_turn_start",
    },
    flavorText: "Just wants to nap in that sunny spot. Is that so much to ask.",
  },
  {
    id: "char_kitten",
    name: "The Kitten",
    emoji: "🐱",
    maxLives: 9,
    startingDeck: [
      ...Array(7).fill("kitten_claw"),
      ...Array(3).fill("kitten_kibble"),
    ],
    passiveAbility: {
      description: "When buying a card, gain 1 pawcoin refund.",
      trigger: "on_buy",
    },
    flavorText: "The squeaky toy. IT'S SO UNFAIR.",
  },
];

module.exports = { CHARACTERS, STARTING_CARDS };
