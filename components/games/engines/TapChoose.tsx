"use client";
import { useMemo, useState } from "react";
import type { TapChooseRound } from "@/lib/games/schema";
import { evaluateTapChoose } from "@/lib/games/evaluate";
import { GLOW_FROM_LEVEL } from "@/lib/games/hints";
import { seededShuffle } from "@/lib/games/shuffle";
import { BigButton } from "@/components/ui/Button";
import { Tile } from "../Tile";
import type { EngineProps } from "../types";

export default function TapChoose({ round, activity, seed, hintLevel, reveal, locked, onAttempt, say }: EngineProps<TapChooseRound>) {
  const options = useMemo(() => seededShuffle(round.options, `${seed}:${round.id}`), [round, seed]);
  const [phase, setPhase] = useState<"study" | "answer">(round.study ? "study" : "answer");
  const [chosen, setChosen] = useState<string | null>(null);
  const [shaking, setShaking] = useState<string | null>(null);
  const words = activity.presentation === "words";
  const okIds = useMemo(() => new Set([...round.correctIds, ...round.acceptableIds]), [round]);
  // From hint level 3 the right choice glows. Every choice stays available at all times.
  const glowing = hintLevel >= GLOW_FROM_LEVEL && !round.openEnded;

  const pick = (id: string) => {
    if (locked || reveal) return;
    const res = evaluateTapChoose(round, id);
    if (res.kind === "incorrect") {
      setShaking(id); setTimeout(() => setShaking(null), 400);
      onAttempt({ kind: "incorrect" });
    } else {
      setChosen(id);
      onAttempt({ kind: res.kind === "open" ? "open" : "correct", message: res.reflection ?? round.explain });
    }
  };

  const hidden = round.study?.hideIndex ?? (round.study ? round.study.items.length - 1 : -1);

  return (
    <div className="flex flex-col items-center gap-6">
      {round.display && <div aria-hidden className="whitespace-pre-line text-center text-7xl leading-tight">{round.display}</div>}
      {round.study && (
        <div className="flex flex-col items-center gap-3 rounded-card bg-white/80 p-4">
          <div className="flex flex-wrap justify-center gap-3" aria-label="Things to remember">
            {round.study.items.map((v, i) => (
              <span key={i} aria-hidden className="grid size-20 place-items-center rounded-2xl border-2 border-line bg-white text-5xl">
                {phase === "answer" && i === hidden ? "❔" : v}
              </span>
            ))}
          </div>
          {phase === "study" && <BigButton onClick={() => setPhase("answer")} variant="soft">{round.study.hideLabel ?? "Hide one"}</BigButton>}
        </div>
      )}
      {phase === "answer" && words && !locked && (
        <BigButton variant="soft" onClick={() => say(options.map((o) => o.alt).join(". Or: "))} label="Hear the choices">🔈 Hear the choices</BigButton>
      )}
      {phase === "answer" && (
        <div className={`grid w-full gap-4 ${options.length === 2 ? "grid-cols-2" : options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
          {options.map((o) => {
            const isCorrect = okIds.has(o.id);
            const state = chosen === o.id ? "correct" : reveal && isCorrect ? "correct" : glowing && isCorrect && chosen === null ? "glow" : "neutral";
            return (
              <Tile key={o.id} visual={o.visual} label={o.label} alt={o.alt} state={state} shake={shaking === o.id} textOnly={words}
                disabled={locked || reveal} onClick={() => pick(o.id)} />
            );
          })}
        </div>
      )}
    </div>
  );
}
