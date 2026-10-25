import { describe, expect, it } from "vitest";
import { MazeRoundSchema } from "@/lib/games/schema";
import { deadEnds, findCell, neighbours, solveMaze } from "@/lib/games/maze";

const grid = ["#####", "#S..#", "#.#.#", "#..G#", "#####"];
describe("maze helpers", () => {
  it("finds the start, the goal and the shortest way", () => {
    expect(findCell(grid, "S")).toEqual({ r: 1, c: 1 });
    expect(findCell(grid, "G")).toEqual({ r: 3, c: 3 });
    const path = solveMaze(grid)!;
    expect(path[0]).toEqual({ r: 1, c: 1 });
    expect(path.at(-1)).toEqual({ r: 3, c: 3 });
    expect(path.length).toBe(5);
    expect(neighbours(grid, { r: 1, c: 1 })).toHaveLength(2);
  });
  it("solves from the middle of a route too (used for the glowing hint)", () => {
    expect(solveMaze(grid, { r: 1, c: 3 })!.length).toBe(3);
  });
  it("reports a maze with no way through, and rejects it in the schema", () => {
    const blocked = ["#####", "#S#G#", "#####", "#...#", "#####"];
    expect(solveMaze(blocked)).toBeNull();
    const r = MazeRoundSchema.safeParse({ id: "m", prompt: "Find the way", grid: blocked, mover: "🐭", goal: "🧀" });
    expect(r.success).toBe(false);
  });
  it("rejects missing or doubled start/goal and uneven rows", () => {
    expect(MazeRoundSchema.safeParse({ id: "m", prompt: "p", grid: ["####", "#S.#", "#..#", "####"], mover: "a", goal: "b" }).success).toBe(false);
    expect(MazeRoundSchema.safeParse({ id: "m", prompt: "p", grid: ["#####", "#S.G#", "#..#", "#####"], mover: "a", goal: "b" }).success).toBe(false);
    expect(MazeRoundSchema.safeParse({ id: "m", prompt: "p", grid, mover: "🐭", goal: "🧀" }).success).toBe(true);
  });
  it("counts dead ends as a rough measure of difficulty", () => {
    expect(deadEnds(["#####", "#S.G#", "#.###", "#####"].map((r) => r.padEnd(5, "#")))).toBeGreaterThanOrEqual(1);
  });
});
