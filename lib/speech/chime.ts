// Tiny synthesised sound effects (no audio files to download, nothing recorded).
export type Chime = "correct" | "try" | "done" | "tap";
let ctx: AudioContext | null = null;

export function playChime(kind: Chime, volume: number) {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const notes: Record<Chime, number[]> = { correct: [523, 659, 784], try: [392], done: [523, 659, 784, 1047], tap: [440] };
    const start = ctx.currentTime;
    notes[kind].forEach((f, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain();
      o.type = "sine"; o.frequency.value = f;
      const t = start + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.12 * volume), t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "tap" ? 0.1 : 0.3));
      o.connect(g).connect(ctx!.destination);
      o.start(t); o.stop(t + 0.32);
    });
  } catch { /* sound is optional */ }
}
