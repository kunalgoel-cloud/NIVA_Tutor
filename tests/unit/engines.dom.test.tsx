// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Maze from "@/components/games/engines/Maze";
import { findCell, isOpen } from "@/lib/games/maze";
import TapChoose from "@/components/games/engines/TapChoose";
import CountCollect from "@/components/games/engines/CountCollect";
import MatchPair from "@/components/games/engines/MatchPair";
import CompletePattern from "@/components/games/engines/CompletePattern";
import { ACTIVITIES } from "@/content";
import type { Activity } from "@/lib/games/schema";

afterEach(cleanup);
const act = (id: string) => ACTIVITIES.find((a) => a.id === id)!;
const props = (activity: Activity, i = 0, over = {}) => ({ round: activity.rounds[i] as never, activity, seed: "s", hintLevel: 0 as const, reveal: false, locked: false, onAttempt: vi.fn(), say: vi.fn(), ...over });

describe("Tap and Choose engine", () => {
  const a = act("find-the-odd-one-out");
  it("reports a wrong answer without revealing the right one, and shows a non-colour marker", () => {
    const p = props(a);
    render(<TapChoose {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "apple" }));
    expect(p.onAttempt).toHaveBeenCalledWith({ kind: "incorrect" });
    // The choices stay available: the runner locks them while the hint is being heard, then they open again.
    expect(screen.getByRole("button", { name: "apple" })).toHaveProperty("disabled", false);
    expect(screen.queryByText("✓")).toBeNull();
  });
  it("reports the correct answer and marks it with a tick", () => {
    const p = props(a);
    render(<TapChoose {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "car" }));
    expect(p.onAttempt).toHaveBeenCalledWith(expect.objectContaining({ kind: "correct" }));
    expect(screen.getByText("✓")).toBeTruthy();
  });
  it("never takes choices away; at hint level 3 the right one glows and every choice still works", () => {
    const p = props(a, 0, { hintLevel: 3 });
    render(<TapChoose {...p} />);
    expect(screen.getAllByRole("button").filter((b) => (b as HTMLButtonElement).disabled)).toHaveLength(0);
    expect(screen.getAllByText("✨")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "apple" }));
    expect(p.onAttempt).toHaveBeenCalledWith({ kind: "incorrect" });
  });
  it("ignores taps while the runner has the choices locked (the child is listening to a hint)", () => {
    const p = props(a, 0, { locked: true });
    render(<TapChoose {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "car" }));
    expect(p.onAttempt).not.toHaveBeenCalled();
  });
  it("word-only activities show the written word instead of a picture symbol", () => {
    const kind = act("kind-words");
    const p = props(kind);
    render(<TapChoose {...p} />);
    expect(screen.getByText("please and thank you")).toBeTruthy();
    expect(screen.queryByText("🙏")).toBeNull();
    expect(screen.getByRole("button", { name: "Hear the choices" })).toBeTruthy();
  });
  it("highlights the answer when asked to reveal and ignores further taps", () => {
    const p = props(a, 0, { reveal: true });
    render(<TapChoose {...p} />);
    expect(screen.getByText("✓")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "apple" }));
    expect(p.onAttempt).not.toHaveBeenCalled();
  });
  it("welcomes any option on open-ended rounds", () => {
    const open = act("choose-a-story-ending");
    const p = props(open);
    render(<TapChoose {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "he shared it with his friends" }));
    expect(p.onAttempt).toHaveBeenCalledWith(expect.objectContaining({ kind: "open" }));
  });
  it("memory rounds hide the study set before offering choices", () => {
    const mem = act("remember-the-missing-object");
    const p = props(mem);
    render(<TapChoose {...p} />);
    expect(screen.queryByRole("button", { name: "car" })).toBeNull(); // answers not shown during study
    fireEvent.click(screen.getByRole("button", { name: "Hide one" }));
    expect(screen.getByRole("button", { name: "car" })).toBeTruthy();
  });
});

describe("Count and Collect engine", () => {
  it("counts by tapping, speaks the numbers and checks the numeral", () => {
    const a = act("count-the-apples");
    const p = props(a);
    render(<CountCollect {...p} />);
    const items = screen.getAllByRole("button", { name: "Not counted yet" });
    items.forEach((b) => fireEvent.click(b));
    expect(p.say).toHaveBeenNthCalledWith(1, "one");
    expect(p.say).toHaveBeenNthCalledWith(2, "two");
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(p.onAttempt).toHaveBeenCalledWith({ kind: "incorrect" });
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct" });
  });
  it("collect mode: stops at the requested number, flags too many, allows taking one back", () => {
    const a = act("feed-the-dinosaur");
    const p = props(a); // give 2 apples
    render(<CountCollect {...p} />);
    const give = () => fireEvent.click(screen.getAllByRole("button", { name: /Give one/ })[0]);
    give(); give(); give();
    fireEvent.click(screen.getByRole("button", { name: "That's all" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "incorrect" });
    expect(screen.getByRole("status").textContent).toMatch(/take one back/);
    fireEvent.click(screen.getAllByRole("button", { name: "Take one back" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "That's all" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct" });
  });
  it("cannot be submitted with nothing given", () => {
    render(<CountCollect {...props(act("feed-the-dinosaur"))} />);
    expect((screen.getByRole("button", { name: "That's all" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("Match the Pair engine", () => {
  it("matches pairs, reports partial progress, then completion", () => {
    const a = act("match-the-pairs");
    const p = props(a);
    render(<MatchPair {...p} />);
    const click = (n: string) => fireEvent.click(screen.getByRole("button", { name: n }));
    click("shoe"); click("sock");
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct", complete: false });
    click("toothbrush"); click("rain"); // wrong partner
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "incorrect" });
    click("toothbrush"); click("tooth");
    click("umbrella"); click("rain");
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct", complete: true });
  });
  it("sort mode places items in baskets", () => {
    const a = act("sort-by-size");
    const p = props(a);
    render(<MatchPair {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "big elephant" }));
    fireEvent.click(screen.getByRole("button", { name: "Put in small basket" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "incorrect" });
    fireEvent.click(screen.getByRole("button", { name: "big elephant" }));
    fireEvent.click(screen.getByRole("button", { name: "Put in big basket" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct", complete: false });
  });
});

describe("Complete the Pattern engine", () => {
  it("completes a pattern and shows the chosen item in the blank", () => {
    const a = act("complete-the-colour-pattern");
    const p = props(a);
    render(<CompletePattern {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "yellow" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "incorrect" });
    fireEvent.click(screen.getByRole("button", { name: "red" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct" });
  });
  it("order mode accepts steps only in the right order", () => {
    const a = act("build-a-number-train");
    const p = props(a);
    render(<CompletePattern {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "number 2" })); // wrong first tap
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "incorrect" });
    fireEvent.click(screen.getByRole("button", { name: "number 1" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct", complete: false });
    fireEvent.click(screen.getByRole("button", { name: "number 2" }));
    fireEvent.click(screen.getByRole("button", { name: "number 3" }));
    expect(p.onAttempt).toHaveBeenLastCalledWith({ kind: "correct", complete: true });
  });
  it("shuffles so the starting order is never already solved", () => {
    const a = act("build-a-number-train");
    render(<CompletePattern {...props(a)} />);
    const labels = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"));
    expect(labels).not.toEqual(["number 1", "number 2", "number 3"]);
  });
});

describe("Maze engine", () => {
  const a = act("puppy-finds-the-bone");
  const round = a.rounds[0] as import("@/lib/games/schema").MazeRound;
  const start = findCell(round.grid, "S")!;
  const dirs: [string, number, number][] = [["Up", -1, 0], ["Down", 1, 0], ["Left", 0, -1], ["Right", 0, 1]];
  const wallDir = dirs.find(([, dr, dc]) => !isOpen(round.grid, start.r + dr, start.c + dc))!;
  const openDir = dirs.find(([, dr, dc]) => isOpen(round.grid, start.r + dr, start.c + dc))!;
  const arrow = (name: string) => document.querySelector(`[aria-label="${name}"]`)!;

  it("a wall does not move the walker, and keeps its place; three bumps ask for a hint", () => {
    const p = props(a);
    render(<Maze {...p} />);
    fireEvent.click(arrow(wallDir[0]));
    expect(screen.getByText("That's a wall! Try another way.")).toBeTruthy();
    expect(p.onAttempt).not.toHaveBeenCalled();
    fireEvent.click(arrow(wallDir[0])); fireEvent.click(arrow(wallDir[0]));
    expect(p.onAttempt).toHaveBeenCalledWith({ kind: "incorrect" });
    expect(document.querySelector(`[data-cell="${start.r},${start.c}"]`)!.textContent).toContain(round.mover);
  });
  it("walking to an open square works and stepping back is allowed", () => {
    const p = props(a);
    render(<Maze {...p} />);
    fireEvent.click(arrow(openDir[0]));
    const to = { r: start.r + openDir[1], c: start.c + openDir[2] };
    expect(document.querySelector(`[data-cell="${to.r},${to.c}"]`)!.textContent).toContain(round.mover);
    fireEvent.click(document.querySelector(`[data-cell="${start.r},${start.c}"]`)!);
    expect(document.querySelector(`[data-cell="${start.r},${start.c}"]`)!.textContent).toContain(round.mover);
  });
  it("ignores input while the runner has it locked, and glows the next step at hint level 3", () => {
    const locked = props(a, 0, { locked: true });
    const { unmount } = render(<Maze {...locked} />);
    fireEvent.click(arrow(openDir[0]));
    expect(document.querySelector(`[data-cell="${start.r},${start.c}"]`)!.textContent).toContain(round.mover);
    unmount();
    render(<Maze {...props(a, 0, { hintLevel: 3 })} />);
    expect(document.querySelectorAll(".anim-bob")).toHaveLength(1);
  });
});
