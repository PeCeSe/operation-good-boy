# CLAUDE.md — Operation: Good Boy

This file is for Claude to understand the project context, decisions made, and what's in scope.

---

## Git Workflow

Push directly to `main`. No feature branches needed until the game is in a playable state.

Frontend auto-deploys to Vercel on every push to `main` — that's the only test environment in use right now. No local dev environment.

---

## What This Is

A co-op browser-based deck-builder for 2–4 players. Players are cats working together to defeat Good Boy (the final enemy) before the neighborhood is overrun with cucumbers. Built with React + Vite (frontend) and Node.js + Socket.IO (backend).

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Socket.IO client
- **Backend**: Node.js, Express, Socket.IO
- **Hosting**: Frontend on Vercel (auto-deploys from `main`), backend on Render (manual redeploy required)
- **Repo structure**: Monorepo — `frontend/` and `backend/` as separate apps

---

## Characters (Finalized)

| ID | Name | Subtitle |
|----|------|----------|
| `char_persian` | Lady Fluffington III | The Persian |
| `char_streetcat` | Ace | The Street Cat |
| `char_kitten` | Noodle | The Chaos Kitten |

All characters have 9 max lives. A 4th character slot is planned but not designed yet.
No passive abilities — these were removed as they were never designed.

**Images** (all in `frontend/public/characters/`):
- `{name}.png` — full detailed artwork (used in character selection cards)
- `{name}_headshot.png` — simplified portrait with transparent background (used in player panels in-game and lobby)
- `{name}_stunned.png` — stunned variant of headshot (shown when player is knocked out)

---

## Core Mechanics (Agreed)

### Philosophy: Manual Play
The game is intentionally low-automation — like a physical board game. Players manually apply card effects, track damage, manage cucumbers, etc. The code enforces as little as possible. Do NOT add automatic game logic unless explicitly asked.

### What the Code Does Automatically
- **Turn order**: `endTurn` advances `currentPlayerId` and increments `roundNumber`
- **Shop restock**: shop refills to 6 cards at end of each turn
- **Hand cycling**: player's hand is discarded and redrawn (5 cards, 6 for Street Cat) on end turn
- **Victory check**: when `enemies` is empty and `enemyDeck` is empty, phase flips to `"victory"`

### What Players Do Manually
Everything else: apply card effects, track lives, place cucumbers, drag attack tokens onto enemies, drag defeated enemies to discard, draw enemies from the villain deck, draw events, etc.

### Locations & Cucumbers
- Locations played sequentially; each has a `maxCucumberTokens` limit
- Cucumbers are set manually via `setCucumbers` socket event
- Defeat condition: all locations lost

### Victory Condition
**Defeat all enemies.** When the enemy deck and the board are both empty, the code auto-triggers victory.

Not every level has a boss. The early levels (including level 1) have **no boss** — winning just means clearing all the regular enemies. Some higher levels include a final boss (**Good Boy**) placed at the bottom of the enemy deck; the boss is detected via `isBoss: true` in the enemy data. Right now no boss exists in `enemies.js` yet (boss content comes with the later levels), so the win logic must not assume a boss is present.

### Shop
6 cards visible at a time, refilled automatically at end of each turn. Cards have a pawcoin cost tracked in the payment zone.

---

## State Architecture

### Backend (`backend/src/game/`)
- `gameState.js` — initializes game state
- `actions.js` — all game actions (manual: draw enemy, defeat enemy, set cucumbers, buy card, end turn, etc.)
- `roomManager.js` — socket-to-room mapping, rejoin logic
- `data/` — cards, characters, enemies, events, locations

### Frontend (`frontend/src/`)
- `pages/Game.jsx` — main game screen
- `pages/Lobby.jsx` — character selection and ready-up
- `pages/Home.jsx` — create/join room
- `pages/Cards.jsx` — debug/reference page, fetches all game data from `GET /api/gamedata`
- `components/PlayerHUD.jsx` — fixed bottom bar with the current player's hand, attacks, shop
- `data/characters.js` — source of truth for character display data (names, images, colors) used by Lobby and Game

---

## What Is Temporary / Not Finished

- **Pacing and flow**: Still being refined. The per-turn event reveal flow is new and hasn't been extensively playtested.
- **Card content**: All card names, flavor text, and effects are placeholder. Final card design pass not done.
- **Event content**: Events are mostly placeholder — names and effects need a full content pass.
- **Enemy content**: Enemy stats, abilities, and rewards are placeholder. Only level-1 enemies exist so far (3 of them, no boss).
- **Levels / difficulty**: The difficulty slider (Monday–Sunday, 0-indexed: Monday=0 … Sunday=6) is selected by the host and synced to all players. It now changes which content packs are used at game start (in `gameState.js`):
  - **Monday (0)**: pack 1 only — locations, events, enemies, shop cards (the original level-1 setup).
  - **Tuesday (1)**: locations from **pack 2 only**; events, enemies, and shop cards from **packs 1 + 2 combined**. Still one enemy on the board at a time.
  - **Wednesday–Sunday (2–6)**: not yet designed — currently fall through to the Tuesday (pack 1 + 2) setup, except enemy slots open up to 3 for difficulty ≥ 2 (`maxEnemySlots` in `actions.js`). Tougher stats and bosses come with later content.
- **Design and colors**: Current UI is functional but unstyled in many places. A full design pass (colors, typography, spacing, visual polish) is planned for later.
- **Sound and animation**: Minimal animations exist. No sound effects yet.
- **Card artwork**: Cards show type emoji placeholders. Real card art is not designed yet.
- **4th character**: Slot exists in the game but no character is designed for it yet.
- **Win/defeat screens**: Exist but are basic. Need visual polish.
- **Mobile layout**: Works but not optimized for small screens.
- **Skins (UI hidden, backend ready)**: The full skins system is implemented server-side (`skinId` on players, `select_skin` socket event, `getDisplayData` helper, `skins.js` data file) but the lobby UI is hidden behind `{false && ...}` until cat artwork is ready. Skins defined: Lulla, Thermo, Nestor, Mango & Chili. To re-enable: remove the `{false &&` guard in `Lobby.jsx` around the "Skin selector" block. Each skin needs three images in `/public/skins/` — see comment in that block for details.

---

## Future Plans (From Discussions)

- [ ] Full content pass on cards (names, effects, flavor text, artwork)
- [ ] Full content pass on events and enemies
- [ ] Difficulty levels — Monday/Tuesday wired up (pack selection); design Wednesday–Sunday (tougher stats, more enemy slots, bosses on later levels)
- [ ] Design and color system pass — consistent visual identity
- [ ] 4th playable character
- [ ] Card artwork (replacing emoji placeholders)
- [ ] Sound effects and more animations
- [ ] Mobile-optimized layout
- [ ] Win/defeat screen polish
- [ ] Spectator mode or reconnection improvements
- [ ] Skins — cat photo reskins (Lulla, Thermo, Nestor, Mango & Chili); backend done, UI hidden pending artwork
- [ ] Possibly: player avatars/emotes during other players' turns
- [ ] Possibly: a tutorial or rules summary in-game

### Game Log (lower priority, polish pass later)
- [ ] Highlight player names in a distinct colour
- [ ] Separator line between each new turn (`------`)
- [ ] Card names styled differently (another colour + underline); on hover → tooltip showing the card
- [ ] More icons in log text — e.g. show attack token image instead of writing "attack token"
- [ ] Fix grammar: "life" → "lives" for plural
- [ ] Stronger visual separation between rounds (e.g. a header row "— Round 3 —")
- [ ] More tone of voice — e.g. 🎉 when an enemy is defeated
- [ ] Clearer visual separation between individual lines (more padding/dividers)
- [ ] Timestamp: show seconds as well (HH:MM:SS)

---

## Image Handling

### Folder structure
All card images live in `frontend/public/cards/` organised by pack and type:
```
/cards
  /pack1
    /items/    ← shop item cards
    /allies/   ← shop ally cards
    /moves/    ← shop move cards (ready for when art exists)
  /starters/   ← character starting deck cards (organised by character subfolder)
  /fallbacks/  ← type fallback images shown when a card has no art yet
/characters/   ← character artwork (full, headshot, stunned variants)
```

### Compression — Claude compresses images after the user adds them
The user adds raw images to the repo (typically 2–3MB each). Claude must compress them with `pngquant` before committing — never commit uncompressed images. The repo was already bloated to 57MB from uncompressed images once; keep it lean.

**Only compress when the user says they've added new images** — don't proactively check or re-compress existing ones. Double-compression destroys quality.

Install if needed: `apt-get install -y pngquant`

**Lobby/hero character art** (`characters/ace.png`, `fluffington.png`, `noodle.png`) — quality 85-95 (gentle, these are displayed large):
```bash
pngquant --quality=85-95 --speed 1 --force --output image.png image.png
```

**Everything else** (card art, headshots, stunned variants, fallbacks) — quality 65-85 (aggressive, displayed small):
```bash
pngquant --quality=65-85 --speed 1 --force --output image.png image.png
```

Target size after compression: ~200–800KB per image. If an image is still over 1MB after compression, flag it.

### Adding new card images
1. User places raw image in the correct `/cards/pack1/{type}/` folder
2. Claude compresses it in place with pngquant (see above)
3. Add an `image` field to the card entry in `backend/src/data/cards.js` — `Cards.jsx` picks it up automatically via the API

---

## Important Notes for Claude

- **Frontend deploys automatically** when pushing to `main` via Vercel.
- **Backend must be manually redeployed** on Render after backend changes.
- The `CHARACTERS` array in `frontend/src/data/characters.js` is the single source of truth for character display data (names, images, colors). Backend character data lives in `backend/src/data/characters.js`.
- `pages/Cards.jsx` fetches data from `GET /api/gamedata` — do not add hardcoded game data to this file.
- Do NOT add automatic game logic (auto-applying card effects, auto-damage, auto-discard, etc.) — the game is intentionally manual.
- **Difficulty** is stored on the room (`backend/src/game/roomManager.js`), changed only by the host via the `set_difficulty` socket event, and synced to all players through `room_update`. It is copied into `gameState.difficulty` at game start. Per-player win/loss history per difficulty is kept client-side in `localStorage` under `ogb_difficulty_history` (`StatsScreen.jsx` writes it, `Lobby.jsx` reads it for the ✓/✗ badges).
