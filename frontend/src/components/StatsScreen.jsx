import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CHARACTERS from "../data/characters";
import SKINS from "../data/skins";
import { getDisplayData } from "../data/getDisplayData";

const LIFETIME_KEY = "ogb_lifetime_stats";
const LAST_GAME_KEY = "ogb_last_game_stats";
const DIFFICULTY_HISTORY_KEY = "ogb_difficulty_history";

function loadLifetime() {
  try { return JSON.parse(localStorage.getItem(LIFETIME_KEY)) || null; } catch { return null; }
}
function saveStats(lifetime, lastGame) {
  localStorage.setItem(LIFETIME_KEY, JSON.stringify(lifetime));
  localStorage.setItem(LAST_GAME_KEY, JSON.stringify(lastGame));
}

// ── Closeness ──────────────────────────────────────────────────────────────────

function getCloseness(phase, gameState) {
  const { lostLocations = [], locationDeck = [], totalEnemies = 0, enemies = [], enemyDeck = [] } = gameState;
  const totalLocations = lostLocations.length + locationDeck.length + 1; // +1 for current (which is null on defeat)

  if (phase === "victory") {
    const lost = lostLocations.length;
    if (lost === 0)
      return { emoji: "😎", text: "Absolute domination. Good Boy didn't stand a chance — on to the next difficulty!" };
    if (lost === totalLocations - 1)
      return { emoji: "😅", text: "So close it hurt! You scraped through on your very last location." };
    return { emoji: "🐾", text: `Solid win — you held ${totalLocations - lost} out of ${totalLocations} locations.` };
  }

  // defeat — always on last location, measure enemies remaining
  const enemiesRemaining = enemies.filter(Boolean).length + enemyDeck.length;
  const enemiesDefeated = totalEnemies - enemiesRemaining;
  const ratio = totalEnemies > 0 ? enemiesRemaining / totalEnemies : 1;

  if (enemiesRemaining <= 1)
    return { emoji: "😤", text: "So close! Just one more enemy stood between you and victory." };
  if (ratio <= 0.3)
    return { emoji: "😞", text: "You nearly had it — just couldn't finish the job." };
  if (ratio <= 0.6)
    return { emoji: "😬", text: `A tough fight. You took down ${enemiesDefeated} out of ${totalEnemies} enemies.` };
  return { emoji: "🥒", text: "Completely overrun by cucumbers. Maybe try a lower difficulty?" };
}

// ── Stat row helpers ───────────────────────────────────────────────────────────

const STAT_COLS = [
  { key: "damageDealt",      label: "Damage dealt",       emoji: "⚔️"  },
  { key: "coinsEarned",      label: "Coins earned",       emoji: "🪙"  },
  { key: "cucumbersAdded",   label: "Cucumbers placed",   emoji: "🥒"  },
  { key: "cucumbersRemoved", label: "Cucumbers removed",  emoji: "✨"  },
  { key: "cardsBought",      label: "Cards bought",       emoji: "🃏"  },
  { key: "livesHealed",      label: "Lives healed",       emoji: "❤️"  },
  { key: "enemiesDefeated",  label: "Enemies defeated",   emoji: "💀"  },
  { key: "timesStunned",     label: "Times stunned",      emoji: "💫"  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function StatsScreen({ gameState, mySocketId }) {
  const navigate = useNavigate();
  const { phase, players = [], roundNumber = 0 } = gameState;
  const isWin = phase === "victory";

  const closeness = useMemo(() => getCloseness(phase, gameState), [phase, gameState]);
  const prevLifetime = loadLifetime();

  // Build this game's aggregate (my stats + totals)
  const me = players.find((p) => p.socketId === mySocketId);
  const myStats = me?.stats ?? {};

  // Compute "best" player per stat (for highlighting)
  const best = useMemo(() => {
    const result = {};
    for (const { key } of STAT_COLS) {
      let max = -1, bestId = null;
      for (const p of players) {
        if ((p.stats?.[key] ?? 0) > max) { max = p.stats[key]; bestId = p.playerId; }
      }
      result[key] = max > 0 ? bestId : null;
    }
    return result;
  }, [players]);

  // Build totals for lifetime accumulation
  const gameTotals = useMemo(() => {
    const totals = {};
    for (const { key } of STAT_COLS) {
      totals[key] = players.reduce((s, p) => s + (p.stats?.[key] ?? 0), 0);
    }
    return totals;
  }, [players]);

  // Save to localStorage once on mount
  useEffect(() => {
    const prev = loadLifetime() || { gamesPlayed: 0, wins: 0, losses: 0 };
    for (const { key } of STAT_COLS) prev[key] = (prev[key] ?? 0) + (myStats[key] ?? 0);
    prev.gamesPlayed++;
    if (isWin) prev.wins++; else prev.losses++;
    saveStats(prev, { ...myStats, isWin, roundNumber });
    // Record win/loss for this difficulty so the lobby can show history badges
    const diffIdx = gameState.difficulty ?? 0;
    try {
      const hist = JSON.parse(localStorage.getItem(DIFFICULTY_HISTORY_KEY)) || {};
      hist[diffIdx] = isWin ? "win" : "loss";
      localStorage.setItem(DIFFICULTY_HISTORY_KEY, JSON.stringify(hist));
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const newLifetime = useMemo(() => {
    const prev = prevLifetime || { gamesPlayed: 0, wins: 0, losses: 0 };
    const next = { ...prev };
    for (const { key } of STAT_COLS) next[key] = (prev[key] ?? 0) + (myStats[key] ?? 0);
    next.gamesPlayed = (prev.gamesPlayed ?? 0) + 1;
    if (isWin) next.wins = (prev.wins ?? 0) + 1;
    else next.losses = (prev.losses ?? 0) + 1;
    return next;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start py-10 px-4 gap-8 ${isWin ? "bg-paper-100" : "bg-paper-200"}`}>

      {/* ── Header ── */}
      <div className="text-center">
        <div className="text-6xl mb-2">{isWin ? "🎉" : "🥒"}</div>
        <h1 className={`font-display text-5xl ${isWin ? "text-moss" : "text-red"}`}>
          {isWin ? "Victory!" : "Defeat"}
        </h1>
        <p className="font-body text-ink-500 mt-1 text-sm">
          {isWin ? "Good Boy has been defeated. The neighborhood is safe." : "The neighborhood is overrun with cucumbers."}
        </p>
        <p className="font-body text-ink-400 text-xs mt-0.5 italic">For now.</p>
      </div>

      {/* ── Closeness card ── */}
      <div className="bg-paper-50 border-2 border-ink-border shadow-md rounded-2xl px-6 py-4 max-w-md w-full text-center">
        <div className="text-3xl mb-1">{closeness.emoji}</div>
        <p className="font-body text-ink-700 text-sm leading-relaxed">{closeness.text}</p>
        <p className="font-body text-ink-400 text-xs mt-2">
          Round {roundNumber} &nbsp;·&nbsp;
          {gameState.lostLocations?.length ?? 0} location{(gameState.lostLocations?.length ?? 0) !== 1 ? "s" : ""} lost
        </p>
      </div>

      {/* ── Player stats table ── */}
      <div className="w-full max-w-2xl">
        <h2 className="font-display text-2xl text-ink mb-3">This game</h2>
        <div className="bg-paper-50 border-2 border-ink-border shadow-md rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-ink-border/20 bg-paper-200/50">
                <th className="text-left font-display text-xs uppercase tracking-wider text-ink-400 px-4 py-2">Stat</th>
                {players.map((p) => {
                  const display = getDisplayData(p, SKINS, CHARACTERS);
                  const isMe = p.socketId === mySocketId;
                  return (
                    <th key={p.playerId} className="text-center font-display text-xs uppercase tracking-wider text-ink-400 px-3 py-2">
                      <div className="flex flex-col items-center gap-1">
                        {display?.headshot && (
                          <img src={display.headshot} alt="" className="w-7 h-7 object-contain rounded-full" />
                        )}
                        <span className={isMe ? "text-ink font-bold" : ""}>{p.name}{isMe ? " (you)" : ""}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {STAT_COLS.map(({ key, label, emoji }, i) => (
                <tr key={key} className={i % 2 === 0 ? "bg-paper-50" : "bg-paper-100/50"}>
                  <td className="px-4 py-2 font-body text-sm text-ink-600">
                    <span className="mr-1.5">{emoji}</span>{label}
                  </td>
                  {players.map((p) => {
                    const val = p.stats?.[key] ?? 0;
                    const isBest = best[key] === p.playerId;
                    const isMe = p.socketId === mySocketId;
                    return (
                      <td key={p.playerId} className="text-center px-3 py-2">
                        <span className={`font-display text-base ${
                          isBest && val > 0
                            ? isWin ? "text-moss font-bold" : "text-red font-bold"
                            : isMe ? "text-ink" : "text-ink-500"
                        }`}>
                          {val}
                        </span>
                        {isBest && val > 0 && players.length > 1 && (
                          <span className="ml-1 text-xs">👑</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Lifetime stats (my stats only) ── */}
      {me && (
        <div className="w-full max-w-2xl">
          <h2 className="font-display text-2xl text-ink mb-3">
            Your all-time stats
            <span className="font-body text-sm font-normal text-ink-400 ml-2">
              {newLifetime.gamesPlayed} game{newLifetime.gamesPlayed !== 1 ? "s" : ""} ·{" "}
              {newLifetime.wins ?? 0}W / {newLifetime.losses ?? 0}L
            </span>
          </h2>
          <div className="bg-paper-50 border-2 border-ink-border shadow-md rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-ink-border/20 bg-paper-200/50">
                  <th className="text-left font-display text-xs uppercase tracking-wider text-ink-400 px-4 py-2">Stat</th>
                  <th className="text-center font-display text-xs uppercase tracking-wider text-ink-400 px-3 py-2">This game</th>
                  <th className="text-center font-display text-xs uppercase tracking-wider text-ink-400 px-3 py-2">All time</th>
                </tr>
              </thead>
              <tbody>
                {STAT_COLS.map(({ key, label, emoji }, i) => {
                  const thisGame = myStats[key] ?? 0;
                  const allTime = newLifetime[key] ?? 0;
                  return (
                    <tr key={key} className={i % 2 === 0 ? "bg-paper-50" : "bg-paper-100/50"}>
                      <td className="px-4 py-2 font-body text-sm text-ink-600">
                        <span className="mr-1.5">{emoji}</span>{label}
                      </td>
                      <td className="text-center px-3 py-2 font-display text-base text-ink">{thisGame}</td>
                      <td className="text-center px-3 py-2 font-display text-base text-ink-500">{allTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <button
        onClick={() => navigate("/")}
        className={`px-8 py-3 rounded-lg font-display border-2 border-ink shadow-[0_2px_0_#271d14] hover:-translate-y-px hover:shadow-[0_3px_0_#271d14] active:translate-y-px active:shadow-none transition-[transform,box-shadow] ${
          isWin ? "bg-moss text-white" : "bg-paper-200 text-ink"
        }`}
      >
        Back to Home
      </button>
    </div>
  );
}
