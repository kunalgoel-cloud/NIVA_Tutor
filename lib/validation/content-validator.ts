// Content validation: used by `npm run validate:content`, by tests, and by the parent library screen.
import { ActivitySchema } from "@/lib/games/schema";
import { ObjectiveSchema, FrameworkSchema, DomainSchema, AGE_BANDS, type Objective, type Framework, type Domain } from "@/lib/curriculum/schema";

export type Issue = { level: "error" | "warning"; scope: string; message: string };

export type ValidationInput = {
  rawActivities: unknown[];
  objectives: unknown[];
  frameworks: unknown[];
  domains: unknown[];
  mediaExists?: (src: string) => boolean; // injected so tests do not need the filesystem
};

// Phrases that must never appear in child-facing text (shaming, pressure, unsafe asks).
export const FORBIDDEN_PHRASES = [
  "you're bad", "you are bad", "stupid", "you failed", "you must get this right", "dumb", "idiot", "hurry up", "wrong answer", "disappointed in you", "i am sad that you", "i'm sad that you",
  "your full name", "your address", "your school", "phone number", "home address", "don't tell your", "keep it a secret", "our secret",
];

function walkStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => walkStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => walkStrings(v, out));
  return out;
}

export function validateContent(input: ValidationInput): Issue[] {
  const issues: Issue[] = [];
  const add = (level: Issue["level"], scope: string, message: string) => issues.push({ level, scope, message });

  // Domains and frameworks
  const domains: Domain[] = [];
  for (const d of input.domains) {
    const r = DomainSchema.safeParse(d);
    if (r.success) domains.push(r.data);
    else add("error", `domain:${(d as { id?: string })?.id ?? "?"}`, r.error.issues.map((i) => i.message).join("; "));
  }
  const frameworks: Framework[] = [];
  for (const f of input.frameworks) {
    const r = FrameworkSchema.safeParse(f);
    if (r.success) {
      frameworks.push(r.data);
      if (r.data.verificationStatus === "verified" && !r.data.reviewDate) add("error", `framework:${r.data.id}`, "verified framework needs a reviewDate");
      if (r.data.verificationStatus === "pending") add("warning", `framework:${r.data.id}`, "source verification is still pending (not actually consulted)");
    } else add("error", `framework:${(f as { id?: string })?.id ?? "?"}`, r.error.issues.map((i) => i.message).join("; "));
  }
  const frameworkIds = new Set(frameworks.map((f) => f.id));
  const domainIds = new Set(domains.map((d) => d.id));

  // Objectives
  const objectives: Objective[] = [];
  const seenObj = new Set<string>();
  for (const o of input.objectives) {
    const r = ObjectiveSchema.safeParse(o);
    if (!r.success) {
      add("error", `objective:${(o as { id?: string })?.id ?? "?"}`, r.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; "));
      continue;
    }
    const ob = r.data;
    if (seenObj.has(ob.id)) add("error", `objective:${ob.id}`, "duplicate objective id");
    seenObj.add(ob.id);
    objectives.push(ob);
    if (!domainIds.has(ob.domain)) add("error", `objective:${ob.id}`, `unknown domain ${ob.domain}`);
    for (const m of ob.frameworkMappings) if (!frameworkIds.has(m.frameworkId)) add("error", `objective:${ob.id}`, `unknown framework ${m.frameworkId}`);
  }
  const objById = new Map(objectives.map((o) => [o.id, o]));
  for (const ob of objectives) for (const p of ob.prerequisites) if (!objById.has(p)) add("error", `objective:${ob.id}`, `unknown prerequisite ${p}`);
  // cycle check
  const visiting = new Set<string>(), done = new Set<string>();
  const visit = (id: string, path: string[]) => {
    if (done.has(id)) return;
    if (visiting.has(id)) { add("error", `objective:${id}`, `prerequisite cycle: ${[...path, id].join(" -> ")}`); return; }
    visiting.add(id);
    for (const p of objById.get(id)?.prerequisites ?? []) visit(p, [...path, id]);
    visiting.delete(id); done.add(id);
  };
  objectives.forEach((o) => visit(o.id, []));

  // Activities
  const seen = new Set<string>();
  const activityIds: string[] = [];
  const publishedObjectives = new Set<string>();
  for (const raw of input.rawActivities) {
    const rawId = (raw as { id?: string })?.id ?? "?";
    const scope = `activity:${rawId}`;
    const parsed = ActivitySchema.safeParse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues) add("error", scope, `${i.path.join(".")}: ${i.message}`);
      continue;
    }
    const a = parsed.data;
    activityIds.push(a.id);
    if (seen.has(a.id)) add("error", scope, "duplicate activity id");
    seen.add(a.id);

    const rids = a.rounds.map((r) => r.id);
    if (new Set(rids).size !== rids.length) add("error", scope, "duplicate round ids");
    if (!AGE_BANDS.includes(a.ageBand)) add("error", scope, "invalid age band");
    if (a.completion.minRoundsCompleted > a.rounds.length) add("error", scope, "completion.minRoundsCompleted exceeds number of rounds");

    for (const oid of a.objectiveIds) {
      const ob = objById.get(oid);
      if (!ob) { add("error", scope, `unknown objective ${oid}`); continue; }
      if (a.status === "published" && ob.status !== "published") add("error", scope, `published activity references non-published objective ${oid}`);
    }
    const primary = objById.get(a.objectiveIds[0]);
    if (primary) {
      if (primary.domain !== a.domain) add("error", scope, `domain ${a.domain} differs from primary objective domain ${primary.domain}`);
      if (primary.ageBand !== a.ageBand) add("warning", scope, `age band ${a.ageBand} differs from objective ${primary.id} (${primary.ageBand})`);
    }
    for (const m of a.frameworkMappings) if (!frameworkIds.has(m.frameworkId)) add("error", scope, `unknown framework ${m.frameworkId}`);
    for (const m of a.media) if (input.mediaExists && !input.mediaExists(m.src)) add("error", scope, `missing media file ${m.src}`);

    if (a.status === "published") {
      if (a.reviewStatus !== "reviewed") add("error", scope, "unreviewed content is marked as published");
      a.objectiveIds.forEach((o) => publishedObjectives.add(o));
    }
    if (a.status === "validated" && a.reviewStatus !== "reviewed") add("warning", scope, "validated but not yet reviewed");

    // Open-ended rounds must not carry a single correct answer
    for (const r of a.rounds) {
      if (a.engine === "tap-choose" && (r as { openEnded: boolean; correctIds: string[] }).openEnded && (r as { correctIds: string[] }).correctIds.length)
        add("error", `${scope}/${r.id}`, "open-ended round must not define correctIds");
      if (a.engine === "listen-respond" && a.rounds.length && !(r as { quickReplies: unknown[] }).quickReplies.length) add("error", `${scope}/${r.id}`, "speech round needs tap alternatives");
    }

    // A story needs something to listen to and something that checks it was understood.
    if (a.engine === "story-listen") {
      const kinds = (a.rounds as { kind: string }[]).map((r) => r.kind);
      if (!kinds.includes("page")) add("error", scope, "story has no pages to listen to");
      if (kinds.filter((k) => k === "question").length < 2) add("error", scope, "story needs at least two questions to check understanding");
      if (kinds[0] !== "page") add("error", scope, "a story must start with a page, not a question");
      if (kinds.at(-1) !== "question") add("error", scope, "a story must end with a question, so understanding is checked before it finishes");
    }

    // Safety scan of all strings
    const text = walkStrings(raw).join(" \n ").toLowerCase();
    for (const p of FORBIDDEN_PHRASES) if (text.includes(p)) add("error", scope, `contains forbidden phrase "${p}"`);
    if (/https?:\/\//.test(text) || /\bwww\./.test(text)) add("error", scope, "child content must not contain external links");
  }

  for (const ob of objectives)
    if (ob.status === "published" && !publishedObjectives.has(ob.id)) add("warning", `objective:${ob.id}`, "published objective has no published activity yet");

  return issues;
}

export const hasErrors = (issues: Issue[]) => issues.some((i) => i.level === "error");
