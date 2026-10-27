# OpenRouter integration for Al-Ahruf Academy

## What changed

The authenticated `academy_chat` action now uses OpenRouter's OpenAI-compatible Chat Completions endpoint for its generative fallback. The academy's existing deterministic answers, Supabase authentication, role scoping, and platform actions remain in `academy-api/index.ts`.

## Required Supabase Edge Function secrets

Configure these in the Supabase Dashboard for the academy's active project, under **Edge Functions → Secrets**:

- `OPENROUTER_API_KEY`: your OpenRouter API key (secret; never commit it or put it in frontend code).
- `OPENROUTER_MODEL`: optional. Defaults to `openrouter/free`. If overridden, the code accepts only `openrouter/free` or a model identifier ending in `:free`; other identifiers are refused so this integration does not intentionally call a paid model.

Do not add the key to GitHub Pages environment variables or any `VITE_*` / frontend setting. A key must be configured by the project owner before generative replies can be tested.

The code has been deployed to the active Supabase project (`bxwrdutoauonbfdbrhsu`, Edge Function version 152). The OpenRouter provider has not been live-tested because the API key has not been configured through this workflow.

## Free-only behavior

- Default model is `openrouter/free`, which routes to eligible free model endpoints.
- Explicit model overrides must be marked `:free`.
- There is no OpenAI fallback and no automatic paid-model fallback in application code.
- Free endpoints have rate limits, may be unavailable, and their availability/model selection can change. The built-in academy responses continue to handle known intents when the model call is unavailable.
- This implementation uses the standard free-tier request shape. Do not assume provider-specific data-retention policies are enforced by the free plan. Avoid sending passwords, access tokens, payment details, or unnecessary student-identifying information to the generative model.

## Deploy

After configuring the secret, deploy the existing Edge Function to the project's intended Supabase project using the repository's normal deployment workflow. For a local Supabase CLI setup, the command is:

```sh
supabase functions deploy academy-api --project-ref bxwrdutoauonbfdbrhsu
```

Never put the API key directly in a shell command that may be saved in history. Prefer the Supabase Dashboard's secret manager or a protected local environment file.

**GitHub Actions note:** the latest automatic deployment attempt failed because the repository secret `SUPABASE_ACCESS_TOKEN` was rejected by Supabase as an invalid access token. Replace that GitHub Actions secret with a current Supabase personal access token before relying on automatic deployments. The direct Supabase deployment for version 152 succeeded.

## Smoke tests after deployment

1. Sign in as a test account and ask a general academy question in English, French, then Arabic.
2. Ask a follow-up question to verify the recent conversation context.
3. Confirm account-specific ranking, timetable, and payment questions still use the existing backend handlers.
4. Verify a student cannot see another student's private records and a teacher cannot see administrator-only payment data.
5. Temporarily test with the key absent and with a deliberately invalid free-model identifier; the request must not fall back to a paid model.
6. Test provider errors/rate limits and confirm the UI remains usable.
7. Inspect browser assets and Git history to confirm no API key was exposed.

A successful GitHub commit does not by itself configure the secret or deploy the Supabase Edge Function. Mark the integration live only after the smoke tests pass.
