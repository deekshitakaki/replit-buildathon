import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingPanel } from "@/components/FloatingPanel";
import { Sticker } from "@/components/Sticker";
import { useLetterStore } from "@/store/use-letter-store";
import { cn } from "@/lib/utils";

export default function Write() {
  const [_, setLocation] = useLocation();
  const paperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { content, background, font, stickers, setContent, makeItBeautiful } = useLetterStore();

  const fontClasses = {
    dancing: "font-dancing text-3xl leading-relaxed",
    sacramento: "font-sacramento text-4xl leading-relaxed",
    satisfy: "font-satisfy text-3xl leading-relaxed",
    sans: "font-sans text-lg leading-loose",
    serif: "font-serif text-xl leading-loose",
  };

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(400, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [content, font]); // Re-calculate if font changes size

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 z-30 sticky top-0">
        <Link href="/">
          <div className="font-serif italic font-bold text-2xl text-foreground cursor-pointer hover:opacity-80 transition-opacity">
            Dearly.
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white transition-all duration-200 hover:scale-105"
            onClick={makeItBeautiful}
          >
            <Wand2 size={16} className="text-primary" />
            <span className="hidden sm:inline">Make it beautiful</span>
          </Button>
          <Button onClick={() => setLocation('/preview')} className="bg-primary/90 hover:bg-primary text-white transition-all duration-200 hover:scale-105">
            <Eye size={16} />
            Preview
          </Button>
        </div>
      </header>

      <FloatingPanel />

      {/* Main Canvas Area */}
      <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-12 flex justify-center custom-scrollbar pb-32">
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
              "w-full min-h-[750px] rounded-lg shadow-[0_8px_40px_rgba(139,90,60,0.12),0_2px_8px_rgba(139,90,60,0.06)] relative overflow-hidden transition-colors duration-500",
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
          
          <div className="text-center mt-6 text-sm text-muted-foreground font-medium">
            Drag stickers to move them. Click 'Preview' when you're ready.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
