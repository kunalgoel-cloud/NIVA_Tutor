"use client";
import { useMemo, useState } from "react";
import type { MazeRound } from "@/lib/games/schema";
import { GLOW_FROM_LEVEL } from "@/lib/games/hints";
import { findCell, isOpen, solveMaze, type Cell } from "@/lib/games/maze";
import type { EngineProps } from "../types";

const BUMPS_BEFORE_HELP = 3;
const same = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c;

/** Walk from the start to the goal by tapping a neighbouring square or the arrow buttons. Walls just say "that's a wall". */
export default function Maze({ round, locked, hintLevel, onAttempt }: EngineProps<MazeRound>) {
  const start = useMemo(() => findCell(round.grid, "S")!, [round]);
  const goal = useMemo(() => findCell(round.grid, "G")!, [round]);
  const [pos, setPos] = useState<Cell>(start);
  const [trail, setTrail] = useState<Cell[]>([start]);
  const [bumps, setBumps] = useState(0);
  const [bumped, setBumped] = useState<Cell | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const cols = round.grid[0].length;
  const nextStep = useMemo(() => (hintLevel >= GLOW_FROM_LEVEL && !finished ? solveMaze(round.grid, pos)?.[1] ?? null : null), [hintLevel, finished, round, pos]);

  const bump = (to: Cell) => {
    setBumped(to); setTimeout(() => setBumped(null), 400);
    setNote("That's a wall! Try another way.");
    const n = bumps + 1; setBumps(n);
    // Bumping around is fine; after a few bumps the grown-up voice offers help, as in every game.
    if (n % BUMPS_BEFORE_HELP === 0) onAttempt({ kind: "incorrect" });
  };
  const move = (to: Cell) => {
    if (locked || finished) return;
    if (!isOpen(round.grid, to.r, to.c)) { bump(to); return; }
    if (Math.abs(to.r - pos.r) + Math.abs(to.c - pos.c) !== 1) { setNote("Tap a square next to you."); return; }
    setNote(null);
    setPos(to);
    setTrail((t) => {
      const back = t.findIndex((c) => same(c, to));
      return back >= 0 ? t.slice(0, back + 1) : [...t, to]; // stepping back undoes the trail
    });
    if (same(to, goal)) { setFinished(true); onAttempt({ kind: "correct" }); }
  };
  const step = (dr: number, dc: number) => move({ r: pos.r + dr, c: pos.c + dc });

  const onTrail = (r: number, c: number) => trail.some((t) => t.r === r && t.c === c);
  const label = (r: number, c: number) => (same({ r, c }, pos) ? "You are here" : same({ r, c }, goal) ? "The goal" : round.grid[r][c] === "#" ? "Wall" : "Path");

  return (
    <div className="flex flex-col items-center gap-5" data-testid="maze">
      <div role="group" aria-label="Maze. Use the arrow buttons or the arrow keys, or tap a square next to you." tabIndex={0}
        onKeyDown={(e) => { const d = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, [number, number]>)[e.key]; if (d) { e.preventDefault(); step(d[0], d[1]); } }}
        className="grid w-full max-w-md gap-0.5 rounded-card bg-white/80 p-2 shadow-clay" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {round.grid.flatMap((row, r) => [...row].map((ch, c) => {
          const here = same({ r, c }, pos), isGoal = same({ r, c }, goal), wall = ch === "#";
          const glow = nextStep && same(nextStep, { r, c });
          return (
            // Squares can be tapped, but the arrow buttons are the real controls, so squares are not buttons (they can be small in big mazes).
            <div key={`${r}-${c}`} onClick={() => move({ r, c })} aria-label={label(r, c)} data-cell={`${r},${c}`}
              className={`grid aspect-square place-items-center rounded-md text-[min(6vw,1.8rem)] leading-none ${wall ? "bg-[var(--w-deep)]" : onTrail(r, c) ? "bg-emerald-100" : "bg-amber-50"} ${glow ? "ring-4 ring-[var(--w-deep)] anim-bob" : ""} ${bumped && same(bumped, { r, c }) ? "anim-shake" : ""}`}>
              {here ? <span aria-hidden>{round.mover}</span> : isGoal ? <span aria-hidden>{round.goal}</span> : null}
            </div>
          );
        }))}
      </div>
      {note && <p role="status" className="text-center text-lg font-bold text-try">{note}</p>}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Move">
        <span />
        <Arrow label="Up" onClick={() => step(-1, 0)} disabled={locked || finished}>↑</Arrow>
        <span />
        <Arrow label="Left" onClick={() => step(0, -1)} disabled={locked || finished}>←</Arrow>
        <Arrow label="Down" onClick={() => step(1, 0)} disabled={locked || finished}>↓</Arrow>
        <Arrow label="Right" onClick={() => step(0, 1)} disabled={locked || finished}>→</Arrow>
      </div>
    </div>
  );
}

function Arrow({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label}
      className="tap grid size-16 place-items-center rounded-2xl border-2 border-line bg-white text-3xl font-black shadow-clay active:scale-95 disabled:opacity-50">
      <span aria-hidden>{children}</span>
    </button>
  );
}
