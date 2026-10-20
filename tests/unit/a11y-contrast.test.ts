import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
const token = (name: string, scope = css) => scope.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1] ?? null;

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

describe("text contrast of design tokens (WCAG AA 4.5:1)", () => {
  const ink = token("--color-ink")!, soft = token("--color-ink-soft")!, cream = token("--color-cream")!, paper = token("--color-paper")!;
  it("base text colours", () => {
    expect(ratio(ink, cream)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(ink, paper)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(soft, cream)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(soft, paper)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(ink, token("--color-sun")!)).toBeGreaterThanOrEqual(4.5);
  });
  it("feedback colours are readable on white", () => {
    expect(ratio(token("--color-good")!, paper)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(token("--color-try")!, paper)).toBeGreaterThanOrEqual(4.5);
  });
  for (const world of ["number-kingdom", "conversation-cafe", "puzzle-planet", "wonder-world", "creativity-forest"]) {
    it(`world palette: ${world}`, () => {
      const scope = css.match(new RegExp(`\\[data-world="${world}"\\]\\s*\\{([^}]*)\\}`))![1];
      const bg = token("--w-bg", scope)!, fg = token("--w-fg", scope)!, deep = token("--w-deep", scope)!;
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5); // card titles
      expect(ratio("#ffffff", deep)).toBeGreaterThanOrEqual(4.5); // primary buttons
      expect(ratio(deep, bg)).toBeGreaterThanOrEqual(3); // outlines/rings vs card background (non-text, 3:1)
    });
  }
  it("respects reduced motion in CSS", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});
