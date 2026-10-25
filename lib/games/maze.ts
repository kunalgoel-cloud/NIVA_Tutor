// Pure maze helpers. A maze is a grid of strings: '#' wall, '.' path, 'S' start, 'G' goal.
export type Cell = { r: number; c: number };
export const MAZE_RE = /^[#.SG]+$/;

export function findCell(grid: string[], ch: "S" | "G"): Cell | null {
  for (let r = 0; r < grid.length; r++) { const c = grid[r].indexOf(ch); if (c >= 0) return { r, c }; }
  return null;
}
export const isOpen = (grid: string[], r: number, c: number) => r >= 0 && r < grid.length && c >= 0 && c < grid[r].length && grid[r][c] !== "#";
export const neighbours = (grid: string[], p: Cell): Cell[] =>
  [{ r: p.r - 1, c: p.c }, { r: p.r + 1, c: p.c }, { r: p.r, c: p.c - 1 }, { r: p.r, c: p.c + 1 }].filter((n) => isOpen(grid, n.r, n.c));

/** Shortest path (inclusive of both ends) from `from` to the goal, or null when there is none. */
export function solveMaze(grid: string[], from: Cell | null = findCell(grid, "S")): Cell[] | null {
  const goal = findCell(grid, "G");
  if (!from || !goal) return null;
  const key = (p: Cell) => `${p.r},${p.c}`;
  const prev = new Map<string, Cell | null>([[key(from), null]]);
  const queue: Cell[] = [from];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i];
    if (cur.r === goal.r && cur.c === goal.c) {
      const path: Cell[] = [];
      for (let p: Cell | null = cur; p; p = prev.get(key(p)) ?? null) path.unshift(p);
      return path;
    }
    for (const n of neighbours(grid, cur)) if (!prev.has(key(n))) { prev.set(key(n), cur); queue.push(n); }
  }
  return null;
}
/** How many dead-end branches the maze has (a rough difficulty measure). */
export function deadEnds(grid: string[]): number {
  let n = 0;
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++)
    if (isOpen(grid, r, c) && grid[r][c] === "." && neighbours(grid, { r, c }).length === 1) n++;
  return n;
}
