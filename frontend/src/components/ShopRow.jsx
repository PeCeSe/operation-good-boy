import CardComponent from "./CardComponent";
import socket from "../socket";

export default function ShopRow({ shop, currentPawcoins, isMyTurn, blockShop }) {
  const handleBuy = (cardId) => {
    if (!isMyTurn || blockShop) return;
    socket.emit("buy_card", { cardId });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 mb-2">
        Shop {blockShop && <span className="text-red-400 font-normal">(closed this round)</span>}
      </h3>
      <div className="flex gap-2 flex-wrap">
        {shop.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            showCost
            isPlayable={isMyTurn && !blockShop && currentPawcoins >= card.cost}
            onClick={() => handleBuy(card.id)}
          />
        ))}
        {shop.length === 0 && (
          <p className="text-slate-600 text-sm italic">Shop is empty.</p>
        )}
      </div>
    </div>
  );
}
