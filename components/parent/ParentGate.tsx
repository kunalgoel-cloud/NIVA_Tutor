"use client";
import { useState, useSyncExternalStore } from "react";
import { useApp } from "@/components/AppProvider";
import { BigButton } from "@/components/ui/Button";
import { checkGateAnswer, GATE_UNLOCK_MINUTES, makeGateChallenge, verifyPin } from "@/lib/parent/gate";

const KEY = "lww:gate-until";
const readUnlocked = () => { try { return Number(sessionStorage.getItem(KEY) ?? "0") > Date.now(); } catch { return false; } };
// External store: the unlock window lives in sessionStorage; we re-check on a timer so it re-locks by itself.
const subscribe = (cb: () => void) => { window.addEventListener("lww-gate", cb); const t = setInterval(cb, 15_000); return () => { window.removeEventListener("lww-gate", cb); clearInterval(t); }; };
const snapshot = () => (readUnlocked() ? "open" : "locked");
const serverSnapshot = () => "unknown";

/**
 * Parent gate: a words-based sum (or the parent's PIN, if one is set). It keeps a small child out of
 * settings. It is NOT a security boundary. Real protection of stored data needs accounts + RLS (docs/privacy.md).
 */
export function ParentGate({ children }: { children: React.ReactNode }) {
  const { ready, settings } = useApp();
  const gate = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [seed, setSeed] = useState(() => String(Date.now()));
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (gate === "unknown" || !ready) return <div role="status" className="grid min-h-dvh place-items-center text-lg font-semibold text-ink-soft">Loading…</div>;
  if (gate === "open") return <>{children}</>;

  const challenge = makeGateChallenge(seed);
  const usePin = !!settings.parentPin;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = usePin && settings.parentPin ? await verifyPin(answer.trim(), settings.parentPin) : checkGateAnswer(challenge, answer);
    if (ok) {
      try { sessionStorage.setItem(KEY, String(Date.now() + GATE_UNLOCK_MINUTES * 60_000)); } catch { /* session-only; fine */ }
      window.dispatchEvent(new Event("lww-gate")); setAnswer(""); setError(null);
    } else { setError(usePin ? "That PIN isn't right." : "That isn't quite right. Try again."); setSeed(String(Date.now())); setAnswer(""); }
  };

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-8 shadow-clay" aria-labelledby="gate-title">
        <h1 id="gate-title" className="text-2xl font-extrabold">Grown-ups only</h1>
        <p className="text-ink-soft">{usePin ? "Enter your parent PIN to continue." : "Please answer this to continue. (Words, so little ones can't just tap.)"}</p>
        {!usePin && <p className="text-xl font-bold" data-testid="gate-question">{challenge.question}</p>}
        <label className="flex flex-col gap-1 font-semibold" htmlFor="gate-answer">{usePin ? "PIN" : "Your answer (a number)"}
          <input id="gate-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} inputMode="numeric" autoComplete="off" type={usePin ? "password" : "text"}
            className="min-h-14 rounded-xl border-2 border-line px-4 text-xl" aria-describedby={error ? "gate-error" : undefined} />
        </label>
        {error && <p id="gate-error" role="alert" className="font-semibold text-try">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <BigButton type="submit" variant="plain" className="bg-ink text-white">Continue</BigButton>
          <BigButton href="/" variant="soft">Back to the games</BigButton>
        </div>
        <p className="text-xs text-ink-soft">This keeps small children out of settings. It is not a security lock on your data.</p>
      </form>
    </main>
  );
}
