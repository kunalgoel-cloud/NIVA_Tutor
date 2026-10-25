"use client";
import { useMemo, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Character } from "@/components/characters/Character";
import { characterById } from "@/content/characters";
import type { ListenRespondRound } from "@/lib/games/schema";
import { countWords } from "@/lib/games/evaluate";
import { converse } from "@/lib/ai/client";
import type { Turn } from "@/lib/ai/schema";
import { createBrowserStt } from "@/lib/speech/recognition";
import { BigButton } from "@/components/ui/Button";
import type { EngineProps } from "../types";

const MIC_MESSAGES: Record<string, string> = {
  unsupported: "Talking isn't available here. Tap a picture instead!",
  denied: "The microphone is switched off. Tap a picture instead, or ask a grown-up.",
  "no-speech": "I couldn't hear that. Try again, or tap a picture!",
  error: "Hmm, that didn't work. Tap a picture instead!",
};

export default function ListenRespond({ round, activity, locked, onAttempt, say }: EngineProps<ListenRespondRound>) {
  const { settings, profile } = useApp();
  const character = characterById(activity.characterId);
  const stt = useMemo(() => createBrowserStt(), []);
  const micOn = settings.speech.microphoneEnabled && stt.isAvailable();
  const [turns, setTurns] = useState<Turn[]>([{ speaker: "character", text: round.prompt }]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [nextPrompt, setNextPrompt] = useState<string | null>(null);
  const ownWords = useRef(false);
  const sent = useRef(false); // guards against double-taps while a reply is in flight

  async function send(message: string, own: boolean) {
    if (busy || sent.current || locked || !message.trim()) return;
    sent.current = true; setBusy(true); setNotice(null); setNextPrompt(null);
    if (own && countWords(message) >= 2) ownWords.current = true;
    const history = turns.slice(-8);
    setTurns((t) => [...t, { speaker: "child", text: message.slice(0, 200) }]);
    const res = await converse({
      activityId: activity.id, round, text: message, history, turnIndex, ageBand: profile?.ageBand ?? "little-explorer",
      aiEnabled: settings.ai.enabled, dailyLimit: settings.ai.dailyReplyLimit,
    });
    setTurns((t) => [...t, { speaker: "character", text: res.spokenResponse }]);
    say(res.spokenResponse);
    if (res.needsClarification) setNotice("You can tap a picture too!");
    else {
      setTurnIndex((i) => i + 1);
      if (res.endActivity || res.state === "wrap-up") onAttempt({ kind: "correct", support: ownWords.current ? "own-words" : "tapped" });
      else if (res.nextPrompt) setNextPrompt(res.nextPrompt);
    }
    sent.current = false; setBusy(false); setTyped("");
  }

  async function talk() {
    if (listening || busy || locked) return;
    setListening(true); setNotice(null);
    const r = await stt.listen();
    setListening(false);
    if (r.ok) await send(r.transcript, true); // transcript is used for this turn only and is never stored
    else setNotice(MIC_MESSAGES[r.reason]);
  }

  const shown = turns.slice(1).slice(-4); // the opening prompt is already shown above the conversation
  return (
    <div className="flex w-full flex-col gap-5">
      {round.display && <div aria-hidden className="text-center text-7xl">{round.display}</div>}
      <div className="flex flex-col gap-3" aria-live="polite" aria-label="Conversation">
        {shown.map((t, i) => (
          <div key={i} className={`flex items-end gap-3 ${t.speaker === "child" ? "flex-row-reverse" : ""}`}>
            {t.speaker === "character" && <Character species={character.species} size={64} label={character.name} speaking={i === shown.length - 1 && busy} />}
            <p className={`max-w-[80%] rounded-3xl px-5 py-3 text-xl font-semibold shadow-clay ${t.speaker === "child" ? "bg-[var(--w-deep)] text-white" : "bg-white"}`}>{t.text}</p>
          </div>
        ))}
        {busy && <p className="pl-20 text-ink-soft" aria-label="Thinking">…</p>}
      </div>
      {nextPrompt && !locked && <p className="text-center text-lg font-bold text-ink-soft">{nextPrompt}</p>}
      {notice && <p role="status" className="text-center text-lg font-bold text-try">{notice}</p>}
      {!locked && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Tap an answer">
            {round.quickReplies.map((q) => (
              <button key={q.id} type="button" disabled={busy} onClick={() => send(q.say, false)} aria-label={q.say}
                className="tap flex flex-col items-center gap-1 rounded-card border-2 border-line bg-white px-3 py-4 shadow-clay active:scale-95 disabled:opacity-60">
                {activity.presentation !== "words" && <span aria-hidden className="text-5xl">{q.visual}</span>}
                <span className={`text-center font-bold ${activity.presentation === "words" ? "text-xl" : "text-base"}`}>{q.say}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {micOn ? (
              <BigButton onClick={talk} disabled={listening || busy} variant="primary" label="Talk">{listening ? "👂 Listening…" : "🎤 Talk to me"}</BigButton>
            ) : (
              <p className="text-sm font-semibold text-ink-soft">{settings.speech.microphoneEnabled ? "Talking isn't available on this device, so tap a picture!" : "Tap a picture to answer."}</p>
            )}
          </div>
          <details className="mx-auto w-full max-w-xl rounded-2xl bg-white/70 p-3">
            <summary className="flex min-h-12 cursor-pointer items-center text-sm font-bold text-ink-soft">Grown-up: type what your child says</summary>
            <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); void send(typed, true); }}>
              <label className="sr-only" htmlFor="typed-reply">What your child says</label>
              <input id="typed-reply" value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={200} autoComplete="off"
                className="min-h-12 flex-1 rounded-xl border-2 border-line bg-white px-3 text-lg" placeholder="Type here" />
              <BigButton type="submit" disabled={busy || !typed.trim()}>Send</BigButton>
            </form>
            <p className="mt-1 text-xs text-ink-soft">Nothing typed here is saved. Avoid names or personal details.</p>
          </details>
        </>
      )}
    </div>
  );
}
