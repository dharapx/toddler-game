"use client";
import { useEffect, useState } from "react";

interface GrabKeyProps {
  externalChar?: { char: string; id: number }; // from AlphabetButtons
  onCharSelect: (char: string) => void; // ✅ callback to parent
}

export default function GrabKey({ externalChar, onCharSelect }: GrabKeyProps) {
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("");

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
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);

      // ✅ Instead of rendering animation, call function
      onCharSelect(next);
    }
  }, [queue, current, onCharSelect]);

  return null; // ✅ this component doesn’t render anything now
}
