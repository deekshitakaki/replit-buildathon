import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Type, Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLetterStore, BackgroundType, FontType } from "@/store/use-letter-store";
import { paperTheme } from "@/lib/paper-theme";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Swatches render the real paper class so the preview matches the letter.
const BACKGROUNDS: { id: BackgroundType; name: string }[] = [
  { id: 'cream',      name: 'Cream'      },
  { id: 'blush',      name: 'Blush'      },
  { id: 'rose',       name: 'Rose'       },
  { id: 'lavender',   name: 'Lavender'   },
  { id: 'vintage',    name: 'Vintage'    },
  { id: 'kraft',      name: 'Kraft'      },
  { id: 'floral',     name: 'Floral'     },
  { id: 'party',      name: 'Party'      },
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'grid',       name: 'Journal'    },
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
  { label: 'Birthday', emojis: ['🎂', '🎈', '🎉', '🥳', '🎊', '🎁', '🍰', '🎆'] },
  { label: 'Flowers',  emojis: ['🌸', '🌷', '🌹', '🪷', '🌼', '💐', '🌺', '🌻'] },
  { label: 'Hearts',   emojis: ['🩷', '💕', '💖', '💗', '💓', '💌', '🤍', '💝'] },
  { label: 'Nature',   emojis: ['🍃', '🌿', '🍂', '🌾', '🌙', '☁️', '🌈', '❄️'] },
  { label: 'Sparkle',  emojis: ['✨', '⭐', '🌟', '💫', '🕊️', '🦋', '🎀', '🧸'] },
];

export function FloatingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bg' | 'font' | 'stickers'>('stickers');
  const { background, font, setBackground, setFont, addSticker } = useLetterStore();

  return (
    <>
      {/* Desktop side panel */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -252,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="hidden md:flex fixed left-4 top-20 bottom-20 w-56 bg-white/92 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] z-40 flex-col overflow-hidden"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -right-px top-1/2 -translate-y-1/2 w-5 h-12 bg-white/80 border border-black/[0.07] border-l-0 rounded-r-lg flex items-center justify-center hover:bg-rose-50 transition-colors z-50 shadow-sm"
          title="Close panel"
        >
          <ChevronLeft size={13} className="text-muted-foreground" />
        </button>

        <div className="flex p-2 gap-1 bg-white/50">
          <TabButton active={activeTab === 'stickers'} onClick={() => setActiveTab('stickers')} icon={<Sparkles size={16} />} label="Stickers" />
          <TabButton active={activeTab === 'font'}     onClick={() => setActiveTab('font')}     icon={<Type size={16} />}     label="Font"     />
          <TabButton active={activeTab === 'bg'}       onClick={() => setActiveTab('bg')}       icon={<Paintbrush size={16} />} label="Paper"  />
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-black/[0.05] to-transparent" />

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <PanelContent
            activeTab={activeTab}
            background={background}
            font={font}
            setBackground={setBackground}
            setFont={setFont}
            addSticker={addSticker}
          />
        </div>
      </motion.div>

      {/* Desktop reopen handle */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="reopen-desktop"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={() => setIsOpen(true)}
            className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 w-8 h-20 bg-white/90 backdrop-blur-xl border border-black/[0.07] border-l-0 rounded-r-2xl shadow-[2px_0_12px_rgba(0,0,0,0.08)] items-center justify-center hover:bg-rose-50/80 transition-colors group"
            title="Open panel"
          >
            <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet trigger + sheet */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_28px_rgba(0,0,0,0.12)] text-sm font-medium text-foreground/80"
        >
          <Sparkles size={15} className="text-primary" />
          Style letter
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/25 z-50"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 34 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col"
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-black/10 mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                  <div className="flex-1" />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-black/5 text-muted-foreground"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex px-3 pb-2 gap-1">
                  <TabButton active={activeTab === 'stickers'} onClick={() => setActiveTab('stickers')} icon={<Sparkles size={16} />} label="Stickers" />
                  <TabButton active={activeTab === 'font'}     onClick={() => setActiveTab('font')}     icon={<Type size={16} />}     label="Font"     />
                  <TabButton active={activeTab === 'bg'}       onClick={() => setActiveTab('bg')}       icon={<Paintbrush size={16} />} label="Paper"  />
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
                  <PanelContent
                    activeTab={activeTab}
                    background={background}
                    font={font}
                    setBackground={setBackground}
                    setFont={setFont}
                    addSticker={(emoji) => {
                      addSticker(emoji);
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function PanelContent({
  activeTab,
  background,
  font,
  setBackground,
  setFont,
  addSticker,
}: {
  activeTab: 'bg' | 'font' | 'stickers';
  background: BackgroundType;
  font: FontType;
  setBackground: (bg: BackgroundType) => void;
  setFont: (font: FontType) => void;
  addSticker: (emoji: string) => void;
}) {
  return (
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
          {BACKGROUNDS.map((bg) => {
            const theme = paperTheme(bg.id);
            const isActive = background === bg.id;
            return (
              <motion.button
                key={bg.id}
                onClick={() => setBackground(bg.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING.crisp}
                title={bg.name}
                style={{
                  borderColor: isActive ? theme.accent : undefined,
                  boxShadow: isActive
                    ? `0 0 0 3px ${theme.accentSoft}, 0 4px 14px ${theme.accent}33`
                    : undefined,
                }}
                className={cn(
                  "aspect-[4/3] rounded-2xl border-2 shadow-sm transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden",
                  `paper-bg-${bg.id}`,
                  !isActive && "border-black/5 hover:border-black/10"
                )}
              >
                <span
                  className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm"
                  style={{ color: theme.ink }}
                >
                  {bg.name}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
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
