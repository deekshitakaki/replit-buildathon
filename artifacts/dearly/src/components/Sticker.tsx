import { motion, useMotionValue } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLetterStore, Sticker as StickerType } from "@/store/use-letter-store";

interface StickerProps {
  sticker: StickerType;
  isEditable?: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
}

export function Sticker({ sticker, isEditable = true, paperRef }: StickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const updateSticker = useLetterStore((state) => state.updateSticker);
  const removeSticker = useLetterStore((state) => state.removeSticker);
  const hasMounted = useRef(false);

  const x = useMotionValue(sticker.x);
  const y = useMotionValue(sticker.y);

  // Sync position from store only when the sticker id changes (new sticker or page mount)
  useEffect(() => {
    x.set(sticker.x);
    y.set(sticker.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticker.id]);

  // Preview (read-only) mode
  if (!isEditable) {
    return (
      <motion.div
        className="absolute pointer-events-none select-none z-10"
        style={{ x: sticker.x, y: sticker.y, rotate: sticker.rotation }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: sticker.scale, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
      >
        <span className="text-4xl leading-none block filter drop-shadow-sm">{sticker.emoji}</span>
      </motion.div>
    );
  }

  return (
    // Outer wrapper: handles position via motion values + entry animation
    <motion.div
      className="absolute select-none touch-none"
      style={{
        x,
        y,
        rotate: sticker.rotation,
        zIndex: isDragging ? 100 : isHovered ? 50 : 10,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      // Entry pop animation — only fires on first mount
      initial={hasMounted.current ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: sticker.scale, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      drag
      dragConstraints={paperRef}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        hasMounted.current = true;
        setIsDragging(true);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        updateSticker(sticker.id, { x: x.get(), y: y.get() });
      }}
      whileHover={!isDragging ? { scale: sticker.scale * 1.1 } : {}}
      whileDrag={{ scale: sticker.scale * 1.18, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <span className="text-4xl leading-none block">{sticker.emoji}</span>

        {isHovered && !isDragging && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              removeSticker(sticker.id);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-white text-rose-400 rounded-full shadow-md border border-rose-100/80 flex items-center justify-center hover:bg-rose-50 hover:scale-110 transition-transform"
          >
            <X size={9} strokeWidth={3} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
