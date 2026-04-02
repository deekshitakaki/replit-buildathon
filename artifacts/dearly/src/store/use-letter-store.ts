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

const AVAILABLE_EMOJIS = ['🌸', '🌷', '💌', '🕊️', '🌙', '⭐', '🌿', '🦋', '🌹', '💕', '✨', '🎀'];

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
            x: 100 + Math.random() * 100, // Initial random offset from top-left
            y: 100 + Math.random() * 100,
            rotation: (Math.random() - 0.5) * 30, // Random rotation -15 to +15 deg
            scale: 1 + Math.random() * 0.5, // Scale 1.0 to 1.5
          }
        ]
      })),

      updateSticker: (id, updates) => set((state) => ({
        stickers: state.stickers.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),

      removeSticker: (id) => set((state) => ({
        stickers: state.stickers.filter((s) => s.id !== id)
      })),

      makeItBeautiful: () => set((state) => {
        const emojis = ['🌸', '💕', '✨', '🌷', '🦋', '⭐', '🌹', '💌'];
        const positions = [
          { x: 30, y: 30 },
          { x: 450, y: 40 },
          { x: 60, y: 550 },
          { x: 420, y: 500 },
        ];
        const newStickers: Sticker[] = positions.map((pos) => ({
          id: generateId(),
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x: pos.x + (Math.random() - 0.5) * 40,
          y: pos.y + (Math.random() - 0.5) * 40,
          rotation: (Math.random() - 0.5) * 25,
          scale: 1 + Math.random() * 0.6,
        }));
        return { stickers: newStickers };
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
          console.error("Failed to parse shared letter", e);
        }
        return false;
      }
    }),
    {
      name: 'dearly-letter-storage',
    }
  )
);
