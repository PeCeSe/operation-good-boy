import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CHARACTERS from "../data/characters";
import CardComponent from "../components/CardComponent";
import LocationBar from "../components/LocationBar";
import { EventCardDisplay } from "../components/EventDeck";
import { EnemyCardDisplay } from "../components/EnemyComponent";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

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

function CardBack() {
  return (
    <div
      className="rounded-xl border-2 border-brown bg-brown-deep flex items-center justify-center select-none flex-shrink-0"
      style={{ width: 176, height: 258 }}
    >
      <span className="text-5xl opacity-30">🐾</span>
    </div>
  );
}

function EventCardBack() {
  return (
    <div
      className="relative rounded-lg border-2 border-plum overflow-hidden flex-shrink-0"
      style={{ width: 213, height: 213 }}
    >
      <img src="/cards/event_back.png" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-28 h-28 rounded-full" style={{ background: "rgba(180, 150, 210, 0.6)" }} />
        <div className="relative w-24 h-24 flex items-center justify-center">
          <img src="/cards/event_icon.png" className="w-full h-full object-contain" />
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "rgba(130, 106, 150, 0.55)", mixBlendMode: "color" }} />
        </div>
      </div>
    </div>
  );
}


export default function Cards() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [cucumbers, setCucumbers] = useState({});

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/gamedata`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setCucumbers(Object.fromEntries(d.locations.map((l) => [l.id, 0])));
      })
      .catch(() => setError("Could not load game data from backend."));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-sm">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-ink-300 text-sm">Loading…</div>
    );
  }

  const { cards, characters, startingCards, enemies, events, locations } = data;

  const moveCards = cards.filter((c) => c.type === "move");
  const itemCards = cards.filter((c) => c.type === "item");
  const allyCards = cards.filter((c) => c.type === "ally");

  // Build starting decks: one entry per character, deduped cards with count
  const startingDecks = characters.map((char) => {
    const counts = {};
    char.startingDeck.forEach((key) => {
      counts[key] = (counts[key] || 0) + 1;
    });
    const uniqueCards = Object.entries(counts).map(([key, count]) => ({
      ...startingCards[key],
      count,
    }));
    return { char, cards: uniqueCards };
  });

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
          {locations.map((loc, i) => (
            <div key={loc.id} className="flex flex-col gap-1.5">
              <LocationBar
                currentLocation={{ ...loc, currentCucumbers: cucumbers[loc.id] ?? 0 }}
                lostLocations={locations.slice(0, i)}
                totalLocations={locations.length}
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
          <div className="flex flex-col gap-1.5">
            <EventCardBack />
            <div className="flex justify-center"><span className="text-[9px] text-ink-300 italic">card back</span></div>
          </div>
          {events.map((event) => (
            <div key={event.id} className="relative flex flex-col gap-1.5">
              <div className="relative">
                <EventCardDisplay event={event} />
                {event.copies && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shadow">
                    ×{event.copies}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <PackBadge pack={event.pack} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enemies */}
      <section>
        <SectionHeader>Enemies</SectionHeader>
        <div className="flex flex-wrap gap-4">
          {enemies.map((enemy) => (
            <div key={enemy.id} className="flex flex-col gap-1.5">
              <EnemyCardDisplay enemy={enemy} />
              <div className="flex justify-center">
                <PackBadge pack={enemy.pack} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Starting decks */}
      <section>
        <SectionHeader>Starting Decks</SectionHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1.5">
              <CardBack />
              <div className="flex justify-center"><span className="text-[9px] text-ink-300 italic">card back</span></div>
            </div>
          </div>
          {startingDecks.map(({ char, cards: deckCards }) => {
            const frontendChar = CHARACTERS.find((c) => c.id === char.id);
            return (
              <div key={char.id}>
                <div className="flex items-center gap-3 mb-3">
                  {frontendChar?.headshot && (
                    <img src={frontendChar.headshot} alt={char.name} className="w-8 h-8 object-contain" />
                  )}
                  <div>
                    <span className="font-bold text-sm text-ink">{frontendChar?.name ?? char.name}</span>
                    <span className="text-[10px] text-ink-300 uppercase tracking-wide ml-2">{frontendChar?.subtitle}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {deckCards.map((card) => (
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
        ].map(({ label, cards: typeCards, color }) => (
          <div key={label} className="mb-8">
            <h3 className={`font-bold text-sm uppercase tracking-[0.12em] mb-3 ${color}`}>{label}</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1.5">
                <CardBack />
                <div className="flex justify-center"><span className="text-[9px] text-ink-300 italic">card back</span></div>
              </div>
              {typeCards.map((card) => (
                <div key={card.id} className="flex flex-col gap-1.5">
                  <div className="relative">
                    <CardComponent card={card} showCost={true} isPlayable={true} />
                    {card.copies && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center shadow">
                        ×{card.copies}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <PackBadge pack={card.pack} />
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
