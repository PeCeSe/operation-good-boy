import { useState } from "react";
import CardComponent from "./CardComponent";
import socket from "../socket";

function CardBack() {
  return (
    <div className="w-10 h-14 bg-sepia-deep border-2 border-brown-deep rounded-lg flex items-center justify-center text-sepia-soft text-lg select-none">
      🐾
    </div>
  );
}

export default function PileControls({ drawPile, discardPile, peekCard, isMe, playerId }) {
  const [showBrowse, setShowBrowse] = useState(false);
  const [showPeek, setShowPeek] = useState(false);

  const drawCount = drawPile?.length ?? 0;
  const discardCount = discardPile?.length ?? 0;
  const topDiscard = discardPile?.[discardPile.length - 1] ?? null;

  const handleDraw = () => socket.emit("draw_card");
  const handlePeek = () => {
    socket.emit("peek_draw_top");
    setShowPeek(true);
  };
  const handleShuffle = () => socket.emit("shuffle_discard");

  const handlePeekToHand = () => {
    socket.emit("peek_to_hand");
    setShowPeek(false);
  };
  const handlePeekToTop = () => {
    socket.emit("peek_to_top");
    setShowPeek(false);
  };
  const handlePeekToDiscard = () => {
    socket.emit("peek_to_discard");
    setShowPeek(false);
  };

  const handleRetrieve = (cardId) => {
    socket.emit("retrieve_from_discard", { cardId });
    setShowBrowse(false);
  };

  return (
    <div className="flex items-end gap-3">
      {/* Draw pile */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <CardBack />
          <span className="absolute -top-1.5 -right-1.5 bg-ink text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {drawCount}
          </span>
        </div>
        <span className="text-[10px] text-ink-500 uppercase tracking-wide">Draw</span>
        {isMe && (
          <div className="flex flex-col gap-1">
            <button
              onClick={handleDraw}
              disabled={drawCount === 0}
              className="text-[10px] bg-gold-soft hover:bg-gold/20 border border-gold text-gold-deep rounded px-2 py-0.5 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              Draw
            </button>
            <button
              onClick={handlePeek}
              disabled={!!peekCard || drawCount === 0}
              className="text-[10px] bg-paper-200 hover:bg-paper-300 border border-ink-border text-ink-700 rounded px-2 py-0.5 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              Peek
            </button>
            {drawCount === 0 && discardCount > 0 && (
              <button
                onClick={handleShuffle}
                className="text-[10px] bg-ally-lighter hover:bg-ally-soft border border-ally text-ally-deep rounded px-2 py-0.5 transition-colors"
              >
                Shuffle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Discard pile */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {topDiscard ? (
            <div className="w-10 h-14 rounded-lg border-2 border-ink-border bg-paper-200 flex items-center justify-center text-lg overflow-hidden">
              {topDiscard.type === "move" && <span className="text-move">🐾</span>}
              {topDiscard.type === "item" && <span className="text-item">📦</span>}
              {topDiscard.type === "ally" && <span className="text-ally">🤝</span>}
              {!["move", "item", "ally"].includes(topDiscard.type) && <span>❓</span>}
            </div>
          ) : (
            <div className="w-10 h-14 rounded-lg border-2 border-dashed border-ink-border bg-paper-50" />
          )}
          {discardCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-ink-700 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {discardCount}
            </span>
          )}
        </div>
        <span className="text-[10px] text-ink-500 uppercase tracking-wide">Discard</span>
        {isMe && discardCount > 0 && (
          <button
            onClick={() => setShowBrowse(true)}
            className="text-[10px] bg-paper-200 hover:bg-paper-300 border border-ink-border text-ink-700 rounded px-2 py-0.5 transition-colors"
          >
            Browse
          </button>
        )}
      </div>

      {/* Peek modal */}
      {isMe && peekCard && (showPeek || true) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60" onClick={() => setShowPeek(false)}>
          <div
            className="bg-paper-50 rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3 border-2 border-ink-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-bold text-ink-700 mb-1">Peeked card</div>
            <CardComponent card={peekCard} isPlayable={false} />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handlePeekToHand}
                className="bg-moss hover:bg-moss-deep text-white font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Take to hand
              </button>
              <button
                onClick={handlePeekToTop}
                className="bg-paper-200 hover:bg-paper-300 text-ink-700 font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Return to top
              </button>
              <button
                onClick={handlePeekToDiscard}
                className="bg-red-soft hover:bg-red/20 text-red-deep font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Send to discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse discard modal */}
      {showBrowse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60" onClick={() => setShowBrowse(false)}>
          <div
            className="bg-paper-50 rounded-xl p-4 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border-2 border-ink-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-ink-700">Discard Pile ({discardCount} cards)</div>
              <button onClick={() => setShowBrowse(false)} className="text-ink-300 hover:text-ink-700 text-lg leading-none">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {discardCount === 0 ? (
                <p className="text-ink-300 text-sm italic">Discard pile is empty.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discardPile.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      isPlayable={true}
                      onClick={() => handleRetrieve(card.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] text-ink-300 mt-2 text-center">Click a card to retrieve it to hand</div>
          </div>
        </div>
      )}
    </div>
  );
}
