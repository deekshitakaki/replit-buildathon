import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Type, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useLetterStore, BackgroundType, FontType } from "@/store/use-letter-store";
import { cn } from "@/lib/utils";

const BACKGROUNDS: { id: BackgroundType; name: string; colorClass: string }[] = [
  { id: 'cream',    name: 'Cream',    colorClass: 'bg-[#fdf8f2]' },
  { id: 'blush',    name: 'Blush',    colorClass: 'bg-[#fff0f3]' },
  { id: 'lavender', name: 'Lavender', colorClass: 'bg-[#f5f0ff]' },
  { id: 'vintage',  name: 'Vintage',  colorClass: 'bg-[#fdf6e3]' },
  { id: 'floral',   name: 'Floral',   colorClass: 'bg-[#fdf8f2] border-2 border-pink-100 relative overflow-hidden after:content-[""] after:absolute after:inset-0 after:bg-[radial-gradient(#ffb3c6_1px,transparent_1px)] after:bg-[size:8px_8px] after:opacity-50' },
  { id: 'grid',     name: 'Journal',  colorClass: 'bg-[#fdfaf7] paper-bg-grid' },
];

const FONTS: { id: FontType; name: string; className: string; group: string }[] = [
  { id: 'greatvibes',  name: 'Great Vibes',       className: 'font-greatvibes text-2xl',      group: 'Handwritten' },
  { id: 'dancing',     name: 'Dancing Script',     className: 'font-dancing text-xl',          group: 'Handwritten' },
  { id: 'sacramento',  name: 'Sacramento',         className: 'font-sacramento text-2xl',      group: 'Handwritten' },
  { id: 'parisienne',  name: 'Parisienne',         className: 'font-parisienne text-xl',       group: 'Handwritten' },
  { id: 'allura',      name: 'Allura',             className: 'font-allura text-2xl',          group: 'Handwritten' },
  { id: 'satisfy',     name: 'Satisfy',            className: 'font-satisfy text-xl',          group: 'Handwritten' },
  { id: 'cormorant',   name: 'Cormorant Garamond', className: 'font-cormorant text-xl italic', group: 'Serif' },
  { id: 'serif',       name: 'Playfair Display',   className: 'font-serif text-lg',            group: 'Serif' },
  { id: 'baskerville', name: 'Libre Baskerville',  className: 'font-baskerville text-base',    group: 'Serif' },
  { id: 'sans',        name: 'Inter',              className: 'font-sans text-sm',             group: 'Clean' },
];

const CATEGORIZED_STICKERS = [
  { label: 'Flowers', emojis: ['🌸', '🌷', '🌹', '🪷', '🌼', '💐', '🌺', '🌻'] },
  { label: 'Hearts',  emojis: ['🩷', '💕', '💖', '💗', '💓', '💌', '🤍', '💝'] },
  { label: 'Nature',  emojis: ['🍃', '🌿', '🍂', '🌾', '🌙', '☁️', '🌈', '❄️'] },
  { label: 'Sparkle', emojis: ['✨', '⭐', '🌟', '💫', '🕊️', '🦋', '🎀', '🧸'] },
];

export function FloatingPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'bg' | 'font' | 'stickers'>('stickers');
  const { background, font, setBackground, setFont, addSticker } = useLetterStore();

  return (
    <>
      {/* Sliding panel — slides fully off-screen when closed */}
      <motion.div
        initial={{ x: 0, opacity: 0 }}
        animate={{
          x: isOpen ? 0 : -252,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed left-4 top-20 bottom-20 w-56 bg-white/92 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] z-40 flex flex-col overflow-hidden"
      >
        {/* Close tab on right edge of panel */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -right-px top-1/2 -translate-y-1/2 w-5 h-12 bg-white/80 border border-black/[0.07] border-l-0 rounded-r-lg flex items-center justify-center hover:bg-rose-50 transition-colors z-50 shadow-sm"
          title="Close panel"
        >
          <ChevronLeft size={13} className="text-muted-foreground" />
        </button>

        {/* Tabs */}
        <div className="flex p-2 gap-1 bg-white/50">
          <TabButton active={activeTab === 'stickers'} onClick={() => setActiveTab('stickers')} icon={<Sparkles size={16} />} label="Stickers" />
          <TabButton active={activeTab === 'font'}     onClick={() => setActiveTab('font')}     icon={<Type size={16} />}     label="Font"     />
          <TabButton active={activeTab === 'bg'}       onClick={() => setActiveTab('bg')}       icon={<Paintbrush size={16} />} label="Paper"  />
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
                className="flex flex-col gap-4"
              >
                {(['Handwritten', 'Serif', 'Clean'] as const).map((group) => (
                  <div key={group}>
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest pl-0.5 mb-2 block">{group}</span>
                    <div className="flex flex-col gap-1">
                      {FONTS.filter(f => f.group === group).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFont(f.id)}
                          className={cn(
                            "p-3 text-left rounded-xl border transition-all",
                            font === f.id
                              ? "border-primary/40 bg-primary/[0.08] text-primary shadow-sm"
                              : "border-transparent hover:bg-secondary text-foreground"
                          )}
                        >
                          <span className={f.className}>{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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

      {/* Re-open button — always at left edge, shown only when panel is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="reopen"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={() => setIsOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-50 w-8 h-20 bg-white/90 backdrop-blur-xl border border-black/[0.07] border-l-0 rounded-r-2xl shadow-[2px_0_12px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-rose-50/80 transition-colors group"
            title="Open panel"
          >
            <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
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
