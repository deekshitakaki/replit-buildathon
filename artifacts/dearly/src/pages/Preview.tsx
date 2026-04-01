import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { toPng } from "html-to-image";
import { Download, Share2, Edit2, Check } from "lucide-react";
import { useLetterStore } from "@/store/use-letter-store";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Preview() {
  const [_, setLocation] = useLocation();
  const paperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const { content, background, font, stickers, loadFromEncodedData } = useLetterStore();

  // Handle loading shared URL
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      loadFromEncodedData(hash);
    }
  }, []);

  // Reveal sequence
  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), 2500); // Show UI after initial paper/text reveal
    return () => clearTimeout(timer);
  }, []);

  const fontClasses = {
    dancing: "font-dancing text-3xl leading-relaxed",
    sacramento: "font-sacramento text-4xl leading-relaxed",
    satisfy: "font-satisfy text-3xl leading-relaxed",
    sans: "font-sans text-lg leading-loose",
    serif: "font-serif text-xl leading-loose",
  };

  const handleDownload = async () => {
    if (!paperRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(paperRef.current, { 
        pixelRatio: 2,
        skipFonts: false,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'dearly-letter.png';
      a.click();
    } catch (err) {
      console.error('Export failed', err);
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
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const url = `${origin}${basePath}/preview#${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };

  // Split content for staggered typewriting effect
  // We split by paragraphs, then words for a very organic feel
  const paragraphs = content.split('\n');

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      
      {/* Background ambient glow matching the paper */}
      <div 
        className={cn(
          "absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000",
          `paper-bg-${background}`
        )} 
      />

      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 right-6 z-50 flex gap-3"
          >
            <Button variant="secondary" onClick={() => setLocation('/write')} className="shadow-lg">
              <Edit2 size={16} />
              Edit
            </Button>
            <Button variant="secondary" onClick={handleShare} className="shadow-lg w-32 justify-center">
              {linkCopied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
              {linkCopied ? "Copied!" : "Share Link"}
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-105"
            >
              {!isExporting && <Download size={16} />}
              {isExporting ? "Preparing your letter... ✨" : "Save PNG"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl z-10 my-16"
      >
        <div 
          ref={paperRef}
          className={cn(
            "w-full min-h-[750px] rounded-lg shadow-[0_8px_40px_rgba(139,90,60,0.12),0_2px_8px_rgba(139,90,60,0.06)] relative overflow-hidden",
            `paper-bg-${background}`
          )}
        >
          {/* Grain/texture overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-0" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E")` }}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.03)] pointer-events-none" />

          <div className={cn("relative z-10 p-8 sm:p-12 md:p-16 h-full", fontClasses[font])}>
            <div className="whitespace-pre-wrap text-foreground/90">
              {paragraphs.map((para, pIdx) => (
                <div key={pIdx} className="min-h-[1.5em]">
                  {para.split(' ').map((word, wIdx) => (
                    <motion.span
                      key={`${pIdx}-${wIdx}`}
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.5 + (pIdx * 0.5) + (wIdx * 0.05), // Staggered reveal
                        ease: "easeOut"
                      }}
                      className="inline-block mr-2"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Stickers pop in last */}
          {stickers.map((sticker, i) => (
            <motion.div
              key={sticker.id}
              initial={{ scale: 0, opacity: 0, rotate: sticker.rotation - 45 }}
              animate={{ scale: sticker.scale, opacity: 1, rotate: sticker.rotation }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 1.5 + (paragraphs.length * 0.2) + (i * 0.1) // Wait for text, then stagger
              }}
              className="absolute pointer-events-none drop-shadow-md"
              style={{ x: sticker.x, y: sticker.y }}
            >
              <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
