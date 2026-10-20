# Prioritised implementation checklist

Legend: ✅ implemented & tested · 🟡 implemented, not fully tested · 🔶 partial · ⬜ not implemented

## Release 1 (this version)
- ✅ Next.js app, design system, 5 worlds, navigation, all 16 required screens (welcome, parent setup, profile select, world home, world overview/activity selection, game, conversation, completion, Today's Adventure, parent dashboard, progress, library, settings, export/delete, error/offline/not-found)
- ✅ 5 engines; 91 original activities (8 domains); Zod validation; calm failure screens
- ✅ Hints (4 levels), feedback, pause/skip/stop, evidence recording
- ✅ Evidence categories; deterministic recommendations with reasons; Today's Adventure; offline missions kept separate
- ✅ Content validation script + publication lifecycle (draft → validated → published → retired)
- ✅ Demo mode (fictional, separate, resettable); local persistence; export; deletion; retention
- ✅ Parent gate (+ optional PIN); settings for band, session, audio, mic, AI, privacy
- ✅ AI provider interface, service, safety filters, rate limit, fallback (mock-tested)
- 🟡 Read-aloud + microphone with fallbacks (fakes only; no real iPad)
- 🟡 SQL schema + RLS + least privilege: applied to a live project and checked there via SQL; live API/auth flow untested
- 🟡 Accessibility: contrast, 44px targets, keyboard (parent), labels, reduced motion, non-colour cues tested in Chromium; no screen-reader (VoiceOver) pass
- ⬜ Curriculum source verification (pending a human with internet)

## Next, in order
1. **Test on the real iPad** (read-aloud voice, touch feel, orientation, Add to Home Screen). Fix what you find.
2. **Deploy to Vercel** for https; test the microphone on the iPad.
3. **Verify the curriculum sources** and update `content/frameworks.ts`.
4. **Live-test AI** with a key and a spend limit; tune persona prompts.
5. **Play-test with your child**; adjust wording, difficulty, session length. Add more Little Explorer activities where gaps appear.
6. **Test cloud sign-in end to end** (create parent account, play, check data appears in Supabase, sign in on a second device). Then add password reset and decide on email confirmation settings.
7. Content for 4–5 (Curious Thinker): addition within 5, number bonds, estimation, hidden rules.
8. New engines: Arrange the Story, Solve the Puzzle (mazes), Explore & Discover, Create Something (drawing).
9. Recorded character voices and illustrated art; image `media` support is in the schema.
10. Privacy review (DPDP rules at deployment time) before any cloud storage of child data.
