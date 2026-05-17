// Basic starting cards — not in the shop, character-specific
const STARTING_CARDS = {
  kitten_eyes: {
    id: "kitten_eyes",
    name: "Kitten Eyes",
    type: "move",
    cost: 0,
    image: "/cards/KittenEyes.png",
    effect: { attack: 0, attackType: null, pawcoins: 1, special: null },
    flavorText: "Resistance is futile.",
  },
  streetcat_tuna: {
    id: "streetcat_tuna",
    name: "Old Can of Tuna",
    type: "item",
    cost: 0,
    image: "/cards/OldCanOfTuna.png",
    effect: { attack: 0, attackType: null, pawcoins: 0, special: "choice_scratch_or_bite_cond_coin" },
    description: "Gain 1 🐾 scratch or 1 🦷 bite. Defeating an enemy this turn also gains 1 pawcoin.",
    flavorText: "Still good. Probably.",
  },
  streetcat_hidingspot: {
    id: "streetcat_hidingspot",
    name: "The Good Hiding Spot",
    type: "item",
    cost: 0,
    image: "/cards/GoodHidingSpot.png",
    effect: { attack: 0, attackType: null, pawcoins: 1, special: "passive_protection" },
    description: "Gain 1 pawcoin. While in hand: lose max 1 life per event or attack.",
    flavorText: "Stealth mode activated.",
  },
  streetcat_roxy: {
    id: "streetcat_roxy",
    name: "Roxy",
    type: "ally",
    cost: 0,
    image: "/cards/Roxy.png",
    effect: { attack: 0, attackType: null, pawcoins: 0, special: "choice_scratch_bite_or_heal2" },
    description: "Choose: Gain 1 🐾 scratch, 1 🦷 bite, or 2 ♥.",
    flavorText: "She stops traffic. Literally.",
  },
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
      ...Array(7).fill("kitten_eyes"),
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
      ...Array(7).fill("kitten_eyes"),
      "streetcat_tuna",
      "streetcat_hidingspot",
      "streetcat_roxy",
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
      ...Array(7).fill("kitten_eyes"),
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
