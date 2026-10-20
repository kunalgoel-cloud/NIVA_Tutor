# Known limitations

**Not tested on real hardware or services**
- No real iPad or iPadOS Safari test. Layout, touch targets and reduced motion were tested in desktop Chromium at iPad/phone sizes.
  Voice quality, `speechSynthesis` behaviour and microphone recognition on iPadOS are unverified.
- The Anthropic adapter is tested against a mock only. No live Supabase project or Vercel account was used.
- Curriculum sources were not opened (no internet in the build environment): see curriculum-mapping.md.

**Not built**
- Supabase login and cloud sync (SQL is ready; `SupabaseRepository` is not written).
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
