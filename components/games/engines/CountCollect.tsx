"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { CountCollectRound } from "@/lib/games/schema";
import { evaluateCollect, evaluateCountAnswer } from "@/lib/games/evaluate";
import { seededShuffle } from "@/lib/games/shuffle";
import { BigButton } from "@/components/ui/Button";
import type { EngineProps } from "../types";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export default function CountCollect(props: EngineProps<CountCollectRound>) {
  return props.round.mode === "count" ? <Count {...props} /> : <Collect {...props} />;
}

function Count({ round, seed, hintLevel, reveal, locked, onAttempt, say }: EngineProps<CountCollectRound>) {
  const [counted, setCounted] = useState<number[]>([]);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const [chosen, setChosen] = useState<number | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const choices = useMemo(() => seededShuffle(round.choices ?? [], `${seed}:${round.id}`), [round, seed]);
  const items = useMemo(() => Array.from({ length: round.total }, (_, i) => i), [round.total]);

  const countedShown = reveal ? items : counted; // when the answer is revealed, show everything counted
  const nextToCount = items.find((i) => !countedShown.includes(i));

  const tapItem = (i: number) => {
    if (locked || reveal || counted.includes(i)) return;
    const n = counted.length + 1;
    setCounted((c) => [...c, i]);
    say(NUMBER_WORDS[n] ?? String(n));
  };
  const answer = (n: number) => {
    if (locked || reveal) return;
    if (evaluateCountAnswer(round, n) === "correct") { setChosen(n); onAttempt({ kind: "correct" }); }
    else { setTried((t) => new Set(t).add(n)); setShake(n); setTimeout(() => setShake(null), 400); onAttempt({ kind: "incorrect" }); }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={`${round.total} things to count. Tap each one.`}>
        {items.map((i) => {
          const idx = countedShown.indexOf(i);
          const hinted = hintLevel >= 3 && nextToCount === i && !reveal;
          return (
            <motion.button key={i} type="button" onClick={() => tapItem(i)} whileTap={{ scale: 0.9 }} disabled={locked || reveal}
              aria-label={idx >= 0 ? `Counted ${idx + 1}` : "Not counted yet"}
              className={`tap relative grid size-24 place-items-center rounded-3xl border-2 bg-white text-6xl shadow-clay ${idx >= 0 ? "border-good bg-emerald-50" : "border-line"} ${hinted ? "ring-4 ring-[var(--w-deep)] anim-bob" : ""}`}>
              <span aria-hidden>{round.visual}</span>
              {idx >= 0 && <span aria-hidden className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-[var(--w-deep)] text-lg font-black text-white">{idx + 1}</span>}
            </motion.button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-4" role="group" aria-label="How many? Choose a number">
        {choices.map((n) => (
          <button key={n} type="button" onClick={() => answer(n)} disabled={locked || reveal || tried.has(n)} aria-label={String(n)}
            className={`tap relative grid size-24 place-items-center rounded-full border-2 bg-white text-5xl font-extrabold shadow-clay ${chosen === n || (reveal && n === round.total) ? "ring-4 ring-good bg-emerald-50" : "border-line"} ${tried.has(n) ? "opacity-50 border-dashed" : ""} ${shake === n ? "anim-shake" : ""}`}>
            {n}
            {(chosen === n || (reveal && n === round.total)) && <span aria-hidden className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-good text-lg font-black text-white">✓</span>}
            {tried.has(n) && <span aria-hidden className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-sun text-lg">🤔</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Collect({ round, hintLevel, reveal, locked, onAttempt, say }: EngineProps<CountCollectRound>) {
  const target = round.target ?? 0;
  const [given, setGiven] = useState(0);
  const [nudge, setNudge] = useState<string | null>(null);
  const givenShown = reveal ? target : given;
  const remaining = round.total - givenShown;

  const give = () => { if (locked || reveal || remaining <= 0) return; const n = given + 1; setGiven(n); setNudge(null); say(NUMBER_WORDS[n] ?? String(n)); };
  const takeBack = () => { if (locked || reveal || given <= 0) return; setGiven((g) => g - 1); setNudge(null); };
  const done = () => {
    if (locked || reveal) return;
    const res = evaluateCollect(round, given);
    if (res === "correct") onAttempt({ kind: "correct" });
    else { setNudge(res === "too-few" ? "A few more, please!" : "That is a lot! Tap a snack on the plate to take one back."); onAttempt({ kind: "incorrect" }); }
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="grid w-full gap-6 sm:grid-cols-2">
        <div className="rounded-card bg-white/80 p-4">
          <p className="mb-2 text-center text-sm font-bold text-ink-soft" aria-hidden>Tap to give</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: remaining }, (_, i) => (
              <button key={i} type="button" onClick={give} aria-label={`Give one ${round.visual}`} disabled={locked || reveal} className="tap grid size-20 place-items-center rounded-3xl border-2 border-line bg-white text-5xl shadow-clay active:scale-90"><span aria-hidden>{round.visual}</span></button>
            ))}
            {remaining === 0 && <p className="py-6 text-lg font-bold text-ink-soft">All given!</p>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-card bg-white/80 p-4">
          <div aria-hidden className="text-8xl">{round.collectTo?.visual}</div>
          <p className="sr-only">{round.collectTo?.alt} has {givenShown}</p>
          <div className="flex min-h-24 w-full flex-wrap justify-center gap-2 rounded-3xl border-2 border-dashed border-line p-2" aria-label={`${givenShown} on the plate`}>
            {Array.from({ length: givenShown }, (_, i) => (
              <button key={i} type="button" onClick={takeBack} aria-label="Take one back" disabled={locked || reveal} className="tap grid size-16 place-items-center rounded-2xl bg-white text-4xl shadow-clay"><span aria-hidden>{round.visual}</span></button>
            ))}
            {hintLevel >= 3 && givenShown < target && Array.from({ length: target - givenShown }, (_, i) => (
              <span key={`slot${i}`} aria-hidden className="grid size-16 place-items-center rounded-2xl border-2 border-dashed border-[var(--w-deep)] text-3xl opacity-60">＋</span>
            ))}
          </div>
          <p aria-live="polite" className="text-3xl font-extrabold">{givenShown}</p>
        </div>
      </div>
      {nudge && <p role="status" className="text-center text-lg font-bold text-try">{nudge}</p>}
      <BigButton size="lg" onClick={done} disabled={locked || reveal || given === 0} label="That's all">✋ That&apos;s all!</BigButton>
    </div>
  );
}
