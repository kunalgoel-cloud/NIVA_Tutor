// Spoken instructions and character replies via the browser's built-in voices (no network, no data leaves the device).
export type SpeakOptions = { volume: number; muted: boolean; rate?: number };

const FEMALE = /samantha|karen|moira|tessa|serena|fiona|allison|ava\b|susan|victoria|zira|hazel|aria|jenny|sonia|libby|natasha|veena|heera|neerja|nicky|kate|catherine|female|google us english|google uk english female/i;
const NATURAL = /natural|neural|premium|enhanced|siri/i;
// Male, novelty or low-quality voices that sound robotic to a young child.
const AVOID = /\b(fred|albert|ralph|junior|zarvox|trinoids|whisper|organ|cellos|bubbles|boing|bells|bahh|deranged|hysterical|good news|bad news|kathy|daniel|alex|oliver|aaron|arthur|gordon|rishi|reed|eddy|flo|grandma|grandpa|rocko|sandy|shelley|male)\b|\bcompact\b/i;

/** Higher is friendlier: warm, female, natural-sounding, English, and on-device. */
export function scoreVoice(v: Pick<SpeechSynthesisVoice, "name" | "lang" | "localService">): number {
  const lang = v.lang.replace("_", "-").toLowerCase();
  if (!lang.startsWith("en")) return -Infinity;
  let score = 0;
  if (FEMALE.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i, ""))) score += 40;
  if (NATURAL.test(v.name)) score += 25;
  if (v.localService) score += 10;
  if (["en-gb", "en-us", "en-in", "en-au"].includes(lang)) score += 10;
  if (AVOID.test(v.name)) score -= 100;
  return score;
}

export class Speaker {
  private voice: SpeechSynthesisVoice | null = null;
  private preferred: string | null = null;
  private synth: SpeechSynthesis | null;
  constructor(w: { speechSynthesis?: SpeechSynthesis } | undefined = typeof window === "undefined" ? undefined : window) {
    this.synth = w?.speechSynthesis ?? null;
    if (this.synth) {
      this.pickVoice();
      this.synth.addEventListener?.("voiceschanged", () => this.pickVoice());
    }
  }
  get supported() { return !!this.synth; }
  /** Parent's chosen voice name (null = best automatic choice). */
  setPreferred(name: string | null) { this.preferred = name || null; this.pickVoice(); }
  /** English voices, friendliest first, for the parent's voice picker. */
  voices(): SpeechSynthesisVoice[] {
    return (this.synth?.getVoices() ?? []).filter((v) => scoreVoice(v) > -Infinity).sort((a, b) => scoreVoice(b) - scoreVoice(a));
  }
  private pickVoice() {
    const ranked = this.voices();
    this.voice = ranked.find((v) => v.name === this.preferred) ?? ranked[0] ?? null;
  }
  /** Resolves when speech ends (or immediately if unsupported/muted). Never rejects. */
  speak(text: string, o: SpeakOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || o.muted || o.volume <= 0 || !text.trim()) return resolve();
      try {
        this.synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (this.voice) u.voice = this.voice;
        u.lang = this.voice?.lang ?? "en-GB";
        u.volume = Math.min(1, Math.max(0, o.volume));
        u.rate = o.rate ?? 0.85; // slower and gentler for young listeners
        u.pitch = 1.15;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        this.synth.speak(u);
      } catch { resolve(); }
    });
  }
  cancel() { try { this.synth?.cancel(); } catch { /* ignore */ } }
}
