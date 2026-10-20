// Spoken instructions and character replies via the browser's built-in voices (no network, no data leaves the device).
export type SpeakOptions = { volume: number; muted: boolean; rate?: number };

export class Speaker {
  private voice: SpeechSynthesisVoice | null = null;
  private synth: SpeechSynthesis | null;
  constructor(w: { speechSynthesis?: SpeechSynthesis } | undefined = typeof window === "undefined" ? undefined : window) {
    this.synth = w?.speechSynthesis ?? null;
    if (this.synth) {
      this.pickVoice();
      this.synth.addEventListener?.("voiceschanged", () => this.pickVoice());
    }
  }
  get supported() { return !!this.synth; }
  private pickVoice() {
    const voices = this.synth?.getVoices() ?? [];
    const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    this.voice = en.find((v) => v.lang === "en-IN") ?? en.find((v) => v.lang === "en-GB") ?? en.find((v) => v.lang === "en-US") ?? en[0] ?? null;
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
        u.rate = o.rate ?? 0.9; // a little slower for young listeners
        u.pitch = 1.1;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        this.synth.speak(u);
      } catch { resolve(); }
    });
  }
  cancel() { try { this.synth?.cancel(); } catch { /* ignore */ } }
}
