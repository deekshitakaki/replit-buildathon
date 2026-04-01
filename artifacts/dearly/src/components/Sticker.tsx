import { motion, useMotionValue } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLetterStore, Sticker as StickerType } from "@/store/use-letter-store";

interface StickerProps {
  sticker: StickerType;
  isEditable?: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
}

export function Sticker({ sticker, isEditable = true, paperRef }: StickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const updateSticker = useLetterStore((state) => state.updateSticker);
  const removeSticker = useLetterStore((state) => state.removeSticker);

  const x = useMotionValue(sticker.x);
  const y = useMotionValue(sticker.y);

  // Sync position from store only on initial mount or when sticker.id changes
  useEffect(() => {
    x.set(sticker.x);
    y.set(sticker.y);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticker.id]);

  if (!isEditable) {
    return (
      <motion.div
        className="absolute pointer-events-none select-none"
        style={{ x: sticker.x, y: sticker.y, rotate: sticker.rotation, scale: sticker.scale }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: sticker.scale, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute select-none touch-none"
      style={{
        x,
        y,
        rotate: sticker.rotation,
        scale: sticker.scale,
        cursor: isHovered ? "grab" : "grab",
        zIndex: isHovered ? 50 : 10,
      }}
      drag
      dragConstraints={paperRef}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{
        scale: sticker.scale * 1.15,
        cursor: "grabbing",
        filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.18))",
        zIndex: 100,
      }}
      whileHover={{ scale: sticker.scale * 1.08 }}
      onDragEnd={() => {
        updateSticker(sticker.id, { x: x.get(), y: y.get() });
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: sticker.scale, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="relative">
        <span className="text-4xl">{sticker.emoji}</span>
        {isHovered && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              removeSticker(sticker.id);
            }}
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white text-rose-400 rounded-full shadow-md border border-rose-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:scale-110"
            style={{ opacity: 1 }}
          >
            <X size={10} strokeWidth={3} />
          </button>
        )}
      </div>
    </motion.div>
  );
}