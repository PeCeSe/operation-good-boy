export default function HealthSlider({ lives, maxLives, onChange, disabled = false }) {
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: maxLives }).map((_, i) => {
        const heartValue = i + 1;
        const filled = i < lives;
        const handleClick = () => {
          if (disabled || !onChange) return;
          // If clicking the rightmost filled heart (i+1 === lives), decrease by 1
          if (heartValue === lives) {
            onChange(lives - 1);
          } else {
            onChange(heartValue);
          }
        };
        return (
          <span
            key={i}
            onClick={handleClick}
            className={`text-lg leading-none transition-colors select-none
              ${filled ? "text-red" : "text-ink-300"}
              ${!disabled && onChange ? "cursor-pointer hover:scale-110 inline-block transition-transform" : ""}
            `}
            title={!disabled && onChange ? `Set lives to ${heartValue === lives ? lives - 1 : heartValue}` : undefined}
          >
            ♥
          </span>
        );
      })}
    </div>
  );
}
