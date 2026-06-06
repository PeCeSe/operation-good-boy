import PawCoin from "../components/PawCoin";
import { ClawMark } from "../components/TokenPool";

/**
 * Renders a description string with styled symbols:
 * ♥ or ❤️  → red heart span
 * 🪙        → PawCoin component
 * 🥒        → cucumber SVG image
 * ⚔️ or ⚔   → attack token (pow-cloud) image
 */
export function renderDescription(text) {
  if (!text) return null;
  const tokens = text.split(/(♥|❤️|🪙|🥒|⚔️|⚔)/u);
  return tokens.map((token, i) => {
    if (token === "♥" || token === "❤️")
      return <span key={i} className="text-red font-bold">♥</span>;
    if (token === "🪙")
      return <PawCoin key={i} />;
    if (token === "⚔️" || token === "⚔")
      return <ClawMark key={i} className="inline-block w-5 h-5 align-text-bottom" />;
    if (token === "🥒")
      return (
        <img
          key={i}
          src="/cucumber.svg"
          alt="cucumber"
          className="inline-block w-3.5 h-3.5 align-middle"
        />
      );
    return <span key={i}>{token}</span>;
  });
}
