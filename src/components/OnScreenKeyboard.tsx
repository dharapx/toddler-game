import React from "react";

interface OnScreenKeyboardProps {
  onPress: (letter: string) => void;
}

const letters = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

export function OnScreenKeyboard({ onPress }: OnScreenKeyboardProps) {
  return (
    <div className="grid grid-cols-7 gap-2 p-4">
      {letters.map((letter) => (
        <button
          key={letter}
          className="bg-blue-500 text-white rounded-xl p-3 text-lg font-bold shadow-md active:scale-95"
          onClick={() => onPress(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
