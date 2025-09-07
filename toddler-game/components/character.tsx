"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RenderCharDetails from "./dictionaryParser";

interface KeyPressDisplayProps {
  externalChar?: { char: string; id: number };
  triggerAltMode?: boolean;
}

export default function KeyPressDisplay({ externalChar, triggerAltMode = false }: KeyPressDisplayProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [renderIndex, setRenderIndex] = useState<number>(0);
  const [pressTick, setPressTick] = useState<number>(0); // ✅ NEW

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const char = event.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        setQueue((prev) => [...prev, char]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle external (button) input
  useEffect(() => {
    if (externalChar && /^[A-Z]$/.test(externalChar.char)) {
      setQueue((prev) => [...prev, externalChar.char.toUpperCase()]);
    }
  }, [externalChar]);

  // Consume queue sequentially
  useEffect(() => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest); // clear queue so only next press replaces current
      setRenderIndex((prev) => prev + 1);
      setPressTick((p) => p + 1);          // ✅ bump tick on every key
    }
  }, [queue]);

  // ❌ Removed auto-reset (keep character until new input)
  const handleAnimationComplete = useCallback(() => {
    // no-op now
  }, []);

  // ✅ If alt mode is ON, show dictionary details instead
  if (triggerAltMode && current) {
    return <RenderCharDetails char={current} tick={pressTick}/>;
  }

  // ✅ normal JSX return (unchanged)
  return (
    <div className="flex flex-col items-center justify-center h-40 text-4xl font-bold">
      <AnimatePresence mode="wait" >
        {current && (
          <motion.div
            key={`${current}-${renderIndex}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: 1.5, 
              opacity: 1
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: .4, type: "spring", ease: "easeInOut" }}
            onAnimationComplete={handleAnimationComplete}
            className="text-8xl font-bold text-shadow-blue-950 text-lime-400 drop-shadow-lg bg-gradient-to-tl"
          >
            {current}
          </motion.div>
        )}
      </AnimatePresence>
      {!current && queue.length === 0 && (
        <div className="text-6xl opacity-30">⌨️</div>
      )}
    </div>
  );
}
