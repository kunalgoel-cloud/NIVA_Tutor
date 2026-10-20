// Parent gate. IMPORTANT: this is a *child deterrent*, not security. Real access control for
// stored family data is Supabase Auth + Row Level Security (see docs/privacy.md).
import { hashString, mulberry32 } from "@/lib/games/shuffle";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen"];

export type GateChallenge = { question: string; answer: number };

/** Words-based sum that a young child who cannot read cannot solve by tapping. */
export function makeGateChallenge(seed: string): GateChallenge {
  const rnd = mulberry32(hashString(seed));
  const a = 4 + Math.floor(rnd() * 5); // 4-8
  const b = 4 + Math.floor(rnd() * 5);
  return { question: `What is ${WORDS[a]} plus ${WORDS[b]}?`, answer: a + b };
}

export function checkGateAnswer(c: GateChallenge, input: string): boolean {
  return Number.parseInt(input.trim(), 10) === c.answer;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPin(pin: string, salt?: string) {
  const s = salt ?? [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { salt: s, hash: await sha256(`${s}:${pin}`) };
}
export async function verifyPin(pin: string, stored: { salt: string; hash: string }): Promise<boolean> {
  return (await hashPin(pin, stored.salt)).hash === stored.hash;
}
export const isValidPin = (pin: string) => /^\d{4,8}$/.test(pin);

export const GATE_UNLOCK_MINUTES = 10;
