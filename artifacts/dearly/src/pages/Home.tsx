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
    font: "sacramento" as FontType,
    hint: "for someone who means the world",
    accent: "#fadadd",
  },
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    background: "lavender" as BackgroundType,
    font: "dancing" as FontType,
    hint: "celebrate their special day",
    accent: "#e6e6fa",
  },
  {
    id: "apology",
    label: "Apology",
    emoji: "🫂",
    background: "vintage" as BackgroundType,
    font: "serif" as FontType,
    hint: "say what's hard to say",
    accent: "#f5ebdd",
  },
  {
    id: "gratitude",
    label: "Gratitude",
    emoji: "🌸",
    background: "cream" as BackgroundType,
    font: "dancing" as FontType,
    hint: "thank them from the heart",
    accent: "#fff8f5",
  },
];

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
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #fff8f5 0%, #fdf4f8 50%, #f5f0ff 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-pink-100/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-rose-100/40 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full"
      >
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="mb-10 text-4xl"
        >
          ✉️
        </motion.div>

        {/* Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground/80 leading-snug mb-2">
          Write something that
        </h1>
        <p className="font-dancing text-5xl sm:text-6xl text-primary mb-4 leading-tight">
          feels like you
        </p>
        <p className="text-sm text-muted-foreground mb-12 tracking-wide font-light">
          Choose a mood to begin
        </p>

        {/* Occasion cards */}
        <div className="grid grid-cols-2 gap-3 w-full mb-10">
          {OCCASIONS.map((occasion, i) => (
            <motion.button
              key={occasion.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
              onClick={() => handleOccasion(occasion)}
              className="group relative flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-[20px] border border-white/80 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {occasion.emoji}
              </span>
              <span className="font-serif text-base text-foreground/80">{occasion.label}</span>
              <span className="text-[10px] text-muted-foreground font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {occasion.hint}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Or just start */}
        <button
          onClick={() => setLocation("/write")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 tracking-wide underline underline-offset-4 decoration-muted"
        >
          or just start writing →
        </button>
      </motion.div>
    </div>
  );
}
