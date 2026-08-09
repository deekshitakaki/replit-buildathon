import { useId } from "react";

interface PostageStampProps {
  width?: number;
  ink: string;
  accent: string;
  className?: string;
}

/**
 * A perforated postage stamp. The notches are punched with a mask rather than
 * painted, so the envelope colour shows through whatever it happens to be.
 */
export function PostageStamp({ width = 62, ink, accent, className }: PostageStampProps) {
  const uid = useId().replace(/:/g, "");
  const maskId = `stamp-mask-${uid}`;
  const skyId = `stamp-sky-${uid}`;

  // 74 × 92 artboard, perforations every 8 units along each edge.
  const notches: React.ReactNode[] = [];
  for (let x = 8; x < 74; x += 8) {
    notches.push(<circle key={`t${x}`} cx={x} cy={4} r={3} fill="black" />);
    notches.push(<circle key={`b${x}`} cx={x} cy={88} r={3} fill="black" />);
  }
  for (let y = 8; y < 92; y += 8) {
    notches.push(<circle key={`l${y}`} cx={4} cy={y} r={3} fill="black" />);
    notches.push(<circle key={`r${y}`} cx={70} cy={y} r={3} fill="black" />);
  }

  return (
    <svg
      width={width}
      height={(width / 74) * 92}
      viewBox="0 0 74 92"
      className={className}
      role="img"
      aria-label="Postage stamp"
    >
      <defs>
        <mask id={maskId}>
          <rect x="4" y="4" width="66" height="84" fill="white" />
          {notches}
        </mask>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.16" />
        </linearGradient>
      </defs>

      <g mask={`url(#${maskId})`}>
        <rect x="4" y="4" width="66" height="84" fill={`url(#${skyId})`} />
        <rect
          x="9"
          y="9"
          width="56"
          height="74"
          fill="none"
          stroke={accent}
          strokeOpacity="0.45"
          strokeWidth="1"
        />

        {/* A small heart, drawn rather than typed */}
        <path
          d="M37 56 C24 47 20 40 20 34 C20 28 25 24 30 24 C33.5 24 36 26 37 28.5
             C38 26 40.5 24 44 24 C49 24 54 28 54 34 C54 40 50 47 37 56 Z"
          fill={accent}
          fillOpacity="0.72"
        />

        <text
          x="37"
          y="70"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="9"
          letterSpacing="1.6"
          fill={ink}
          fillOpacity="0.7"
        >
          DEARLY
        </text>
        <text
          x="37"
          y="79"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="8"
          fill={ink}
          fillOpacity="0.45"
        >
          ∞
        </text>
      </g>
    </svg>
  );
}

interface PostmarkProps {
  size?: number;
  ink: string;
  /** Shown around the ring — usually the city or the date. */
  label?: string;
  className?: string;
}

/** The smudged cancellation mark stamped over the postage. */
export function Postmark({ size = 92, ink, label = "SENT WITH CARE", className }: PostmarkProps) {
  const uid = useId().replace(/:/g, "");
  const arcId = `postmark-arc-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      style={{ opacity: 0.34 }}
    >
      <defs>
        <path id={arcId} d="M50 50 m -33 0 a 33 33 0 1 1 66 0" fill="none" />
      </defs>

      <circle cx="50" cy="50" r="38" fill="none" stroke={ink} strokeWidth="1.6" />
      <circle cx="50" cy="50" r="30" fill="none" stroke={ink} strokeWidth="1" />

      <text
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="8.5"
        letterSpacing="1.4"
        fill={ink}
      >
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>

      {/* Cancellation bars trailing off to the right */}
      {[40, 47, 54, 61].map((y) => (
        <line
          key={y}
          x1="88"
          y1={y}
          x2="126"
          y2={y}
          stroke={ink}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
