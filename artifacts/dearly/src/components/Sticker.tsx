import { motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useLetterStore, Sticker as StickerType } from "@/store/use-letter-store";
import { cn } from "@/lib/utils";

interface StickerProps {
  sticker: StickerType;
  isEditable?: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
}

export function Sticker({ sticker, isEditable = true, paperRef }: StickerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const updateSticker = useLetterStore((state) => state.updateSticker);
  const removeSticker = useLetterStore((state) => state.removeSticker);
  const dragControls = useDragControls();

  if (!isEditable) {
    return (
      <motion.div
        className="absolute pointer-events-none select-none drop-shadow-md"
        style={{ x: sticker.x, y: sticker.y, rotate: sticker.rotation, scale: sticker.scale }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: sticker.scale, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "absolute cursor-grab active:cursor-grabbing group",
        isHovered && "z-50"
      )}
      drag
      dragControls={dragControls}
      dragConstraints={paperRef}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        // Approximate new position by adding offset to original
        updateSticker(sticker.id, { 
          x: sticker.x + info.offset.x, 
          y: sticker.y + info.offset.y 
        });
      }}
      style={{ x: sticker.x, y: sticker.y, rotate: sticker.rotation, scale: sticker.scale }}
      initial={{ scale: 0 }}
      animate={{ scale: sticker.scale }}
      whileHover={{ scale: sticker.scale * 1.1 }}
      whileDrag={{ scale: sticker.scale * 1.2, filter: "drop-shadow(0px 10px 10px rgba(0,0,0,0.15))" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <span className="text-4xl select-none filter drop-shadow-sm">{sticker.emoji}</span>
        
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSticker(sticker.id);
            }}
            className="absolute -top-3 -right-3 bg-white text-destructive rounded-full p-1 shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:scale-110"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
