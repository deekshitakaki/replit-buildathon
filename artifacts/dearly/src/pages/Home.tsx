import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useLetterStore } from "@/store/use-letter-store";
import type { BackgroundType, FontType } from "@/store/use-letter-store";

const OCCASIONS = [
  {
    id: "love",
    label: "Love",
    emoji: "💖",
    background: "blush" as BackgroundType,
    font: "greatvibes" as FontType,
    hint: "for someone who means the world",
    gradient: "from-rose-50/80 to-pink-50/60",
    border: "border-rose-200/50",
    glow: "hover:shadow-rose-100/60",
  },
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    background: "lavender" as BackgroundType,
    font: "dancing" as FontType,
    hint: "celebrate their special day",
    gradient: "from-violet-50/80 to-purple-50/60",
    border: "border-violet-200/50",
    glow: "hover:shadow-violet-100/60",
  },
  {
    id: "apology",
    label: "Apology",
    emoji: "🫂",
    background: "vintage" as BackgroundType,
    font: "cormorant" as FontType,
    hint: "say what's hard to say",
    gradient: "from-amber-50/80 to-orange-50/60",
    border: "border-amber-200/50",
    glow: "hover:shadow-amber-100/60",
  },
  {
    id: "gratitude",
    label: "Gratitude",
    emoji: "🌸",
    background: "cream" as BackgroundType,
    font: "sacramento" as FontType,
    hint: "thank them from the heart",
    gradient: "from-emerald-50/80 to-teal-50/60",
    border: "border-emerald-200/50",
    glow: "hover:shadow-emerald-100/60",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
};
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { setBackground, setFont, setContent } = useLetterStore();

  const handleOccasion = (occasion: typeof OCCASIONS[number]) => {
    setBackground(occasion.background);
    setFont(occasion.font);
    setContent("");
    setLocation("/write");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: [
          "radial-gradient(ellipse 80% 60% at 15% 10%, #ffd6e4 0%, transparent 55%)",
          "radial-gradient(ellipse 70% 55% at 88% 15%, #e8e0ff 0%, transparent 55%)",
          "radial-gradient(ellipse 60% 50% at 50% 95%, #ffecd6 0%, transparent 55%)",
          "radial-gradient(ellipse 90% 80% at 50% 50%, #fff4f8 0%, transparent 70%)",
          "#fdf8f5",
        ].join(", "),
      }}
    >
      {/* Floating ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[8%] left-[12%] w-64 h-64 rounded-full bg-pink-200/30 blur-[80px]"
        />
        <motion.div
          animate={{ y: [0, 14, 0], x: [0, -8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[12%] right-[10%] w-80 h-80 rounded-full bg-purple-200/25 blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[45%] left-[55%] w-48 h-48 rounded-full bg-rose-100/30 blur-[60px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
      >
        {/* Brand title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <span
            className="font-cormorant italic"
            style={{
              fontSize: "clamp(32px, 5vw, 46px)",
              color: "hsl(20 25% 38%)",
              letterSpacing: "0.12em",
              fontWeight: 400,
            }}
          >
            Dearly
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground/75 leading-snug mb-1 tracking-tight">
            Write something that
          </h1>
          <p className="font-dancing text-5xl sm:text-6xl text-primary mb-5 leading-tight">
            feels like you
          </p>
          <p className="text-xs text-muted-foreground/70 mb-10 tracking-[0.2em] uppercase font-light">
            Choose a mood to begin
          </p>
        </motion.div>

        {/* Occasion cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 w-full mb-8"
        >
          {OCCASIONS.map((occasion) => (
            <motion.button
              key={occasion.id}
              variants={item}
              onClick={() => handleOccasion(occasion)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`
                group relative flex flex-col items-center justify-center gap-2.5
                py-7 px-4 rounded-[18px] cursor-pointer
                bg-gradient-to-br ${occasion.gradient}
                border ${occasion.border}
                backdrop-blur-md
                shadow-sm hover:shadow-lg ${occasion.glow}
                transition-shadow duration-300
              `}
            >
              <motion.span
                className="text-3xl"
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                {occasion.emoji}
              </motion.span>
              <span className="font-serif text-sm text-foreground/75 tracking-wide">
                {occasion.label}
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-light tracking-wide leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[90%]">
                {occasion.hint}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Plain start */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          onClick={() => setLocation("/write")}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 tracking-[0.15em] uppercase"
        >
          or just start writing →
        </motion.button>
      </motion.div>
    </div>
  );
}
