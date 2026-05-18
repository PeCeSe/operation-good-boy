import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import PawCoin from "./PawCoin";
import socket from "../socket";

export default function ShopRow({ shop, shopDeck, paymentZone, isMyTurn, myPlayerId }) {
  const [lastPurchaseVisible, setLastPurchaseVisible] = useState(false);

  useEffect(() => {
    if (paymentZone?.lastPurchase) {
      setLastPurchaseVisible(true);
      const timer = setTimeout(() => setLastPurchaseVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentZone?.lastPurchase?.cardName]);

  const handleBuy = (cardId) => {
    socket.emit("buy_card", { cardId });
  };

  const handleClearPayment = () => {
    socket.emit("clear_payment");
  };

  const tokenCount = paymentZone?.tokens ?? 0;
  const payerId = paymentZone?.playerId;

  return (
    <div>
      {/* Payment zone */}
      <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Payment Zone</div>
          {tokenCount === 0 ? (
            <div className="text-xs text-stone-400 italic">No coins placed</div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex gap-0.5 flex-wrap">
                {Array.from({ length: Math.min(tokenCount, 16) }).map((_, i) => (
                  <PawCoin key={i} className="w-5 h-5" />
                ))}
                {tokenCount > 16 && <span className="text-xs text-amber-700 self-center">+{tokenCount - 16}</span>}
              </div>
              <span className="text-sm font-bold text-amber-700">{tokenCount}</span>
              {payerId && <span className="text-xs text-stone-500">from {payerId}</span>}
            </div>
          )}
          {lastPurchaseVisible && paymentZone?.lastPurchase && (
            <div className="text-xs text-green-600 font-semibold mt-1 animate-pulse">
              Last bought: {paymentZone.lastPurchase.cardName} for {paymentZone.lastPurchase.paid} 🪙
            </div>
          )}
        </div>
        {tokenCount > 0 && (
          <button
            onClick={handleClearPayment}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded px-2 py-1 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Shop header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-stone-600">Shop</h3>
        <span className="text-xs text-stone-400">{shopDeck?.length ?? 0} cards in deck</span>
      </div>

      {/* Shop cards */}
      <div className="flex gap-2 flex-wrap">
        {shop?.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            showCost
            isPlayable={true}
            onClick={() => handleBuy(card.id)}
          />
        ))}
        {(!shop || shop.length === 0) && (
          <p className="text-stone-400 text-sm italic">Shop is empty.</p>
        )}
      </div>
    </div>
  );
}
