import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Type, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useLetterStore, BackgroundType, FontType } from "@/store/use-letter-store";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const BACKGROUNDS: { id: BackgroundType; name: string; colorClass: string }[] = [
  { id: 'cream', name: 'Cream', colorClass: 'bg-[#fdf8f2]' },
  { id: 'blush', name: 'Blush', colorClass: 'bg-[#fff0f3]' },
  { id: 'lavender', name: 'Lavender', colorClass: 'bg-[#f5f0ff]' },
  { id: 'vintage', name: 'Vintage', colorClass: 'bg-[#fdf6e3]' },
  { id: 'floral', name: 'Floral', colorClass: 'bg-[#fdf8f2] border-2 border-pink-100 relative overflow-hidden after:content-[""] after:absolute after:inset-0 after:bg-[radial-gradient(#ffb3c6_1px,transparent_1px)] after:bg-[size:8px_8px] after:opacity-50' },
  { id: 'grid', name: 'Journal', colorClass: 'bg-[#fdfaf7] paper-bg-grid' },
];

const FONTS: { id: FontType; name: string; className: string }[] = [
  { id: 'dancing', name: 'Dancing Script', className: 'font-dancing text-xl' },
  { id: 'sacramento', name: 'Sacramento', className: 'font-sacramento text-2xl' },
  { id: 'satisfy', name: 'Satisfy', className: 'font-satisfy text-xl' },
  { id: 'serif', name: 'Playfair Display', className: 'font-serif text-lg' },
  { id: 'sans', name: 'Inter', className: 'font-sans text-sm' },
];

const CATEGORIZED_STICKERS = [
  { 
    label: 'Flowers', 
    emojis: ['🌸', '🌷', '🌹', '🪷', '🌼', '💐', '🌺', '🌻'] 
  },
  { 
    label: 'Hearts', 
    emojis: ['🩷', '💕', '💖', '💗', '💓', '💌', '🤍', '💝'] 
  },
  { 
    label: 'Nature', 
    emojis: ['🍃', '🌿', '🍂', '🌾', '🌙', '☁️', '🌈', '❄️'] 
  },
  { 
    label: 'Sparkle', 
    emojis: ['✨', '⭐', '🌟', '💫', '🕊️', '🦋', '🎀', '🧸'] 
  },
];

export function FloatingPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'bg' | 'font' | 'stickers'>('stickers');
  
  const { background, font, setBackground, setFont, addSticker } = useLetterStore();

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -260, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-4 top-20 bottom-20 w-64 bg-white/90 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] z-40 flex flex-col overflow-hidden"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-border shadow-md rounded-r-xl flex items-center justify-center hover:bg-gray-50 transition-colors z-50"
      >
        {isOpen ? <ChevronLeft size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
      </button>

      <div className="flex p-2 gap-1 bg-white/50">
        <TabButton 
          active={activeTab === 'stickers'} 
          onClick={() => setActiveTab('stickers')}
          icon={<Sparkles size={16} />}
          label="Stickers"
        />
        <TabButton 
          active={activeTab === 'font'} 
          onClick={() => setActiveTab('font')}
          icon={<Type size={16} />}
          label="Font"
        />
        <TabButton 
          active={activeTab === 'bg'} 
          onClick={() => setActiveTab('bg')}
          icon={<Paintbrush size={16} />}
          label="Paper"
        />
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-black/[0.05] to-transparent" />

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'stickers' && (
            <motion.div 
              key="stickers"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5"
            >
              {CATEGORIZED_STICKERS.map((category) => (
                <div key={category.label} className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest pl-0.5 mb-1">{category.label}</span>
                  <div className="grid grid-cols-4 gap-2">
                    {category.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="aspect-square flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-150 rounded-lg hover:bg-rose-50/60 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'font' && (
            <motion.div 
              key="font"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2"
            >
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  className={cn(
                    "p-3 text-left rounded-xl border transition-all",
                    font === f.id 
                      ? "border-primary/40 bg-primary/8 text-primary shadow-sm" 
                      : "border-transparent hover:bg-secondary text-foreground"
                  )}
                >
                  <span className={f.className}>{f.name}</span>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'bg' && (
            <motion.div 
              key="bg"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.id)}
                  className={cn(
                    "aspect-[4/3] rounded-2xl border shadow-sm transition-all flex flex-col items-center justify-center gap-2",
                    bg.colorClass,
                    background === bg.id 
                      ? "border-primary ring-4 ring-primary/20 scale-95" 
                      : "border-black/5 hover:border-primary/50 hover:scale-105"
                  )}
                >
                  <span className="text-[10px] font-medium text-black/60 bg-white/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    {bg.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all",
        active 
          ? "bg-white shadow-sm text-primary" 
          : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
