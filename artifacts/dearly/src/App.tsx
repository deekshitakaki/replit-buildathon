import { useMemo } from "react";
import { Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { EASE } from "@/lib/motion";

import Home from "@/pages/Home";
import Write from "@/pages/Write";
import Preview from "@/pages/Preview";

const PAGES: Record<string, React.ComponentType> = {
  "/": Home,
  "/write": Write,
  "/preview": Preview,
};

/**
 * The page component is resolved once per route and frozen for that route's
 * lifetime, so the outgoing screen keeps rendering its own content while it
 * fades out instead of flashing the incoming page's markup.
 */
function Page({ path }: { path: string }) {
  const Component = useMemo(() => PAGES[path] ?? NotFound, [path]);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: EASE }}
    >
      <Component />
    </motion.div>
  );
}

function Routes() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Page key={location} path={location} />
    </AnimatePresence>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
