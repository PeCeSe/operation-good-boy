import { Link } from "react-router-dom";
import CHARACTERS from "../data/characters";
import CardComponent from "../components/CardComponent";
import LocationBar from "../components/LocationBar";
import { EventCardDisplay } from "../components/EventDeck";
import { EnemyCardDisplay } from "../components/EnemyComponent";

// ── Raw game data (mirrored from backend/src/data/) ──────────────────────────

const LOCATIONS = [
  { id: "loc_1", name: "The Garden", pack: 1, maxCucumberTokens: 8, currentCucumberTokens: 0, eventsToDraw: 1, flavorText: "Good Boy's territory. Allegedly." },
  { id: "loc_2", name: "The Street Corner", pack: 1, maxCucumberTokens: 8, currentCucumberTokens: 0, eventsToDraw: 2, flavorText: "Neutral ground. For now." },
  { id: "loc_3", name: "The Sunny Windowsill", pack: 1, maxCucumberTokens: 8, currentCucumberTokens: 0, eventsToDraw: 3, flavorText: "The last good spot." },
];

const EVENTS = [
  { id: "ev_1", pack: 1, name: "The Postman Rang the Doorbell", effect: { cucumberTokens: 1 }, flavorText: "Chaos. Pure chaos." },
  { id: "ev_2", pack: 1, name: "The Vacuum Cleaner Turned On", effect: { damageAll: 1 }, flavorText: "Everyone scatter." },
  { id: "ev_3", pack: 1, name: "Bath Time", effect: { discardCards: 1 }, flavorText: "The indignity." },
  { id: "ev_4", pack: 1, name: "Vet Appointment", effect: { damageAll: 2 }, flavorText: "They said it wouldn't hurt." },
  { id: "ev_5", pack: 1, name: "Kids Are Visiting", effect: { cucumberTokens: 1, discardCards: 2 }, flavorText: "They just grab. No warning." },
  { id: "ev_6", pack: 1, name: "It's Raining", effect: { blockShop: true }, flavorText: "We're all stuck inside. Shop's closed." },
  { id: "ev_7", pack: 1, name: "Dog Walk Past The Window", effect: { cucumberTokens: 2 }, flavorText: "He looked right at us." },
  { id: "ev_8", pack: 1, name: "Monday Morning", effect: { damageAll: 1, pawcoinPenalty: 1 }, flavorText: "Nobody wanted this." },
];

const ENEMIES = [
  { id: "en_1", pack: 1, name: "Angry Postman", emoji: "📬", maxHealth: 6, attack: 2, cucOnSurvive: 1, ability: { description: "Active player discards 1 card." }, reward: { description: "Remove 1 🥒." }, flavorText: "He takes this very personally.", damageTokens: [] },
  { id: "en_2", pack: 1, name: "Neighbour's Baby", emoji: "👶", maxHealth: 4, attack: 1, cucOnSurvive: 1, ability: { description: "All players lose 1 life." }, reward: { description: "All players gain 1 life." }, flavorText: "It just screams. Constantly.", damageTokens: [] },
  { id: "en_3", pack: 1, name: "Squirrel Gang", emoji: "🐿️", maxHealth: 8, attack: 2, cucOnSurvive: 1, ability: { description: "Add 1 🥒 to the location." }, reward: { description: "All players draw 1 card." }, flavorText: "There are more of them every time.", damageTokens: [] },
  { id: "en_4", pack: 1, name: "Sprinkler System", emoji: "💦", maxHealth: 5, attack: 2, cucOnSurvive: 1, ability: { description: "Active player loses 1 life." }, reward: { description: "Remove 1 🥒." }, flavorText: "It has no feelings. It cannot be reasoned with.", damageTokens: [] },
  { id: "en_5", pack: 1, name: "Grumpy Old Man", emoji: "👴", maxHealth: 7, attack: 2, cucOnSurvive: 1, ability: { description: "Active player loses 2 lives." }, reward: { description: "All players gain 1 life. Remove 1 🥒." }, flavorText: "Get off his lawn.", damageTokens: [] },
  { id: "en_6", pack: 1, name: "Vacuum Cleaner", emoji: "🤖", maxHealth: 6, attack: 3, cucOnSurvive: 1, ability: { description: "All players discard 1 card." }, reward: { description: "All players draw 2 cards." }, flavorText: "A machine with no purpose but suffering.", damageTokens: [] },
  { id: "en_7", pack: 1, name: "Rival Cat", emoji: "😾", maxHealth: 8, attack: 3, cucOnSurvive: 2, ability: { description: "Add 2 🥒 to the location." }, reward: { description: "Active player draws 2 cards." }, flavorText: "The audacity.", damageTokens: [] },
  { id: "en_8", pack: 1, name: "Good Boy", emoji: "🐕", maxHealth: 20, attack: 4, cucOnSurvive: 2, ability: { description: "Add 1 🥒 to the location." }, reward: { description: "Remove 2 🥒. All players gain 1 life." }, flavorText: "The humans think he's harmless. He is not.", isBoss: true, damageTokens: [] },
];

const KITTEN_EYES = { id: "kitten_eyes", name: "Kitten Eyes", count: 7, pack: 1, type: "move", image: "/cards/starters/KittenEyes.png", effect: { attack: 0, pawcoins: 1, special: null }, flavorText: "Resistance is futile." };

const STARTING_DECKS = [
  {
    charId: "char_persian",
    cards: [
      KITTEN_EYES,
      { id: "persian_pedigree", name: "Pedigree", count: 1, pack: 1, type: "item", image: "/cards/starters/persian/Pedigree.png", effect: { attack: 0, pawcoins: 0, special: "choice_pedigree" }, description: "Choose one: Gain 2 🪙; or ALL Heroes gain 1 🪙.", flavorText: "Fourteen generations of excellence." },
      { id: "persian_mirror", name: "Vanity Mirror", count: 1, pack: 1, type: "item", image: "/cards/starters/persian/VanityMirror.png", effect: { attack: 0, pawcoins: 1, special: "moves_to_top_of_deck" }, description: "Gain 1 🪙. You may put Moves you acquire on the top of your deck instead of in your discard pile.", flavorText: "The fairest in the land. Obviously." },
      { id: "persian_slave", name: "Hooman Slave", count: 1, pack: 1, type: "ally", image: "/cards/starters/persian/HoomanSlave.png", effect: { attack: 0, pawcoins: 0, special: "choice_attack_or_heal2" }, description: "Choose: Gain 1 ⚔️ attack token, or heal 2 ♥.", flavorText: "Adequate. For a hooman." },
    ],
  },
  {
    charId: "char_streetcat",
    cards: [
      KITTEN_EYES,
      { id: "sc_tuna", name: "Old Can of Tuna", count: 1, pack: 1, type: "item", image: "/cards/starters/streetcat/OldCanOfTuna.png", effect: { attack: 0, pawcoins: 0, special: "add_attack_or_coin" }, description: "Gain 1 ⚔️ attack token. Defeating an enemy this turn also gains 1 pawcoin.", flavorText: "Still good. Probably." },
      { id: "sc_hide", name: "The Good Hiding Spot", count: 1, pack: 1, type: "item", image: "/cards/starters/streetcat/GoodHidingSpot.png", effect: { attack: 0, pawcoins: 1, special: "passive_protection" }, description: "Gain 1 pawcoin. While in hand: lose max 1 life per event or attack.", flavorText: "Stealth mode activated." },
      { id: "sc_roxy", name: "Roxy", count: 1, pack: 1, type: "ally", image: "/cards/starters/streetcat/Roxy.png", effect: { attack: 0, pawcoins: 0, special: "choice_attack_or_heal2" }, description: "Choose: Gain 1 ⚔️ attack token, or heal 2 ♥.", flavorText: "She stops traffic. Literally." },
    ],
  },
  {
    charId: "char_kitten",
    cards: [
      KITTEN_EYES,
      { id: "kitten_jingly", name: "Jingly Ball", count: 1, type: "item", image: "/cards/starters/kitten/JinglyBall.png", effect: { attack: 0, pawcoins: 1, special: "discard_gain_2_coins" }, description: "Gain 1 🪙. If you discard this, gain 2 🪙.", flavorText: "Pretty and it makes noise!" },
      { id: "kitten_kibble", name: "Kitten Kibble", count: 1, type: "item", image: "/cards/starters/kitten/KittenKibble.png", effect: { attack: 0, pawcoins: 0, special: "choice_attack_or_heal2_any" }, description: "Choose one: Gain 1 ⚔️, or any one hero gains 2 ♥.", flavorText: "With extra nutrients for growing kittens." },
      { id: "kitten_mrbear", name: "Mr. Bear", count: 1, type: "ally", image: "/cards/starters/kitten/MrBear.png", effect: { attack: 0, pawcoins: 0, special: "choice_attack_or_heal2" }, description: "Choose one: Gain 1 ⚔️, or gain 2 ♥.", flavorText: "The best friend anyone could wish for." },
    ],
  },
];

const SHOP_CARDS = [
  // Move
  { id: "card_m01", name: "Knock Down From Shelf", type: "move", cost: 2, pack: 1, copies: 3, effect: { attack: 0, pawcoins: 1, special: "items_to_top_of_deck" }, description: "Gain 1 🪙. You may put Items you acquire on top of your deck instead of your discard pile.", flavorText: "It wasn't an accident." },
  { id: "card_m02", name: "Meow", type: "move", cost: 4, pack: 1, copies: 2, effect: { attack: 0, pawcoins: 0, special: "draw_all" }, description: "ALL heroes draw a card.", flavorText: "Loud. Insistent. Effective." },
  { id: "card_m03", name: "Zoomies", type: "move", cost: 4, pack: 1, copies: 4, effect: { attack: 1, pawcoins: 0, special: "draw_card" }, description: "Gain 1 ⚔️. Draw a card.", flavorText: "No warning. No reason. Full speed." },
  { id: "card_m04", name: "Slow Blink", type: "move", cost: 3, pack: 1, copies: 6, effect: { attack: 0, pawcoins: 0, special: "choice_2coins_or_draw" }, description: "Choose one: Gain 2 🪙, or draw a card.", flavorText: "This means I love you. Now do what I want." },
  { id: "card_m05", name: "Scratch", type: "move", cost: 5, pack: 1, copies: 2, effect: { attack: 2, pawcoins: 0, special: null }, flavorText: "Lightning fast. No regrets." },
  // Item
  { id: "card_i01", name: "Squeeze Treat", type: "item", cost: 2, pack: 1, copies: 4, effect: { attack: 0, pawcoins: 0, special: "heal2_any" }, description: "Any one hero gains 2 ♥.", flavorText: "Straight from the tube." },
  { id: "card_i02", name: "Scratching Post", type: "item", cost: 3, pack: 1, copies: 4, effect: { attack: 1, pawcoins: 0, special: "heal2_self" }, description: "Gain 1 ⚔️ and gain 2 ♥.", flavorText: "Also works on furniture." },
  { id: "card_i03", name: "Cardboard Castle", type: "item", cost: 4, pack: 1, copies: 1, effect: { attack: 0, pawcoins: 2, special: "allies_to_top_of_deck" }, description: "Gain 2 🪙. You may put Allies you acquire on top of your deck instead of your discard pile.", flavorText: "Fits any cat. No questions asked." },
  { id: "card_i04", name: "Toy Mouse", type: "item", cost: 5, pack: 1, copies: 1, effect: { attack: 0, pawcoins: 2, special: "draw_card" }, description: "Gain 2 🪙. Draw a card.", flavorText: "Suspiciously lifelike." },
  // Ally
  { id: "card_a01", name: "Old Lady Next Door", type: "ally", cost: 8, pack: 1, copies: 1, effect: { attack: 0, pawcoins: 0, special: "all_gain_attack_coin_heal_draw" }, description: "ALL heroes gain 1 ⚔️, 1 🪙, 1 ♥ and draw a card.", flavorText: "She gives out treats. Loyalty secured." },
  { id: "card_a02", name: "Sly the Fox", type: "ally", cost: 3, pack: 1, copies: 1, effect: { attack: 1, pawcoins: 0, special: "defeat_enemy_heal2_any" }, description: "Gain 1 ⚔️. If you defeat an enemy, any one hero gains 2 ♥.", flavorText: "He's got a plan. Probably." },
  { id: "card_a03", name: "Herbert the Hedgehog", type: "ally", cost: 4, pack: 1, copies: 1, effect: { attack: 1, pawcoins: 0, special: "heal1_all" }, description: "Gain 1 ⚔️. ALL heroes gain 1 ♥.", flavorText: "Surprisingly sturdy. Surprisingly helpful." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <h2 className="text-xl font-bold text-stone-800 border-b-2 border-amber-400 pb-2 mb-4">{children}</h2>
  );
}

function PackBadge({ pack }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow">
      Pack {pack}
    </span>
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
          {LOCATIONS.map((loc) => (
            <div key={loc.id} className="flex flex-col gap-1.5">
              <LocationBar
                currentLocation={loc}
                lostLocations={[]}
                totalLocations={LOCATIONS.length}
              />
              <div className="flex justify-center">
                <PackBadge pack={loc.pack} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section>
        <SectionHeader>Stupid Hooman Events</SectionHeader>
        <div className="flex flex-wrap gap-3">
          {EVENTS.map((event) => (
            <EventCardDisplay key={event.id} event={event} pack={event.pack} />
          ))}
        </div>
      </section>

      {/* Enemies */}
      <section>
        <SectionHeader>Enemies</SectionHeader>
        <div className="flex flex-wrap gap-4">
          {ENEMIES.map((enemy) => (
            <EnemyCardDisplay key={enemy.id} enemy={enemy} pack={enemy.pack} />
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
                <div key={card.id} className="relative">
                  <CardComponent card={card} showCost={true} isPlayable={true} pack={card.pack} />
                  {card.copies && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-700 text-white text-xs font-bold flex items-center justify-center shadow">
                      ×{card.copies}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
