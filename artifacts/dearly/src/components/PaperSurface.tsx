import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BackgroundType } from "@/store/use-letter-store";
import { paperVars } from "@/lib/paper-theme";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The measured size of the paper. Stickers are stored as fractions of these
 * dimensions, so they land in the same spot on a phone as on a desktop.
 */
export interface PaperMetrics {
  width: number;
  height: number;
}

const PaperMetricsContext = createContext<PaperMetrics>({ width: 0, height: 0 });

export function usePaperMetrics() {
  return useContext(PaperMetricsContext);
}

interface Layer {
  id: number;
  bg: BackgroundType;
}

interface PaperSurfaceProps {
  background: BackgroundType;
  className?: string;
  children?: React.ReactNode;
  /** Softens the fold creases — the preview scene reads better with them faint. */
  creaseOpacity?: number;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
}

/**
 * The sheet of paper itself: colour, grain, folds, vignette and edge light.
 *
 * Paper backgrounds are built from `background-image` gradients, which CSS
 * transitions cannot interpolate. So a change stacks a new layer on top of the
 * old one and fades it in, then drops the old layer once it is hidden.
 */
export const PaperSurface = forwardRef<HTMLDivElement, PaperSurfaceProps>(
  function PaperSurface(
    { background, className, children, creaseOpacity = 1, onPointerDown },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [metrics, setMetrics] = useState<PaperMetrics>({ width: 0, height: 0 });
    const reduceMotion = useReducedMotion();

    const nextId = useRef(0);
    const [layers, setLayers] = useState<Layer[]>([{ id: 0, bg: background }]);

    useEffect(() => {
      setLayers((prev) => {
        if (prev[prev.length - 1].bg === background) return prev;
        nextId.current += 1;
        return [...prev, { id: nextId.current, bg: background }];
      });
    }, [background]);

    useLayoutEffect(() => {
      const node = innerRef.current;
      if (!node) return;

      const measure = () => {
        const rect = node.getBoundingClientRect();
        setMetrics((prev) =>
          prev.width === rect.width && prev.height === rect.height
            ? prev
            : { width: rect.width, height: rect.height },
        );
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const setRefs = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const settle = (id: number) => {
      setLayers((prev) => (prev[prev.length - 1].id === id ? [prev[prev.length - 1]] : prev));
    };

    return (
      <div
        ref={setRefs}
        onPointerDown={onPointerDown}
        style={paperVars(background)}
        className={cn("paper-surface paper-lift relative overflow-hidden", className)}
      >
        {layers.map((layer, index) => (
          <motion.div
            key={layer.id}
            aria-hidden
            className={cn("absolute inset-0 z-0", `paper-bg-${layer.bg}`)}
            initial={{ opacity: index === 0 ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : DUR.slow, ease: EASE }}
            onAnimationComplete={() => settle(layer.id)}
          />
        ))}

        <div className="paper-grain absolute inset-0 z-0 pointer-events-none" aria-hidden />
        <div
          className="paper-creases absolute inset-0 z-0 pointer-events-none"
          style={{ opacity: creaseOpacity }}
          aria-hidden
        />
        <div className="paper-vignette absolute inset-0 z-0 pointer-events-none" aria-hidden />

        <PaperMetricsContext.Provider value={metrics}>
          {children}
        </PaperMetricsContext.Provider>
      </div>
    );
  },
);
