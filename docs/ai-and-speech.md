# AI conversation and speech

## What happens by default
Conversation activities use a **built-in responder** (`lib/ai/local.ts`) that reads the child's words (typed, spoken or tapped),
matches *meaning* (keywords and inflections such as "mangoes"), replies in context, gently models a fuller sentence for very short
answers, and ends gracefully after the activity's turn limit. No network, no key.

## Turning on AI (optional)
1. Server only: set `AI_ENABLED=true`, `AI_PROVIDER=anthropic`, `AI_API_KEY`, `AI_MODEL` (see `.env.example`).
2. In Grown-ups → Settings → *AI conversation*, tick *Allow AI-powered replies*.
Both are required. Settings shows the server status and, if not configured, names the missing variables (never values).

## Request flow
Browser (`lib/ai/client.ts`) → `POST /api/conversation` → `runConversation` (`lib/ai/service.ts`):
validate request (Zod, ≤200 chars, ≤8 history turns) → look up the **approved activity** (unknown activities refused: no open-ended chatbot) →
redact emails/links/long numbers → build a system prompt with safety rules, persona, objective → call provider with a timeout →
validate the structured reply (Zod) → screen the text (no links, identity requests, secrecy, claiming to be a real child, shaming,
more than one question) → on *any* problem return the built-in reply. On the last turn the ending is forced.

Structured reply: `spokenResponse`, optional `displayText`, `state` (continue / wrap-up), `nextPrompt`, `needsClarification`,
`endActivity`, `safetyFallback`.

**Never sent to the provider:** nickname, exact age, progress, history from other activities. Sent: the short current message, up to
8 turns of *this* conversation, activity id, age band.

Controls: input/output validation, 8 s default timeout, per-IP hourly rate limit (`AI_RATE_LIMIT_PER_HOUR`, in-memory so best-effort on
serverless), a per-device daily cap set by the parent, bounded history, and silent fallback.

## Adding another provider
Implement `ConversationProvider` (`lib/ai/types.ts`): `id`, `isConfigured()`, `respond(input, signal)` returning untrusted JSON matching
`ConversationResponseSchema`. Pick it in `app/api/conversation/route.ts`. `lib/ai/anthropic.ts` is the reference.

## Speech
- **Read aloud:** browser `speechSynthesis` (`lib/speech/synthesis.ts`), picks an English voice, slower rate, respects mute and volume.
  Never throws; silent if unsupported.
- **Microphone:** off by default; parent opt-in. `lib/speech/recognition.ts` wraps browser recognition behind an `SttAdapter`
  interface. It reports `unsupported / denied / no-speech / error` and the child is always offered picture taps (and a grown-up
  can type). Listening stops after 12 s. Audio is never recorded or stored by the app; the transcript is used for one reply and discarded.
- **Privacy caution:** browser recognition may send audio to Apple/Google. Review that before enabling; any other STT service needs a
  privacy review first. A server STT adapter is **not implemented**.
