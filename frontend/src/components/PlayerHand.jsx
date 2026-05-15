import CardComponent from "./CardComponent";
import socket from "../socket";

export default function PlayerHand({ hand, isMyTurn }) {
  const handlePlay = (cardId) => {
    if (!isMyTurn) return;
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
              key={card.id + Math.random()}
              card={card}
              isPlayable={isMyTurn}
              onClick={() => handlePlay(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
