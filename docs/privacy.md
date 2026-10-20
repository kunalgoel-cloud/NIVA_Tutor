# Privacy, safety and data retention

## Principles implemented
- No ads, analytics, trackers, public profiles, leaderboards, streaks, timers or external links in the child interface (a content test rejects links).
- Nickname only; no date of birth, photo, school, address or contact details are requested anywhere. Demo data is fictional.
- **No raw audio is recorded. No conversation transcripts are stored** (there is deliberately no setting to enable it). What is stored
  per activity: activity id/version, objective, per-round outcome, hint counts, timestamps, duration, and an optional note you type.
- AI and microphone are **off by default** and need parent opt-in. Games work without either.
- Feedback is encouraging; a validator blocks shaming phrases, identity requests and "keep it secret" wording in content, and the AI
  output filter blocks the same.
- Progress wording is neutral and evidence-based; no labels such as "gifted" or "delayed".

## Where data lives
Current mode: browser `localStorage` on the device only (not backed up, not synced). Nothing is sent to any server except, if you enable
it, the AI conversation requests described in [ai-and-speech.md](ai-and-speech.md).

## Retention
Play history older than the retention window (default 2 years; choose 3 months–5 years in Settings) is deleted automatically when the
app opens. You can also delete a profile, or everything, at any time (Grown-ups → Data & privacy; type DELETE to confirm).

## Export and delete
Download a JSON export per child (profile, settings without the PIN hash, attempts). With Supabase later, `export_child_data()` and
`delete_child_profile()` do the same server-side under RLS.

## The parent gate
A words-based sum or optional PIN keeps small children out of settings. **It is not security**: anyone with the device can clear site
data. Real protection of stored family data needs Supabase Auth + Row Level Security (written and tested, not yet connected).

## India's Digital Personal Data Protection Act, 2023
Children's data has special treatment (for example verifiable parental consent and limits on tracking/targeted advertising). The detailed
rules and their commencement dates must be checked at deployment time. **No compliance claim is made here.** The design (minimal data,
no tracking, parent control, deletion/export) is intended to make a later review easier. For a private single-family app, get advice
before storing data in the cloud or sharing the app beyond your family.
