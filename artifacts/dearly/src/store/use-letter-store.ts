import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import { decodeLetter } from '@/lib/letter-share';

export type BackgroundType =
  | 'cream' | 'blush' | 'lavender' | 'vintage' | 'floral' | 'grid'
  | 'rose'  | 'kraft' | 'party'   | 'watercolor';

export type FontType =
  | 'dancing' | 'sacramento' | 'satisfy' | 'sans' | 'serif'
  | 'greatvibes' | 'allura' | 'parisienne' | 'cormorant' | 'baskerville';

export interface Sticker {
  id: string;
  emoji: string;
  /** Fraction of paper width (0–1), so placement survives any screen size. */
  x: number;
  /** Fraction of paper height (0–1). */
  y: number;
  rotation: number;
  scale: number;
}

export interface LetterState {
  content: string;
  background: BackgroundType;
  font: FontType;
  stickers: Sticker[];

  setContent: (content: string) => void;
  setBackground: (bg: BackgroundType) => void;
  setFont: (font: FontType) => void;
  addSticker: (emoji: string) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  makeItBeautiful: () => void;
  loadFromEncodedData: (encoded: string) => boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — returns a new shuffled array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const jitter = (base: number, range: number) =>
  base + (Math.random() - 0.5) * range;

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Reference paper size the original pixel coordinates were authored against. */
const LEGACY_PAPER = { width: 640, height: 750 };

/** Older letters (and v1 share links) stored raw pixels. */
export function normalizeLegacySticker<T extends { x: number; y: number }>(sticker: T): T {
  return {
    ...sticker,
    x: clamp01(sticker.x / LEGACY_PAPER.width),
    y: clamp01(sticker.y / LEGACY_PAPER.height),
  };
}

// ── Mood detection ────────────────────────────────────────────────────────────

type Mood = 'love' | 'birthday' | 'apology' | 'gratitude' | 'general';

const MOOD_KEYWORDS: Record<Mood, RegExp> = {
  love:      /\b(love|heart|miss|forever|always|darling|dear|adore|cherish|babe|sweetheart|romance)\b/i,
  birthday:  /\b(birthday|happy|celebrate|wish|born|party|age|year|cake|gift|candle|balloon)\b/i,
  apology:   /\b(sorry|apologize|forgive|mistake|hurt|wrong|regret|fault|forgiveness)\b/i,
  gratitude: /\b(thank|grateful|gratitude|appreciate|blessed|thankful|recognition|honored)\b/i,
  general:   /.*/,
};

const BG_MOOD_MAP: Record<BackgroundType, Mood> = {
  blush:      'love',
  rose:       'love',
  lavender:   'birthday',
  party:      'birthday',
  vintage:    'apology',
  kraft:      'apology',
  floral:     'gratitude',
  cream:      'gratitude',
  watercolor: 'general',
  grid:       'general',
};

function detectMood(content: string, background: BackgroundType): Mood {
  for (const mood of (['love', 'birthday', 'apology', 'gratitude'] as Mood[])) {
    if (MOOD_KEYWORDS[mood].test(content)) return mood;
  }
  return BG_MOOD_MAP[background] ?? 'general';
}

// ── Mood presets ──────────────────────────────────────────────────────────────

interface MoodPreset {
  fonts: FontType[];
  backgrounds: BackgroundType[];
  emojis: string[];
  stickerCount: number;
}

const MOOD_PRESETS: Record<Mood, MoodPreset> = {
  love: {
    fonts:       ['greatvibes', 'sacramento', 'allura'],
    backgrounds: ['blush', 'rose'],
    emojis:      ['💖', '🌹', '💕', '🩷', '💗', '💝', '💌', '🌸', '🫶', '💓'],
    stickerCount: 4,
  },
  birthday: {
    fonts:       ['dancing', 'parisienne', 'satisfy'],
    backgrounds: ['party', 'lavender'],
    emojis:      ['🎂', '🎈', '🎉', '🎀', '🥳', '🎊', '🎁', '🌟', '✨', '🍰', '🎆', '⭐'],
    stickerCount: 4,
  },
  apology: {
    fonts:       ['cormorant', 'baskerville', 'serif'],
    backgrounds: ['vintage', 'kraft'],
    emojis:      ['🕊️', '🌿', '🤍', '🍃', '🌙', '🫧'],
    stickerCount: 2,
  },
  gratitude: {
    fonts:       ['sacramento', 'greatvibes', 'dancing'],
    backgrounds: ['floral', 'watercolor'],
    emojis:      ['🌸', '🌷', '🦋', '🌼', '🌺', '💐', '🌻', '🌿', '🍃', '✨'],
    stickerCount: 4,
  },
  general: {
    fonts:       ['dancing', 'satisfy', 'parisienne'],
    backgrounds: ['cream', 'watercolor'],
    emojis:      ['✨', '🌸', '💕', '⭐', '🌿', '🦋', '💫', '🌙'],
    stickerCount: 3,
  },
};

// ── Placement zones ──────────────────────────────────────────────────────────
// Coordinates are fractions of the paper (0–1) measured from its top-left, so
// the same arrangement holds on any screen and in any shared link.
// Two pools: corners first, then accents — shuffled separately so variety
// changes each click while maintaining aesthetic spread.

const CORNER_ZONES = [
  { x: 0.045, y: 0.030, rotation: -14, scale: 1.35 }, // top-left
  { x: 0.855, y: 0.028, rotation: 16,  scale: 1.25 }, // top-right
  { x: 0.040, y: 0.888, rotation: -20, scale: 1.20 }, // bottom-left
  { x: 0.858, y: 0.892, rotation: 12,  scale: 1.40 }, // bottom-right
];

const ACCENT_ZONES = [
  { x: 0.455, y: 0.022, rotation: 0,   scale: 1.10 }, // top-center
  { x: 0.875, y: 0.455, rotation: 22,  scale: 1.15 }, // mid-right
  { x: 0.030, y: 0.455, rotation: -18, scale: 1.10 }, // mid-left
  { x: 0.455, y: 0.925, rotation: 5,   scale: 1.05 }, // bottom-center
];

function pickZones(count: number) {
  const corners = shuffle(CORNER_ZONES);
  const accents = shuffle(ACCENT_ZONES);
  // Always use at least 2 corners for visual anchoring
  const cornerCount = Math.min(count, Math.max(2, count - 1));
  const accentCount = count - cornerCount;
  return [...corners.slice(0, cornerCount), ...accents.slice(0, accentCount)];
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useLetterStore = create<LetterState>()(
  persist(
    (set) => ({
      content: '',
      background: 'cream',
      font: 'dancing',
      stickers: [],

      setContent:    (content)    => set({ content }),
      setBackground: (background) => set({ background }),
      setFont:       (font)       => set({ font }),

      addSticker: (emoji) => set((state) => ({
        stickers: [
          ...state.stickers,
          {
            id: generateId(),
            emoji,
            x: 0.15 + Math.random() * 0.55,
            y: 0.12 + Math.random() * 0.42,
            rotation: (Math.random() - 0.5) * 30,
            scale: 1 + Math.random() * 0.5,
          },
        ],
      })),

      updateSticker: (id, updates) => set((state) => ({
        stickers: state.stickers.map((s) => s.id === id ? { ...s, ...updates } : s),
      })),

      removeSticker: (id) => set((state) => ({
        stickers: state.stickers.filter((s) => s.id !== id),
      })),

      makeItBeautiful: () => set((state) => {
        const mood    = detectMood(state.content, state.background);
        const preset  = MOOD_PRESETS[mood];

        // Pick a random font & background from the mood's palette each click
        const font       = shuffle(preset.fonts)[0];
        const background = shuffle(preset.backgrounds)[0];

        // Shuffle the full emoji pool then take the first N (different each click)
        const shuffledEmojis = shuffle(preset.emojis);
        const zones          = pickZones(preset.stickerCount);

        const newStickers: Sticker[] = zones.map((zone, i) => ({
          id:       generateId(),
          emoji:    shuffledEmojis[i % shuffledEmojis.length],
          x:        clamp01(jitter(zone.x, 0.022)),
          y:        clamp01(jitter(zone.y, 0.020)),
          rotation: jitter(zone.rotation, 7),
          scale:    jitter(zone.scale, 0.18),
        }));

        return { font, background, stickers: newStickers };
      }),

      loadFromEncodedData: (encoded: string) => {
        const data = decodeLetter(encoded);
        if (!data) {
          console.error('Failed to parse shared letter');
          return false;
        }
        set(data);
        return true;
      },
    }),
    {
      name: 'dearly-letter-v2',
      version: 2,
      // v1 stored sticker positions as raw pixels against an assumed paper size.
      migrate: (persisted, version) => {
        const state = persisted as Partial<LetterState>;
        if (version >= 2 || !state?.stickers) return state as LetterState;
        return {
          ...state,
          stickers: state.stickers.map(normalizeLegacySticker),
        } as LetterState;
      },
    }
  )
);
