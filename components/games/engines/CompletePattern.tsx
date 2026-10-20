"use client";
import { useMemo, useState } from "react";
import type { CompletePatternRound } from "@/lib/games/schema";
import { evaluateComplete, isValidOrderPrefix } from "@/lib/games/evaluate";
import { seededShuffle, shuffleDifferent } from "@/lib/games/shuffle";
import { Tile } from "../Tile";
import type { EngineProps } from "../types";

export default function CompletePattern(props: EngineProps<CompletePatternRound>) {
  return props.round.mode === "complete" ? <Complete {...props} /> : <Order {...props} />;
}

function Complete({ round, seed, hintLevel, reveal, locked, onAttempt }: EngineProps<CompletePatternRound>) {
  const options = useMemo(() => seededShuffle(round.options, `${seed}:${round.id}`), [round, seed]);
  const [tried, setTried] = useState<Set<string>>(new Set());
  const [filled, setFilled] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const revealId = reveal ? round.correctIds[0] : null;
  const shown = filled ?? revealId;
  const slotVisual = shown ? round.options.find((o) => o.id === shown)?.visual : null;
  const eliminated = hintLevel >= 3 ? options.find((o) => !round.correctIds.includes(o.id) && !tried.has(o.id))?.id : undefined;

  const pick = (id: string) => {
    if (locked || reveal) return;
    if (evaluateComplete(round, id)) { setFilled(id); onAttempt({ kind: "correct" }); }
    else { setTried((t) => new Set(t).add(id)); setShake(id); setTimeout(() => setShake(null), 400); onAttempt({ kind: "incorrect" }); }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-3" role="img" aria-label={`Pattern: ${round.sequence.map((s) => (s === "?" ? "blank" : s)).join(", ")}`}>
        {round.sequence.map((s, i) =>
          s === "?" ? (
            <span key={i} className={`grid size-24 place-items-center rounded-3xl border-4 border-dashed text-6xl ${shown ? "border-good bg-emerald-50" : "border-[var(--w-deep)] bg-white/70"}`}>
              <span aria-hidden>{slotVisual ?? "❔"}</span>
            </span>
          ) : (
            <span key={i} aria-hidden className="grid size-24 place-items-center rounded-3xl border-2 border-line bg-white text-6xl shadow-clay">{s}</span>
          )
        )}
      </div>
      <div className={`grid w-full gap-4 ${options.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {options.map((o) => (
          <Tile key={o.id} visual={o.visual} label={o.label} alt={o.alt} size="md"
            state={filled === o.id || revealId === o.id ? "correct" : tried.has(o.id) ? "tried" : eliminated === o.id ? "dim" : "neutral"}
            shake={shake === o.id} disabled={locked || reveal || tried.has(o.id) || eliminated === o.id} onClick={() => pick(o.id)} />
        ))}
      </div>
    </div>
  );
}

function Order({ round, seed, reveal, locked, hintLevel, onAttempt }: EngineProps<CompletePatternRound>) {
  const pool = useMemo(() => shuffleDifferent(round.steps, `${seed}:${round.id}`), [round, seed]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const finalOrder = reveal ? round.steps.map((s) => s.id) : placed;
  const nextHint = hintLevel >= 3 ? round.steps.map((s) => s.id).find((id) => !finalOrder.includes(id)) : undefined;

  const tap = (id: string) => {
    if (locked || reveal || placed.includes(id)) return;
    const next = [...placed, id];
    if (isValidOrderPrefix(round, next)) {
      setPlaced(next);
      onAttempt({ kind: "correct", complete: next.length === round.steps.length });
    } else {
      setShake(id); setTimeout(() => setShake(null), 400);
      onAttempt({ kind: "incorrect" });
    }
  };
  const byId = (id: string) => round.steps.find((s) => s.id === id)!;

  return (
    <div className="flex flex-col items-center gap-8">
      <ol className="flex flex-wrap justify-center gap-3" aria-label="Your order">
        {round.steps.map((_, i) => {
          const id = finalOrder[i];
          return (
            <li key={i} className={`relative grid size-24 place-items-center rounded-3xl border-4 text-5xl ${id ? "border-good bg-emerald-50" : "border-dashed border-line bg-white/60"}`}>
              <span aria-hidden className="absolute -left-2 -top-2 grid size-8 place-items-center rounded-full bg-[var(--w-deep)] text-base font-black text-white">{i + 1}</span>
              <span aria-hidden>{id ? byId(id).visual : ""}</span>
              {id && <span className="sr-only">{byId(id).alt}</span>}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap justify-center gap-4" role="group" aria-label="Tap in the right order">
        {pool.map((s) => (
          <div key={s.id} className={nextHint === s.id ? "anim-bob" : ""}>
            <Tile visual={s.visual} label={undefined} alt={s.alt} size="md" state={finalOrder.includes(s.id) ? "dim" : nextHint === s.id ? "selected" : "neutral"}
              shake={shake === s.id} disabled={locked || reveal || finalOrder.includes(s.id)} onClick={() => tap(s.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
