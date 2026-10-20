// Speech-to-text adapter interface + browser implementation.
// Transcripts exist only in memory for the current turn; raw audio is never recorded or stored by this app.
// NOTE: browser speech recognition may send audio to the browser vendor's servers (e.g. Apple/Google).
// The parent must opt in (Settings > Microphone). A privacy review is needed before adding any other STT service.
import { getRecognitionCtor } from "./capabilities";

export type SttResult = { ok: true; transcript: string } | { ok: false; reason: "unsupported" | "denied" | "no-speech" | "error" };

export interface SttAdapter {
  readonly id: string;
  isAvailable(): boolean;
  listen(): Promise<SttResult>;
  stop(): void;
}

export function createBrowserStt(w: unknown = typeof window === "undefined" ? undefined : window): SttAdapter {
  let active: { stop(): void } | null = null;
  return {
    id: "browser",
    isAvailable: () => !!getRecognitionCtor(w),
    listen() {
      const Ctor = getRecognitionCtor(w);
      if (!Ctor) return Promise.resolve({ ok: false, reason: "unsupported" } as SttResult);
      return new Promise<SttResult>((resolve) => {
        let settled = false;
        const done = (r: SttResult) => { if (!settled) { settled = true; active = null; resolve(r); } };
        try {
          const rec = new Ctor();
          rec.lang = "en-GB"; rec.interimResults = false; rec.continuous = false; rec.maxAlternatives = 1;
          rec.onresult = (e) => {
            const t = e.results?.[0]?.[0]?.transcript?.trim();
            done(t ? { ok: true, transcript: t } : { ok: false, reason: "no-speech" });
          };
          rec.onerror = (e) => done({ ok: false, reason: e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "no-speech" : "error" });
          rec.onend = () => done({ ok: false, reason: "no-speech" });
          active = rec;
          rec.start();
          setTimeout(() => { try { rec.stop(); } catch { /* ignore */ } }, 12_000); // never listen indefinitely
        } catch { done({ ok: false, reason: "error" }); }
      });
    },
    stop() { try { active?.stop(); } catch { /* ignore */ } },
  };
}
