/** Shared motion vocabulary so every screen moves with the same character. */

/** The house curve — soft landing, no overshoot. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** A slower entrance curve for large surfaces (paper, envelope). */
export const EASE_SOFT = [0.34, 0, 0.2, 1] as const;

export const DUR = {
  /** Hover, tap, colour changes. */
  fast: 0.18,
  /** Most UI motion. */
  base: 0.45,
  /** Panels, cross-fades, page transitions. */
  slow: 0.8,
  /** Set pieces — the envelope, the letter reveal. */
  theatrical: 1.1,
} as const;

export const SPRING = {
  /** Snappy — buttons, stickers, seals. */
  crisp: { type: "spring", stiffness: 340, damping: 26 } as const,
  /** Weighty — sheets and panels. */
  soft: { type: "spring", stiffness: 320, damping: 34 } as const,
};
