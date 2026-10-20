// @vitest-environment jsdom
// Plays EVERY activity round with an automated "oracle" through the real engine components,
// proving each activity can be solved and that completion is reported.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ACTIVITIES } from "@/content";
import { EngineView } from "@/components/games/registry";
import TapChoose from "@/components/games/engines/TapChoose";
import CountCollect from "@/components/games/engines/CountCollect";
import MatchPair from "@/components/games/engines/MatchPair";
import CompletePattern from "@/components/games/engines/CompletePattern";
import { localRespond } from "@/lib/ai/local";
import { isChildVisible } from "@/lib/validation/publication";
import type { Activity, CompletePatternRound, CountCollectRound, ListenRespondRound, MatchPairRound, TapChooseRound } from "@/lib/games/schema";
import type { AttemptReport } from "@/components/games/types";

afterEach(cleanup);
void EngineView;

const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

function playRound(a: Activity, i: number): AttemptReport[] {
  const reports: AttemptReport[] = [];
  const base = { activity: a, seed: "oracle", hintLevel: 0 as const, reveal: false, locked: false, onAttempt: (r: AttemptReport) => reports.push(r), say: vi.fn() };
  switch (a.engine) {
    case "tap-choose": {
      const r = a.rounds[i] as TapChooseRound;
      render(<TapChoose {...base} round={r} />);
      if (r.study) click(r.study.hideLabel ?? "Hide one");
      const target = r.openEnded ? r.options[0] : r.options.find((o) => r.correctIds.includes(o.id))!;
      click(target.alt);
      break;
    }
    case "count-collect": {
      const r = a.rounds[i] as CountCollectRound;
      render(<CountCollect {...base} round={r} />);
      if (r.mode === "count") {
        screen.getAllByRole("button", { name: "Not counted yet" }).forEach((b) => fireEvent.click(b));
        click(String(r.total));
      } else {
        for (let n = 0; n < r.target!; n++) fireEvent.click(screen.getAllByRole("button", { name: /Give one/ })[0]);
        click("That's all");
      }
      break;
    }
    case "match-pair": {
      const r = a.rounds[i] as MatchPairRound;
      render(<MatchPair {...base} round={r} />);
      if (r.mode === "pairs") for (const p of r.pairs) { click(p.left.alt); click(p.right.alt); }
      else for (const it of r.items) { click(it.alt); click(`Put in ${r.bins.find((b) => b.id === it.binId)!.alt}`); }
      break;
    }
    case "complete-pattern": {
      const r = a.rounds[i] as CompletePatternRound;
      render(<CompletePattern {...base} round={r} />);
      if (r.mode === "complete") click(r.options.find((o) => o.id === r.correctIds[0])!.alt);
      else for (const s of r.steps) click(s.alt);
      break;
    }
    case "listen-respond": break; // conversation rounds are exercised below without the UI shell
  }
  return reports;
}

describe("every published activity is playable", () => {
  const playable = ACTIVITIES.filter(isChildVisible).filter((a) => a.engine !== "listen-respond");
  for (const a of playable) {
    it(`${a.title} (${a.engine}) completes with the right answers`, () => {
      a.rounds.forEach((_, i) => {
        const reports = playRound(a, i);
        const last = reports.at(-1);
        expect(reports.filter((r) => r.kind === "incorrect"), `${a.id}/${a.rounds[i].id} had unexpected wrong answers`).toHaveLength(0);
        expect(last, `${a.id}/${a.rounds[i].id} reported nothing`).toBeDefined();
        expect(last!.complete ?? true).toBe(true);
        expect(["correct", "open"]).toContain(last!.kind);
        cleanup();
      });
    });
  }
});

describe("every conversation activity ends gracefully via tap alternatives alone", () => {
  const convo = ACTIVITIES.filter(isChildVisible).filter((a) => a.engine === "listen-respond");
  it("has conversation activities", () => expect(convo.length).toBeGreaterThanOrEqual(10));
  for (const a of convo) {
    it(`${a.title}: each quick reply leads to a warm wrap-up within the turn limit, with no speech needed`, () => {
      for (const r of a.rounds as ListenRespondRound[]) {
        expect(a.accessibility.tapAlternative).toBe(true);
        for (const q of r.quickReplies) {
          let ended = false;
          for (let turn = 0; turn < r.maxTurns && !ended; turn++) {
            const res = localRespond(r, q.say, turn);
            expect(res.spokenResponse.length).toBeGreaterThan(0);
            expect(res.spokenResponse).not.toMatch(/wrong|incorrect|failed/i);
            expect((res.spokenResponse.match(/\?/g) ?? []).length).toBeLessThanOrEqual(2);
            ended = res.endActivity;
          }
          expect(ended, `${a.id}: reply "${q.say}" never ended the conversation`).toBe(true);
        }
      }
    });
  }
  it("accepts an unexpected answer without failing it", () => {
    const alien = ACTIVITIES.find((a) => a.id === "meet-the-friendly-alien")!.rounds[0] as ListenRespondRound;
    const res = localRespond(alien, "dragon fruit", 0);
    expect(res.needsClarification).toBe(false);
    expect(res.spokenResponse).not.toMatch(/wrong|no\b/i);
  });
});
