import CardComponent from "./CardComponent";
import socket from "../socket";

export default function ShopRow({ shop, currentPawcoins, isMyTurn, blockShop }) {
  const handleBuy = (cardId) => {
    if (!isMyTurn || blockShop) return;
    socket.emit("buy_card", { cardId });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-600 mb-2">
        Shop {blockShop && <span className="text-red-500 font-normal">(closed this round)</span>}
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
          <p className="text-stone-400 text-sm italic">Shop is empty.</p>
        )}
      </div>
    </div>
  );
}
