import { describe, expect, it, vi } from "vitest";
import { detectSpeech, getRecognitionCtor } from "@/lib/speech/capabilities";
import { Speaker, scoreVoice } from "@/lib/speech/synthesis";
import { createBrowserStt } from "@/lib/speech/recognition";
import { checkGateAnswer, hashPin, isValidPin, makeGateChallenge, verifyPin } from "@/lib/parent/gate";

class FakeRec {
  lang = ""; interimResults = false; continuous = false; maxAlternatives = 1;
  onresult: ((e: never) => void) | null = null; onerror: ((e: { error?: string }) => void) | null = null; onend: (() => void) | null = null;
  static mode: "ok" | "denied" | "silent" | "throw" = "ok";
  start() {
    if (FakeRec.mode === "throw") throw new Error("boom");
    setTimeout(() => {
      if (FakeRec.mode === "ok") this.onresult?.({ results: [[{ transcript: " I like mangoes " }]] } as never);
      else if (FakeRec.mode === "denied") this.onerror?.({ error: "not-allowed" });
      else this.onend?.();
    }, 0);
  }
  stop() {} abort() {}
}

describe("speech capability detection", () => {
  it("never assumes support", () => {
    expect(detectSpeech({})).toEqual({ synthesis: false, recognition: false });
    expect(detectSpeech(undefined)).toEqual({ synthesis: false, recognition: false });
    expect(getRecognitionCtor({ webkitSpeechRecognition: FakeRec })).toBe(FakeRec);
  });
});

describe("speech input fallback", () => {
  it("reports unsupported instead of throwing", async () => {
    const stt = createBrowserStt({});
    expect(stt.isAvailable()).toBe(false);
    expect(await stt.listen()).toEqual({ ok: false, reason: "unsupported" });
  });
  it("returns the transcript for this turn only", async () => {
    FakeRec.mode = "ok";
    expect(await createBrowserStt({ webkitSpeechRecognition: FakeRec }).listen()).toEqual({ ok: true, transcript: "I like mangoes" });
  });
  it("maps permission denial, silence and crashes to friendly reasons", async () => {
    const w = { webkitSpeechRecognition: FakeRec };
    FakeRec.mode = "denied"; expect(await createBrowserStt(w).listen()).toEqual({ ok: false, reason: "denied" });
    FakeRec.mode = "silent"; expect(await createBrowserStt(w).listen()).toEqual({ ok: false, reason: "no-speech" });
    FakeRec.mode = "throw"; expect(await createBrowserStt(w).listen()).toEqual({ ok: false, reason: "error" });
  });
});

describe("speech output", () => {
  it("resolves immediately when unsupported, muted or silent, never throws", async () => {
    await expect(new Speaker({}).speak("hi", { volume: 1, muted: false })).resolves.toBeUndefined();
    const speak = vi.fn();
    const synth = { cancel: vi.fn(), speak, getVoices: () => [], addEventListener: vi.fn() } as unknown as SpeechSynthesis;
    const sp = new Speaker({ speechSynthesis: synth });
    await sp.speak("hi", { volume: 1, muted: true });
    await sp.speak("hi", { volume: 0, muted: false });
    expect(speak).not.toHaveBeenCalled();
  });
  it("survives a synthesis engine that throws", async () => {
    const synth = { cancel: () => { throw new Error("x"); }, speak: vi.fn(), getVoices: () => [], addEventListener: vi.fn() } as unknown as SpeechSynthesis;
    vi.stubGlobal("SpeechSynthesisUtterance", class {});
    await expect(new Speaker({ speechSynthesis: synth }).speak("hi", { volume: 1, muted: false })).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });
});

describe("voice choice", () => {
  const v = (name: string, lang = "en-US", localService = true) => ({ name, lang, localService }) as SpeechSynthesisVoice;
  const synthWith = (voices: SpeechSynthesisVoice[]) => ({ cancel: vi.fn(), speak: vi.fn(), getVoices: () => voices, addEventListener: vi.fn() }) as unknown as SpeechSynthesis;

  it("prefers a natural female voice over robotic or male ones", () => {
    const sp = new Speaker({ speechSynthesis: synthWith([v("Fred"), v("Daniel", "en-GB"), v("Albert"), v("Samantha"), v("Karen", "en-AU")]) });
    expect(sp.voices()[0].name).toBe("Samantha");
    expect(sp.voices().slice(-1)[0].name).not.toBe("Samantha");
  });
  it("ranks enhanced/natural voices first and ignores non-English", () => {
    const sp = new Speaker({ speechSynthesis: synthWith([v("Samantha"), v("Microsoft Aria Online (Natural)", "en-US", false), v("Amelie", "fr-FR")]) });
    expect(sp.voices().map((x) => x.name)).toEqual(["Microsoft Aria Online (Natural)", "Samantha"]);
  });
  it("uses the parent's chosen voice, else the best one", async () => {
    vi.stubGlobal("SpeechSynthesisUtterance", class { voice: unknown; onend?: () => void; });
    const spoken: { voice: { name: string } }[] = [];
    const synth = { cancel: vi.fn(), getVoices: () => [v("Samantha"), v("Karen", "en-AU")], addEventListener: vi.fn(),
      speak: (u: { voice: { name: string }; onend: () => void }) => { spoken.push(u); u.onend(); } } as unknown as SpeechSynthesis;
    const sp = new Speaker({ speechSynthesis: synth });
    const o = { volume: 1, muted: false };
    await sp.speak("hi", o); sp.setPreferred("Karen"); await sp.speak("hi", o); sp.setPreferred("Gone"); await sp.speak("hi", o);
    expect(spoken.map((u) => u.voice.name)).toEqual(["Samantha", "Karen", "Samantha"]);
    expect(scoreVoice(v("Fred"))).toBeLessThan(0);
    vi.unstubAllGlobals();
  });
});

describe("parent gate", () => {
  it("makes a words-based sum that changes with the seed", () => {
    const a = makeGateChallenge("1"), b = makeGateChallenge("1");
    expect(a).toEqual(b);
    expect(a.question).toMatch(/plus/);
    expect(a.question).not.toMatch(/\d/); // words only, so a non-reader cannot tap through
    expect(new Set(["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => makeGateChallenge(s).answer)).size).toBeGreaterThan(1);
  });
  it("checks answers", () => {
    const c = makeGateChallenge("x");
    expect(checkGateAnswer(c, String(c.answer))).toBe(true);
    expect(checkGateAnswer(c, ` ${c.answer} `)).toBe(true);
    expect(checkGateAnswer(c, String(c.answer + 1))).toBe(false);
    expect(checkGateAnswer(c, "abc")).toBe(false);
  });
  it("stores PINs as salted hashes that verify", async () => {
    const h = await hashPin("1234");
    expect(JSON.stringify(h)).not.toContain("1234");
    expect(await verifyPin("1234", h)).toBe(true);
    expect(await verifyPin("1235", h)).toBe(false);
    expect((await hashPin("1234")).hash).not.toBe(h.hash); // random salt
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("12")).toBe(false);
    expect(isValidPin("12ab")).toBe(false);
  });
});
