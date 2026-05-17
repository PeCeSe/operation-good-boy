import { Link } from "react-router-dom";
import CHARACTERS from "../data/characters";

// ── Raw game data (mirrored from backend/src/data/) ──────────────────────────

const LOCATIONS = [
  { name: "The Garden", maxCucumbers: 8, eventsToDraw: 1, flavorText: "Good Boy's territory. Allegedly." },
  { name: "The Street Corner", maxCucumbers: 8, eventsToDraw: 2, flavorText: "Neutral ground. For now." },
  { name: "The Sunny Windowsill", maxCucumbers: 8, eventsToDraw: 3, flavorText: "The last good spot." },
];

const EVENTS = [
  { name: "The Postman Rang the Doorbell", effect: { cucumberTokens: 1 }, flavorText: "Chaos. Pure chaos." },
  { name: "The Vacuum Cleaner Turned On", effect: { damageAll: 1 }, flavorText: "Everyone scatter." },
  { name: "Bath Time", effect: { discardCards: 1 }, flavorText: "The indignity." },
  { name: "Vet Appointment", effect: { damageAll: 2 }, flavorText: "They said it wouldn't hurt." },
  { name: "Kids Are Visiting", effect: { cucumberTokens: 1, discardCards: 2 }, flavorText: "They just grab. No warning." },
  { name: "It's Raining", effect: { blockShop: true }, flavorText: "We're all stuck inside. Shop's closed." },
  { name: "Dog Walk Past The Window", effect: { cucumberTokens: 2 }, flavorText: "He looked right at us." },
  { name: "Monday Morning", effect: { damageAll: 1, pawcoinPenalty: 1 }, flavorText: "Nobody wanted this." },
];

// Good Boy last (he's always the final boss)
const ENEMIES = [
  { name: "Angry Postman", emoji: "📬", hp: 6, attack: 2, weakTo: ["charm"], resistantTo: ["scratch"], cucOnSurvive: 1, ability: "Active player discards 1 card.", reward: "Remove 1 🥒.", flavorText: "He takes this very personally." },
  { name: "Neighbour's Baby", emoji: "👶", hp: 4, attack: 1, weakTo: ["charm"], resistantTo: ["ignore"], cucOnSurvive: 1, ability: "All players lose 1 life.", reward: "All players gain 1 life.", flavorText: "It just screams. Constantly." },
  { name: "Squirrel Gang", emoji: "🐿️", hp: 8, attack: 2, weakTo: ["scratch"], resistantTo: ["ignore"], cucOnSurvive: 1, ability: "Add 1 🥒 to the location.", reward: "All players draw 1 card.", flavorText: "There are more of them every time." },
  { name: "Sprinkler System", emoji: "💦", hp: 5, attack: 2, weakTo: ["bite"], resistantTo: ["charm"], cucOnSurvive: 1, ability: "Active player loses 1 life.", reward: "Remove 1 🥒.", flavorText: "It has no feelings. It cannot be reasoned with." },
  { name: "Grumpy Old Man", emoji: "👴", hp: 7, attack: 2, weakTo: ["ignore"], resistantTo: ["charm"], cucOnSurvive: 1, ability: "Active player loses 2 lives.", reward: "All players gain 1 life. Remove 1 🥒.", flavorText: "Get off his lawn." },
  { name: "Vacuum Cleaner", emoji: "🤖", hp: 6, attack: 3, weakTo: ["bite"], resistantTo: ["scratch"], cucOnSurvive: 1, ability: "All players discard 1 card.", reward: "All players draw 2 cards.", flavorText: "A machine with no purpose but suffering." },
  { name: "Rival Cat", emoji: "😾", hp: 8, attack: 3, weakTo: ["ignore"], resistantTo: ["charm"], cucOnSurvive: 2, ability: "Add 2 🥒 to the location.", reward: "Active player draws 2 cards.", flavorText: "The audacity." },
  { name: "Good Boy", emoji: "🐕", hp: 20, attack: 4, weakTo: ["ignore"], resistantTo: ["charm"], cucOnSurvive: 2, ability: "Add 1 🥒 to the location.", reward: "Remove 2 🥒. All players gain 1 life.", flavorText: "The humans think he's harmless. He is not.", isBoss: true },
];

const STARTING_DECKS = [
  {
    charId: "char_persian",
    cards: [
      { name: "Delicate Swipe", count: 7, type: "move", effect: "+1 scratch" },
      { name: "Premium Kibble", count: 3, type: "item", effect: "+1 🪙" },
    ],
  },
  {
    charId: "char_streetcat",
    cards: [
      { name: "Street Claw", count: 7, type: "move", effect: "+1 scratch" },
      { name: "Scavenged Kibble", count: 3, type: "item", effect: "+1 🪙" },
    ],
  },
  {
    charId: "char_kitten",
    cards: [
      { name: "Tiny Swipe", count: 7, type: "move", effect: "+1 scratch" },
      { name: "Kibble", count: 3, type: "item", effect: "+1 🪙" },
    ],
  },
];

const SHOP_CARDS = [
  // Move
  { name: "Zoomies", type: "move", cost: 3, effect: "+2 scratch", flavorText: "No warning. No reason. Full speed." },
  { name: "Dead Cat Flop", type: "move", cost: 4, effect: "+3 ignore", flavorText: "The perfect guilt trip." },
  { name: "Slow Blink", type: "move", cost: 3, effect: "+2 charm", flavorText: "This means I love you. Now do what I want." },
  { name: "Pounce", type: "move", cost: 3, effect: "+1 scratch, +1 bite", flavorText: "Maximum commitment." },
  { name: "Hiss", type: "move", cost: 2, effect: "+2 ignore", flavorText: "Don't touch me. I mean it." },
  { name: "Swipe", type: "move", cost: 4, effect: "+3 scratch", flavorText: "Lightning fast. No regrets." },
  { name: "Belly Trap", type: "move", cost: 3, effect: "+2 bite", flavorText: "You were warned." },
  { name: "Kneading Therapy", type: "move", cost: 4, effect: "Heal all players", flavorText: "Technically helping." },
  // Item
  { name: "Scratching Post", type: "item", cost: 4, effect: "+2 scratch, +1 🪙", flavorText: "Also works on furniture." },
  { name: "Lure Wand", type: "item", cost: 3, effect: "+3 charm", flavorText: "They never see it coming." },
  { name: "Cardboard Box", type: "item", cost: 2, effect: "Draw 1 card", flavorText: "Fits any cat. No questions asked." },
  { name: "Catnip", type: "item", cost: 2, effect: "+3 🪙", flavorText: "For focus. Definitely for focus." },
  { name: "Hairball", type: "item", cost: 3, effect: "+2 bite", flavorText: "A biological weapon." },
  { name: "Laser Pointer", type: "item", cost: 2, effect: "+1 scratch, +1 charm", flavorText: "Distracting for everyone involved." },
  { name: "Yarn Ball", type: "item", cost: 3, effect: "+1 scratch, +2 🪙", flavorText: "Multi-purpose." },
  // Ally
  { name: "Friendly Pigeon", type: "ally", cost: 3, effect: "+2 🪙", flavorText: "Surprisingly cooperative for a bird." },
  { name: "Old Lady Next Door", type: "ally", cost: 5, effect: "+4 charm", flavorText: "She gives out treats. Loyalty secured." },
  { name: "Stray Kitten", type: "ally", cost: 3, effect: "+1 scratch, Draw 1 card", flavorText: "Chaotic. Enthusiastic. Present." },
  { name: "Garden Snail", type: "ally", cost: 2, effect: "+2 ignore", flavorText: "Slow. Passive-aggressive. Effective." },
  { name: "Neighborhood Mouse", type: "ally", cost: 4, effect: "+3 bite", flavorText: "Tiny. Furious. Inexplicable." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  move: "bg-blue-100 text-blue-700",
  item: "bg-purple-100 text-purple-700",
  ally: "bg-green-100 text-green-700",
};

function formatEventEffect(e) {
  const parts = [];
  if (e.cucumberTokens > 0) parts.push(`+${e.cucumberTokens} 🥒`);
  if (e.damageAll > 0) parts.push(`All lose ${e.damageAll} life`);
  if (e.discardCards > 0) parts.push(`Discard ${e.discardCards} card${e.discardCards > 1 ? "s" : ""}`);
  if (e.blockShop) parts.push("Shop blocked");
  if (e.pawcoinPenalty > 0) parts.push(`-${e.pawcoinPenalty} 🪙`);
  return parts.join(" · ") || "No effect";
}

function SectionHeader({ children }) {
  return (
    <h2 className="text-xl font-bold text-stone-800 border-b-2 border-amber-400 pb-2 mb-4">{children}</h2>
  );
}

function Pill({ children, className }) {
  return <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${className}`}>{children}</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Cards() {
  const moveCards = SHOP_CARDS.filter((c) => c.type === "move");
  const itemCards = SHOP_CARDS.filter((c) => c.type === "item");
  const allyCards = SHOP_CARDS.filter((c) => c.type === "ally");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-600">Game Reference</h1>
        <Link to="/" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">← Home</Link>
      </div>

      {/* Locations */}
      <section>
        <SectionHeader>Locations</SectionHeader>
        <div className="flex flex-col gap-3">
          {LOCATIONS.map((loc, i) => (
            <div key={loc.name} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
              <div className="text-2xl shrink-0">{["🌿", "🏙️", "🪟"][i]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-stone-800">{loc.name}</div>
                <div className="text-xs text-stone-500 mt-0.5 italic">{loc.flavorText}</div>
              </div>
              <div className="shrink-0 text-right space-y-1">
                <div className="text-sm font-semibold text-stone-700">🥒 max {loc.maxCucumbers}</div>
                <div className="text-xs text-stone-500">{loc.eventsToDraw} event{loc.eventsToDraw > 1 ? "s" : ""} per turn</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section>
        <SectionHeader>Stupid Hooman Events</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EVENTS.map((ev) => (
            <div key={ev.name} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <div className="font-semibold text-stone-800 text-sm">{ev.name}</div>
              <div className="text-xs font-bold text-red-600">{formatEventEffect(ev.effect)}</div>
              <div className="text-[11px] text-stone-400 italic mt-auto">{ev.flavorText}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Enemies */}
      <section>
        <SectionHeader>Enemies</SectionHeader>
        <div className="flex flex-col gap-3">
          {ENEMIES.map((enemy) => (
            <div
              key={enemy.name}
              className={`bg-white border rounded-xl p-4 shadow-sm ${enemy.isBoss ? "border-amber-400 ring-1 ring-amber-200" : "border-stone-200"}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{enemy.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-800">{enemy.name}</span>
                    {enemy.isBoss && <Pill className="bg-amber-100 text-amber-700">Final Boss</Pill>}
                  </div>
                  <div className="text-[11px] text-stone-400 italic mt-0.5">{enemy.flavorText}</div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-stone-600">
                    <div><span className="font-semibold">HP:</span> {enemy.hp}</div>
                    <div><span className="font-semibold">Survives:</span> +{enemy.cucOnSurvive} 🥒</div>
                    <div><span className="font-semibold text-green-600">Weak:</span> {enemy.weakTo.join(", ")}</div>
                    <div><span className="font-semibold text-red-500">Resist:</span> {enemy.resistantTo.join(", ")}</div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="text-stone-600"><span className="font-semibold text-red-500">Ability:</span> {enemy.ability}</div>
                    <div className="text-stone-600"><span className="font-semibold text-green-600">Defeat reward:</span> {enemy.reward}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Starting decks */}
      <section>
        <SectionHeader>Starting Decks</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STARTING_DECKS.map(({ charId, cards }) => {
            const char = CHARACTERS.find((c) => c.id === charId);
            return (
              <div key={charId} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 p-3 bg-stone-50 border-b border-stone-200">
                  {char?.headshot && (
                    <img src={char.headshot} alt={char.name} className="w-10 h-10 object-contain shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-sm text-stone-800">{char?.name}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide">{char?.subtitle}</div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {cards.map((card) => (
                    <div key={card.name} className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-stone-700">{card.count}× {card.name}</div>
                        <div className="text-[10px] text-stone-500">{card.effect}</div>
                      </div>
                      <Pill className={TYPE_COLORS[card.type]}>{card.type}</Pill>
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
          { label: "Move", cards: moveCards, color: "text-blue-600" },
          { label: "Item", cards: itemCards, color: "text-purple-600" },
          { label: "Ally", cards: allyCards, color: "text-green-600" },
        ].map(({ label, cards, color }) => (
          <div key={label} className="mb-6">
            <h3 className={`font-bold text-sm uppercase tracking-widest mb-3 ${color}`}>{label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cards.map((card) => (
                <div key={card.name} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex gap-3">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-600 text-sm">
                      {card.cost}🪙
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-stone-800 text-sm">{card.name}</span>
                      <Pill className={TYPE_COLORS[card.type]}>{card.type}</Pill>
                    </div>
                    <div className="text-xs font-semibold text-amber-700">{card.effect}</div>
                    <div className="text-[11px] text-stone-400 italic mt-1">{card.flavorText}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
