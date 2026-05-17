import { useState } from "react";
import PawCoin from "./PawCoin";

const TYPE_CONFIG = {
  move:  { border: "border-green-800",  bg: "bg-green-100",  emoji: "🐾" },
  item:  { border: "border-amber-900",  bg: "bg-amber-100",  emoji: "📦" },
  ally:  { border: "border-indigo-900", bg: "bg-indigo-100", emoji: "🤝" },
};

function MiniCard({ card, selected, onClick, dragging, onDragStart, onDragEnd }) {
  const cfg = TYPE_CONFIG[card.type] || { border: "border-stone-400", bg: "bg-stone-100", emoji: "❓" };
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        relative w-24 flex-shrink-0 rounded-xl border-2 overflow-hidden shadow cursor-grab active:cursor-grabbing select-none
        transition-all duration-150
        ${cfg.border}
        ${selected ? "ring-4 ring-red-400 scale-95 opacity-60" : "hover:scale-105 hover:shadow-lg bg-amber-50"}
        ${dragging ? "opacity-30" : ""}
      `}
    >
      <div className="px-2 pt-2 pb-1">
        <div className="font-bold text-[10px] leading-tight text-stone-800 truncate">{card.name}</div>
      </div>
      <div className={`mx-1 rounded-md h-14 flex items-center justify-center text-3xl ${cfg.bg}`}>
        {cfg.emoji}
      </div>
      <div className="px-2 py-1.5 text-[9px] text-stone-500 leading-tight line-clamp-2">
        {card.effect?.pawcoins > 0 && <>+{card.effect.pawcoins}<PawCoin className="inline w-3 h-3 align-middle" /> </>}
        {card.effect?.attack > 0 && `+${card.effect.attack} ${card.effect.attackType} `}
        {card.effect?.special === "draw_card" && "Draw 1"}
        {card.effect?.special === "heal" && "Heal 1"}
      </div>
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🗑️</span>
        </div>
      )}
    </div>
  );
}

export default function DiscardOverlay({ myEntry, myHand, pendingDiscardList, players, onConfirm }) {
  const [selected, setSelected] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dropHover, setDropHover] = useState(false);

  const required = myEntry?.count ?? 0;

  const toggleSelect = (cardId) => {
    setSelected((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : prev.length < required
        ? [...prev, cardId]
        : prev
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;
    setSelected((prev) =>
      prev.includes(cardId) ? prev : prev.length < required ? [...prev, cardId] : prev
    );
    setDropHover(false);
    setDraggingId(null);
  };

  const removeFromDiscard = (cardId) => setSelected((prev) => prev.filter((id) => id !== cardId));

  const waitingFor = pendingDiscardList?.map((d) => {
    const p = players.find((pl) => pl.playerId === d.playerId);
    return p?.name;
  }).filter(Boolean);

  if (!myEntry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center anim-slide-up">
          <div className="text-4xl mb-3">🗑️</div>
          <div className="font-bold text-stone-800 text-lg mb-2">Discarding cards…</div>
          <div className="text-sm text-stone-500">
            Waiting for {waitingFor?.join(", ")} to discard.
          </div>
        </div>
      </div>
    );
  }

  const discardedCards = selected.map((id) => myHand.find((c) => c.id === id)).filter(Boolean);
  const remainingCards = myHand.filter((c) => !selected.includes(c.id));
  const ready = selected.length === required;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm px-4 gap-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden anim-slide-up">
        <div className="bg-red-600 px-5 py-4 text-center">
          <div className="text-[9px] font-bold tracking-widest text-red-200 uppercase mb-1">Discard</div>
          <div className="text-white font-bold text-xl">
            Choose {required} card{required !== 1 ? "s" : ""} to discard
          </div>
        </div>

        {/* Hand */}
        <div className="px-4 pt-4 pb-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Your hand — click or drag to discard zone
          </div>
          {remainingCards.length === 0 ? (
            <div className="text-sm text-stone-400 italic py-2">No cards left in hand.</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {remainingCards.map((card) => (
                <MiniCard
                  key={card.id}
                  card={card}
                  selected={false}
                  dragging={draggingId === card.id}
                  onClick={() => toggleSelect(card.id)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("cardId", card.id);
                    setDraggingId(card.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div
          className={`mx-4 mb-4 rounded-xl border-2 border-dashed min-h-[7rem] flex flex-col items-center justify-center gap-2 transition-colors ${
            dropHover ? "border-red-400 bg-red-50" : "border-stone-300 bg-stone-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDropHover(true); }}
          onDragLeave={() => setDropHover(false)}
          onDrop={handleDrop}
        >
          {discardedCards.length === 0 ? (
            <div className="text-stone-400 text-sm text-center px-4">
              <div className="text-2xl mb-1">🗑️</div>
              Drop cards here to discard
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap justify-center p-3">
              {discardedCards.map((card) => (
                <MiniCard
                  key={card.id}
                  card={card}
                  selected
                  onClick={() => removeFromDiscard(card.id)}
                  onDragStart={(e) => e.preventDefault()}
                  onDragEnd={() => {}}
                />
              ))}
            </div>
          )}
          <div className="text-xs text-stone-400">
            {selected.length} / {required} selected
          </div>
        </div>

        {/* Confirm */}
        <div className="px-4 pb-4">
          <button
            onClick={() => ready && onConfirm(selected)}
            disabled={!ready}
            className={`w-full font-bold py-3 rounded-xl text-sm transition-colors ${
              ready
                ? "bg-red-500 hover:bg-red-400 text-white shadow-lg"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            {ready ? `Discard ${required} card${required !== 1 ? "s" : ""} →` : `Select ${required - selected.length} more`}
          </button>
        </div>
      </div>
    </div>
  );
}
