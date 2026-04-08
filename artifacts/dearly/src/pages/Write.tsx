import { useCallback, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, Wand2, Download, Share2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { FloatingPanel } from "@/components/FloatingPanel";
import { Sticker } from "@/components/Sticker";
import { useLetterStore } from "@/store/use-letter-store";
import { cn } from "@/lib/utils";

export default function Write() {
  const [_, setLocation] = useLocation();
  const paperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { content, background, font, stickers, setContent, makeItBeautiful } = useLetterStore();

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

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(400, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [content, font]);

  const handleDownload = useCallback(async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(paperRef.current, { pixelRatio: 2, skipFonts: false });
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

  const handleShare = useCallback(() => {
    const state = useLetterStore.getState();
    const encoded = btoa(encodeURIComponent(JSON.stringify({
      content: state.content,
      background: state.background,
      font: state.font,
      stickers: state.stickers,
    })));
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${window.location.origin}${basePath}/preview#${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white/70 backdrop-blur-xl flex items-center justify-between px-8 py-4 z-30 sticky top-0 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <Link href="/">
          <div className="font-serif italic font-semibold text-xl text-foreground/80 cursor-pointer hover:text-foreground transition-colors tracking-wide">
            Dearly
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={makeItBeautiful}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-black/5 transition-all duration-200"
          >
            <Wand2 size={14} />
            Make it beautiful
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-black/10 mx-1" />

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-black/5 transition-all duration-200 min-w-[108px] justify-center"
          >
            {linkCopied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            {linkCopied ? "Copied!" : "Share Link"}
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground rounded-full hover:bg-black/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {isExporting ? "Saving…" : "Save PNG"}
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-black/10 mx-1" />

          <button
            onClick={() => setLocation("/preview")}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-foreground text-background rounded-full hover:bg-foreground/90 transition-all duration-200 shadow-sm"
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </header>

      <FloatingPanel />

      {/* Main Canvas Area */}
      <main className="flex-1 overflow-y-auto pt-14 pb-32 flex justify-center custom-scrollbar" style={{ paddingLeft: "max(2rem, calc(240px + 2rem))", paddingRight: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-2xl"
        >
          {/* The Paper */}
          <div
            ref={paperRef}
            className={cn(
              "w-full min-h-[750px] rounded-[20px] shadow-[0_12px_56px_rgba(139,90,60,0.14),0_4px_16px_rgba(139,90,60,0.08)] relative overflow-hidden transition-colors duration-500",
              `paper-bg-${background}`
            )}
          >
            {/* Grain/texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E")` }}
            />
            {/* Soft inner shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12 md:p-16 h-full flex flex-col">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleInput();
                }}
                placeholder="My dearest..."
                className={cn(
                  "w-full bg-transparent resize-none outline-none text-foreground/90 placeholder:text-muted-foreground/40 no-scrollbar selection:bg-primary/20",
                  fontClasses[font]
                )}
                spellCheck={false}
              />
            </div>

            {/* Render Stickers */}
            {stickers.map((sticker) => (
              <Sticker
                key={sticker.id}
                sticker={sticker}
                paperRef={paperRef}
                isEditable={true}
              />
            ))}
          </div>

          <div className="text-center mt-8 text-xs text-muted-foreground/50 tracking-wide">
            Click stickers to add · drag to position
          </div>
        </motion.div>
      </main>
    </div>
  );
}
