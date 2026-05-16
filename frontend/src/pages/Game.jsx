import React from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import CardComponent from "../components/CardComponent";
import EnemyComponent from "../components/EnemyComponent";
import PlayerBoard from "../components/PlayerBoard";
import ShopRow from "../components/ShopRow";
import LocationBar from "../components/LocationBar";
import EventDisplay from "../components/EventDisplay";
import GameLog from "../components/GameLog";
import PhaseOverlay from "../components/PhaseOverlay";

function Lives({ lives, max }) {
  return (
    <span className="text-red-400 font-mono text-sm">
      {"♥".repeat(Math.max(0, lives))}
      {"♡".repeat(Math.max(0, max - lives))}
    </span>
  );
}

function PlayerPanel({ player, isCurrentTurn, isMe }) {
  const attackEntries = Object.entries(player.currentAttack).filter(([, v]) => v > 0);

  return (
    <div
      className={`rounded-lg p-3 border-2 transition-all ${
        isCurrentTurn ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{player.character.emoji}</span>
        <span className="font-semibold text-sm">
          {player.name} {isMe && <span className="text-stone-400 text-xs">(you)</span>}
        </span>
        {player.isStunned && <span className="text-xs text-red-400 font-bold">STUNNED</span>}
      </div>
      <Lives lives={player.lives} max={player.character.maxLives} />
      {isCurrentTurn && (
        <div className="text-xs mt-1 space-y-0.5">
          <div className="text-amber-600">🪙 {player.currentPawcoins} pawcoins</div>
          {attackEntries.map(([type, amount]) => (
            <div key={type} className="text-stone-700">
              {type}: {amount}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Game({ gameState, mySocketId }) {
  const navigate = useNavigate();
  const [draggingAttackType, setDraggingAttackType] = React.useState(null);
  const {
    turn,
    players,
    enemies,
    currentLocation,
    lostLocations,
    currentEvents,
    shop,
    shopDeck,
    blockShop,
    pendingPhase,
    log,
    phase,
  } = gameState;

  const me = players.find((p) => p.socketId === mySocketId);
  const isMyTurn = me && turn.currentPlayerId === me.playerId;

  const availableAttackTypes = me
    ? Object.entries(me.currentAttack).filter(([, v]) => v > 0)
    : [];

  const handleAttack = (enemyId, attackType) => {
    socket.emit("attack_enemy", { enemyId, attackType });
  };

  const handleEndTurn = () => {
    socket.emit("end_turn");
  };

  const handleAdvancePhase = () => {
    socket.emit("advance_phase");
  };

  if (phase === "victory") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-bold text-amber-600">Victory!</h1>
        <p className="text-stone-500">Good Boy has been defeated. The neighborhood is safe.</p>
        <p className="text-stone-400 text-sm italic">For now.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (phase === "defeat") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">🥒</div>
        <h1 className="text-4xl font-bold text-red-400">Defeat</h1>
        <p className="text-stone-500">The neighborhood is overrun with cucumbers.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-stone-300 hover:bg-stone-400 font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-amber-600">Operation: Good Boy</span>
          <span className="text-stone-400 text-sm">Round {turn.roundNumber}</span>
        </div>
        <div className="text-sm text-stone-500">
          {isMyTurn ? (
            <span className="text-amber-600 font-semibold animate-pulse">Your turn!</span>
          ) : (
            <span>
              {players.find((p) => p.playerId === turn.currentPlayerId)?.name}'s turn
            </span>
          )}
        </div>
      </div>

      {/* Location + Events */}
      <div className="flex gap-3 items-start">
        <LocationBar currentLocation={currentLocation} lostLocations={lostLocations} totalLocations={3} />
        <EventDisplay events={currentEvents} />
      </div>

      {/* Enemies */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 mb-2">
          Enemies ({enemies.length} active)
        </h2>
        {enemies.length === 0 ? (
          <p className="text-stone-400 text-sm italic">No enemies on the board. 🎉</p>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {enemies.map((enemy) => (
              <EnemyComponent
                key={enemy.id}
                enemy={enemy}
                onAttack={handleAttack}
                availableAttackTypes={availableAttackTypes}
                isMyTurn={isMyTurn}
                draggingAttackType={draggingAttackType}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other players panel */}
      {players.filter((p) => p.socketId !== mySocketId).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {players
            .filter((p) => p.socketId !== mySocketId)
            .map((p) => (
              <PlayerPanel
                key={p.playerId}
                player={p}
                isCurrentTurn={p.playerId === turn.currentPlayerId}
                isMe={false}
              />
            ))}
        </div>
      )}

      {/* My player board */}
      {me && (
        <PlayerBoard
          player={me}
          isMyTurn={isMyTurn}
          onEndTurn={handleEndTurn}
          onDragAttackStart={setDraggingAttackType}
          onDragAttackEnd={() => setDraggingAttackType(null)}
        />
      )}

      {/* Shop */}
      <ShopRow
        shop={shop}
        currentPawcoins={me?.currentPawcoins || 0}
        isMyTurn={isMyTurn}
        blockShop={blockShop}
      />

      <div className="text-xs text-stone-400 text-right">
        Shop deck: {shopDeck?.length || 0} cards remaining
      </div>

      {/* Log */}
      <GameLog log={log} />

      {/* Phase overlay — shown when events or enemy abilities are pending */}
      <PhaseOverlay
        pendingPhase={pendingPhase}
        isMyTurn={isMyTurn}
        onAdvance={handleAdvancePhase}
      />
    </div>
  );
}
