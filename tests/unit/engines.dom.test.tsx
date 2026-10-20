// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByRole("button", { name: "apple" })).toHaveProperty("disabled", true);
    expect(screen.getByText("🤔")).toBeTruthy(); // marker is a shape/emoji, not colour alone
    expect(screen.queryByText("✓")).toBeNull();
  });
  it("reports the correct answer and marks it with a tick", () => {
    const p = props(a);
    render(<TapChoose {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "car" }));
    expect(p.onAttempt).toHaveBeenCalledWith(expect.objectContaining({ kind: "correct" }));
    expect(screen.getByText("✓")).toBeTruthy();
  });
  it("sets one wrong option aside at hint level 3", () => {
    const p = props(a, 0, { hintLevel: 3 });
    render(<TapChoose {...p} />);
    expect(screen.getAllByRole("button").filter((b) => (b as HTMLButtonElement).disabled)).toHaveLength(1);
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
    fireEvent.click(screen.getAllByRole("button")[0]);
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
