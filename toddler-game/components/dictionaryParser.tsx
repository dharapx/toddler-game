"use client";
import { useState, useEffect} from "react";
import dictionaryData from "../data/dictionary.json";
import speakText from "./SpeakText";

type WordEntry = {
  word: string;
  bn: string;
  img: string | null;
  category: string;
};

interface RenderCharDetailsProps {
  char: string;
  tick: number; // ✅ NEW: increments on every key press
}

export default function RenderCharDetails({ char, tick }: RenderCharDetailsProps) {
  const upperChar = char.toUpperCase();
  const entries: WordEntry[] = (dictionaryData as Record<string, WordEntry[]>)[upperChar] || [];

  const [lastChar, setLastChar] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (entries.length === 0) return;

    if (upperChar !== lastChar) {
      // New letter: start at a random entry
      setLastChar(upperChar);
      setCurrentIndex(Math.floor(Math.random() * entries.length));
    } else {
      // Same letter pressed again: cycle to next entry
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }
    // Runs whenever a key is processed (tick changes), or the letter changes
  }, [tick, upperChar, entries.length, lastChar]);

  const entry = entries[currentIndex];

  // Speak when entry changes
  useEffect(() => {
    if (entry?.word) {
      speakText(`${upperChar} is for ${entry.word}`, 'en-US', 1.15);
      // speakText(`${upperChar} মানে ${entry.bn}`, 'bn-IN', 1.05);
    }
  }, [entry, upperChar]);

  if (!entries.length) {
    return <p>No entries found for {upperChar}</p>;
  }


  return (
    <div className="grid grid-cols-2 space-y-3 p-4 border rounded-lg shadow bg-white/10 backdrop-blur-lg">
      <div className="flex items-center justify-center">
        {entry.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.img} alt={entry.word} className="max-h-40 object-contain" />
          // <Image src={entry.img} alt={entry.word} width={250} height={250} objectFit="contain"/>
        ) : (
          <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center space-y-2">
        <h2 className="text-xl font-bold">Letter: {upperChar}</h2>
        <p>
          <strong>{entry.word}</strong> ({entry.bn}) — {entry.category}
        </p>
      </div>

    </div>
  );
}

