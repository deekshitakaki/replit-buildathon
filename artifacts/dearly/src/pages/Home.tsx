import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Feather } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
      
      {/* Decorative background elements */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-[120px]" />
      </motion.div>

      <div className="max-w-2xl px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-white shadow-xl shadow-primary/10 rounded-2xl flex items-center justify-center mb-8 rotate-3">
            <Feather className="text-primary" size={32} strokeWidth={1.5} />
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight mb-6">
            Write something that <span className="italic text-primary font-dancing text-6xl md:text-8xl pr-4">feels like you</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg mx-auto font-light tracking-wide leading-relaxed">
            Create beautiful, emotional digital letters with custom typography, soft aesthetics, and delicate stickers. Share them instantly.
          </p>

          <Link href="/write">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300 shadow-xl shadow-black/10 group">
              Start writing
              <motion.span 
                className="inline-block ml-1 group-hover:translate-x-1 transition-transform"
              >
                →
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
