# Little Wonder World

A private, gentle, game-style early-learning app for one child, aged 3 now and growing to 7.
Five learning worlds (Number Kingdom, Conversation Café, Puzzle Planet, Wonder World, Creativity Forest), 149 original
activities for ages 3–4, a parent area with evidence-based progress, and an optional AI conversation partner.

**It works fully with no accounts, no database and no AI key.** Everything below is honest about what is built and tested.

## Start it (3 commands)

```bash
npm install          # once
npm run dev          # starts the app on port 3000
```
Then open <http://localhost:3000>. Press **Let's play!** to start with a fictional *Demo Explorer*, or open **Grown-ups**
(bottom of the welcome screen) and **Set up a child profile**.

The grown-up gate asks a sum written in words, for example "What is seven plus eight?". Type the number.

### Open it on your iPad
1. Put the iPad and the computer running `npm run dev` on the **same Wi-Fi**.
2. Find the computer's address: on a Mac, System Settings → Network → Wi-Fi → Details → IP address (looks like `192.168.1.23`).
3. On the iPad open Safari and go to `http://192.168.1.23:3000`.
4. Optional: Share → **Add to Home Screen** for a full-screen app.

**Important:** Safari only allows the **microphone** on secure (https) pages, so on `http://192.168…` games, spoken
instructions and tap answers work, but "Talk to me" will not. To test the microphone, deploy to Vercel (https) — see
[docs/deployment.md](docs/deployment.md).

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Start the app for development (reachable from your iPad) |
| `npm run build` / `npm start` | Production build and run |
| `npm run check` | Typecheck + lint + content validation + all unit/integration tests |
| `npm run test:e2e` | Browser tests with Playwright (builds the app, runs on port 3100) |
| `npm run validate:content` | Checks every activity, objective and framework entry |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the content |

## Status at a glance
See [docs/checklist.md](docs/checklist.md) for the full prioritised list. In short:

| Area | Status |
|---|---|
| 7 reusable game engines (adds stories with questions, and mazes), 149 data-driven activities for ages 3 to 7, validation, graceful errors | Implemented and tested |
| Hints, feedback, evidence tracking, rules-based progress + recommendations, Today's Adventure | Implemented and tested |
| Parent area: gate, overview, progress, history, library/publishing, settings, export/delete | Implemented and tested |
| Local demo mode with clearly fictional data | Implemented and tested |
| AI provider abstraction + safety filters + built-in conversation fallback | Implemented and tested (provider call tested with a mock, **not** against the live API) |
| Browser speech (read aloud, microphone with tap fallback) | Implemented; read-aloud and fallbacks tested with fakes, **not on a real iPad** |
| SQL schema, Row Level Security, least-privilege grants, seed | Applied to a live Supabase project; rules tested in an in-process Postgres and checked on the live schema via SQL |
| Cloud storage + parent sign-in (Supabase) | Implemented; adapter tested against an in-memory stand-in; **the live API connection and sign-in flow are not yet tested** |
| Content for ages 4–7 | **Not implemented** (structure and objectives exist; activities do not) |
| Further engines (drawing, building, open exploration, …) | **Not implemented** (architecture ready) |
| Curriculum sources verified | **Pending** (could not open them while building) |

## Documentation
- [Architecture](docs/architecture.md) · [Curriculum mapping & source register](docs/curriculum-mapping.md) · [Content workflow](docs/content-workflow.md)
- [AI & speech](docs/ai-and-speech.md) · [Database & cloud storage](docs/database.md) · [Deployment](docs/deployment.md)
- [Privacy & data retention](docs/privacy.md) · [Known limitations](docs/known-limitations.md) · [Checklist](docs/checklist.md)
