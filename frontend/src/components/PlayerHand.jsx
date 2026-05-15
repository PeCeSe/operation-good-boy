import { useState } from "react";
import CardComponent from "./CardComponent";
import socket from "../socket";

export default function PlayerHand({ hand, isMyTurn }) {
  const [playingCardId, setPlayingCardId] = useState(null);

  const handlePlay = (cardId) => {
    if (!isMyTurn || playingCardId) return;
    setPlayingCardId(cardId);
    socket.emit("play_card", { cardId });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 mb-2">
        Your Hand ({hand.length} cards)
      </h3>
      {hand.length === 0 ? (
        <p className="text-slate-600 text-sm italic">No cards in hand.</p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {hand.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              isPlayable={isMyTurn && !playingCardId}
              isPlaying={playingCardId === card.id}
              onClick={() => handlePlay(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
