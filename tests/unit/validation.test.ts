import { describe, expect, it } from "vitest";
import { DOMAINS, FRAMEWORKS, OBJECTIVES, RAW_ACTIVITIES } from "@/content";
import { activity, T } from "@/content/builders";
import { hasErrors, validateContent } from "@/lib/validation/content-validator";
import { canTransition, effectiveActivity, isChildVisible } from "@/lib/validation/publication";
import { ActivitySchema } from "@/lib/games/schema";

const run = (raw: unknown[], extra: Partial<Parameters<typeof validateContent>[0]> = {}) =>
  validateContent({ rawActivities: raw, objectives: OBJECTIVES, frameworks: FRAMEWORKS, domains: DOMAINS, mediaExists: () => true, ...extra });
const mk = (over: Record<string, unknown> = {}) => ({
  ...activity({ id: "t1", title: "T", description: "d", world: "puzzle-planet", domain: "logic-puzzles", obj: ["LOG-ODD-01"], instructions: "Tap one" }, "tap-choose", [T("r1", "Pick", ["🍎|a", "🚗|b"], [0])]),
  ...over,
});
const messages = (raw: unknown) => run([raw]).filter((i) => i.level === "error").map((i) => i.message).join(" | ");

describe("content validation script logic", () => {
  it("the shipped library has zero errors", () => {
    const errors = run(RAW_ACTIVITIES).filter((i) => i.level === "error");
    expect(errors).toEqual([]);
    expect(hasErrors(run(RAW_ACTIVITIES))).toBe(false);
  });
  it("flags missing fields", () => {
    const { instructions: _i, ...rest } = mk() as Record<string, unknown>; // eslint-disable-line @typescript-eslint/no-unused-vars
    expect(messages(rest)).toMatch(/instructions/);
  });
  it("flags missing feedback", () => {
    expect(messages(mk({ feedback: { correct: [], encourage: ["x"], complete: ["y"] } }))).toMatch(/feedback/);
  });
  it("flags invalid objective references", () => {
    expect(messages(mk({ objectiveIds: ["NOPE-XX-99"] }))).toMatch(/unknown objective/);
  });
  it("flags invalid age bands and unsupported engines", () => {
    expect(messages(mk({ ageBand: "toddler" }))).toMatch(/ageBand|age/i);
    expect(messages(mk({ engine: "solve-puzzle" }))).toMatch(/engine/i);
  });
  it("flags malformed answer configuration", () => {
    expect(messages(mk({ rounds: [T("r1", "Pick", ["🍎|a", "🚗|b"], [])] }))).toMatch(/correctIds/);
  });
  it("flags missing media files", () => {
    const withMedia = mk({ media: [{ type: "image", src: "/images/nope.png" }] });
    const issues = run([withMedia], { mediaExists: () => false });
    expect(issues.some((i) => /missing media/.test(i.message))).toBe(true);
  });
  it("flags unreviewed content marked as published", () => {
    expect(messages(mk({ reviewStatus: "unreviewed", status: "published" }))).toMatch(/unreviewed content is marked as published/);
  });
  it("flags duplicate ids and duplicate round ids", () => {
    expect(run([mk(), mk()]).some((i) => /duplicate activity id/.test(i.message))).toBe(true);
    const dupRounds = mk({ rounds: [T("r1", "A", ["🍎|a", "🚗|b"], [0]), T("r1", "B", ["🍎|a", "🚗|b"], [0])] });
    expect(messages(dupRounds)).toMatch(/duplicate round ids/);
  });
  it("flags a domain that disagrees with the primary objective", () => {
    expect(messages(mk({ domain: "mathematics" }))).toMatch(/differs from primary objective domain/);
  });
  it("flags a published activity that points at a planned (draft) objective", () => {
    expect(messages(mk({ objectiveIds: ["MATH-ADD-01"], domain: "mathematics" }))).toMatch(/non-published objective/);
  });
  it("blocks shaming language, secrecy and identity requests in child content", () => {
    for (const bad of ["You failed!", "Tell me your full name", "It's our secret", "That was stupid"]) {
      const r = mk({ feedback: { correct: ["Good"], encourage: [bad], complete: ["Done"] } });
      expect(messages(r)).toMatch(/forbidden phrase/);
    }
  });
  it("blocks external links in child content", () => {
    expect(messages(mk({ description: "see https://example.com" }))).toMatch(/external links/);
  });
  it("flags prerequisite cycles and unknown frameworks", () => {
    const objs = OBJECTIVES.map((o) => (o.id === "MATH-CNT-01" ? { ...o, prerequisites: ["MATH-CNT-02"] } : o));
    expect(run([], { objectives: objs }).some((i) => /cycle/.test(i.message))).toBe(true);
    const bad = OBJECTIVES.map((o, i) => (i === 0 ? { ...o, frameworkMappings: [{ frameworkId: "zzz", reference: "x", mappingType: "aligns" }] } : o));
    expect(run([], { objectives: bad }).some((i) => /unknown framework/.test(i.message))).toBe(true);
  });
  it("reports pending source verification as a warning, never as verified", () => {
    const w = run([]).filter((i) => i.level === "warning" && /verification/.test(i.message));
    expect(w.length).toBe(FRAMEWORKS.length);
    expect(FRAMEWORKS.every((f) => f.verificationStatus === "pending" && f.reviewDate === null)).toBe(true);
  });
  it("treats every shipped objective as complete under the schema", () => {
    expect(run([]).filter((i) => i.scope.startsWith("objective:") && i.level === "error")).toEqual([]);
  });
});

describe("publication rules", () => {
  const parse = (over: Record<string, unknown>) => ActivitySchema.parse(mk(over));
  it("only published AND reviewed activities are visible to the child", () => {
    expect(isChildVisible(parse({}))).toBe(true);
    for (const status of ["draft", "validated", "retired"]) expect(isChildVisible(parse({ status }))).toBe(false);
    expect(isChildVisible(parse({ reviewStatus: "unreviewed" }))).toBe(false);
  });
  it("enforces the draft -> validated -> published -> retired lifecycle", () => {
    const draft = parse({ status: "draft" });
    expect(canTransition(draft, "published", false).ok).toBe(false);
    expect(canTransition(draft, "validated", false).ok).toBe(true);
    expect(canTransition(parse({ status: "validated" }), "published", false).ok).toBe(true);
    expect(canTransition(parse({ status: "published" }), "retired", false).ok).toBe(true);
    expect(canTransition(parse({ status: "published" }), "draft", false).ok).toBe(false);
  });
  it("refuses to publish unreviewed content or content with validation errors", () => {
    expect(canTransition(parse({ status: "validated", reviewStatus: "unreviewed" }), "published", false).reason).toMatch(/reviewed/);
    expect(canTransition(parse({ status: "validated" }), "published", true).ok).toBe(false);
  });
  it("applies parent overrides without mutating content", () => {
    const a = parse({});
    const retired = effectiveActivity(a, { [a.id]: { status: "retired" } });
    expect(retired.status).toBe("retired");
    expect(a.status).toBe("published");
    expect(isChildVisible(retired)).toBe(false);
  });
});
