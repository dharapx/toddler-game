"use client";
import { useInputMode } from "@/hooks/useInputMode";
import { OnScreenKeyboard } from "@/components/OnScreenKeyboard";
import React, { useEffect, useRef, useState } from "react";

/*
  Letter Pop — Full A–Z self-contained Next.js page
  - Full A–Z dictionary included (3 examples per letter) using inline SVG data-URLs as images
  - Works fully offline (no external asset requests)
  - Fullscreen canvas, glowing letter centered in a movable circle
  - When an image is shown the circle+letter shift left and remain centered inside the circle
  - Images are drawn to the right of the circle; name (English) and Bengali appear below the image
  - Cycles through examples per letter; English/Bengali speech toggle with female/child-like voice preference
*/

// small helper that returns a small SVG data URL representing the item (keeps file self-contained)
function makeSVGDataUrl(title: string, subtitle: string): string {
  const bgColors = ["#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#06B6D4", "#F59E0B", "#A78BFA"];
  const bg = bgColors[(title.charCodeAt(0) + subtitle.length) % bgColors.length];
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
    <rect width='100%' height='100%' fill='${bg}' rx='40' />
    <g font-family='Segoe UI, Roboto, Arial, sans-serif'>
      <text x='50%' y='45%' text-anchor='middle' font-size='72' font-weight='700' fill='white'>${escapeXml(title)}</text>
      <text x='50%' y='62%' text-anchor='middle' font-size='40' fill='rgba(255,255,255,0.95)'>${escapeXml(subtitle)}</text>
    </g>
  </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function escapeXml(s: string): string {
  return String(s).replace(/[&<>"']/g, function (c: string): string {
    const map: { [key: string]: string } = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
    return map[c] || "";
  });
}

function speakText(text: string, lang: string = "en-US", pitch: number = 1.15): void {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    u.pitch = pitch;
    u.volume = 1.0;
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const pref =
      voices.find((v) => /female|woman|zira|samantha|zira|google us english/i.test(v.name)) ||
      voices.find((v) => /female|woman/i.test(v.name)) ||
      voices[0];
    if (pref) u.voice = pref;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

function labelForKey(e: KeyboardEvent): string {
  const k = e.key;
  if (k.length === 1) {
    if (/[a-z]/i.test(k)) return k.toUpperCase();
    if (/[0-9]/.test(k)) return k;
    const map: Record<string, string> = {
      " ": "space",
      "-": "dash",
      _: "underscore",
      ",": "comma",
      ".": "dot",
      "!": "exclamation",
      "?": "question mark",
      ";": "semicolon",
      ":": "colon",
      "'": "apostrophe",
      '"': "quote",
      "#": "hash",
      $: "dollar",
      "&": "and",
      "*": "asterisk",
      "/": "slash",
      "\\": "backslash",
      "+": "plus",
      "=": "equals",
      "@": "at",
      "(": "left parenthesis",
      ")": "right parenthesis",
      "[": "left bracket",
      "]": "right bracket",
      "{": "left brace",
      "}": "right brace",
    };
    return map[k] ?? k;
  }
  const friendly: Record<string, string> = {
    Enter: "enter",
    Backspace: "backspace",
    Tab: "tab",
    Escape: "escape",
    Shift: "shift",
    Control: "control",
    Alt: "alt",
    Meta: "meta",
    ArrowUp: "up arrow",
    ArrowDown: "down arrow",
    ArrowLeft: "left arrow",
    ArrowRight: "right arrow",
  };
  return friendly[k] ?? k.toLowerCase();
}

// Full A–Z dictionary
type DictionaryItem = { word: string; bn: string; img: string | null; category: string };
const dictionary: Record<string, DictionaryItem[]> = {
  A: [
    { word: "Apple", bn: "আপেল", img: null, category: "Fruit" },
    { word: "Ant", bn: "পিঁপড়া", img: null, category: "Animal" },
    { word: "Ashok", bn: "অশোক গাছ", img: null, category: "Tree" }
  ],
  B: [
    { word: "Banana", bn: "কলা", img: null, category: "Fruit" },
    { word: "Buffalo", bn: "মহিষ", img: null, category: "Animal" },
    { word: "Bulbul", bn: "বুলবুল", img: null, category: "Bird" }
  ],
  C: [
    { word: "Cat", bn: "বিড়াল", img: null, category: "Animal" },
    { word: "Coconut", bn: "নারকেল", img: null, category: "Fruit" },
    { word: "Cabbage", bn: "বন্দাকপি", img: null, category: "Vegetable" }
  ],
  D: [
    { word: "Dog", bn: "কুকুর", img: null, category: "Animal" },
    { word: "Duck", bn: "হাঁস", img: null, category: "Bird" },
    { word: "Drum", bn: "ঢাক", img: null, category: "Instrument" }
  ],
  E: [
    { word: "Elephant", bn: "হাতি", img: null, category: "Animal" },
    { word: "Egg", bn: "ডিম", img: null, category: "Food" },
    { word: "Eagle", bn: "চিল", img: null, category: "Bird" }
  ],
  F: [
    { word: "Fish", bn: "মাছ", img: null, category: "Animal" },
    { word: "Frog", bn: "ব্যাঙ", img: null, category: "Animal" },
    { word: "Fig", bn: "ইলাচি/ডুমুর", img: null, category: "Fruit" }
  ],
  G: [
    { word: "Goat", bn: "ছাগল", img: null, category: "Animal" },
    { word: "Guava", bn: "পেয়ারা", img: null, category: "Fruit" },
    { word: "Gourd", bn: "লাউ/বেল", img: null, category: "Vegetable" }
  ],
  H: [
    { word: "Horse", bn: "ঘোড়া", img: null, category: "Animal" },
    { word: "Honey", bn: "মধু", img: null, category: "Food" },
    { word: "Heron", bn: "বদৌরি/আলকচা", img: null, category: "Bird" }
  ],
  I: [
    { word: "Ink", bn: "কালি", img: null, category: "Object" },
    { word: "Indian Myna", bn: "দোয়েল/ময়না", img: null, category: "Bird" },
    { word: "Ivy gourd", bn: "টিংরা/কুমড়ো", img: null, category: "Vegetable" }
  ],
  J: [
    { word: "Jackfruit", bn: "কাঠাল", img: null, category: "Fruit" },
    { word: "Junglefowl", bn: "মনকাঁদা/মোরগ", img: null, category: "Bird" },
    { word: "Jar", bn: "জাতি/গামলা", img: null, category: "Object" }
  ],
  K: [
    { word: "Kite (bird)", bn: "চিল/ঘুঘু", img: null, category: "Bird" },
    { word: "Karela (bitter gourd)", bn: "করলা", img: null, category: "Vegetable" },
    { word: "Kheer", bn: "ক্ষীর", img: null, category: "Food" }
  ],
  L: [
    { word: "Lion", bn: "সিংহ", img: null, category: "Animal" },
    { word: "Lemon", bn: "লেবু", img: null, category: "Fruit" },
    { word: "Ladyfinger (Okra)", bn: "ঢেঁড়স/ভেন্ডি", img: null, category: "Vegetable" }
  ],
  M: [
    { word: "Mango", bn: "আম", img: null, category: "Fruit" },
    { word: "Monkey", bn: "বানর", img: null, category: "Animal" },
    { word: "Marigold", bn: "গন্ধরাজ/গোলাপি ফুল", img: null, category: "Plant" }
  ],
  N: [
    { word: "Nectarine", bn: "নিক্টারিন", img: null, category: "Fruit" },
    { word: "Nightingale", bn: "নীলকণ্ঠ/রবীন্দ্রা পাখি", img: null, category: "Bird" },
    { word: "Neem", bn: "নীম গাছ", img: null, category: "Tree" }
  ],
  O: [
    { word: "Orange", bn: "কমলা", img: null, category: "Fruit" },
    { word: "Ox", bn: "বাঁশ/বজ্র", img: null, category: "Animal" },
    { word: "Okra", bn: "ভেন্ডি", img: null, category: "Vegetable" }
  ],
  P: [
    { word: "Papaya", bn: "পেঁপে", img: null, category: "Fruit" },
    { word: "Peacock", bn: "ময়ূর", img: null, category: "Bird" },
    { word: "Pumpkin", bn: "কুমড়া", img: null, category: "Vegetable" }
  ],
  Q: [
    { word: "Queen bee", bn: "রাণী মৌমাছি", img: null, category: "Animal" },
    { word: "Quince", bn: "কোঁচি/কুইন্স", img: null, category: "Fruit" },
    { word: "Quail", bn: "কোয়েল/কুইল", img: null, category: "Bird" }
  ],
  R: [
    { word: "Rabbit", bn: "খরগোশ", img: null, category: "Animal" },
    { word: "Raddish", bn: "মুলা", img: null, category: "Vegetable" },
    { word: "Rose", bn: "গোলাপ", img: null, category: "Plant" }
  ],
  S: [
    { word: "Sunflower", bn: "সূর্যমুখী", img: null, category: "Plant" },
    { word: "Snake", bn: "সাপ", img: null, category: "Animal" },
    { word: "Sapodilla (chikoo)", bn: "চিকু", img: null, category: "Fruit" }
  ],
  T: [
    { word: "Tiger", bn: "বাঘ", img: null, category: "Animal" },
    { word: "Tomato", bn: "টমেটো", img: null, category: "Vegetable" },
    { word: "Tulsi", bn: "তুলসি", img: null, category: "Plant" }
  ],
  U: [
    { word: "Umbrella", bn: "ছাতা", img: null, category: "Object" },
    { word: "Umbu fruit", bn: "উমবু", img: null, category: "Fruit" },
    { word: "Ullu (owl)", bn: "পেঁচা", img: null, category: "Bird" }
  ],
  V: [
    { word: "Vanilla", bn: "ভ্যানিলা", img: null, category: "Spice" },
    { word: "Vulture", bn: "গিদ্ধ", img: null, category: "Bird" },
    { word: "Vine gourd", bn: "দৌল/পটলা", img: null, category: "Vegetable" }
  ],
  W: [
    { word: "Watermelon", bn: "তরমুজ", img: null, category: "Fruit" },
    { word: "Wolf", bn: "নেকড়ে", img: null, category: "Animal" },
    { word: "Woodpecker", bn: "কাঠঠোকরা", img: null, category: "Bird" }
  ],
  X: [
    { word: "Xigua (watermelon)", bn: "তরমুজ", img: null, category: "Fruit" },
    { word: "Xerus (ground squirrel)", bn: "স্কয়ারেল", img: null, category: "Animal" },
    { word: "Xenops (bird)", bn: "এক ধরনের পাখি", img: null, category: "Bird" }
  ],
  Y: [
    { word: "Yam", bn: "আলু/যাম", img: null, category: "Vegetable" },
    { word: "Yak", bn: "য়াক/যাখ", img: null, category: "Animal" },
    { word: "Yellowhammer (bird)", bn: "এক ধরনের পাখি", img: null, category: "Bird" }
  ],
  Z: [
    { word: "Zebra", bn: "জেবরা", img: null, category: "Animal" },
    { word: "Zucchini", bn: "ঝুকিনি/ঝুকিনি লাউ", img: null, category: "Vegetable" },
    { word: "Ziziphus (ber)", bn: "বের/কথাল", img: null, category: "Fruit" }
  ]
};

// fill images
for (const L of Object.keys(dictionary) as Array<keyof typeof dictionary>) {
  for (let i = 0; i < dictionary[L].length; i++) {
    const it = dictionary[L][i];
    it.img = makeSVGDataUrl(it.word, it.bn);
  }
}

function preloadDictionary(dict: typeof dictionary): Record<string, HTMLImageElement[]> {
  const P: Record<string, HTMLImageElement[]> = {};
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    for (const L of Object.keys(dict) as Array<keyof typeof dictionary>) {
      P[L] = dict[L].map((item) => {
        const img = document.createElement('img');
        img.src = typeof item.img === "string" && item.img.length > 0 ? item.img : "";
        return img;
      });
    }
  } else {
    for (const L of Object.keys(dict) as Array<keyof typeof dictionary>) {
      P[L] = dict[L].map(() => null as unknown as HTMLImageElement);
    }
  }
  return P;
}

class Particle {
  x: number;
  y: number;
  hue: number;
  alpha: number;
  vx: number;
  vy: number;
  size: number;
  decay: number;
  gravity: number;

  constructor(x: number, y: number, hue: number, scale: number) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.alpha = 1;
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 3 + 1) * (scale || 1);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = Math.random() * 6 + 3;
    this.decay = Math.random() * 0.02 + 0.01;
    this.gravity = 0.03;
  }

  step(): void {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.fillStyle = `hsl(${this.hue}, 90%, 55%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [started, setStarted] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const animRef = useRef<number | null>(null);
  const preloaded = useRef<Record<string, HTMLImageElement[]>>(preloadDictionary(dictionary));
  const indexRef = useRef<Record<string, number>>(Object.fromEntries(Object.keys(dictionary).map(k => [k, 0])));
  type DictionaryItem = { word: string; bn: string; img: string | null; category: string };
  type StateType = {
    char: string;
    label: string;
    start: number;
    duration: number;
    hueBase: number;
    particles: Particle[];
    rippleStart: number;
    rippleDuration: number;
    currentImage: HTMLImageElement | null;
    currentItem: DictionaryItem | null;
    showImage: boolean;
  };
  const stateRef = useRef<StateType>({
    char: "",
    label: "",
    start: 0,
    duration: 1400,
    hueBase: 0,
    particles: [],
    rippleStart: 0,
    rippleDuration: 1200,
    currentImage: null,
    currentItem: null,
    showImage: false
  });

  const resize = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const begin = async () => {
    try { if (document.fullscreenElement == null) await document.documentElement.requestFullscreen(); } catch {}
    speakText(lang === 'en' ? "Ready!" : "শুরু!", lang === 'en' ? 'en-US' : 'bn-IN', 1.05);
    setStarted(true);
  canvasRef.current?.focus?.();
  };


  // new reusable input handler
  const handleInput = (ch: string, label?: string) => {
    const s = stateRef.current;
    s.char = ch;
    s.label = label ?? ch;
    s.start = performance.now();
    s.hueBase = Math.floor(Math.random() * 360);
    s.rippleStart = performance.now();
    s.particles = Array.from({ length: 80 }, () =>
      new Particle(window.innerWidth / 2, window.innerHeight / 2, s.hueBase + Math.random() * 60 - 30, 1)
    );

    if (/[A-Z]/.test(ch) && (dictionary as Record<string, DictionaryItem[]>)[ch]) {
      const bank = (dictionary as Record<string, DictionaryItem[]>)[ch];
      const idx = indexRef.current[ch] % bank.length;
      const item = bank[idx];
      stateRef.current.currentItem = item;
      stateRef.current.currentImage = preloaded.current[ch][idx];
      stateRef.current.showImage = true;
      indexRef.current[ch] = idx + 1;

      if (lang === 'en') speakText(`${ch} is for ${item.word}`, 'en-US', 1.15);
      else speakText(`${ch} মানে ${item.bn}`, 'bn-IN', 1.05);

    } else {
      stateRef.current.currentItem = null;
      stateRef.current.currentImage = null;
      stateRef.current.showImage = false;
      speakText(label ?? ch, lang === 'en' ? 'en-US' : 'bn-IN', 1.05);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // const onKey = (e: KeyboardEvent) => {
    //   if (e.repeat) return;
    //   e.preventDefault();
    //   const label = labelForKey(e);
    //   const ch = e.key.length === 1 ? e.key.toUpperCase() : label.toUpperCase();
    //   const s = stateRef.current;
    //   s.char = ch;
    //   s.label = label;
    //   s.start = performance.now();
    //   s.hueBase = Math.floor(Math.random() * 360);
    //   s.rippleStart = performance.now();
    //   s.particles = Array.from({ length: 80 }, () => new Particle(window.innerWidth / 2, window.innerHeight / 2, s.hueBase + Math.random() * 60 - 30, 1));

    //   if (/[A-Z]/.test(ch) && (dictionary as Record<string, DictionaryItem[]>)[ch]) {
    //     const bank = (dictionary as Record<string, DictionaryItem[]>)[ch];
    //     const idx = indexRef.current[ch] % bank.length;
    //     const item = bank[idx];
    //     stateRef.current.currentItem = item;
    //     stateRef.current.currentImage = preloaded.current[ch][idx];
    //     stateRef.current.showImage = true;
    //     indexRef.current[ch] = idx + 1;
    //     if (lang === 'en') speakText(`${ch} is for ${item.word}`, 'en-US', 1.15);
    //     else speakText(`${ch} মানে ${item.bn}`, 'bn-IN', 1.05);
    //   } else {
    //     stateRef.current.currentItem = null;
    //     stateRef.current.currentImage = null;
    //     stateRef.current.showImage = false;
    //     speakText(label, lang === 'en' ? 'en-US' : 'bn-IN', 1.05);
    //   }
    // };

    const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
      e.preventDefault();
      const label = labelForKey(e);
      const ch = e.key.length === 1 ? e.key.toUpperCase() : label.toUpperCase();
      handleInput(ch, label);
    };

    const onResize = () => resize();
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', onKey);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    resize();

    return () => {
      canvas.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [lang]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (t: number) => {
      const { char, start, duration, hueBase, particles, rippleStart, rippleDuration, currentImage, currentItem, showImage } = stateRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // background
      const g = ctx.createLinearGradient(0, 0, w, h);
      const base = (t / 50) % 360;
      g.addColorStop(0, `hsl(${(base + 220) % 360}, 90%, 9%)`);
      g.addColorStop(1, `hsl(${(base + 260) % 360}, 90%, 12%)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.step();
        p.draw(ctx);
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      if (char) {
        const elapsed = t - start; const p = Math.min(1, elapsed / duration); const easeOut = 1 - Math.pow(1 - p, 3);
        const fontSize = Math.min(w, h) * (0.35 + 0.12 * Math.sin(t / 300));
        // compute circle center: if showing image shift circle left so image sits to right
        const imageAreaWidth = showImage ? Math.min(w * 0.42, (currentImage ? currentImage.width : 800) * 0.4) : 0;
        const padding = 40;
        const circleX = showImage ? (w / 2 - imageAreaWidth / 2 - padding) : (w / 2);
        const x = circleX;
        const y = h / 2;

        ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
        const hue = (hueBase + t / 8) % 360; const blurLevels = [60, 30, 10];
        blurLevels.forEach((b, i) => { ctx.shadowBlur = b; ctx.shadowColor = `hsla(${hue}, 100%, ${i === 0 ? 60 : 50}%, ${0.35 - i * 0.08})`; ctx.fillStyle = `hsl(${hue}, 100%, ${50 + i * 5}%)`; ctx.globalAlpha = 0.9 * easeOut; ctx.fillText(char, x, y); });
        ctx.shadowBlur = 0; ctx.globalAlpha = 1; const grad = ctx.createLinearGradient(x - fontSize, y - fontSize, x + fontSize, y + fontSize); grad.addColorStop(0, `hsl(${(hue + 30) % 360}, 100%, 70%)`); grad.addColorStop(1, `hsl(${(hue + 200) % 360}, 100%, 65%)`); ctx.fillStyle = grad; ctx.fillText(char, x, y);
        if (char.length > 1 || /[^A-Z0-9]/.test(char)) { ctx.font = `700 ${Math.min(w, h) * 0.07}px system-ui`; ctx.globalAlpha = 0.9; ctx.fillStyle = `hsl(${(hue + 120) % 360}, 100%, 85%)`; ctx.fillText(stateRef.current.label.toUpperCase(), x, y + fontSize * 0.7); }
        ctx.restore();

        // circle that scales with character size
        const baseRing = fontSize * 0.5; const bounce = 1 + 0.08 * Math.sin(t / 250); const ringR = baseRing * bounce;
        ctx.beginPath(); ctx.arc(x, y, ringR, 0, Math.PI * 2); ctx.lineWidth = Math.max(4, fontSize * 0.04); ctx.strokeStyle = `hsla(${(hue + 300) % 360}, 100%, 70%, ${0.25 * easeOut})`; ctx.stroke();

        // ripples
        const now = t; const count = 3; for (let i = 0; i < count; i++) { const delay = i * (rippleDuration / count) * 0.25; const rElapsed = now - rippleStart - delay; if (rElapsed > 0) { const rp = rElapsed / rippleDuration; if (rp < 1) { const maxExtra = Math.max(w, h) * 0.6; const rippleRadius = ringR + rp * maxExtra; ctx.beginPath(); ctx.arc(x, y, rippleRadius, 0, Math.PI * 2); const alpha = Math.max(0, 0.5 * (1 - rp)); ctx.lineWidth = Math.max(2, (1 - rp) * 14); ctx.strokeStyle = `hsla(${(hue + 300) % 360}, 100%, 70%, ${alpha})`; ctx.stroke(); } } }

        // draw image on right if present
        if (showImage && currentImage && currentItem) {
          const img = currentImage;
          const imgMaxW = Math.min(w * 0.42, 480);
          const imgMaxH = Math.min(h * 0.45, 360);
          const imgW = Math.min(imgMaxW, img.width || imgMaxW);
          const imgH = Math.min(imgMaxH, img.height || imgMaxH);
          const imgX = x + ringR + 30;
          const imgY = y - imgH / 2;
          try { ctx.drawImage(img, imgX, imgY, imgW, imgH); } catch {}

          // word (English) below the image
          ctx.font = `700 ${Math.min(w, h) * 0.045}px system-ui`;
          ctx.textAlign = 'left';
          ctx.fillStyle = 'white';
          ctx.fillText(currentItem.word, imgX, imgY + imgH + 36);

          // Bengali below english
          ctx.font = `600 ${Math.min(w, h) * 0.038}px system-ui`;
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fillText(currentItem.bn, imgX, imgY + imgH + 36 + Math.min(w, h) * 0.05);

          // small category tag
          ctx.font = `500 ${Math.min(w, h) * 0.03}px system-ui`;
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillText(currentItem.category, imgX, imgY + imgH + 36 + Math.min(w, h) * 0.1);
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const pressLetter = (k: string) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); };

  // return (
  //   <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>
  //     {!started && (
  //       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  //         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
  //           <button onClick={begin} style={{ padding: '20px 40px', borderRadius: 24, color: 'white', fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#6EE7F9,#A78BFA,#F472B6)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
  //             Start • Fullscreen & Sound
  //           </button>
  //           <div style={{ color: 'rgba(255,255,255,0.85)' }}>Language: <strong>{lang === 'en' ? 'English' : 'Bengali'}</strong></div>
  //           <div style={{ display: 'flex', gap: 8 }}>
  //             <button onClick={() => setLang('en')} style={{ padding: '8px 12px', borderRadius: 8, background: '#10B981', color: 'white' }}>English</button>
  //             <button onClick={() => setLang('bn')} style={{ padding: '8px 12px', borderRadius: 8, background: '#6366F1', color: 'white' }}>Bengali</button>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     <canvas ref={canvasRef} style={{ width: '100%', height: '100%', outline: 'none' }} />

  //     {started && (
  //       <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, alignItems: 'center' }}>
  //         <div style={{ display: 'flex', gap: 6 }}>
  //           {Object.keys(dictionary).map(k => (
  //             <button key={k} onClick={() => pressLetter(k)} style={{ padding: '8px 10px', borderRadius: 8, background: '#2563EB', color: 'white', fontWeight: 700 }}>{k}</button>
  //           ))}
  //         </div>
  //         <div style={{ color: 'rgba(255,255,255,0.75)', marginLeft: 12 }}>Press any key… (ESC to exit fullscreen)</div>
  //         <div style={{ marginLeft: 12 }}>
  //           <button onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')} style={{ padding: '6px 10px', borderRadius: 8, background: '#374151', color: 'white' }}>{lang === 'en' ? 'Bengali' : 'English'}</button>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );

  // inside your component:
  const { isMobile } = useInputMode();

  return (
  <div
    style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "black",
      position: "relative",
    }}
  >
    {!started && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={begin}
            style={{
              padding: "20px 40px",
              borderRadius: 24,
              color: "white",
              fontSize: 20,
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#6EE7F9,#A78BFA,#F472B6)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            Start • Fullscreen & Sound
          </button>
          <div style={{ color: "rgba(255,255,255,0.85)" }}>
            Language:{" "}
            <strong>{lang === "en" ? "English" : "Bengali"}</strong>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setLang("en")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#10B981",
                color: "white",
              }}
            >
              English
            </button>
            <button
              onClick={() => setLang("bn")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#6366F1",
                color: "white",
              }}
            >
              Bengali
            </button>
          </div>
        </div>
      </div>
    )}

    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", outline: "none" }}
    />

    {started && (
      <>
        {/* Desktop button row */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {Object.keys(dictionary).map((k) => (
                <button
                  key={k}
                  onClick={() => pressLetter(k)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "#2563EB",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.75)",
                marginLeft: 12,
              }}
            >
              Press any key… (ESC to exit fullscreen)
            </div>
            <div style={{ marginLeft: 12 }}>
              <button
                onClick={() =>
                  setLang((l) => (l === "en" ? "bn" : "en"))
                }
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "#374151",
                  color: "white",
                }}
              >
                {lang === "en" ? "Bengali" : "English"}
              </button>
            </div>
          </div>
        )}

        {/* ✅ Mobile on-screen keyboard */}
        {isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              padding: "8px 0",
              zIndex: 20,
            }}
          >
            <OnScreenKeyboard onPress={(ch) => handleInput(ch)} />
          </div>
        )}
      </>
    )}
  </div>
);

}
