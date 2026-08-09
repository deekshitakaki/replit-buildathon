import type { BackgroundType, FontType, Sticker } from "@/store/use-letter-store";
import { normalizeLegacySticker } from "@/store/use-letter-store";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export interface LetterPayload {
  content: string;
  background: BackgroundType;
  font: FontType;
  stickers: Sticker[];
}

const BACKGROUNDS: BackgroundType[] = [
  "cream", "blush", "lavender", "vintage", "floral", "grid",
  "rose", "kraft", "party", "watercolor",
];

const FONTS: FontType[] = [
  "dancing", "sacramento", "satisfy", "sans", "serif",
  "greatvibes", "allura", "parisienne", "cormorant", "baskerville",
];

/**
 * Compact array form: [emoji, x, y, rotation, scale].
 * In v2, x and y are per-mille of the paper (0–1000) so they stay integers
 * while remaining resolution-independent.
 */
type CompactSticker = [string, number, number, number, number];

interface CompactPayload {
  v: 1 | 2;
  t: string;
  b: number;
  f: number;
  s: CompactSticker[];
}

function toCompact(data: LetterPayload): CompactPayload {
  return {
    v: 2,
    t: data.content,
    b: Math.max(0, BACKGROUNDS.indexOf(data.background)),
    f: Math.max(0, FONTS.indexOf(data.font)),
    s: data.stickers.map((sticker) => [
      sticker.emoji,
      Math.round(sticker.x * 1000),
      Math.round(sticker.y * 1000),
      Math.round(sticker.rotation),
      Math.round(sticker.scale * 100) / 100,
    ]),
  };
}

function fromCompact(data: CompactPayload): LetterPayload {
  const isFractional = data.v === 2;

  return {
    content: typeof data.t === "string" ? data.t : "",
    background: BACKGROUNDS[data.b] ?? "cream",
    font: FONTS[data.f] ?? "dancing",
    stickers: Array.isArray(data.s)
      ? data.s.map((row, i) => {
          const sticker = {
            id: `s${i}`,
            emoji: String(row[0] ?? "✨"),
            x: Number(row[1]) || 0,
            y: Number(row[2]) || 0,
            rotation: Number(row[3]) || 0,
            scale: Number(row[4]) || 1,
          };
          return isFractional
            ? { ...sticker, x: sticker.x / 1000, y: sticker.y / 1000 }
            : normalizeLegacySticker(sticker);
        })
      : [],
  };
}

function fromLegacy(data: Record<string, unknown>): LetterPayload {
  return {
    content: typeof data.content === "string" ? data.content : "",
    background: (data.background as BackgroundType) || "cream",
    font: (data.font as FontType) || "dancing",
    stickers: Array.isArray(data.stickers)
      ? (data.stickers as Sticker[]).map(normalizeLegacySticker)
      : [],
  };
}

/** Encode letter state for URL hash sharing (compressed + compact keys). */
export function encodeLetter(data: LetterPayload): string {
  const compact = JSON.stringify(toCompact(data));
  return compressToEncodedURIComponent(compact);
}

/** Decode letter state from a URL hash. Supports compressed + legacy formats. */
export function decodeLetter(encoded: string): LetterPayload | null {
  if (!encoded) return null;

  // New format: lz-string encoded compact JSON
  try {
    const inflated = decompressFromEncodedURIComponent(encoded);
    if (inflated) {
      const data = JSON.parse(inflated);
      if (data && typeof data === "object" && (data.v === 1 || data.v === 2)) {
        return fromCompact(data as CompactPayload);
      }
      // Compressed but still legacy-shaped object
      if (data && typeof data === "object" && "content" in data) {
        return fromLegacy(data);
      }
    }
  } catch {
    // fall through to legacy
  }

  // Legacy format: btoa(encodeURIComponent(JSON.stringify(...)))
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    if (data && typeof data === "object") {
      return fromLegacy(data);
    }
  } catch {
    // ignore
  }

  return null;
}

/** Build a shareable preview URL and copy it to the clipboard. */
export async function copyShareLink(data: LetterPayload): Promise<boolean> {
  const encoded = encodeLetter(data);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = `${window.location.origin}${basePath}/preview#${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
}
