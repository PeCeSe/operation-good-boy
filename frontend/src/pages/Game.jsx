import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import CHARACTERS from "../data/characters";
import EnemyComponent from "../components/EnemyComponent";
import PlayerBoard from "../components/PlayerBoard";
import ShopRow from "../components/ShopRow";
import LocationBar from "../components/LocationBar";
import GameLog from "../components/GameLog";
import EventDeck from "../components/EventDeck";
import TokenPool, { ATTACK_CONFIG } from "../components/TokenPool";
import socket from "../socket";

function DragChip({ attackType }) {
  const cfg = ATTACK_CONFIG[attackType] ?? ATTACK_CONFIG.scratch;
  return (
    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg shadow-xl ${cfg.bg} ${cfg.border}`}>
      {cfg.icon}
    </div>
  );
}

function OtherPlayerPanel({ player, isCurrentTurn }) {
  const charData = CHARACTERS.find((c) => c.id === player.character?.id);
  const maxLives = player.character?.maxLives ?? 9;

  return (
    <div
      className={`rounded-lg border-2 transition-all overflow-hidden ${
        isCurrentTurn ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 p-2">
        {charData?.headshot ? (
          <img
            src={player.isStunned && charData.stunned ? charData.stunned : charData.headshot}
            alt={player.name}
            className="w-10 h-10 object-contain shrink-0"
          />
        ) : (
          <span className="text-xl shrink-0">{player.character?.emoji}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate">{player.name}</div>
          {charData && <div className="text-[10px] text-stone-400 truncate uppercase tracking-wide">{charData.subtitle}</div>}
          {player.isStunned && <span className="text-xs text-red-400 font-bold">STUNNED</span>}
          {isCurrentTurn && (
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wide animate-pulse">Their turn</div>
          )}
        </div>
      </div>
      <div className="px-2 pb-2 flex items-center gap-2 flex-wrap">
        <div className="flex gap-0.5 flex-wrap flex-1">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span key={i} className={`text-sm leading-none ${i < (player.lives ?? 0) ? "text-red-400" : "text-stone-200"}`}>
              ♥
            </span>
          ))}
        </div>
        <span className="text-xs text-amber-600 font-semibold shrink-0">
          🪙 {player.pawTokens ?? 0}
        </span>
        {(player.attackTokens ?? []).length > 0 && (
          <div className="flex gap-0.5">
            {player.attackTokens.map((t) => {
              const cfg = ATTACK_CONFIG[t.type] ?? ATTACK_CONFIG.scratch;
              return (
                <span key={t.id} className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${cfg.bg} ${cfg.border}`}>
                  {cfg.icon}
                </span>
              );
            })}
          </div>
        )}
        <span className="text-xs text-stone-400 shrink-0">
          🃏 {player.hand?.length ?? 0}
        </span>
      </div>
    </div>
  );
}

export default function Game({ gameState, mySocketId }) {
  const navigate = useNavigate();
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const {
    phase,
    currentPlayerId,
    roundNumber,
    players,
    enemies,
    currentLocation,
    lostLocations,
    shop,
    shopDeck,
    eventDeck,
    activeEvents,
    eventDiscard,
    paymentZone,
    log,
  } = gameState;

  const me = players.find((p) => p.socketId === mySocketId);
  const isMyTurn = me?.playerId === currentPlayerId;
  const currentPlayerName = players.find((p) => p.playerId === currentPlayerId)?.name;

  function handleDragStart({ active }) {
    setActiveDrag(active.data.current ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null);
    if (!over) return;

    const data = active.data.current ?? {};

    if (data.draggableType === "pool_token" && over.id === "staging") {
      socket.emit("add_attack_token", { type: data.attackType });
    } else if (data.draggableType === "staging_token") {
      const overId = String(over.id);
      if (overId !== "staging") {
        socket.emit("move_token_to_enemy", { enemyId: overId, tokenId: data.tokenId });
      }
    } else if (data.draggableType === "event_card" && over.id === "event_discard") {
      socket.emit("discard_event", { eventId: data.eventId });
    }
  }

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

  const otherPlayers = players.filter((p) => p.socketId !== mySocketId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-amber-600">Operation: Good Boy</span>
            <span className="text-stone-400 text-sm">Round {roundNumber}</span>
          </div>
          <div className="text-sm text-stone-500">
            {isMyTurn ? (
              <span className="text-amber-600 font-semibold animate-pulse">Your turn!</span>
            ) : (
              <span>{currentPlayerName}'s turn</span>
            )}
          </div>
        </div>

        {/* Board row: location left, enemies right */}
        <div className="flex gap-3 items-start flex-wrap">
          <LocationBar
            currentLocation={currentLocation}
            lostLocations={lostLocations ?? []}
            totalLocations={3}
          />
          <div className="flex-1">
            {enemies.length === 0 ? (
              <p className="text-stone-400 text-sm italic mt-2">No enemies on the board. 🎉</p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {enemies.map((enemy) => (
                  <EnemyComponent key={enemy.id} enemy={enemy} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event deck */}
        <EventDeck
          eventDeck={eventDeck ?? []}
          activeEvents={activeEvents ?? []}
          eventDiscard={eventDiscard ?? []}
        />

        {/* Token pool — shared attack supply */}
        <TokenPool />

        {/* Other players compact panels */}
        {otherPlayers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {otherPlayers.map((p) => (
              <OtherPlayerPanel
                key={p.playerId}
                player={p}
                isCurrentTurn={p.playerId === currentPlayerId}
              />
            ))}
          </div>
        )}

        {/* My player board */}
        {me && (
          <PlayerBoard
            player={me}
            isMe={true}
            isCurrentTurn={isMyTurn}
            paymentZone={paymentZone}
          />
        )}

        {/* Shop */}
        <ShopRow
          shop={shop}
          shopDeck={shopDeck}
          paymentZone={paymentZone}
          isMyTurn={isMyTurn}
          myPlayerId={me?.playerId}
        />

        {/* Game log */}
        <GameLog log={log} />
      </div>

      {/* Drag overlay — follows cursor */}
      <DragOverlay dropAnimation={null}>
        {(activeDrag?.draggableType === "pool_token" || activeDrag?.draggableType === "staging_token") && (
          <DragChip attackType={activeDrag.attackType} />
        )}
        {activeDrag?.draggableType === "event_card" && (
          <div className="w-36 h-8 bg-violet-800 rounded-lg flex items-center justify-center shadow-xl">
            <span className="text-white text-xs font-bold">🎴 Event</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
