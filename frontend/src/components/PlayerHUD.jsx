import { useState, useRef, useEffect } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import PawCoin from "./PawCoin";
import PlayerBoard, { StagingToken } from "./PlayerBoard";
import { ATTACK_CONFIG } from "./TokenPool";
import CHARACTERS from "../data/characters";
import socket from "../socket";

// ── Draggable pawcoin ──────────────────────────────────────────────────────────

function DraggableCoin({ index, onMove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `paw_coin_${index}`,
    data: { draggableType: "paw_coin" },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onMove}
      style={{ touchAction: "none", opacity: isDragging ? 0.3 : 1 }}
      className="shrink-0 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
      title="Click or drag to payment zone"
    >
      <PawCoin className="w-9 h-9" />
    </div>
  );
}

// ── Player tab button ──────────────────────────────────────────────────────────

function PlayerTab({ player, isMe, isActive, isTurn, onClick }) {
  const charData  = CHARACTERS.find(c => c.id === player?.character?.id);
  const isStunned = (player?.lives ?? 1) === 0;
  const headshot  = isStunned && charData?.stunned ? charData.stunned : charData?.headshot;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold
        transition-colors select-none shrink-0 border-2 border-b-0
        ${isActive
          ? "bg-paper-100 text-ink-700 border-ink-border/20 translate-y-[2px] relative z-10"
          : "bg-paper-200/60 text-ink-400 border-ink-border/20 hover:text-ink-600 hover:bg-paper-200/80"
        }
      `}
    >
      {headshot && (
        <img src={headshot} alt={player.name} className="w-5 h-5 object-contain rounded-full shrink-0" />
      )}
      <span>{player.name}</span>
      {isMe && (
        <span className="text-[9px] text-ink-400 font-normal">(YOU)</span>
      )}
      {isTurn && (
        <span className="w-2 h-2 rounded-full bg-moss shrink-0" title="Their turn" />
      )}
    </button>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_DRAWER_H  = 480;
const TAB_BAR_H     = 38; // approximate tab bar height, used for content max-height
const STAGING_W     = 180;
const STAGING_H     = 44;

const RULES_TAB_ID    = "__rules__";
const SETTINGS_TAB_ID = "__settings__";

// ── Turn order / rules tab content ────────────────────────────────────────────

// Inline cucumber icon for use in text
function CucumberIcon() {
  return <img src="/cucumber.svg" alt="cucumber" className="inline w-3.5 h-3.5 object-contain mx-0.5 relative -top-px" />;
}

const STEPS = [
  {
    n: 1,
    title: "Stupid Hooman Event",
    body: "Flip the top card of the event deck. Hoomans are at it again — read the card and apply the chaos.",
  },
  {
    n: 2,
    title: "Resolve enemy abilities",
    body: "Each villain on the board has something to say about it. Check their card and apply any effects.",
  },
  {
    n: 3,
    title: "Take actions",
    body: "Play cards from your hand, spend pawcoins at the shop, place attack tokens on enemies, and take those villains down.",
  },
  {
    n: 4,
    title: "End your turn",
    body: 'Hit the "End Turn" button. Any unused cards, pawcoins, and attack tokens are discarded. You\'ll draw a fresh paw of 5.',
  },
];

const REFS = [
  {
    icon: <img src="/cucumber.svg" alt="" className="w-4 h-4 object-contain" />,
    body: <>Each location can only take so many <CucumberIcon />cucumbers. Fill it up and you'll have to abandon it and fall back to the next one.</>,
  },
  {
    icon: "💀",
    body: "Lose all locations and it's game over. Don't let that happen.",
  },
  {
    icon: "🏆",
    body: "Defeat every enemy — that's a win!",
  },
  {
    icon: "😵",
    body: <>Hit 0 lives and you're Stunned. Add a <CucumberIcon />cucumber to the location, discard half your draw pile, and you can't heal this round. After your turn ends, you bounce back to full health — tough cat.</>,
  },
  {
    icon: <img src="/pawcoin.svg" alt="" className="w-4 h-4 object-contain" />,
    body: "Pawcoins buy cards from the shop. Pick up whatever looks tastiest for your deck.",
  },
];

function RulesPanel() {
  return (
    <div className="px-6 py-5 grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">

      {/* Left: Turn order */}
      <div>
        <h2 className="text-[9px] text-ink-400 uppercase tracking-[0.15em] font-bold mb-4">Turn Order</h2>
        <ol className="space-y-4">
          {STEPS.map(({ n, title, body }) => (
            <li key={n} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-ink-700 text-white text-xs font-black flex items-center justify-center mt-0.5">{n}</span>
              <div>
                <div className="font-bold text-sm text-ink-700 leading-snug">{title}</div>
                <div className="text-xs text-ink-500 leading-snug mt-0.5">{body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Right: Quick reference */}
      <div>
        <h2 className="text-[9px] text-ink-400 uppercase tracking-[0.15em] font-bold mb-4">Good to Know</h2>
        <ul className="space-y-3">
          {REFS.map(({ icon, body }, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-ink-500 leading-snug">
              <span className="shrink-0 w-4 flex items-start justify-center mt-0.5">
                {typeof icon === "string" ? <span>{icon}</span> : icon}
              </span>
              <span>{body}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Settings panel ────────────────────────────────────────────────────────────

const LAYOUT_OPTIONS = [
  {
    id: "sorted",
    label: "Sorted",
    icon: "🔢",
    description: "Cards in a fixed row. Drag to change the order.",
  },
  {
    id: "tidy",
    label: "Tidy",
    icon: "➖",
    description: "Cards stay on the same line — drag left and right to organise.",
  },
  {
    id: "free",
    label: "Free",
    icon: "🌀",
    description: "Full chaos. Drag your cards wherever you want.",
  },
];

function SettingsPanel({ me }) {
  const savedLayout = localStorage.getItem("handLayout") ?? "tidy";
  const currentLayout = me?.handLayout ?? savedLayout;

  const handleLayoutChange = (layoutId) => {
    localStorage.setItem("handLayout", layoutId);
    socket.emit("update_hand_layout", { handLayout: layoutId });
  };

  return (
    <div className="px-6 py-5">
      <h2 className="text-[9px] text-ink-400 uppercase tracking-[0.15em] font-bold mb-3">Hand Layout</h2>
      <div className="inline-flex rounded-xl border-2 border-ink shadow-[0_3px_0_#271d14] overflow-hidden">
        {LAYOUT_OPTIONS.map(({ id, label, icon, description }, i) => {
          const isActive = currentLayout === id;
          return (
            <div key={id} className="relative group flex">
              {i > 0 && <div className="w-px bg-ink/25 shrink-0" />}
              <button
                onClick={() => handleLayoutChange(id)}
                className={`flex flex-col items-center gap-0.5 px-6 py-2.5 font-display select-none transition-colors ${
                  isActive
                    ? "bg-moss text-white"
                    : "bg-paper-50 text-ink-500 hover:bg-paper-200"
                }`}
              >
                <span className="text-sm font-bold">{label}</span>
                <span className="text-base leading-none">{icon}</span>
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                <div className="bg-ink text-paper-100 font-body text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed text-center">
                  {description}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main HUD ───────────────────────────────────────────────────────────────────

export default function PlayerHUD({
  me,
  otherPlayers,
  paymentZone,
  currentPlayerId,
  isMyTurn,
}) {
  const [drawerHeight, setDrawerHeight] = useState(MAX_DRAWER_H);
  const [isDragging,   setIsDragging]   = useState(false);
  const [activeTabId,  setActiveTabId]  = useState(null);
  const dragStateRef = useRef(null);

  // Apply saved hand layout preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("handLayout");
    if (saved && me?.playerId) {
      socket.emit("update_hand_layout", { handLayout: saved });
    }
  }, [me?.playerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { setNodeRef: setStagingRef, isOver: isOverStaging } = useDroppable({ id: "staging" });

  // All players in order — me first, then others
  const allPlayers   = [me, ...(otherPlayers ?? [])].filter(Boolean);
  const showTabs     = allPlayers.length > 1;
  const isRulesTab    = activeTabId === RULES_TAB_ID;
  const isSettingsTab = activeTabId === SETTINGS_TAB_ID;

  // Active tab defaults to "me"
  const activePlayer = (isRulesTab || isSettingsTab) ? null : (allPlayers.find(p => p.playerId === activeTabId) ?? me ?? allPlayers[0] ?? null);
  const isViewingMe  = activePlayer?.playerId === me?.playerId;

  const lives      = me?.lives ?? 0;
  const maxLives   = me?.character?.maxLives ?? 9;
  const pawTokens  = me?.pawTokens ?? 0;
  const atkTokens  = me?.attackTokens ?? [];
  const isStunned  = lives === 0;

  // ── Handle drag-to-resize ──────────────────────────────────────────────────

  const handlePointerDown = (e) => {
    e.preventDefault();
    const startY      = e.clientY;
    const startHeight = drawerHeight;
    dragStateRef.current = { hasDragged: false };
    setIsDragging(true);

    const onMove = (ev) => {
      const delta = startY - ev.clientY;
      if (Math.abs(delta) > 4) dragStateRef.current.hasDragged = true;
      setDrawerHeight(Math.max(0, Math.min(MAX_DRAWER_H, startHeight + delta)));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  };

  const handleClick = () => {
    if (dragStateRef.current?.hasDragged) return;
    setDrawerHeight(h => h > 0 ? 0 : MAX_DRAWER_H);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">

      {/* ── Drawer handle tab ── */}
      <div className="flex justify-center">
        <button
          onPointerDown={handlePointerDown}
          onClick={handleClick}
          className={`bg-paper-50 border-2 border-b-0 border-ink-border rounded-t-lg px-6 py-0.5 text-ink-400 hover:text-ink transition-colors text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {drawerHeight > 0 ? "▼ Hide" : "▲ Show"}
        </button>
      </div>

      {/* ── Always-visible strip ── */}
      <div className="bg-paper-50 border-t-2 border-ink-border shadow-2xl">
        <div className="flex items-center gap-4 px-5 py-2.5">

          {/* Left: Coins + Attacks */}
          <div className="flex items-center gap-4 shrink-0">

            {/* Pawcoins */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-ink-300 uppercase tracking-widest font-bold">Pawcoins</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit("set_paw_tokens", { tokens: pawTokens + 1 })}
                  className="w-7 h-7 shrink-0 bg-gold border-2 border-gold-deep rounded-full text-white font-bold flex items-center justify-center text-sm leading-none shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >+</button>
                <div
                  className="flex items-center gap-1 overflow-x-auto rounded-lg px-1.5 py-1 border-2 border-dashed border-gold/40 bg-paper-200/20"
                  style={{ width: STAGING_W, minHeight: STAGING_H }}
                >
                  {pawTokens === 0
                    ? <PawCoin className="w-9 h-9 opacity-20" />
                    : Array.from({ length: pawTokens }).map((_, i) => (
                        <DraggableCoin
                          key={i}
                          index={i}
                          onMove={() => {
                            socket.emit("set_paw_tokens", { tokens: Math.max(0, pawTokens - 1) });
                            socket.emit("place_payment", { tokens: (paymentZone?.tokens ?? 0) + 1 });
                          }}
                        />
                      ))
                  }
                </div>
              </div>
            </div>

            {/* Attacks */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-ink-300 uppercase tracking-widest font-bold">Attacks</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => socket.emit("add_attack_token", { type: "attack" })}
                  className="w-7 h-7 shrink-0 bg-red border-2 border-red-deep rounded-full text-white font-bold flex items-center justify-center text-sm leading-none shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow]"
                >+</button>
                <div
                  ref={setStagingRef}
                  className={`flex items-center gap-1 overflow-x-auto rounded-lg px-1.5 py-1 border-2 border-dashed transition-colors ${
                    isOverStaging ? "border-red bg-red/5" : "border-ink-300/50 bg-paper-200/20"
                  }`}
                  style={{ width: STAGING_W, minHeight: STAGING_H }}
                >
                  {atkTokens.length === 0
                    ? <div className="w-9 h-9 rounded-full border-2 border-ink-300/25 flex items-center justify-center text-base opacity-25">{ATTACK_CONFIG.attack.icon}</div>
                    : atkTokens.map(t => <StagingToken key={t.id} token={t} />)
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Center: Lives */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative flex gap-0.5 justify-center">
              {/* Slider track */}
              <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ink-300/20 overflow-hidden pointer-events-none">
                <div
                  className="h-full rounded-full bg-red/60 transition-all duration-150"
                  style={{ width: `${maxLives > 1 ? ((lives - 1) / (maxLives - 1)) * 100 : (lives > 0 ? 100 : 0)}%`, float: "right" }}
                />
              </div>
              {Array.from({ length: maxLives }).map((_, i) => {
                const num    = maxLives - i;
                const filled = (maxLives - 1 - i) < lives;
                const handleClick = () => {
                  if (!me?.playerId) return;
                  const newLives = num === lives ? lives - 1 : num;
                  socket.emit("set_lives", { playerId: me.playerId, lives: Math.max(0, newLives) });
                };
                return (
                  <button
                    key={i}
                    onClick={handleClick}
                    className="relative w-11 h-11 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    title={filled ? (num === lives ? "Click to lose a life" : `Set lives to ${num}`) : `Set lives to ${num}`}
                  >
                    <span className={`text-[44px] leading-none select-none ${filled ? "text-red" : "text-ink-300"}`}>♥</span>
                    <span className={`absolute text-[10px] font-bold leading-none ${filled ? "text-white" : "text-ink-500"}`}>{num}</span>
                  </button>
                );
              })}
              {/* STUNNED overlay */}
              {isStunned && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold tracking-widest uppercase text-red border-2 border-red px-2.5 py-0.5 rounded bg-paper-50/80" style={{ transform: "rotate(-4deg)", display: "inline-block" }}>
                    STUNNED!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: End Turn */}
          <button
            onClick={() => socket.emit("end_turn")}
            disabled={!isMyTurn}
            className={`shrink-0 font-display px-5 py-2.5 rounded-lg border-2 transition-[transform,box-shadow] ${
              isMyTurn
                ? "bg-moss text-white border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none"
                : "bg-paper-200 text-ink-300 border-ink-300/50 opacity-40 cursor-not-allowed"
            }`}
          >
            End Turn →
          </button>
        </div>
      </div>

      {/* ── Drawer ── */}
      <div
        className="bg-paper-100 border-t border-ink-border/20 overflow-hidden flex flex-col"
        style={{
          height: drawerHeight,
          transition: isDragging ? "none" : "height 200ms ease-out",
        }}
      >
        {/* Tab bar — always shown (rules tab is always available) */}
        <div className="flex gap-0.5 px-3 pt-2 shrink-0 border-b-2 border-ink-border/20 bg-paper-200/40">
          {allPlayers.map(p => (
            <PlayerTab
              key={p.playerId}
              player={p}
              isMe={p.playerId === me?.playerId}
              isActive={!isRulesTab && p.playerId === activePlayer?.playerId}
              isTurn={p.playerId === currentPlayerId}
              onClick={() => setActiveTabId(p.playerId)}
            />
          ))}
          {/* Instructions tab */}
          <button
            onClick={() => setActiveTabId(RULES_TAB_ID)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold
              transition-colors select-none shrink-0 border-2 border-b-0
              ${isRulesTab
                ? "bg-paper-100 text-ink-700 border-ink-border/20 translate-y-[2px] relative z-10"
                : "bg-paper-200/60 text-ink-400 border-ink-border/20 hover:text-ink-600 hover:bg-paper-200/80"
              }
            `}
          >
            📋 Instructions
          </button>
          {/* Settings tab */}
          <button
            onClick={() => setActiveTabId(SETTINGS_TAB_ID)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold
              transition-colors select-none shrink-0 border-2 border-b-0
              ${isSettingsTab
                ? "bg-paper-100 text-ink-700 border-ink-border/20 translate-y-[2px] relative z-10"
                : "bg-paper-200/60 text-ink-400 border-ink-border/20 hover:text-ink-600 hover:bg-paper-200/80"
              }
            `}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: MAX_DRAWER_H - TAB_BAR_H }}>
          {isRulesTab
            ? <RulesPanel />
            : isSettingsTab
            ? <SettingsPanel me={me} />
            : activePlayer && (
                <PlayerBoard
                  player={activePlayer}
                  isMe={isViewingMe}
                  isCurrentTurn={activePlayer.playerId === currentPlayerId}
                  paymentZone={isViewingMe ? paymentZone : null}
                  hideHeader={true}
                />
              )
          }
        </div>
      </div>
    </div>
  );
}
