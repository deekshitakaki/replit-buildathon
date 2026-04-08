import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export type BackgroundType = 'cream' | 'blush' | 'lavender' | 'vintage' | 'floral' | 'grid';
export type FontType = 'dancing' | 'sacramento' | 'satisfy' | 'sans' | 'serif' | 'greatvibes' | 'allura' | 'parisienne' | 'cormorant' | 'baskerville';

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
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

// ── Mood detection ────────────────────────────────────────────────────────────

type Mood = 'love' | 'birthday' | 'apology' | 'gratitude' | 'general';

const MOOD_KEYWORDS: Record<Mood, RegExp> = {
  love:      /\b(love|heart|miss|forever|always|darling|dear|adore|cherish|babe|sweetheart|romance)\b/i,
  birthday:  /\b(birthday|happy|celebrate|wish|born|party|age|year|cake|gift)\b/i,
  apology:   /\b(sorry|apologize|forgive|mistake|hurt|wrong|regret|fault|forgiveness)\b/i,
  gratitude: /\b(thank|grateful|gratitude|appreciate|blessed|thankful|recognition|honored)\b/i,
  general:   /.*/,
};

const BG_MOOD_MAP: Record<BackgroundType, Mood> = {
  blush:    'love',
  lavender: 'birthday',
  vintage:  'apology',
  floral:   'gratitude',
  cream:    'gratitude',
  grid:     'general',
};

function detectMood(content: string, background: BackgroundType): Mood {
  for (const mood of (['love', 'birthday', 'apology', 'gratitude'] as Mood[])) {
    if (MOOD_KEYWORDS[mood].test(content)) return mood;
  }
  // Fall back to the background's implied mood
  return BG_MOOD_MAP[background] ?? 'general';
}

// ── Mood presets ──────────────────────────────────────────────────────────────

interface MoodPreset {
  font: FontType;
  background: BackgroundType;
  emojis: string[];
  stickerCount: number;
}

const MOOD_PRESETS: Record<Mood, MoodPreset> = {
  love: {
    font: 'greatvibes',
    background: 'blush',
    emojis: ['💖', '🌹', '💕', '🩷'],
    stickerCount: 4,
  },
  birthday: {
    font: 'dancing',
    background: 'lavender',
    emojis: ['🎀', '✨', '⭐', '🌟'],
    stickerCount: 4,
  },
  apology: {
    font: 'cormorant',
    background: 'vintage',
    emojis: ['🕊️', '🌿', '🤍'],
    stickerCount: 2,
  },
  gratitude: {
    font: 'sacramento',
    background: 'floral',
    emojis: ['🌸', '🌷', '🦋', '🌼'],
    stickerCount: 4,
  },
  general: {
    font: 'dancing',
    background: 'cream',
    emojis: ['✨', '🌸', '💕', '⭐'],
    stickerCount: 3,
  },
};

// ── Sticker placement zones (relative to paper top-left = 0,0) ───────────────
// Paper is at least 500px wide (editor w/ sidebar) and 700px+ tall.
// Positions are corner/edge anchors to avoid the text area in the center.

const PLACEMENT_ZONES: { x: number; y: number; rotation: number; scale: number }[] = [
  { x: 16,  y: 16,  rotation: -14, scale: 1.35 }, // top-left corner
  { x: 452, y: 14,  rotation: 16,  scale: 1.25 }, // top-right corner
  { x: 12,  y: 660, rotation: -20, scale: 1.20 }, // bottom-left corner
  { x: 454, y: 664, rotation: 12,  scale: 1.40 }, // bottom-right corner
  { x: 236, y: 10,  rotation: 0,   scale: 1.10 }, // top-center accent
  { x: 456, y: 340, rotation: 22,  scale: 1.15 }, // mid-right accent
];

const jitter = (base: number, range: number) =>
  base + (Math.random() - 0.5) * range;

export const useLetterStore = create<LetterState>()(
  persist(
    (set) => ({
      content: '',
      background: 'cream',
      font: 'dancing',
      stickers: [],

      setContent: (content) => set({ content }),
      setBackground: (background) => set({ background }),
      setFont: (font) => set({ font }),

      addSticker: (emoji) => set((state) => ({
        stickers: [
          ...state.stickers,
          {
            id: generateId(),
            emoji,
            x: 80 + Math.random() * 200,
            y: 80 + Math.random() * 200,
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
        const mood = detectMood(state.content, state.background);
        const preset = MOOD_PRESETS[mood];

        const zones = PLACEMENT_ZONES.slice(0, preset.stickerCount);
        const newStickers: Sticker[] = zones.map((zone, i) => ({
          id: generateId(),
          emoji: preset.emojis[i % preset.emojis.length],
          x: jitter(zone.x, 10),
          y: jitter(zone.y, 10),
          rotation: jitter(zone.rotation, 6),
          scale: jitter(zone.scale, 0.15),
        }));

        return {
          font: preset.font,
          background: preset.background,
          stickers: newStickers,
        };
      }),

      loadFromEncodedData: (encoded: string) => {
        try {
          const json = decodeURIComponent(atob(encoded));
          const data = JSON.parse(json);
          if (data && typeof data === 'object') {
            set({
              content: data.content || '',
              background: data.background || 'cream',
              font: data.font || 'dancing',
              stickers: Array.isArray(data.stickers) ? data.stickers : [],
            });
            return true;
          }
        } catch (e) {
          console.error('Failed to parse shared letter', e);
        }
        return false;
      },
    }),
    { name: 'dearly-letter-v2' }
  )
);
