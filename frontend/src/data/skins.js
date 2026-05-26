// ── Skins ─────────────────────────────────────────────────────────────────────
// Purely cosmetic — replaces character name + artwork, never game mechanics.
// Add real cat photos to /public/skins/ and update the image paths below.
//
// Each skin needs three images (compress with pngquant 65-85 before committing):
//   headshot  — transparent background portrait, shown in tabs + lobby cards
//   stunned   — same but for when the player is at 0 lives
//   image     — full artwork, shown in the character panel

const SKINS = [
  {
    id: "skin_placeholder_1",
    name: "Cat Name",           // ← replace with your cat's name
    headshot: "/skins/placeholder_headshot.png",
    stunned:  "/skins/placeholder_stunned.png",
    image:    "/skins/placeholder.png",
    backstory: "Coming soon.",  // ← replace with a fun description
    owner: "Pernille",          // just for reference, not shown in game
  },
  {
    id: "skin_placeholder_2",
    name: "Cat Name",
    headshot: "/skins/placeholder_headshot.png",
    stunned:  "/skins/placeholder_stunned.png",
    image:    "/skins/placeholder.png",
    backstory: "Coming soon.",
    owner: "Friend 1",
  },
  {
    id: "skin_placeholder_3",
    name: "Cat Name",
    headshot: "/skins/placeholder_headshot.png",
    stunned:  "/skins/placeholder_stunned.png",
    image:    "/skins/placeholder.png",
    backstory: "Coming soon.",
    owner: "Friend 1",
  },
  {
    id: "skin_placeholder_4",
    name: "Cat Name & Cat Name", // ← duo skin
    headshot: "/skins/placeholder_headshot.png",
    stunned:  "/skins/placeholder_stunned.png",
    image:    "/skins/placeholder.png",
    backstory: "Coming soon.",
    owner: "Friend 2",
  },
];

export default SKINS;
