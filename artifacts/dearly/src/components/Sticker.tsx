import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { RotateCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLetterStore, clamp01, Sticker as StickerType } from "@/store/use-letter-store";
import { usePaperMetrics } from "@/components/PaperSurface";
import { SPRING } from "@/lib/motion";

interface StickerProps {
  sticker: StickerType;
  isEditable?: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Staggers the entrance in the preview reveal. */
  revealDelay?: number;
}

const MIN_SCALE = 0.45;
const MAX_SCALE = 2.6;

/** Emoji size as a fraction of paper width — keeps stickers in proportion. */
const EMOJI_RATIO = 0.055;
const MIN_EMOJI_PX = 20;

export function Sticker({
  sticker,
  isEditable = true,
  paperRef,
  selectedId = null,
  onSelect,
  revealDelay = 0.15,
}: StickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const updateSticker = useLetterStore((state) => state.updateSticker);
  const removeSticker = useLetterStore((state) => state.removeSticker);
  const hasMounted = useRef(false);
  const emojiRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  const { width: paperWidth, height: paperHeight } = usePaperMetrics();

  const x = useMotionValue(sticker.x * paperWidth);
  const y = useMotionValue(sticker.y * paperHeight);
  const isSelected = selectedId === sticker.id;
  const showControls = isEditable && isSelected && !isDragging;

  const fontSize = Math.max(MIN_EMOJI_PX, paperWidth * EMOJI_RATIO);

  // Re-project whenever the stored fraction changes or the paper is resized.
  useEffect(() => {
    x.set(sticker.x * paperWidth);
    y.set(sticker.y * paperHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticker.id, sticker.x, sticker.y, paperWidth, paperHeight]);

  // Until the paper has been measured there is nowhere meaningful to put this.
  if (paperWidth === 0 || paperHeight === 0) return null;

  // ── Preview (read-only) ──────────────────────────────────────────────────
  if (!isEditable) {
    return (
      <motion.div
        className="absolute pointer-events-none select-none z-20"
        style={{
          top: 0,
          left: 0,
          x: sticker.x * paperWidth,
          y: sticker.y * paperHeight,
          rotate: sticker.rotation,
        }}
        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: sticker.scale, opacity: 1 }}
        transition={{ ...SPRING.crisp, delay: reduceMotion ? 0 : revealDelay }}
      >
        <span
          className="leading-none block filter drop-shadow-sm select-none"
          style={{ fontSize }}
        >
          {sticker.emoji}
        </span>
      </motion.div>
    );
  }

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!emojiRef.current) return;

    setIsResizing(true);
    onSelect?.(sticker.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = sticker.scale;
    const rect = emojiRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startDist = Math.hypot(startX - centerX, startY - centerY) || 1;

    const onMove = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - centerX, ev.clientY - centerY);
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * (dist / startDist)));
      updateSticker(sticker.id, { scale: Math.round(next * 100) / 100 });
    };

    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!emojiRef.current) return;

    setIsRotating(true);
    onSelect?.(sticker.id);

    const rect = emojiRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const startRotation = sticker.rotation;

    const onMove = (ev: PointerEvent) => {
      const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX);
      const delta = ((angle - startAngle) * 180) / Math.PI;
      updateSticker(sticker.id, { rotation: Math.round(startRotation + delta) });
    };

    const onUp = () => {
      setIsRotating(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // ── Editable ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="absolute select-none touch-none"
      style={{
        top: 0,
        left: 0,
        x,
        y,
        rotate: sticker.rotation,
        zIndex: isDragging || isResizing || isRotating || isSelected ? 100 : 20,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      initial={hasMounted.current || reduceMotion ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: sticker.scale, opacity: 1 }}
      transition={SPRING.crisp}
      drag={!isResizing && !isRotating}
      dragConstraints={paperRef}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect?.(sticker.id);
      }}
      onDragStart={() => {
        hasMounted.current = true;
        setIsDragging(true);
        onSelect?.(sticker.id);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        updateSticker(sticker.id, {
          x: clamp01(x.get() / paperWidth),
          y: clamp01(y.get() / paperHeight),
        });
      }}
      whileDrag={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))" }}
    >
      <div className="relative">
        <span
          ref={emojiRef}
          className={`leading-none block ${isSelected ? "drop-shadow-md" : ""}`}
          style={{ fontSize }}
        >
          {sticker.emoji}
        </span>

        {showControls && (
          <>
            {/* Selection ring */}
            <div
              className="absolute -inset-2 rounded-xl border border-dashed pointer-events-none"
              style={{ borderColor: "var(--accent)", opacity: 0.6 }}
            />

            {/* Delete */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeSticker(sticker.id);
                onSelect?.(null);
              }}
              className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full shadow-md border border-black/10 flex items-center justify-center hover:scale-110 transition-transform z-10"
              style={{ color: "var(--accent)" }}
              title="Remove sticker"
              aria-label="Remove sticker"
            >
              <X size={11} strokeWidth={3} />
            </button>

            {/* Rotate handle */}
            <button
              onPointerDown={handleRotatePointerDown}
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white text-foreground/60 rounded-full shadow-md border border-black/10 flex items-center justify-center hover:text-primary transition-colors z-10 cursor-grab active:cursor-grabbing"
              title="Rotate"
              aria-label="Rotate sticker"
            >
              <RotateCw size={11} strokeWidth={2.5} />
            </button>

            {/* Resize handle */}
            <button
              onPointerDown={handleResizePointerDown}
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-white rounded-full shadow-md border-2 z-10 cursor-nwse-resize"
              style={{ borderColor: "var(--accent)" }}
              title="Resize"
              aria-label="Resize sticker"
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
