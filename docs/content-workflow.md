# Content-production workflow

1. **Pick an objective** in `content/objectives.ts` (or write one first). Every activity needs a real objective.
2. **Draft** the activity in `content/activities/*.ts` with the helpers in `content/builders.ts` (`T`, `CNT`, `GIVE`, `PAIRS`, `SORT`,
   `PAT`, `ORD`, `LR`). AI may help draft prompts, hints, feedback, alternative answers and parent explanations, but:
   - it never decides the curriculum or the game rules, and
   - nothing it writes is published until it passes the steps below.
3. Set `status: "draft"` and `review: "unreviewed"` while drafting (`activity({... status, review })`).
4. **Validate:** `npm run validate:content` checks missing fields, unknown objectives, bad age bands, unsupported engines, malformed
   answers, missing instructions/feedback, missing media files, shaming language, identity requests, secrecy phrases, external
   links, duplicate ids, domain/objective mismatches, and "published but unreviewed".
5. **Play it** yourself (and `npm run check`: a test plays every published round with an automated solver).
6. **Review** the wording against the principles (encouraging, one idea, no pressure). In the app: Grown-ups → Library → open the
   activity → *Mark as reviewed*.
7. **Publish** in the app (Validate → Publish) or in code (`status: "published", review: "reviewed"`). Only published *and* reviewed
   activities are visible to the child. **Retire** instead of deleting so history stays meaningful.
8. If you change a published activity's content meaningfully, raise its `version` (attempts record the version played).

Original content only: do not copy worksheets, stories or art from commercial platforms.
