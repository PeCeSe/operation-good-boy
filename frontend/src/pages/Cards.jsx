import { Link } from "react-router-dom";
import CHARACTERS from "../data/characters";
import CardComponent from "../components/CardComponent";
import LocationBar from "../components/LocationBar";
import EventDisplay from "../components/EventDisplay";
import EnemyComponent from "../components/EnemyComponent";

// ── Raw game data (mirrored from backend/src/data/) ──────────────────────────

const LOCATIONS = [
  { id: "loc_1", name: "The Garden", maxCucumberTokens: 8, currentCucumberTokens: 0, eventsToDraw: 1, flavorText: "Good Boy's territory. Allegedly." },
  { id: "loc_2", name: "The Street Corner", maxCucumberTokens: 8, currentCucumberTokens: 0, eventsToDraw: 2, flavorText: "Neutral ground. For now." },
  { id: "loc_3", name: "The Sunny Windowsill", maxCucumberTokens: 8, currentCucumberTokens: 0, eventsToDraw: 3, flavorText: "The last good spot." },
];

const EVENTS = [
  { id: "ev_1", name: "The Postman Rang the Doorbell", effect: { cucumberTokens: 1 }, flavorText: "Chaos. Pure chaos." },
  { id: "ev_2", name: "The Vacuum Cleaner Turned On", effect: { damageAll: 1 }, flavorText: "Everyone scatter." },
  { id: "ev_3", name: "Bath Time", effect: { discardCards: 1 }, flavorText: "The indignity." },
  { id: "ev_4", name: "Vet Appointment", effect: { damageAll: 2 }, flavorText: "They said it wouldn't hurt." },
  { id: "ev_5", name: "Kids Are Visiting", effect: { cucumberTokens: 1, discardCards: 2 }, flavorText: "They just grab. No warning." },
  { id: "ev_6", name: "It's Raining", effect: { blockShop: true }, flavorText: "We're all stuck inside. Shop's closed." },
  { id: "ev_7", name: "Dog Walk Past The Window", effect: { cucumberTokens: 2 }, flavorText: "He looked right at us." },
  { id: "ev_8", name: "Monday Morning", effect: { damageAll: 1, pawcoinPenalty: 1 }, flavorText: "Nobody wanted this." },
];

// EnemyComponent expects ability/reward as { description } objects, and maxHealth instead of hp
const ENEMIES = [
  { id: "en_1", name: "Angry Postman", emoji: "📬", maxHealth: 6, attack: 2, weakTo: ["charm"], resistantTo: ["scratch"], cucOnSurvive: 1, ability: { description: "Active player discards 1 card." }, reward: { description: "Remove 1 🥒." }, flavorText: "He takes this very personally." },
  { id: "en_2", name: "Neighbour's Baby", emoji: "👶", maxHealth: 4, attack: 1, weakTo: ["charm"], resistantTo: ["ignore"], cucOnSurvive: 1, ability: { description: "All players lose 1 life." }, reward: { description: "All players gain 1 life." }, flavorText: "It just screams. Constantly." },
  { id: "en_3", name: "Squirrel Gang", emoji: "🐿️", maxHealth: 8, attack: 2, weakTo: ["scratch"], resistantTo: ["ignore"], cucOnSurvive: 1, ability: { description: "Add 1 🥒 to the location." }, reward: { description: "All players draw 1 card." }, flavorText: "There are more of them every time." },
  { id: "en_4", name: "Sprinkler System", emoji: "💦", maxHealth: 5, attack: 2, weakTo: ["bite"], resistantTo: ["charm"], cucOnSurvive: 1, ability: { description: "Active player loses 1 life." }, reward: { description: "Remove 1 🥒." }, flavorText: "It has no feelings. It cannot be reasoned with." },
  { id: "en_5", name: "Grumpy Old Man", emoji: "👴", maxHealth: 7, attack: 2, weakTo: ["ignore"], resistantTo: ["charm"], cucOnSurvive: 1, ability: { description: "Active player loses 2 lives." }, reward: { description: "All players gain 1 life. Remove 1 🥒." }, flavorText: "Get off his lawn." },
  { id: "en_6", name: "Vacuum Cleaner", emoji: "🤖", maxHealth: 6, attack: 3, weakTo: ["bite"], resistantTo: ["scratch"], cucOnSurvive: 1, ability: { description: "All players discard 1 card." }, reward: { description: "All players draw 2 cards." }, flavorText: "A machine with no purpose but suffering." },
  { id: "en_7", name: "Rival Cat", emoji: "😾", maxHealth: 8, attack: 3, weakTo: ["ignore"], resistantTo: ["charm"], cucOnSurvive: 2, ability: { description: "Add 2 🥒 to the location." }, reward: { description: "Active player draws 2 cards." }, flavorText: "The audacity." },
  { id: "en_8", name: "Good Boy", emoji: "🐕", maxHealth: 20, attack: 4, weakTo: ["ignore"], resistantTo: ["charm"], cucOnSurvive: 2, ability: { description: "Add 1 🥒 to the location." }, reward: { description: "Remove 2 🥒. All players gain 1 life." }, flavorText: "The humans think he's harmless. He is not.", isBoss: true },
];

const KITTEN_EYES = { id: "kitten_eyes", name: "Kitten Eyes", count: 7, type: "move", image: "/cards/KittenEyes.png", effect: { attack: 0, attackType: null, pawcoins: 1, special: null }, flavorText: "Resistance is futile." };

const STARTING_DECKS = [
  {
    charId: "char_persian",
    cards: [
      KITTEN_EYES,
      { id: "ps_2", name: "Premium Kibble", count: 3, type: "item", effect: { attack: 0, attackType: null, pawcoins: 1, special: null }, flavorText: "Only the finest." },
    ],
  },
  {
    charId: "char_streetcat",
    cards: [
      KITTEN_EYES,
      { id: "sc_tuna", name: "Old Can of Tuna", count: 1, type: "item", image: "/cards/OldCanOfTuna.png", effect: { attack: 0, attackType: null, pawcoins: 0, special: "choice_scratch_or_bite_cond_coin" }, description: "Gain 1 🐾 scratch or 1 🦷 bite. Defeating an enemy this turn also gains 1 pawcoin.", flavorText: "Still good. Probably." },
      { id: "sc_hide", name: "The Good Hiding Spot", count: 1, type: "item", image: "/cards/GoodHidingSpot.png", effect: { attack: 0, attackType: null, pawcoins: 1, special: "passive_protection" }, description: "Gain 1 pawcoin. While in hand: lose max 1 life per event or attack.", flavorText: "Stealth mode activated." },
      { id: "sc_roxy", name: "Roxy", count: 1, type: "ally", image: "/cards/Roxy.png", effect: { attack: 0, attackType: null, pawcoins: 0, special: "choice_scratch_bite_or_heal2" }, description: "Choose: Gain 1 🐾 scratch, 1 🦷 bite, or 2 ♥.", flavorText: "She stops traffic. Literally." },
    ],
  },
  {
    charId: "char_kitten",
    cards: [
      KITTEN_EYES,
      { id: "ki_2", name: "Kibble", count: 3, type: "item", effect: { attack: 0, attackType: null, pawcoins: 1, special: null }, flavorText: "It's all about the kibble." },
    ],
  },
];

const SHOP_CARDS = [
  // Move
  { id: "card_001", name: "Zoomies", type: "move", cost: 3, effect: { attack: 2, attackType: "scratch", pawcoins: 0, special: null }, flavorText: "No warning. No reason. Full speed." },
  { id: "card_002", name: "Dead Cat Flop", type: "move", cost: 4, effect: { attack: 3, attackType: "ignore", pawcoins: 0, special: null }, flavorText: "The perfect guilt trip." },
  { id: "card_003", name: "Slow Blink", type: "move", cost: 3, effect: { attack: 2, attackType: "charm", pawcoins: 0, special: null }, flavorText: "This means I love you. Now do what I want." },
  { id: "card_004", name: "Pounce", type: "move", cost: 3, effect: { attack: 1, attackType: "scratch", pawcoins: 0, special: "bite_1" }, flavorText: "Maximum commitment." },
  { id: "card_005", name: "Hiss", type: "move", cost: 2, effect: { attack: 2, attackType: "ignore", pawcoins: 0, special: null }, flavorText: "Don't touch me. I mean it." },
  { id: "card_006", name: "Swipe", type: "move", cost: 4, effect: { attack: 3, attackType: "scratch", pawcoins: 0, special: null }, flavorText: "Lightning fast. No regrets." },
  { id: "card_007", name: "Belly Trap", type: "move", cost: 3, effect: { attack: 2, attackType: "bite", pawcoins: 0, special: null }, flavorText: "You were warned." },
  { id: "card_008", name: "Kneading Therapy", type: "move", cost: 4, effect: { attack: 0, attackType: null, pawcoins: 0, special: "heal" }, flavorText: "Technically helping." },
  // Item
  { id: "card_009", name: "Scratching Post", type: "item", cost: 4, effect: { attack: 2, attackType: "scratch", pawcoins: 1, special: null }, flavorText: "Also works on furniture." },
  { id: "card_010", name: "Lure Wand", type: "item", cost: 3, effect: { attack: 3, attackType: "charm", pawcoins: 0, special: null }, flavorText: "They never see it coming." },
  { id: "card_011", name: "Cardboard Box", type: "item", cost: 2, effect: { attack: 0, attackType: null, pawcoins: 0, special: "draw_card" }, flavorText: "Fits any cat. No questions asked." },
  { id: "card_012", name: "Catnip", type: "item", cost: 2, effect: { attack: 0, attackType: null, pawcoins: 3, special: null }, flavorText: "For focus. Definitely for focus." },
  { id: "card_013", name: "Hairball", type: "item", cost: 3, effect: { attack: 2, attackType: "bite", pawcoins: 0, special: null }, flavorText: "A biological weapon." },
  { id: "card_014", name: "Laser Pointer", type: "item", cost: 2, effect: { attack: 1, attackType: "scratch", pawcoins: 0, special: "charm_1" }, flavorText: "Distracting for everyone involved." },
  { id: "card_015", name: "Yarn Ball", type: "item", cost: 3, effect: { attack: 1, attackType: "scratch", pawcoins: 2, special: null }, flavorText: "Multi-purpose." },
  // Ally
  { id: "card_016", name: "Friendly Pigeon", type: "ally", cost: 3, effect: { attack: 0, attackType: null, pawcoins: 2, special: null }, flavorText: "Surprisingly cooperative for a bird." },
  { id: "card_017", name: "Old Lady Next Door", type: "ally", cost: 5, effect: { attack: 4, attackType: "charm", pawcoins: 0, special: null }, flavorText: "She gives out treats. Loyalty secured." },
  { id: "card_018", name: "Stray Kitten", type: "ally", cost: 3, effect: { attack: 1, attackType: "scratch", pawcoins: 0, special: "draw_card" }, flavorText: "Chaotic. Enthusiastic. Present." },
  { id: "card_019", name: "Garden Snail", type: "ally", cost: 2, effect: { attack: 2, attackType: "ignore", pawcoins: 0, special: null }, flavorText: "Slow. Passive-aggressive. Effective." },
  { id: "card_020", name: "Neighborhood Mouse", type: "ally", cost: 4, effect: { attack: 3, attackType: "bite", pawcoins: 0, special: null }, flavorText: "Tiny. Furious. Inexplicable." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <h2 className="text-xl font-bold text-stone-800 border-b-2 border-amber-400 pb-2 mb-4">{children}</h2>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Cards() {
  const moveCards = SHOP_CARDS.filter((c) => c.type === "move");
  const itemCards = SHOP_CARDS.filter((c) => c.type === "item");
  const allyCards = SHOP_CARDS.filter((c) => c.type === "ally");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-600">Game Reference</h1>
        <Link to="/" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">← Home</Link>
      </div>

      {/* Locations */}
      <section>
        <SectionHeader>Locations</SectionHeader>
        <div className="flex flex-wrap gap-4">
          {LOCATIONS.map((loc, i) => (
            <LocationBar
              key={loc.id}
              currentLocation={loc}
              lostLocations={[]}
              totalLocations={LOCATIONS.length}
            />
          ))}
        </div>
      </section>

      {/* Events */}
      <section>
        <SectionHeader>Stupid Hooman Events</SectionHeader>
        <div className="flex flex-wrap gap-3">
          <EventDisplay events={EVENTS} />
        </div>
      </section>

      {/* Enemies */}
      <section>
        <SectionHeader>Enemies</SectionHeader>
        <div className="flex flex-wrap gap-4">
          {ENEMIES.map((enemy) => (
            <EnemyComponent
              key={enemy.id}
              enemy={enemy}
              isMyTurn={false}
            />
          ))}
        </div>
      </section>

      {/* Starting decks */}
      <section>
        <SectionHeader>Starting Decks</SectionHeader>
        <div className="flex flex-col gap-6">
          {STARTING_DECKS.map(({ charId, cards }) => {
            const char = CHARACTERS.find((c) => c.id === charId);
            return (
              <div key={charId}>
                <div className="flex items-center gap-3 mb-3">
                  {char?.headshot && (
                    <img src={char.headshot} alt={char.name} className="w-8 h-8 object-contain" />
                  )}
                  <div>
                    <span className="font-bold text-sm text-stone-800">{char?.name}</span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide ml-2">{char?.subtitle}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {cards.map((card) => (
                    <div key={card.id} className="relative">
                      <CardComponent card={card} isPlayable={true} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-700 text-white text-xs font-bold flex items-center justify-center shadow">
                        ×{card.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shop cards */}
      <section>
        <SectionHeader>Shop Cards</SectionHeader>
        {[
          { label: "Move", cards: moveCards, color: "text-[#B06560]" },
          { label: "Item", cards: itemCards, color: "text-[#A0712E]" },
          { label: "Ally", cards: allyCards, color: "text-[#4A7080]" },
        ].map(({ label, cards, color }) => (
          <div key={label} className="mb-8">
            <h3 className={`font-bold text-sm uppercase tracking-widest mb-3 ${color}`}>{label}</h3>
            <div className="flex flex-wrap gap-3">
              {cards.map((card) => (
                <CardComponent key={card.id} card={card} showCost={true} isPlayable={true} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
