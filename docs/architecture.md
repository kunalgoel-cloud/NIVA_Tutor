# Architecture

```
app/            Next.js pages. Child: / , /worlds, /worlds/[slug], /play/[id], /today, /explore
                Parent (behind the gate): /parent, /parent/{setup,progress,history,library,settings,data}
                API: /api/conversation (AI, server-only secrets), /api/status (config status, no secrets)
components/     UI only. games/ (ActivityRunner + 5 engines), parent/, layout/, characters/, worlds/, ui/
content/        The curriculum as typed data: domains, objectives, frameworks, activities/, characters, worlds
lib/            Business logic with no UI: games/ curriculum/ learning/ recommendations/ ai/ speech/
                database/ privacy/ parent/ validation/
supabase/       SQL migrations (schema + Row Level Security) and a generated seed
tests/          unit/ integration/ e2e/
scripts/        validate-content.ts, generate-seed-sql.ts
```

## Two separate ideas: worlds vs domains
- **World** = where the child navigates (5 of them).
- **Domain** = the underlying curriculum area (8 of them). Every activity has one of each. For example *What Happens When…?* lives
  in Wonder World but belongs to the Logic & Puzzles domain.

## Game engines
Each activity is **data** validated by Zod (`lib/games/schema.ts`) and drawn by an engine. Engines never decide feedback, hints or
recording; they only report `correct` / `incorrect` / `open` to the **ActivityRunner**, which owns the whole loop
(introduce → explain → respond → evaluate → feedback → hint → continue → record).

| Engine | Variants | Used for |
|---|---|---|
| tap-choose | single choice, memory ("hide one"), open-ended | odd-one-out, comparing groups, story endings, feelings… |
| count-collect | count (tap each, pick number), collect ("give N") | counting, feed the dinosaur |
| match-pair | pairs, sort into baskets | shadows, animal homes, sort by size |
| complete-pattern | complete the blank, put in order | patterns, number train, story order |
| listen-respond | tap / type / speak; meaning-based replies | all conversation activities |

**Adding an engine:** add the type and round schema in `lib/games/schema.ts`, write a component that follows `EngineProps`
(`components/games/types.ts`), add a case in `components/games/registry.tsx`. Nothing else changes. Reserved future names are
listed in `PLANNED_ENGINES`.

**Safety of activity data:** activities are plain JSON-like data, parsed with Zod; no `eval`, no HTML, no URLs. A bad activity gets
a calm "not ready" screen (and the `EngineBoundary` catches render failures).

## Learning engine (transparent rules, no machine learning)
- `lib/learning/progress.ts` turns per-round observations into one of six evidence categories. Rules: one answer is never mastery;
  the same question repeated counts once; successes among ≤2 options are half-weight (guessing); hints and shown answers never count
  as independent; "independent" needs successes across ≥2 activities; "ready for challenge" also needs ≥2 different days;
  open-ended rounds never claim mastery.
- `lib/recommendations/recommend.ts` scores each eligible activity and returns **reasons** the parent can read. Eligibility: within
  the age band, prerequisites at "with support" or better (or no activity exists for the prerequisite, so nothing deadlocks).
  Scoring favours practising/new objectives, due reviews, domain rotation, interests; penalises repeats within a day.
  Evidence-free attempts are ignored, so stopping early is never penalised.
- `lib/recommendations/adventure.ts` builds Today's Adventure: counting, chat, puzzle, story/nature/feelings, plus a separate offline mission.

## Data flow
`AppProvider` (React context) → `LocalRepository` (browser localStorage behind the `Repository` interface). If storage fails, play
continues in memory and a gentle notice appears. A future `SupabaseRepository` implements the same interface.

## Why these choices (plain English)
- **Local-first:** your child can play immediately, nothing leaves the device, and there is nothing to configure.
- **Content in code:** every activity is reviewable in git, validated and tested before the child can see it.
- **Emoji + SVG characters:** one consistent look with no image licensing or download weight; real illustrations can be added later via the `media` field.
