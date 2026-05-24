import PawCoin from "../components/PawCoin";

/**
 * Renders a description string with styled symbols:
 * ♥ or ❤️  → red heart span
 * 🪙        → PawCoin component
 * 🥒        → cucumber SVG image
 */
export function renderDescription(text) {
  if (!text) return null;
  const tokens = text.split(/(♥|❤️|🪙|🥒)/u);
  return tokens.map((token, i) => {
    if (token === "♥" || token === "❤️")
      return <span key={i} className="text-red font-bold">♥</span>;
    if (token === "🪙")
      return <PawCoin key={i} />;
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
