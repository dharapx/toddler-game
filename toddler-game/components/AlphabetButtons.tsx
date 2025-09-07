"use client";

interface AlphabetButtonsProps {
  onSelect: (letter: string) => void;
}

export default function AlphabetButtons({ onSelect }: AlphabetButtonsProps) {
  const alphabets: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="grid grid-cols-6 gap-2 text-lg font-bold min-w-[250px]">
      {alphabets.map((letter) => (
        <button
          key={letter}
          onClick={() => onSelect(letter)}
          className="flex items-center justify-center min-w-[40px] min-h-[40px] bg-white/10 backdrop-blur-md rounded-lg shadow-md hover:bg-white/20 transition"
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
