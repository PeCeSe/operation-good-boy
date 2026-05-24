/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Paper (backgrounds) ─────────────────────────────────────────────
        paper: {
          DEFAULT: "#fbf1da",
          light:   "#fff8e6",
          dark:    "#f3e3bf",
          darker:  "#e7cf99",
          deep:    "#dec48a",
        },
        // ── Ink (text / borders) ────────────────────────────────────────────
        ink: {
          DEFAULT: "#271d14",
          700:     "#2e2418",
          500:     "#3b2c20",
          300:     "#4a3a2c",
          200:     "#7a6651",
          100:     "#b39c80",
          50:      "#cdb691",
        },
        // ── Card type families ───────────────────────────────────────────────
        move: {
          DEFAULT: "#c4564f",
          dark:    "#9e3f2f",
          light:   "#e8a6a1",
          lighter: "#f7d5d2",
        },
        item: {
          DEFAULT: "#c98f3a",
          dark:    "#8a5a1f",
          light:   "#f0d9a4",
          lighter: "#fcedc7",
        },
        ally: {
          DEFAULT: "#5d8c9e",
          dark:    "#3a7a78",
          light:   "#d8e8ef",
          lighter: "#c8dedd",
        },
        // ── Accent families ──────────────────────────────────────────────────
        sage: {
          DEFAULT: "#6f7b4f",
          dark:    "#4f5938",
          light:   "#cdd7a8",
        },
        violet: {
          DEFAULT: "#6b5fa6",
          dark:    "#4f3f63",
          light:   "#d4c4e0",
          lighter: "#d8d0ec",
        },
        rust: {
          DEFAULT: "#9e3f2f",
          dark:    "#6e2c20",
          light:   "#e3b6ad",
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
        xl:    "14px",
        "2xl": "22px",
        full:  "999px",
      },
    },
  },
  plugins: [],
};
