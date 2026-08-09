import { useId } from "react";

interface WaxSealProps {
  size?: number;
  /** Gradient stops — usually the active paper's `wax` triple. */
  colors: { light: string; base: string; dark: string };
  /** Letter pressed into the wax. */
  monogram?: string;
  className?: string;
}

/**
 * A pressed wax seal. The blob edge is deliberately irregular, the gradient runs
 * from a top-left highlight down to a pooled shadow, and the monogram is
 * embossed with a light rim above and a dark rim below.
 */
export function WaxSeal({ size = 64, colors, monogram = "D", className }: WaxSealProps) {
  const uid = useId().replace(/:/g, "");
  const fillId = `wax-fill-${uid}`;
  const rimId = `wax-rim-${uid}`;
  const glossId = `wax-gloss-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Wax seal"
    >
      <defs>
        <radialGradient id={fillId} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="48%" stopColor={colors.base} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>

        <radialGradient id={rimId} cx="50%" cy="50%" r="52%">
          <stop offset="82%" stopColor={colors.dark} stopOpacity="0" />
          <stop offset="100%" stopColor={colors.dark} stopOpacity="0.55" />
        </radialGradient>

        <linearGradient id={glossId} x1="20%" y1="10%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Irregular poured-wax edge */}
      <path
        d="M50 4 C63 3 71 11 79 17 C88 24 97 32 96 47 C95 61 88 70 81 78
           C73 87 63 97 49 96 C35 95 27 87 19 80 C11 72 3 63 4 48
           C5 34 13 26 20 18 C28 10 37 5 50 4 Z"
        fill={`url(#${fillId})`}
      />

      {/* Shadow pooling at the rim */}
      <path
        d="M50 4 C63 3 71 11 79 17 C88 24 97 32 96 47 C95 61 88 70 81 78
           C73 87 63 97 49 96 C35 95 27 87 19 80 C11 72 3 63 4 48
           C5 34 13 26 20 18 C28 10 37 5 50 4 Z"
        fill={`url(#${rimId})`}
      />

      {/* Pressed inner ring */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={colors.dark}
        strokeOpacity="0.32"
        strokeWidth="1.6"
      />
      <circle
        cx="50"
        cy="49"
        r="34"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />

      {/* Embossed monogram — dark press below, light catch above */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="42"
        fontStyle="italic"
        fill={colors.dark}
        fillOpacity="0.62"
        dy="1.5"
      >
        {monogram}
      </text>
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="42"
        fontStyle="italic"
        fill={colors.light}
        fillOpacity="0.85"
      >
        {monogram}
      </text>

      {/* Specular sheen */}
      <ellipse cx="38" cy="30" rx="24" ry="17" fill={`url(#${glossId})`} transform="rotate(-24 38 30)" />
    </svg>
  );
}
