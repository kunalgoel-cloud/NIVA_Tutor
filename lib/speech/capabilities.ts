// Feature detection. Never assume speech APIs exist or behave the same on every iPadOS version.
type SR = new () => SpeechRecognitionLike;
export interface SpeechRecognitionLike {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}

export function getRecognitionCtor(w: unknown = typeof window === "undefined" ? undefined : window): SR | null {
  const g = w as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR } | undefined;
  return g?.SpeechRecognition ?? g?.webkitSpeechRecognition ?? null;
}

export type SpeechCapabilities = { synthesis: boolean; recognition: boolean };
export function detectSpeech(w: unknown = typeof window === "undefined" ? undefined : window): SpeechCapabilities {
  const g = w as { speechSynthesis?: unknown } | undefined;
  return { synthesis: !!g?.speechSynthesis, recognition: !!getRecognitionCtor(w) };
}
