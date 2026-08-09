import type { BackgroundType } from "@/store/use-letter-store";

/**
 * Every paper carries its own ink and accent so the whole UI re-tints when the
 * paper changes — rings, glows, seals and buttons follow the letter instead of
 * staying pink regardless of what the writer picked.
 */
export interface PaperTheme {
  /** Body text on this paper. */
  ink: string;
  /** Secondary text on this paper — date line, signature label, placeholder. */
  inkSoft: string;
  /** Interactive accent while this paper is active. Contrast-safe on white. */
  accent: string;
  /** Same hue, light enough for washes, rings and hover fills. */
  accentSoft: string;
  /** Envelope in the preview scene. */
  envelope: { body: string; flap: string; liner: string };
  /** Wax seal gradient stops, warm highlight through to deep shadow. */
  wax: { light: string; base: string; dark: string };
}

export const PAPER_THEMES: Record<BackgroundType, PaperTheme> = {
  cream: {
    ink: "#4A3B30",
    inkSoft: "#8A7663",
    accent: "#9C7A45",
    accentSoft: "#E8D9BC",
    envelope: { body: "#f5ede0", flap: "#eddfc8", liner: "#fdf8f2" },
    wax: { light: "#D8B87E", base: "#B08D57", dark: "#7E6136" },
  },
  blush: {
    ink: "#5C3541",
    inkSoft: "#95707B",
    accent: "#B34E6A",
    accentSoft: "#F3D3DC",
    envelope: { body: "#f5d6db", flap: "#edccd2", liner: "#fff0f3" },
    wax: { light: "#D97A93", base: "#B34E6A", dark: "#7E3145" },
  },
  rose: {
    ink: "#5A2A38",
    inkSoft: "#946A77",
    accent: "#A8415C",
    accentSoft: "#F2C9D4",
    envelope: { body: "#f0c4ce", flap: "#e8b0bc", liner: "#ffe4ea" },
    wax: { light: "#CF6480", base: "#A8415C", dark: "#74283C" },
  },
  lavender: {
    ink: "#3F3358",
    inkSoft: "#7A6E93",
    accent: "#6E52A0",
    accentSoft: "#DDD2F2",
    envelope: { body: "#dbd3f0", flap: "#cec4e8", liner: "#f5f0ff" },
    wax: { light: "#8F73C0", base: "#6E52A0", dark: "#4A3570" },
  },
  vintage: {
    ink: "#4E4030",
    inkSoft: "#8C7A62",
    accent: "#A67B4E",
    accentSoft: "#E9D8BF",
    envelope: { body: "#e8dcc8", flap: "#ddd0b8", liner: "#fdf6e3" },
    wax: { light: "#C79A6A", base: "#A67B4E", dark: "#71512F" },
  },
  kraft: {
    ink: "#4A331B",
    inkSoft: "#8A7150",
    accent: "#8A5A2B",
    accentSoft: "#E2C79B",
    envelope: { body: "#e0c48a", flap: "#d4b574", liner: "#f0d9a8" },
    wax: { light: "#B07B44", base: "#8A5A2B", dark: "#5D3A17" },
  },
  floral: {
    ink: "#4A3540",
    inkSoft: "#8A6F7C",
    accent: "#B25C7E",
    accentSoft: "#F0D2DE",
    envelope: { body: "#f0dde2", flap: "#e8d0d6", liner: "#fdf8f2" },
    wax: { light: "#D07C9C", base: "#B25C7E", dark: "#7C3B55" },
  },
  party: {
    ink: "#3E3A2E",
    inkSoft: "#7D7663",
    accent: "#A8761F",
    accentSoft: "#F2DFAE",
    envelope: { body: "#f5e6c8", flap: "#edd9b0", liner: "#fffbf0" },
    wax: { light: "#E3B255", base: "#C8912E", dark: "#8E6318" },
  },
  watercolor: {
    ink: "#2F3A57",
    inkSoft: "#6B7592",
    accent: "#41628F",
    accentSoft: "#C9D8EE",
    envelope: { body: "#c8d8f0", flap: "#b8cae8", liner: "#eef4ff" },
    wax: { light: "#6285B0", base: "#41628F", dark: "#2A4262" },
  },
  grid: {
    ink: "#3A3630",
    inkSoft: "#7A7367",
    accent: "#6F675C",
    accentSoft: "#D9D4CA",
    envelope: { body: "#e8e0d5", flap: "#ddd5c8", liner: "#fdfaf7" },
    wax: { light: "#948B7E", base: "#6F675C", dark: "#4B453C" },
  },
};

export function paperTheme(background: BackgroundType): PaperTheme {
  return PAPER_THEMES[background] ?? PAPER_THEMES.cream;
}

/**
 * CSS custom properties to spread onto a paper element. Children read
 * `var(--ink)` / `var(--accent)` and re-tint automatically.
 */
export function paperVars(background: BackgroundType): React.CSSProperties {
  const theme = paperTheme(background);
  return {
    "--ink": theme.ink,
    "--ink-soft": theme.inkSoft,
    "--accent": theme.accent,
    "--accent-soft": theme.accentSoft,
  } as React.CSSProperties;
}
