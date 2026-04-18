export function Fleuron({
  size = 20,
  className = "",
  variant = "heart",
}: {
  size?: number;
  className?: string;
  variant?: "heart" | "diamond" | "spray";
}) {
  if (variant === "diamond") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        <path
          d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="12" cy="12" r="1.3" fill="var(--color-cream)" />
      </svg>
    );
  }

  if (variant === "spray") {
    return (
      <svg
        width={size * 2}
        height={size}
        viewBox="0 0 48 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        <path
          d="M0 12 C 6 12 10 6 14 12 C 18 18 20 6 24 12 C 28 18 30 6 34 12 C 38 6 42 12 48 12"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="24" cy="12" r="1.6" fill="currentColor" />
        <circle cx="7" cy="12" r="0.9" fill="currentColor" opacity="0.7" />
        <circle cx="41" cy="12" r="0.9" fill="currentColor" opacity="0.7" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M12 20 C 6 15 3 11 3 8 C 3 5.5 5 4 7 4 C 9 4 11 5.5 12 8 C 13 5.5 15 4 17 4 C 19 4 21 5.5 21 8 C 21 11 18 15 12 20 Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M12 20 L 12 23"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
