// ── Skins ─────────────────────────────────────────────────────────────────────
// Purely cosmetic — replaces character name + artwork, never game mechanics.
// Add real cat photos to /public/skins/ and update the image paths below.
//
// Each skin needs three images (compress with pngquant 65-85 before committing):
//   headshot  — transparent background portrait, shown in tabs + lobby cards
//   stunned   — same but for when the player is at 0 lives
//   image     — full artwork, shown in the character panel
//
// Leave headshot/stunned/image as null until photos are ready — the UI will
// show a coloured initial circle as a placeholder instead.

const SKINS = [
  {
    id: "skin_lulla",
    name: "Lulla",
    headshot: null,   // ← add /skins/lulla_headshot.png when ready
    stunned:  null,
    image:    null,
    backstory: "Coming soon.",
    owner: "Pernille",
  },
  {
    id: "skin_thermo",
    name: "Thermo",
    headshot: null,
    stunned:  null,
    image:    null,
    backstory: "Coming soon.",
    owner: "Friend 1",
  },
  {
    id: "skin_nestor",
    name: "Nestor",
    headshot: null,
    stunned:  null,
    image:    null,
    backstory: "Coming soon.",
    owner: "Friend 1",
  },
  {
    id: "skin_mango_chili",
    name: "Mango & Chili",
    headshot: null,
    stunned:  null,
    image:    null,
    backstory: "Coming soon.",
    owner: "Friend 2",
  },
];

export default SKINS;
