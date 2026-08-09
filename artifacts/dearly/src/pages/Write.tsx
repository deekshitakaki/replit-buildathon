import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, Wand2, Download, Share2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { FloatingPanel } from "@/components/FloatingPanel";
import { PaperSurface } from "@/components/PaperSurface";
import { Sticker } from "@/components/Sticker";
import { useLetterStore } from "@/store/use-letter-store";
import { copyShareLink } from "@/lib/letter-share";
import { paperTheme } from "@/lib/paper-theme";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FONT_CLASSES: Record<string, string> = {
  greatvibes:  "font-greatvibes text-3xl sm:text-4xl leading-relaxed",
  dancing:     "font-dancing text-2xl sm:text-3xl leading-relaxed",
  sacramento:  "font-sacramento text-3xl sm:text-4xl leading-relaxed",
  parisienne:  "font-parisienne text-2xl sm:text-3xl leading-relaxed",
  allura:      "font-allura text-3xl sm:text-4xl leading-relaxed",
  satisfy:     "font-satisfy text-2xl sm:text-3xl leading-relaxed",
  cormorant:   "font-cormorant text-xl sm:text-2xl italic leading-loose",
  serif:       "font-serif text-lg sm:text-xl leading-loose",
  baskerville: "font-baskerville text-base sm:text-lg leading-loose",
  sans:        "font-sans text-base sm:text-lg leading-loose",
};

export default function Write() {
  const [, setLocation] = useLocation();
  const paperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const prevStickerCount = useRef(0);
  const reduceMotion = useReducedMotion();

  const { content, background, font, stickers, setContent, makeItBeautiful } = useLetterStore();
  const theme = paperTheme(background);

  useEffect(() => {
    if (stickers.length > prevStickerCount.current) {
      setSelectedStickerId(stickers[stickers.length - 1]?.id ?? null);
    }
    prevStickerCount.current = stickers.length;
  }, [stickers]);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(400, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [content, font]);

  const handleBeautify = useCallback(() => {
    setIsBeautifying(true);
    setSelectedStickerId(null);
    makeItBeautiful();
    setTimeout(() => setIsBeautifying(false), 900);
  }, [makeItBeautiful]);

  const handleDownload = useCallback(async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    setExportFailed(false);
    try {
      const dataUrl = await toPng(paperRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        // Prefer current CSS so Google Fonts render in the PNG
        skipFonts: false,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "dearly-letter.png";
      a.click();
    } catch (err) {
      console.error("Export failed", err);
      setExportFailed(true);
      setTimeout(() => setExportFailed(false), 3000);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const state = useLetterStore.getState();
    const ok = await copyShareLink({
      content: state.content,
      background: state.background,
      font: state.font,
      stickers: state.stickers,
    });
    if (ok) {
      setLinkCopied(true);
      setShareFailed(false);
      setTimeout(() => setLinkCopied(false), 3000);
    } else {
      setShareFailed(true);
      setTimeout(() => setShareFailed(false), 3000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white/70 backdrop-blur-xl flex items-center justify-between gap-2 px-3 sm:px-8 py-3 sm:py-4 z-30 sticky top-0 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <Link href="/">
          <div className="font-cormorant italic text-xl sm:text-2xl text-foreground/80 cursor-pointer hover:text-foreground transition-colors tracking-[0.08em] shrink-0">
            Dearly
          </div>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={handleBeautify}
            disabled={isBeautifying}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-black/5 transition-all duration-200 disabled:cursor-not-allowed shrink-0"
            title="Make it beautiful"
          >
            <motion.span
              animate={isBeautifying && !reduceMotion ? { rotate: [0, 20, -20, 20, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="inline-flex"
              style={{ color: theme.accent }}
            >
              <Wand2 size={14} />
            </motion.span>
            <span className="hidden sm:inline">
              {isBeautifying ? "Styling…" : "Make it beautiful"}
            </span>
          </button>

          <div className="hidden sm:block w-px h-4 bg-black/10 mx-1" />

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-black/5 transition-all duration-200 min-w-0 sm:min-w-[108px] justify-center shrink-0"
            title="Share link"
          >
            {linkCopied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span className="hidden sm:inline">
              {shareFailed ? "Failed" : linkCopied ? "Copied!" : "Share Link"}
            </span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-black/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title="Save PNG"
          >
            <Download size={14} />
            <span className="hidden sm:inline">
              {exportFailed ? "Failed" : isExporting ? "Saving…" : "Save PNG"}
            </span>
          </button>

          <div className="hidden sm:block w-px h-4 bg-black/10 mx-1" />

          <motion.button
            onClick={() => setLocation("/preview")}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white rounded-full transition-colors duration-300 shadow-sm shrink-0"
            style={{ backgroundColor: theme.accent }}
          >
            <Eye size={14} />
            <span className="hidden xs:inline sm:inline">Preview</span>
          </motion.button>
        </div>
      </header>

      <FloatingPanel />

      {/* Main Canvas Area */}
      <main className="flex-1 overflow-y-auto pt-4 sm:pt-14 pb-36 sm:pb-32 flex justify-center custom-scrollbar px-4 sm:px-8 md:pl-16 md:pr-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className="relative w-full max-w-2xl"
        >
          <motion.div
            animate={isBeautifying && !reduceMotion ? { scale: [1, 1.008, 1] } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <PaperSurface
              ref={paperRef}
              background={background}
              onPointerDown={() => setSelectedStickerId(null)}
              className="w-full min-h-[560px] sm:min-h-[750px] rounded-[16px] sm:rounded-[20px] shadow-[0_12px_56px_rgba(139,90,60,0.14),0_4px_16px_rgba(139,90,60,0.08)]"
            >
              <div className="relative z-10 p-6 sm:p-12 md:p-16 h-full flex flex-col">
                <label htmlFor="letter-body" className="sr-only">
                  Your letter
                </label>
                <textarea
                  id="letter-body"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    handleInput();
                  }}
                  placeholder="My dearest..."
                  className={cn(
                    "paper-input w-full bg-transparent resize-none outline-none no-scrollbar transition-[font-family,font-size,color] duration-500",
                    FONT_CLASSES[font]
                  )}
                  spellCheck={false}
                />
              </div>

              {stickers.map((sticker) => (
                <Sticker
                  key={sticker.id}
                  sticker={sticker}
                  paperRef={paperRef}
                  isEditable={true}
                  selectedId={selectedStickerId}
                  onSelect={setSelectedStickerId}
                />
              ))}

              {/* Specular sweep while "Make it beautiful" restyles the letter */}
              <AnimatePresence>
                {isBeautifying && !reduceMotion && (
                  <motion.div
                    key="shimmer"
                    className="paper-shimmer absolute top-[-25%] bottom-[-25%] left-0 w-[60%] z-40 pointer-events-none"
                    initial={{ x: "-120%", opacity: 0 }}
                    animate={{ x: "260%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>
            </PaperSurface>
          </motion.div>

          <div className="text-center mt-6 sm:mt-8 text-xs text-muted-foreground/60 tracking-wide">
            Tap sticker to select · drag to move · handles to resize &amp; rotate
          </div>
        </motion.div>
      </main>
    </div>
  );
}
