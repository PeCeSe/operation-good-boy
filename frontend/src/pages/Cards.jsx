import { useState } from "react";
import { Link } from "react-router-dom";
import CHARACTERS from "../data/characters";
import CardComponent from "../components/CardComponent";
import LocationBar from "../components/LocationBar";
import { EventCardDisplay } from "../components/EventDeck";
import { EnemyCardDisplay } from "../components/EnemyComponent";

// ── Raw game data (mirrored from backend/src/data/) ──────────────────────────

const LOCATIONS = [
  { id: "location_001", name: "The Living Room Sofa", pack: 1, order: 1, maxCucumberTokens: 4, currentCucumberTokens: 0, eventsToDraw: 1, flavorText: "Comfortable. Contested." },
  { id: "location_002", name: "The Sunny Garden", pack: 1, order: 2, maxCucumberTokens: 4, currentCucumberTokens: 0, eventsToDraw: 1, flavorText: "The last patch of warmth worth fighting for." },
];

const EVENTS = [
  { id: "event_001", pack: 1, copies: 3, name: "Bath Time", description: "Active hero loses 2 ❤️.", flavorText: "The indignity." },
  { id: "event_002", pack: 1, copies: 2, name: "The Spray Bottle", description: "Active hero loses 1 ❤️ and discards a card.", flavorText: "Every. Single. Time." },
  { id: "event_003", pack: 1, copies: 3, name: "Cucumber on the Counter", description: "Add 1 🥒 to the location.", flavorText: "Who put that there?!" },
  { id: "event_004", pack: 1, copies: 2, name: "Hoover's On", description: "All heroes lose 1 ❤️ and cannot draw extra cards this turn.", flavorText: "Everyone scatter." },
];

const ENEMIES = [
  { id: "enemy_002", pack: 1, name: "Feral Ferret", emoji: "🐾", maxHealth: 6, attack: 2, cucumberTokensOnSurvive: 1, ability: { description: "Each time a 🥒 token is added to the location, active hero loses 2 ❤️." }, reward: { description: "Remove 1 🥒 from location." }, flavorText: "Unpredictable. Unhinged. Unstoppable.", placedAttacks: {} },
  { id: "enemy_003", pack: 1, name: "Prince Ferdinand", emoji: "👑", maxHealth: 5, attack: 2, cucumberTokensOnSurvive: 1, ability: { description: "Each time a Stupid Hoomans event or enemy causes a hero to discard a card, that hero loses 1 ❤️." }, reward: { description: "ALL heroes draw a card." }, flavorText: "He makes the rules. He also breaks them.", placedAttacks: {} },
  { id: "enemy_004", pack: 1, name: "Darla", emoji: "💅", maxHealth: 6, attack: 2, cucumberTokensOnSurvive: 1, ability: { description: "Active hero loses 1 ❤️." }, reward: { description: "ALL heroes gain 1 🪙 and 1 ❤️." }, flavorText: "She's not sorry.", placedAttacks: {} },
];

const KITTEN_EYES = { id: "kitten_eyes", name: "Kitten Eyes", count: 7, type: "move", image: "/cards/starters/KittenEyes.png", description: "Gain 1 🪙.", flavorText: "Resistance is futile." };

const STARTING_DECKS = [
  {
    charId: "char_persian",
    cards: [
      KITTEN_EYES,
      { id: "persian_pedigree", name: "Pedigree", count: 1, type: "item", image: "/cards/starters/persian/Pedigree.png", description: "Choose one: Gain 2 🪙; or ALL Heroes gain 1 🪙.", flavorText: "Fourteen generations of excellence." },
      { id: "persian_mirror", name: "Vanity Mirror", count: 1, type: "item", image: "/cards/starters/persian/VanityMirror.png", description: "Gain 1 🪙. You may put Moves you acquire on the top of your deck instead of in your discard pile.", flavorText: "The fairest in the land. Obviously." },
      { id: "persian_slave", name: "Hooman Slave", count: 1, type: "ally", image: "/cards/starters/persian/HoomanSlave.png", description: "Choose: Gain 1 ⚔️, or heal 2 ♥.", flavorText: "Adequate. For a hooman." },
    ],
  },
  {
    charId: "char_streetcat",
    cards: [
      KITTEN_EYES,
      { id: "sc_tuna", name: "Old Can of Tuna", count: 1, type: "item", image: "/cards/starters/streetcat/OldCanOfTuna.png", description: "Gain 1 ⚔️. Defeating an enemy this turn also gains 1 🪙.", flavorText: "Still good. Probably." },
      { id: "sc_hide", name: "The Good Hiding Spot", count: 1, type: "item", image: "/cards/starters/streetcat/GoodHidingSpot.png", description: "Gain 1 🪙. While in hand: lose max 1 life per event or attack.", flavorText: "Stealth mode activated." },
      { id: "sc_roxy", name: "Roxy", count: 1, type: "ally", image: "/cards/starters/streetcat/Roxy.png", description: "Choose: Gain 1 ⚔️, or heal 2 ♥.", flavorText: "She stops traffic. Literally." },
    ],
  },
  {
    charId: "char_kitten",
    cards: [
      KITTEN_EYES,
      { id: "kitten_jingly", name: "Jingly Ball", count: 1, type: "item", image: "/cards/starters/kitten/JinglyBall.png", description: "Gain 1 🪙. If you discard this, gain 2 🪙.", flavorText: "Pretty and it makes noise!" },
      { id: "kitten_kibble", name: "Kitten Kibble", count: 1, type: "item", image: "/cards/starters/kitten/KittenKibble.png", description: "Choose one: Gain 1 ⚔️, or any one hero gains 2 ♥.", flavorText: "With extra nutrients for growing kittens." },
      { id: "kitten_mrbear", name: "Mr. Bear", count: 1, type: "ally", image: "/cards/starters/kitten/MrBear.png", description: "Choose one: Gain 1 ⚔️, or gain 2 ♥.", flavorText: "The best friend anyone could wish for." },
    ],
  },
];

const SHOP_CARDS = [
  // Move
  { id: "card_m01", name: "Knock Down From Shelf", type: "move", cost: 2, pack: 1, copies: 3, description: "Gain 1 🪙. You may put Items you acquire on top of your deck instead of your discard pile.", flavorText: "It wasn't an accident." },
  { id: "card_m02", name: "Meow", type: "move", cost: 4, pack: 1, copies: 2, description: "ALL heroes draw a card.", flavorText: "Loud. Insistent. Effective." },
  { id: "card_m03", name: "Zoomies", type: "move", cost: 4, pack: 1, copies: 4, description: "Gain 1 ⚔️. Draw a card.", flavorText: "No warning. No reason. Full speed." },
  { id: "card_m04", name: "Slow Blink", type: "move", cost: 3, pack: 1, copies: 6, description: "Choose one: Gain 2 🪙, or draw a card.", flavorText: "This means I love you. Now do what I want." },
  { id: "card_m05", name: "Scratch", type: "move", cost: 5, pack: 1, copies: 2, description: "Gain 2 ⚔️.", flavorText: "Lightning fast. No regrets." },
  // Item
  { id: "card_i01", name: "Squeeze Treat", type: "item", cost: 2, pack: 1, copies: 4, description: "Any one hero gains 2 ♥.", flavorText: "Straight from the tube." },
  { id: "card_i02", name: "Scratching Post", type: "item", cost: 3, pack: 1, copies: 4, description: "Gain 1 ⚔️ and gain 2 ♥.", flavorText: "Also works on furniture." },
  { id: "card_i03", name: "Cardboard Castle", type: "item", cost: 4, pack: 1, copies: 1, description: "Gain 2 🪙. You may put Allies you acquire on top of your deck instead of your discard pile.", flavorText: "Fits any cat. No questions asked." },
  { id: "card_i04", name: "Toy Mouse", type: "item", cost: 5, pack: 1, copies: 1, description: "Gain 2 🪙. Draw a card.", flavorText: "Suspiciously lifelike." },
  // Ally
  { id: "card_a01", name: "Old Lady Next Door", type: "ally", cost: 8, pack: 1, copies: 1, description: "ALL heroes gain 1 ⚔️, 1 🪙, 1 ♥ and draw a card.", flavorText: "She gives out treats. Loyalty secured." },
  { id: "card_a02", name: "Sly the Fox", type: "ally", cost: 3, pack: 1, copies: 1, description: "Gain 1 ⚔️. If you defeat an enemy, any one hero gains 2 ♥.", flavorText: "He's got a plan. Probably." },
  { id: "card_a03", name: "Herbert the Hedgehog", type: "ally", cost: 4, pack: 1, copies: 1, description: "Gain 1 ⚔️. ALL heroes gain 1 ♥.", flavorText: "Surprisingly sturdy. Surprisingly helpful." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <h2 className="text-xl font-bold text-ink border-b-2 border-gold pb-2 mb-4">{children}</h2>
  );
}

function PackBadge({ pack }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gold text-white shadow">
      Pack {pack}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Cards() {
  const [cucumbers, setCucumbers] = useState(() =>
    Object.fromEntries(LOCATIONS.map((l) => [l.id, 0]))
  );

  const moveCards = SHOP_CARDS.filter((c) => c.type === "move");
  const itemCards = SHOP_CARDS.filter((c) => c.type === "item");
  const allyCards = SHOP_CARDS.filter((c) => c.type === "ally");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink" style={{ letterSpacing: "0.04em" }}>Game Reference</h1>
        <Link to="/" className="text-sm text-ink-500 hover:text-ink-700 transition-colors">← Home</Link>
      </div>

      {/* Locations */}
      <section>
        <SectionHeader>Locations</SectionHeader>
        <div className="flex flex-wrap gap-4">
          {LOCATIONS.map((loc, i) => (
            <div key={loc.id} className="flex flex-col gap-1.5">
              <LocationBar
                currentLocation={{ ...loc, currentCucumbers: cucumbers[loc.id] }}
                lostLocations={LOCATIONS.slice(0, i)}
                totalLocations={LOCATIONS.length}
                onSlotClick={(count) => setCucumbers((prev) => ({ ...prev, [loc.id]: count }))}
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
            <div key={event.id} className="relative">
              <EventCardDisplay event={event} pack={event.pack} />
              {event.copies && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shadow">
                  ×{event.copies}
                </div>
              )}
            </div>
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
                    <span className="font-bold text-sm text-ink">{char?.name}</span>
                    <span className="text-[10px] text-ink-300 uppercase tracking-wide ml-2">{char?.subtitle}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {cards.map((card) => (
                    <div key={card.id} className="relative">
                      <CardComponent card={card} isPlayable={true} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shadow">
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
          { label: "Move", cards: moveCards, color: "text-move" },
          { label: "Item", cards: itemCards, color: "text-item" },
          { label: "Ally", cards: allyCards, color: "text-ally" },
        ].map(({ label, cards, color }) => (
          <div key={label} className="mb-8">
            <h3 className={`font-bold text-sm uppercase tracking-[0.12em] mb-3 ${color}`}>{label}</h3>
            <div className="flex flex-wrap gap-3">
              {cards.map((card) => (
                <div key={card.id} className="relative">
                  <CardComponent card={card} showCost={true} isPlayable={true} pack={card.pack} />
                  {card.copies && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shadow">
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
