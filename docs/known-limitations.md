# Known limitations

**Not tested on real hardware or services**
- No real iPad or iPadOS Safari test. Layout, touch targets and reduced motion were tested in desktop Chromium at iPad/phone sizes.
  Voice quality, `speechSynthesis` behaviour and microphone recognition on iPadOS are unverified.
- The Anthropic adapter is tested against a mock only. The Supabase schema is applied to a live project, but the live API, sign-up/sign-in and email confirmation were never exercised (the build sandbox blocked `supabase.co`). The cloud adapter is tested against an in-memory stand-in only. No Vercel account was used.
- Curriculum sources were not opened (no internet in the build environment): see curriculum-mapping.md.

**Not built**
- Cloud features beyond basics: no email-based password reset page, no multi-parent sharing, no offline write queue (if the network drops, new results stay in memory for that session and are not retried).
- Activities for ages 4–7 (objectives exist, `draft`). Only Little Explorer (3–4) is published.
- Six future engines: story arranging, puzzles/mazes, explore & discover, create something (drawing), AI-led free conversation; "Draw and Describe" and "Discover the hidden rule" are therefore absent.
- Server speech-to-text adapter; recorded voice/character audio files; illustrated artwork (emoji + SVG used).
- Preserving an activity in progress across a page reload.

**Design trade-offs**
- Parent gate is a deterrent, not security. A shared device user can clear data.
- Rate limiting is in-memory (per serverless instance). Provider-side spend limits are the real cap.
- Progress rules are transparent heuristics (documented in architecture.md), not validated psychometrics. Treat them as a conversation
  starter, not an assessment.
- Keyword-based understanding in the built-in conversation is shallow; unexpected answers get a friendly generic reply.
- Open-ended creative rounds record participation only; they cannot raise an objective above "Practising".
- Emoji appearance varies by OS version. Some emoji may look different on older iPadOS.
- `localStorage` is shared per browser profile: two children on one iPad should use separate profiles (supported).

## Games are not repeated (by default)
A finished game (one played to the end; stopping early does not count) is hidden from the child's lists and from Today's Adventure until a grown-up uses **Grown-ups → Settings → Games → Reset all games**. This keeps play fresh, but young children also learn by repetition: with 149 games a child can run out, and the learning engine then has nothing to revisit. The switch "Don't repeat games" turns the rule off. Resetting keeps all history and progress; it only moves the "already played" marker.

## Screen-time limit
The play-time counter and rest period are per browser and per device, so another device or browser has its own timer, and clearing site data resets it. It counts only while a child screen is visible, and the rest starts immediately (a game in progress is left unfinished and is not counted as played). It relies on the device clock.
