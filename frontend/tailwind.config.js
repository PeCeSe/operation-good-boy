/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── 01 · SURFACES ────────────────────────────────────────────────────
        paper: {
          DEFAULT: "#f5f0d8",  // page default background (paper-100)
          50:      "#fff8e6",  // surface — cards, modals, raised panels
          100:     "#f5f0d8",  // page default background
          200:     "#ede0c0",  // sunken — wells, wash, board
          300:     "#c7a789",  // edge — page gradient bottom
          shadow:  "#c6a37a",  // card thickness / depth shadow
        },

        // ── 02 · INK ─────────────────────────────────────────────────────────
        ink: {
          DEFAULT: "#271d14",  // ink-900 — primary text
          border:  "#362c28",  // every border, every line
          700:     "#4a3428",  // secondary text
          500:     "#7a6051",  // tertiary, captions
          300:     "#a8968a",  // hairlines, disabled
        },

        // ── 03 · ACTION ACCENTS ──────────────────────────────────────────────
        moss: {
          DEFAULT: "#677b47",  // primary action, focus, your-turn
          deep:    "#475530",
          soft:    "#a4c7a8",
        },
        gold: {
          DEFAULT: "#d49b2a",  // pawcoins, currency, payment, item cards
          deep:    "#9c6621",
          soft:    "#f8e0a4",
        },
        red: {
          DEFAULT: "#982f21",  // life, damage, danger
          deep:    "#6a2128",
          soft:    "#e8b0b8",
        },

        // ── 04 · CARD FAMILIES ───────────────────────────────────────────────
        // Sakura · move
        move: {
          DEFAULT: "#d45641",  // main — header + type stripe
          deep:    "#a83830",  // deeper accent
          soft:    "#f0b0aa",  // image area fallback, tint
          lighter: "#fae0de",  // very soft wash
        },
        // Gold · item  (same family as action gold above)
        item: {
          DEFAULT: "#c98f3a",
          deep:    "#9c6621",
          soft:    "#f0d9a4",
          lighter: "#fcedc7",
        },
        // Sky · ally
        ally: {
          DEFAULT: "#5d8c9e",
          deep:    "#3a7a78",
          soft:    "#c8dedd",
          lighter: "#e5f2f4",
        },
        // Plum · event / Stupid Hooman
        plum: {
          DEFAULT: "#836498",
          deep:    "#4f3f63",
          soft:    "#d4c4e0",
          lighter: "#ece5f4",
        },
        // Brown · enemy
        brown: {
          DEFAULT: "#6b4422",
          deep:    "#2e2318",
          soft:    "#c8a880",
          lighter: "#f0e0c8",
        },
        // Sepia · location
        sepia: {
          DEFAULT: "#8a6517",
          deep:    "#5c3a1e",
          soft:    "#d0b87a",
          lighter: "#f0e8c8",
        },
      },

      fontFamily: {
        display: ["Bangers", "cursive"],
        body:    ["Nunito", "system-ui", "sans-serif"],
        flavor:  ["'Patrick Hand'", "cursive"],
      },

      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
        xs:    ["13px", { lineHeight: "1.4" }],
        sm:    ["15px", { lineHeight: "1.5" }],
        base:  ["15px", { lineHeight: "1.5" }],
        lg:    ["20px", { lineHeight: "1.4" }],
        xl:    ["22px", { lineHeight: "1.3" }],
        "2xl": ["28px", { lineHeight: "1.2" }],
        "3xl": ["32px", { lineHeight: "1.2" }],
        "4xl": ["44px", { lineHeight: "1.1" }],
        "5xl": ["64px", { lineHeight: "1" }],
        "6xl": ["88px", { lineHeight: "1" }],
      },

      borderRadius: {
        sm:    "6px",
        DEFAULT:"6px",
        md:    "10px",
        lg:    "14px",
        xl:    "16px",
        "2xl": "22px",
        full:  "999px",
      },
    },
  },
  plugins: [],
};
