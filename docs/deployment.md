# Deployment guide

## Local development
```bash
npm install
cp .env.example .env.local   # optional; the app works with nothing set
npm run dev
```

## Vercel (hosting, gives you https so the iPad microphone works)
1. Put the project on GitHub. 2. In Vercel: *Add New → Project → import the repo* (framework: Next.js; defaults are fine).
3. Add environment variables only if you want them (Project → Settings → Environment Variables):

| Variable | Scope | Purpose |
|---|---|---|
| `AI_ENABLED`, `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` | server only | AI conversation |
| `AI_RATE_LIMIT_PER_HOUR`, `AI_TIMEOUT_MS` | server only | abuse protection |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | future Supabase use |
| `SUPABASE_SERVICE_ROLE_KEY` | server only, scripts | never expose to the browser |

4. Deploy. Open the Vercel URL on the iPad → Share → Add to Home Screen.

A deployed URL is public unless you add Vercel's deployment protection or a password. The app contains no personal data in code and
stores progress only on each device, but consider enabling protection for a private family app.

## Security headers
`next.config.ts` sets `nosniff`, no-referrer, `X-Frame-Options: DENY` and a Permissions-Policy that allows only the microphone.

## Before real use
- Decide whether to enable the microphone (browser vendors may process audio).
- Read [privacy.md](privacy.md). This is **not legal advice or a compliance claim**.
- If using AI: review the provider's data-retention and data-use terms and set a spend limit with the provider.

This guide was not exercised against a live Vercel or Supabase account (no credentials were available).
