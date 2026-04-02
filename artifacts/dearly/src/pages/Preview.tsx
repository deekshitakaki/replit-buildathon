import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { toPng } from "html-to-image";
import { Download, Share2, Edit2, Check } from "lucide-react";
import { useLetterStore } from "@/store/use-letter-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "envelope" | "opening" | "letter";

export default function Preview() {
  const [, setLocation] = useLocation();
  const paperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>("envelope");

  const { content, background, font, stickers, loadFromEncodedData } = useLetterStore();

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      loadFromEncodedData(hash);
    }
  }, []);

  const handleOpenEnvelope = () => {
    if (phase !== "envelope") return;
    setPhase("opening");
    // After flap fully opens, transition to letter
    setTimeout(() => setPhase("letter"), 1400);
    // Show action buttons after text has had time to appear
    setTimeout(() => setShowUI(true), 4000);
  };

  const fontClasses: Record<string, string> = {
    greatvibes:  "font-greatvibes text-4xl leading-relaxed",
    dancing:     "font-dancing text-3xl leading-relaxed",
    sacramento:  "font-sacramento text-4xl leading-relaxed",
    parisienne:  "font-parisienne text-3xl leading-relaxed",
    allura:      "font-allura text-4xl leading-relaxed",
    satisfy:     "font-satisfy text-3xl leading-relaxed",
    cormorant:   "font-cormorant text-2xl italic leading-loose",
    serif:       "font-serif text-xl leading-loose",
    baskerville: "font-baskerville text-lg leading-loose",
    sans:        "font-sans text-lg leading-loose",
  };

  const handleDownload = async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(paperRef.current, {
        pixelRatio: 2,
        skipFonts: false,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "dearly-letter.png";
      a.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    const state = useLetterStore.getState();
    const dataToShare = {
      content: state.content,
      background: state.background,
      font: state.font,
      stickers: state.stickers,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(dataToShare)));
    const origin = window.location.origin;
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${origin}${basePath}/preview#${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };

  const paragraphs = content.split("\n");

  // Envelope paper color based on background selection
  const envelopeColors: Record<string, { body: string; flap: string; liner: string }> = {
    cream:    { body: "#f5ede0", flap: "#eddfc8", liner: "#fdf8f2" },
    blush:    { body: "#f5d6db", flap: "#edccd2", liner: "#fff0f3" },
    lavender: { body: "#dbd3f0", flap: "#cec4e8", liner: "#f5f0ff" },
    vintage:  { body: "#e8dcc8", flap: "#ddd0b8", liner: "#fdf6e3" },
    floral:   { body: "#f0dde2", flap: "#e8d0d6", liner: "#fdf8f2" },
    grid:     { body: "#e8e0d5", flap: "#ddd5c8", liner: "#fdfaf7" },
  };
  const env = envelopeColors[background] ?? envelopeColors.cream;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a1018 0%, #150f1a 50%, #0e1018 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.07] blur-[80px] scale-110 transition-opacity duration-2000",
          `paper-bg-${background}`
        )}
      />
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(255,220,200,0.06) 0%, transparent 70%)"
        }}
      />

      {/* ── ACTION BUTTONS ── */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-6 right-6 z-50 flex gap-2"
          >
            <Button variant="secondary" size="sm" onClick={() => setLocation("/write")} className="shadow-lg bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm">
              <Edit2 size={14} />
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={handleShare} className="shadow-lg bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm w-32 justify-center">
              {linkCopied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              {linkCopied ? "Copied!" : "Share Link"}
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="bg-primary/90 hover:bg-primary text-white shadow-lg shadow-primary/20"
            >
              {!isExporting && <Download size={14} />}
              {isExporting ? "Preparing... ✨" : "Save PNG"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ENVELOPE PHASE ── */}
      <AnimatePresence mode="wait">
        {(phase === "envelope" || phase === "opening") && (
          <motion.div
            key="envelope-scene"
            exit={{ opacity: 0, scale: 0.92, y: 30, filter: "blur(8px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center z-10"
          >
            {/* Hint text */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: phase === "envelope" ? 1 : 0 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="text-white/40 text-sm tracking-widest uppercase mb-10 font-light"
            >
              tap to open
            </motion.p>

            {/* Envelope wrapper — perspective for 3D flap */}
            <div
              className="relative cursor-pointer select-none"
              style={{ width: 320, height: 220 }}
              onClick={handleOpenEnvelope}
            >
              {/* ── ENVELOPE BODY ── */}
              <motion.div
                className="absolute inset-0 rounded-b-2xl rounded-t-sm overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]"
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                style={{ background: env.body }}
                whileHover={phase === "envelope" ? { scale: 1.02, y: -2 } : {}}
              >
                {/* V-fold bottom lines */}
                <div className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
                      linear-gradient(225deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%)
                    `,
                  }}
                />

                {/* Envelope seal / heart */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-2xl pointer-events-none z-10"
                  animate={phase === "opening" ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] } : {}}
                  transition={{ duration: 0.5, delay: 0.3, ease: "easeIn" }}
                >
                  🤍
                </motion.div>
              </motion.div>

              {/* ── FLAP (top triangle that lifts open) ── */}
              {/* The flap rotates around its top edge (transformOrigin: top center) */}
              <motion.div
                className="absolute left-0 right-0 top-0 z-20 pointer-events-none"
                style={{
                  height: 130,
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                }}
                initial={{ rotateX: 0 }}
                animate={
                  phase === "opening"
                    ? { rotateX: -178 }
                    : { rotateX: 0 }
                }
                transition={{
                  duration: 1.1,
                  delay: 0.15,
                  ease: [0.34, 0, 0.2, 1],
                }}
              >
                {/* Front face of flap (visible when closed) */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 78%)",
                    background: env.flap,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  }}
                />
                {/* Back face of flap (liner, visible when open) */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 78%)",
                    background: env.liner,
                    transform: "rotateX(180deg) translateZ(0.5px)",
                    backfaceVisibility: "visible",
                  }}
                />
              </motion.div>

              {/* ── LETTER PEEK (slides up out of envelope as it opens) ── */}
              <motion.div
                className="absolute left-4 right-4 bottom-4 rounded-t-md overflow-hidden z-5 pointer-events-none"
                style={{ height: 80, background: env.liner, transformOrigin: "bottom center" }}
                initial={{ y: 0, opacity: 0, scaleX: 0.9 }}
                animate={
                  phase === "opening"
                    ? { y: -60, opacity: 1, scaleX: 1 }
                    : { y: 0, opacity: 0, scaleX: 0.9 }
                }
                transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LETTER PHASE ── */}
      <AnimatePresence>
        {phase === "letter" && (
          <motion.div
            key="letter-scene"
            initial={{ opacity: 0, scale: 0.92, y: 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl z-10 my-16"
          >
            <div
              ref={paperRef}
              className={cn(
                "w-full min-h-[750px] rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.25)] relative overflow-hidden",
                `paper-bg-${background}`
              )}
            >
              {/* Texture */}
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E")`,
                }}
              />
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.03)] pointer-events-none" />

              {/* Text — staggered fade-in word by word */}
              <div className={cn("relative z-10 p-8 sm:p-12 md:p-16 h-full", fontClasses[font])}>
                <div className="whitespace-pre-wrap text-foreground/90">
                  {paragraphs.map((para, pIdx) => (
                    <div key={pIdx} className="min-h-[1.5em]">
                      {para.split(" ").map((word, wIdx) => (
                        <motion.span
                          key={`${pIdx}-${wIdx}`}
                          initial={{ opacity: 0, filter: "blur(5px)", y: 4 }}
                          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                          transition={{
                            duration: 0.9,
                            delay: 0.6 + pIdx * 0.45 + wIdx * 0.055,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="inline-block mr-[0.28em]"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stickers — spring in after text */}
              {stickers.map((sticker, i) => (
                <motion.div
                  key={sticker.id}
                  initial={{ scale: 0, opacity: 0, rotate: sticker.rotation - 30 }}
                  animate={{ scale: sticker.scale, opacity: 1, rotate: sticker.rotation }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 16,
                    delay: 1.4 + paragraphs.length * 0.18 + i * 0.12,
                  }}
                  className="absolute pointer-events-none"
                  style={{ x: sticker.x, y: sticker.y }}
                >
                  <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
