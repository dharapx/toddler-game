export default function speakText(text: string, lang: string = "en-US", pitch: number = 1.15): void {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    u.pitch = pitch;
    u.volume = 1.0;

    const voices = window.speechSynthesis?.getVoices?.() || [];
    const pref =
      voices.find((v) => /female|woman|zira|samantha|google us english/i.test(v.name)) ||
      voices.find((v) => /female|woman/i.test(v.name)) ||
      voices[0];

    if (pref) u.voice = pref;

    window.speechSynthesis.cancel(); // stop previous speech
    window.speechSynthesis.speak(u); // speak new text
  } catch {
    // ignore errors silently
  }
}