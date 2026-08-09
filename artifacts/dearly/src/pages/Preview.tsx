import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useLocation } from "wouter";
import { toPng } from "html-to-image";
import { Download, Share2, PenLine, Check } from "lucide-react";
import { useLetterStore } from "@/store/use-letter-store";
import { copyShareLink, decodeLetter, type LetterPayload } from "@/lib/letter-share";
import { PaperSurface } from "@/components/PaperSurface";
import { Sticker } from "@/components/Sticker";
import { WaxSeal } from "@/components/WaxSeal";
import { PostageStamp, Postmark } from "@/components/PostageStamp";
import { paperTheme } from "@/lib/paper-theme";
import { DUR, EASE, EASE_SOFT } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "envelope" | "opening" | "letter";

/** The reveal never takes longer than this, however long the letter is. */
const REVEAL_BUDGET = 2.2;
const REVEAL_START = 0.45;

export default function Preview() {
  const [, setLocation] = useLocation();
  const paperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>("envelope");
  const [skipReveal, setSkipReveal] = useState(false);
  const reduceMotion = useReducedMotion();

  // Envelope tilt follows the cursor while it is still sealed.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), {
    stiffness: 180,
    damping: 20,
  });
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 180,
    damping: 20,
  });

  const own = useLetterStore();

  /**
   * A letter arriving by link is held in local state rather than written into
   * the persisted store — otherwise opening a friend's letter would overwrite
   * whatever draft the reader had in progress.
   */
  const [shared, setShared] = useState<LetterPayload | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const decoded = decodeLetter(hash);
    if (decoded) setShared(decoded);
    else console.error("Failed to parse shared letter");
  }, []);

  const letter: LetterPayload = shared ?? {
    content: own.content,
    background: own.background,
    font: own.font,
    stickers: own.stickers,
  };

  const theme = paperTheme(letter.background);
  const isGuest = shared !== null;

  const handleOpenEnvelope = () => {
    if (phase !== "envelope") return;
    pointerX.set(0);
    pointerY.set(0);
    if (reduceMotion) {
      setPhase("letter");
      setSkipReveal(true);
      return;
    }
    setPhase("opening");
    setTimeout(() => setPhase("letter"), 1500);
  };

  const fontClasses = useMemo<Record<string, string>>(() => ({
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
  }), []);

  const handleDownload = useCallback(async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(paperRef.current, {
        pixelRatio: 2,
        cacheBust: true,
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
  }, []);

  const handleShare = useCallback(async () => {
    const ok = await copyShareLink(letter);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  }, [letter]);

  // ── Reveal timing ─────────────────────────────────────────────────────────
  // One running word index across the whole letter, with the per-word step
  // shrinking as the letter grows so the total never drags.
  const lines = useMemo(() => letter.content.split("\n"), [letter.content]);

  const wordCount = useMemo(
    () => lines.reduce((total, line) => total + line.split(" ").filter(Boolean).length, 0),
    [lines],
  );

  const step = wordCount > 0 ? Math.min(0.05, REVEAL_BUDGET / wordCount) : 0;

  const handleEnvelopePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "envelope" || reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a1018 0%, #150f1a 50%, #0e1018 100%)" }}
    >
      {/* Ambient glow, tinted by the letter's own paper */}
      <div
        className={cn("absolute inset-0 opacity-[0.07] blur-[80px] scale-110", `paper-bg-${letter.background}`)}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${theme.accent}1f 0%, transparent 70%)`,
        }}
      />

      {/* ── ACTION BUTTONS ── */}
      <AnimatePresence>
        {phase === "letter" && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, delay: 0.3, ease: EASE }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-wrap justify-end gap-2 max-w-[calc(100%-2rem)]"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLocation(isGuest ? "/" : "/write")}
              className="shadow-lg bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <PenLine size={14} />
              {isGuest ? "Write back" : "Edit"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="shadow-lg bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm w-32 justify-center"
            >
              {linkCopied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              {linkCopied ? "Copied!" : "Share Link"}
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="text-white shadow-lg"
              style={{ backgroundColor: theme.accent }}
            >
              {!isExporting && <Download size={14} />}
              {isExporting ? "Preparing… ✨" : "Save PNG"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ENVELOPE PHASE ── */}
      <AnimatePresence mode="wait">
        {(phase === "envelope" || phase === "opening") && (
          <motion.div
            key="envelope-scene"
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: DUR.slow, ease: EASE }}
            className="relative flex flex-col items-center z-10"
          >
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: phase === "envelope" ? 1 : 0, y: 0 }}
              transition={{ duration: DUR.theatrical, delay: 0.6 }}
              className="text-white/40 text-sm tracking-[0.25em] uppercase mb-10 font-light"
            >
              tap to open
            </motion.p>

            <div style={{ perspective: 1200 }}>
              <motion.div
                className="relative cursor-pointer select-none"
                style={{
                  width: 320,
                  height: 220,
                  transformStyle: "preserve-3d",
                  rotateX: tiltX,
                  rotateY: tiltY,
                }}
                onClick={handleOpenEnvelope}
                onPointerMove={handleEnvelopePointerMove}
                onPointerLeave={resetTilt}
                role="button"
                tabIndex={0}
                aria-label="Open the letter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenEnvelope();
                  }
                }}
              >
                {/* ── ENVELOPE BODY ── */}
                <motion.div
                  className="absolute inset-0 rounded-b-2xl rounded-t-sm overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]"
                  initial={reduceMotion ? false : { scale: 0.88, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: DUR.theatrical, ease: EASE, delay: 0.2 }}
                  style={{ background: theme.envelope.body }}
                >
                  {/* V-fold lines */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%),
                        linear-gradient(225deg, transparent 49.5%, rgba(0,0,0,0.06) 49.5%, rgba(0,0,0,0.06) 50.5%, transparent 50.5%)
                      `,
                    }}
                  />

                  {/* Addressed by hand */}
                  <div className="absolute left-6 bottom-7 pointer-events-none">
                    <div
                      className="font-cormorant text-[9px] tracking-[0.22em] uppercase mb-0.5"
                      style={{ color: theme.ink, opacity: 0.42 }}
                    >
                      to
                    </div>
                    <div
                      className="font-dancing text-xl leading-none"
                      style={{ color: theme.ink, opacity: 0.62 }}
                    >
                      you
                    </div>
                    <div
                      className="mt-1.5 h-px w-24"
                      style={{ background: theme.ink, opacity: 0.18 }}
                    />
                  </div>

                  {/* Postage, cancelled. Sits below the flap tip (y≈101) so the
                      closed flap never clips it. */}
                  <div className="absolute right-5 bottom-6 pointer-events-none">
                    <PostageStamp
                      width={52}
                      ink={theme.ink}
                      accent={theme.accent}
                      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                    />
                  </div>
                  <div className="absolute right-2 bottom-2 pointer-events-none overflow-hidden">
                    <Postmark size={76} ink={theme.ink} label="SENT WITH CARE" />
                  </div>
                </motion.div>

                {/* ── FLAP ── */}
                <motion.div
                  className="absolute left-0 right-0 top-0 z-20 pointer-events-none"
                  style={{
                    height: 130,
                    transformOrigin: "top center",
                    transformStyle: "preserve-3d",
                  }}
                  initial={{ rotateX: 0 }}
                  animate={phase === "opening" ? { rotateX: -178 } : { rotateX: 0 }}
                  transition={{ duration: DUR.theatrical, delay: 0.42, ease: EASE_SOFT }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 78%)",
                      background: theme.envelope.flap,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 78%)",
                      background: theme.envelope.liner,
                      transform: "rotateX(180deg) translateZ(0.5px)",
                      backfaceVisibility: "visible",
                    }}
                  />
                </motion.div>

                {/* ── WAX SEAL — breaks before the flap lifts ── */}
                <motion.div
                  className="absolute left-1/2 z-30 pointer-events-none"
                  style={{ top: 101, x: "-50%", y: "-50%" }}
                  initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={
                    phase === "opening"
                      ? { scale: [1, 1.16, 0.2], opacity: [1, 1, 0], rotate: [0, -6, 14] }
                      : { scale: 1, opacity: 1, rotate: 0 }
                  }
                  transition={
                    phase === "opening"
                      ? { duration: 0.42, ease: "easeIn" }
                      : { type: "spring", stiffness: 260, damping: 18, delay: 0.9 }
                  }
                >
                  <WaxSeal size={58} colors={theme.wax} monogram="D" />
                </motion.div>

                {/* ── LETTER SLIDING OUT ── */}
                <motion.div
                  className="absolute left-4 right-4 bottom-4 rounded-t-md overflow-hidden z-10 pointer-events-none shadow-[0_-4px_18px_rgba(0,0,0,0.25)]"
                  style={{ height: 90, background: theme.envelope.liner, transformOrigin: "bottom center" }}
                  initial={{ y: 0, opacity: 0, scaleX: 0.9 }}
                  animate={
                    phase === "opening"
                      ? { y: -78, opacity: 1, scaleX: 1 }
                      : { y: 0, opacity: 0, scaleX: 0.9 }
                  }
                  transition={{ duration: DUR.slow, delay: 0.85, ease: EASE }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LETTER PHASE ── */}
      <AnimatePresence>
        {phase === "letter" && (
          <motion.div
            key="letter-scene"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: DUR.theatrical, ease: EASE }}
            className="relative w-full max-w-2xl z-10 my-16"
          >
            <PaperSurface
              ref={paperRef}
              background={letter.background}
              creaseOpacity={0.7}
              onPointerDown={() => setSkipReveal(true)}
              className="w-full min-h-[750px] rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.5),0_8px_24px_rgba(0,0,0,0.25)]"
            >
              <div className={cn("relative z-10 p-8 sm:p-12 md:p-16 h-full", fontClasses[letter.font])}>
                <div className="whitespace-pre-wrap" style={{ color: theme.ink }}>
                  {(() => {
                    let running = 0;
                    return lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="min-h-[1.5em]">
                        {line.split(" ").map((word, wordIndex) => {
                          const delay = REVEAL_START + running * step;
                          if (word) running += 1;
                          return (
                            <motion.span
                              key={`${lineIndex}-${wordIndex}`}
                              initial={
                                reduceMotion || skipReveal ? false : { opacity: 0, y: 6 }
                              }
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: skipReveal ? 0 : 0.5,
                                delay: skipReveal ? 0 : delay,
                                ease: EASE,
                              }}
                              className="inline-block mr-[0.28em]"
                            >
                              {word}
                            </motion.span>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {letter.stickers.map((sticker, index) => (
                <Sticker
                  key={sticker.id}
                  sticker={sticker}
                  paperRef={paperRef}
                  isEditable={false}
                  revealDelay={skipReveal ? 0 : 0.35 + index * 0.09}
                />
              ))}
            </PaperSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
