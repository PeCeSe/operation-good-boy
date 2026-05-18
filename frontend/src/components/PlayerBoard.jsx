import { useState } from "react";
import CHARACTERS from "../data/characters";
import PawCoin from "./PawCoin";
import HealthSlider from "./HealthSlider";
import PileControls from "./PileControls";
import CardComponent from "./CardComponent";
import socket from "../socket";

export default function PlayerBoard({ player, isMe, isCurrentTurn, onSetLives, paymentZone }) {
  const [showCharacter, setShowCharacter] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  if (!player) return null;

  const {
    playerId,
    name,
    character,
    lives,
    isStunned,
    hand,
    drawPile,
    discardPile,
    pawTokens,
    peekCard,
  } = player;

  const maxLives = character?.maxLives ?? 9;
  const charData = CHARACTERS.find((c) => c.id === character?.id);

  const handleSetLives = (newLives) => {
    socket.emit("set_lives", { playerId, lives: newLives });
    onSetLives?.(playerId, newLives);
  };

  const handleGainToken = () => {
    socket.emit("set_paw_tokens", { tokens: (pawTokens ?? 0) + 1 });
  };

  const handleMoveTokenToPayment = () => {
    if ((pawTokens ?? 0) <= 0) return;
    socket.emit("set_paw_tokens", { tokens: (pawTokens ?? 0) - 1 });
    socket.emit("place_payment", { tokens: (paymentZone?.tokens ?? 0) + 1 });
  };

  const handlePlayCard = (cardId) => {
    socket.emit("play_card", { cardId });
    setSelectedCardId(null);
  };

  const handleDiscardCard = (cardId) => {
    socket.emit("discard_card", { cardId });
    setSelectedCardId(null);
  };

  const handleEndTurn = () => {
    socket.emit("end_turn");
  };

  const displayTokens = Math.min(pawTokens ?? 0, 12);
  const extraTokens = (pawTokens ?? 0) - 12;

  return (
    <div className={`rounded-xl border-2 shadow-md overflow-hidden transition-all ${isCurrentTurn ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${isCurrentTurn ? "bg-amber-50" : "bg-stone-50"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {charData?.headshot
            ? <img
                src={isStunned && charData.stunned ? charData.stunned : charData.headshot}
                alt={name}
                className="w-9 h-9 object-contain shrink-0"
              />
            : <span className="text-xl">{character?.emoji}</span>
          }
          <span className="font-bold text-stone-800">{name}</span>
          {isMe && <span className="text-stone-400 text-xs">(you)</span>}
          {isStunned && (
            <span className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
              STUNNED
            </span>
          )}
          {isCurrentTurn && (
            <span className="text-xs text-amber-600 font-semibold animate-pulse">YOUR TURN</span>
          )}
          <button
            onClick={() => setShowCharacter((v) => !v)}
            className="ml-1 text-stone-400 hover:text-stone-600 transition-colors flex items-center"
            title={showCharacter ? "Hide character" : "Show character"}
          >
            <span className="text-xs">{showCharacter ? "▲" : "▼"}</span>
          </button>
        </div>
        <HealthSlider
          lives={lives ?? 0}
          maxLives={maxLives}
          onChange={handleSetLives}
          disabled={false}
        />
      </div>

      {/* Collapsible character section */}
      {showCharacter && (
        <div className={`border-t border-stone-100 ${isCurrentTurn ? "bg-amber-50/60" : "bg-stone-50/60"}`}>
          {charData?.image && (
            <div
              className="relative w-full h-48 overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${charData.bgFrom} 0%, ${charData.bgTo} 100%)` }}
            >
              <img src={charData.image} alt={charData.name} className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}>
                <div className="text-white font-bold text-base leading-tight">{charData.name}</div>
                <div className="text-white/60 text-xs uppercase tracking-wide">{charData.subtitle}</div>
              </div>
            </div>
          )}
          <div className="px-4 py-3 space-y-2">
            {charData?.trait && <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 italic">{charData.trait}</div>}
            {charData?.passive && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-0.5">Passive</div>
                <div className="text-xs text-stone-700 font-semibold">⚡ {charData.passive}</div>
              </div>
            )}
            <div className="text-xs text-stone-400">Max lives: {maxLives}</div>
          </div>
        </div>
      )}

      {/* Resources row */}
      <div className="bg-white border-t border-b border-stone-200 px-4 py-3 flex items-start gap-4 flex-wrap">
        {/* Pawcoin wallet */}
        {isMe ? (
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Pawcoins</div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Gain button */}
              <button
                onClick={handleGainToken}
                className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-white font-bold text-lg flex items-center justify-center transition-colors shadow"
                title="Gain 1 pawcoin"
              >
                +
              </button>
              {/* Individual coins — each click moves 1 to payment zone */}
              <div className="flex flex-wrap gap-1 max-w-xs">
                {Array.from({ length: displayTokens }).map((_, i) => (
                  <button
                    key={i}
                    onClick={handleMoveTokenToPayment}
                    className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                    title="Move 1 coin to payment zone"
                  >
                    <PawCoin className="w-6 h-6" />
                  </button>
                ))}
                {extraTokens > 0 && (
                  <span className="text-xs text-stone-400 self-center">+{extraTokens} more</span>
                )}
              </div>
              <span className="text-sm text-amber-700 font-semibold ml-1">{pawTokens ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <PawCoin className="w-5 h-5" />
            <span className="text-sm text-amber-700 font-semibold">{pawTokens ?? 0}</span>
            <span className="text-xs text-stone-400">pawcoins</span>
          </div>
        )}

        <div className="w-px h-12 bg-stone-200 flex-shrink-0 self-center" />

        {/* Piles */}
        <PileControls
          drawPile={drawPile ?? []}
          discardPile={discardPile ?? []}
          peekCard={peekCard}
          isMe={isMe}
          playerId={playerId}
        />

        {/* End Turn */}
        {isMe && (
          <button
            onClick={handleEndTurn}
            className="ml-auto self-center bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2 rounded-lg transition-colors"
          >
            End Turn →
          </button>
        )}
      </div>

      {/* Hand area */}
      <div className="bg-stone-50 px-4 py-3">
        {isMe ? (
          <>
            <div className="text-[10px] text-stone-400 uppercase tracking-wide font-bold mb-2">
              Hand ({hand?.length ?? 0} cards)
            </div>
            {hand?.length === 0 ? (
              <p className="text-stone-300 text-sm italic">No cards in hand.</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {hand.map((card) => (
                  <div key={card.id} className="flex flex-col items-center gap-1">
                    <div
                      className={`transition-transform ${selectedCardId === card.id ? "-translate-y-3" : ""}`}
                      onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                    >
                      <CardComponent
                        card={card}
                        isPlayable={true}
                        onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                      />
                    </div>
                    {selectedCardId === card.id && (
                      <div className="flex gap-1.5 mt-0.5">
                        <button
                          onClick={() => handlePlayCard(card.id)}
                          className="text-[10px] bg-amber-500 hover:bg-amber-400 text-white font-bold rounded px-2 py-1 transition-colors"
                        >
                          ▶ Play
                        </button>
                        <button
                          onClick={() => handleDiscardCard(card.id)}
                          className="text-[10px] bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded px-2 py-1 transition-colors"
                        >
                          ✕ Discard
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Hand</div>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(hand?.length ?? 0, 8) }).map((_, i) => (
                <div key={i} className="w-8 h-11 bg-amber-800 border-2 border-amber-900 rounded flex items-center justify-center text-amber-600 text-xs">
                  🐾
                </div>
              ))}
              {(hand?.length ?? 0) > 8 && (
                <span className="text-xs text-stone-400 self-center">+{hand.length - 8}</span>
              )}
            </div>
            <span className="text-xs text-stone-400">{hand?.length ?? 0} cards</span>
          </div>
        )}
      </div>
    </div>
  );
}
