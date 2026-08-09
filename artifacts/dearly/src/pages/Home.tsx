import { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useLocation } from "wouter";
import { useLetterStore } from "@/store/use-letter-store";
import type { BackgroundType, FontType } from "@/store/use-letter-store";
import { MessageToCreator } from "@/components/MessageToCreator";
import { paperTheme } from "@/lib/paper-theme";
import { DUR, EASE, SPRING } from "@/lib/motion";

interface Occasion {
  id: string;
  label: string;
  emoji: string;
  background: BackgroundType;
  font: FontType;
  hint: string;
}

const OCCASIONS: Occasion[] = [
  {
    id: "love",
    label: "Love",
    emoji: "💖",
    background: "blush",
    font: "greatvibes",
    hint: "for someone who means the world",
  },
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    background: "lavender",
    font: "dancing",
    hint: "celebrate their special day",
  },
  {
    id: "apology",
    label: "Apology",
    emoji: "🫂",
    background: "vintage",
    font: "cormorant",
    hint: "say what's hard to say",
  },
  {
    id: "gratitude",
    label: "Gratitude",
    emoji: "🌸",
    background: "cream",
    font: "sacramento",
    hint: "thank them from the heart",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { setBackground, setFont, setContent } = useLetterStore();
  const [noteOpen, setNoteOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleOccasion = (occasion: Occasion) => {
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
      {!reduceMotion && (
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
      )}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.theatrical }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl w-full"
      >
        {/* Brand title */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.theatrical, delay: 0.05, ease: EASE }}
          className="mb-8 text-center"
        >
          <span
            className="font-cormorant italic"
            style={{
              fontSize: "clamp(32px, 5vw, 46px)",
              color: "hsl(24 22% 30%)",
              letterSpacing: "0.12em",
              fontWeight: 400,
            }}
          >
            Dearly
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        >
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground/75 leading-snug mb-1 tracking-tight">
            Write something that
          </h1>
          <p className="font-dancing text-5xl sm:text-6xl text-primary mb-5 leading-tight">
            feels like you
          </p>
          <p className="text-xs text-muted-foreground/70 mb-6 tracking-[0.2em] uppercase font-light">
            Choose a mood to begin
          </p>
        </motion.div>

        {/* Occasion cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8"
        >
          {OCCASIONS.map((occasion) => (
            <OccasionCard
              key={occasion.id}
              occasion={occasion}
              onSelect={handleOccasion}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </motion.div>

        {/* Plain start */}
        <motion.button
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          onClick={() => setLocation("/write")}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200 tracking-[0.15em] uppercase"
        >
          or just start writing →
        </motion.button>
      </motion.div>

      {/* A note to the maker */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-0 right-0 z-10 flex justify-center px-6"
      >
        <button
          onClick={() => setNoteOpen(true)}
          className="group font-cormorant italic text-sm text-muted-foreground/70 hover:text-foreground/80 transition-colors"
        >
          made by hand ·{" "}
          <span className="underline decoration-dotted underline-offset-4 decoration-muted-foreground/40 group-hover:decoration-foreground/40">
            leave me a note
          </span>
        </button>
      </motion.div>

      <MessageToCreator open={noteOpen} onClose={() => setNoteOpen(false)} />
    </div>
  );
}

/**
 * Cards tilt towards the cursor in 3D. The rotation is driven by springs so it
 * trails the pointer slightly rather than tracking it rigidly.
 */
function OccasionCard({
  occasion,
  onSelect,
  reduceMotion,
}: {
  occasion: Occasion;
  onSelect: (occasion: Occasion) => void;
  reduceMotion: boolean;
}) {
  const theme = paperTheme(occasion.background);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [9, -9]), SPRING.crisp);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-11, 11]), SPRING.crisp);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.button
      variants={item}
      onClick={() => onSelect(occasion)}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      title={occasion.hint}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 700,
        boxShadow: `0 2px 16px ${theme.accent}1f`,
      }}
      className="group relative flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl cursor-pointer bg-white/35 backdrop-blur-xl border border-white/60 hover:bg-white/55 transition-colors duration-300 w-full"
    >
      {/* Accent bloom that warms up on hover */}
      <span
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 120%, ${theme.accentSoft}, transparent 70%)` }}
      />

      <motion.span
        className="relative text-2xl"
        whileHover={reduceMotion ? undefined : { scale: 1.18, rotate: -6 }}
        transition={SPRING.crisp}
      >
        {occasion.emoji}
      </motion.span>
      <span
        className="relative font-serif text-xs tracking-wide transition-colors duration-300"
        style={{ color: theme.ink }}
      >
        {occasion.label}
      </span>
    </motion.button>
  );
}
