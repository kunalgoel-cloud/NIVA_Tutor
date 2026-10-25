"use client";
import { useMemo, useState } from "react";
import type { MatchPairRound } from "@/lib/games/schema";
import { isPairMatch, isSortedCorrectly } from "@/lib/games/evaluate";
import { GLOW_FROM_LEVEL } from "@/lib/games/hints";
import { seededShuffle } from "@/lib/games/shuffle";
import { Tile } from "../Tile";
import type { EngineProps } from "../types";

export default function MatchPair(props: EngineProps<MatchPairRound>) {
  return props.round.mode === "pairs" ? <Pairs {...props} /> : <Sort {...props} />;
}

function Pairs({ round, activity, seed, reveal, locked, hintLevel, onAttempt }: EngineProps<MatchPairRound>) {
  const lefts = useMemo(() => seededShuffle(round.pairs.map((p) => ({ ...p.left, pair: p.id })), `${seed}:L`), [round, seed]);
  const rights = useMemo(() => seededShuffle(round.pairs.map((p) => ({ ...p.right, pair: p.id })), `${seed}:R`), [round, seed]);
  const [matchedState, setMatched] = useState<string[]>([]); // pair ids, in match order
  const matched = reveal ? round.pairs.map((p) => p.id) : matchedState;
  const [sel, setSel] = useState<{ side: "l" | "r"; id: string } | null>(null);
  const [shake, setShake] = useState<string | null>(null);

  // Hint level 3: softly highlight a left card whose pair is still unmatched.
  const hinted = hintLevel >= GLOW_FROM_LEVEL ? lefts.find((l) => !matched.includes(l.pair))?.id : undefined;
  const hintedPair = hinted ? lefts.find((l) => l.id === hinted)?.pair : undefined;
  const words = activity.presentation === "words";

  const tap = (side: "l" | "r", id: string, pair: string) => {
    if (locked || reveal || matched.includes(pair)) return;
    if (!sel || sel.side === side) { setSel({ side, id }); return; }
    const leftId = side === "r" ? sel.id : id, rightId = side === "r" ? id : sel.id;
    if (isPairMatch(round, leftId, rightId)) {
      const next = [...matchedState, pair];
      setMatched(next); setSel(null);
      onAttempt({ kind: "correct", complete: next.length === round.pairs.length });
    } else {
      setShake(id); setTimeout(() => setShake(null), 400); setSel(null);
      onAttempt({ kind: "incorrect" });
    }
  };

  const col = (items: typeof lefts, side: "l" | "r") => (
    <div className="flex flex-col items-center gap-4">
      {items.map((c) => {
        const m = matched.indexOf(c.pair);
        const state = m >= 0 ? "placed" : sel?.id === c.id ? "selected" : hintedPair === c.pair ? "glow" : "neutral";
        return (
          <div key={c.id} className={`w-full max-w-60 ${hinted === c.id && side === "l" ? "anim-bob" : ""}`}>
            <Tile visual={c.visual} alt={c.alt} shadow={c.shadow} textOnly={words} size="lg" className="w-full max-w-60" state={state} badge={m >= 0 ? String(m + 1) : undefined}
              shake={shake === c.id} disabled={locked || reveal || m >= 0} onClick={() => tap(side, c.id, c.pair)} />
          </div>
        );
      })}
    </div>
  );
  return (
    <div className="grid w-full grid-cols-2 gap-6" role="group" aria-label="Match the cards. Tap one on the left, then one on the right.">
      {col(lefts, "l")}{col(rights, "r")}
    </div>
  );
}

function Sort({ round, activity, seed, reveal, locked, hintLevel, onAttempt }: EngineProps<MatchPairRound>) {
  const items = useMemo(() => seededShuffle(round.items, `${seed}:S`), [round, seed]);
  const [placedState, setPlaced] = useState<Record<string, string>>({});
  const placed = reveal ? Object.fromEntries(round.items.map((i) => [i.id, i.binId])) : placedState;
  const [sel, setSel] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);

  const unplaced = items.filter((i) => !placed[i.id]);
  const hintedItem = hintLevel >= GLOW_FROM_LEVEL ? unplaced[0]?.id : undefined;
  const words = activity.presentation === "words";
  const hintedBin = hintedItem ? round.items.find((i) => i.id === hintedItem)?.binId : undefined;

  const dropInto = (binId: string) => {
    if (!sel || locked || reveal) return;
    if (isSortedCorrectly(round, sel, binId)) {
      const next = { ...placedState, [sel]: binId };
      setPlaced(next); setSel(null);
      onAttempt({ kind: "correct", complete: Object.keys(next).length === round.items.length });
    } else {
      setShake(sel); setTimeout(() => setShake(null), 400); setSel(null);
      onAttempt({ kind: "incorrect" });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex min-h-36 flex-wrap justify-center gap-4" role="group" aria-label="Things to sort. Tap one, then tap its basket.">
        {unplaced.map((i) => (
          <div key={i.id} className={hintedItem === i.id ? "anim-bob" : ""}>
            <Tile visual={i.visual} alt={i.alt} textOnly={words} size="md" state={sel === i.id ? "selected" : hintedItem === i.id ? "glow" : "neutral"} shake={shake === i.id} disabled={locked || reveal} onClick={() => setSel(i.id)} />
          </div>
        ))}
        {unplaced.length === 0 && <p className="self-center text-xl font-bold text-ink-soft">All sorted!</p>}
      </div>
      <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${round.bins.length}, minmax(0, 1fr))` }}>
        {round.bins.map((b) => (
          <button key={b.id} type="button" onClick={() => dropInto(b.id)} disabled={locked || reveal || !sel} aria-label={`Put in ${b.alt}`}
            className={`tap flex min-h-48 flex-col items-center gap-2 rounded-card border-4 border-dashed bg-white/70 p-3 ${sel ? "border-[var(--w-deep)]" : "border-line"} ${hintedBin === b.id ? "ring-4 ring-[var(--w-deep)]" : ""}`}>
            {!words && <span aria-hidden className="text-6xl">{b.visual}</span>}
            <span className={words ? "text-2xl font-extrabold" : "text-lg font-extrabold"}>{b.alt}</span>
            <span aria-hidden className={`flex flex-wrap justify-center gap-1 ${words ? "text-xl font-bold" : "text-4xl"}`}>
              {round.items.filter((i) => placed[i.id] === b.id).map((i) => <span key={i.id}>{words ? i.alt : i.visual}</span>)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
