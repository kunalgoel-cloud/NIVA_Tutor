# Curriculum mapping and source register

## Honest status
When this was built the environment **could not reach the internet** (DNS lookups failed), so **no framework document was opened**.
Every entry in `content/frameworks.ts` is `verificationStatus: "pending"` with `reviewDate: null`, and the app says so in
Library → Curriculum sources. URLs are the publishers' well-known addresses recalled from memory and must be checked by a person.
Learning-area names are general knowledge, not quotations. **No clause numbers are cited** and none should be added until someone has read the source.

To verify: open each URL, read the relevant section, correct the notes, then set `verificationStatus: "verified"` and `reviewDate`.
The validator refuses "verified" without a date.

## Register (all pending)
| Id | Framework | Issuer | Used for |
|---|---|---|---|
| ncf-fs | National Curriculum Framework for the Foundational Stage | NCERT, India | India context, play-based approach, holistic balance |
| eyfs | Early Years Foundation Stage | UK Dept for Education | Communication & language, maths progression, adult-child interaction |
| nel | Nurturing Early Learners | Singapore MOE | "Discovery of the world", learning dispositions (starts at age 4, so 3–4 mappings are indicative) |
| elof | Head Start Early Learning Outcomes Framework | US Office of Head Start | Developmental progressions within a domain |
| montessori | Montessori principles | AMS / AMI (tradition) | Concrete→abstract maths, one idea at a time, self-correction |
| reggio | Reggio Emilia approach | Reggio Children | Open-ended creative tasks, many ways of expressing ideas |
| evidence | Nurturing Care Framework (evidence-informed principles) | WHO/UNICEF/World Bank | Short sessions, spaced review, offline adult-child activities |

## How the frameworks were combined (not just merged)
- **Overlap:** all four government frameworks treat language, early number, social-emotional development and discovery of the world
  as core, and all favour learning through play. Those became the eight domains.
- **Differences:** age ranges differ (EYFS/ELOF start at birth; NEL at 4; NCF-FS spans 3–8) and domain boundaries differ (for
  example literacy sits inside "language" in some and apart in others). The app keeps its own eight domains and records the
  mapping per objective at learning-area level (`aligns`, `partial`, `informs`).
- **Age limits:** the Little Explorer (3–4) band is only partly covered by NEL; mappings there are marked `partial`.
- **Not claimed:** the app is not aligned to or endorsed by any framework.

## Developmental bands (flexible, not deadlines)
Little Explorer 3–4 · Curious Thinker 4–5 · Confident Learner 5–6 · Young Problem Solver 6–7.
58 objectives exist across all bands; those for ages 4+ are `draft` ("planned") and have no activities yet.

## Progression models (per domain, in `content/domains.ts`)
- **Mathematics:** physical quantities → visual quantities → numerals/order → mental imagery → abstract calculation.
- **Spoken English:** naming → describing → sentences → "because" → connected explanations.
- **Conversation:** respond → take turns → reasons/preferences → narrate → sustain.
- **Logic:** match → sort/odd-one-out → patterns/memory → cause-effect/planning → hidden rules.
- **Literacy:** stories/rhyme → first sounds → word-picture links → retelling → blending/reading.
- **Science:** notice → group → cause/effect → observe change → test ideas.
- **Creativity:** play with ideas → add to a story → invent → full story → create and explain.
- **Social-emotional:** name feelings → notice others' → kind/safe choices → solve problems → independence.

Each objective carries: id, domain, subdomain, title, description, band, prerequisites, prior knowledge, examples, activity types,
observable success criteria, common difficulties, hints, next steps, framework mappings, parent explanation, publication status.
Difficulty (1–3) only orders activities *within* an objective; progression comes from the objective ladder.
