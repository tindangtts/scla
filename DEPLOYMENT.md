# Deployment — Star City Living App (SCLA)

> Production target: Vercel. Last updated: 2026-04-11 (Phase 35-01).

## Vercel Project Configuration

- **Root Directory:** repo root (the monorepo root). Do NOT set to `artifacts/web`.
- **Install Command:** `pnpm install --frozen-lockfile` (declared in vercel.json).
- **Build Command:** `pnpm --filter @workspace/web build` (declared in vercel.json).
- **Output Directory:** `artifacts/web/.next` (declared in vercel.json).
- **Framework Preset:** Next.js (declared in vercel.json).
- **Region:** `sin1` (Singapore) — closest to Yangon.

## Required Environment Variables

All keys also listed blank in `artifacts/web/.env.example`.

| Key | Source | Required |
|-----|--------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase dashboard → Project Settings → API | yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase dashboard → API | yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase dashboard → API (service role — keep secret) | yes |
| DATABASE_URL | Supabase → Connection Pooling (port 6543) | yes |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | Generated via `npx web-push generate-vapid-keys` | yes |
| VAPID_PRIVATE_KEY | Same command as above | yes |
| VAPID_SUBJECT | mailto: address for push subscriptions | yes |
| RESEND_API_KEY | resend.com dashboard (blank disables email) | optional |
| CRON_SECRET | random 64-char hex — shared with Vercel Cron | yes |
| NEXT_PUBLIC_WS_URL | LEAVE BLANK on Vercel (polling fallback — see §WebSocket) | no |
| WS_BROADCAST_URL | LEAVE BLANK on Vercel (polling fallback — see §WebSocket) | no |

## Cron Schedule

Declared in `vercel.json`:

- **Path:** `POST|GET /api/cron/bill-overdue-check`
- **Schedule:** `0 2 * * *` (02:00 UTC = 08:30 Asia/Yangon, daily)
- **Auth:** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. The handler also accepts legacy `x-cron-secret` for manual invocations.

To manually invoke against the deployed URL:

```sh
curl -X POST "https://<vercel-url>/api/cron/bill-overdue-check" \
  -H "x-cron-secret: $CRON_SECRET"
```

To replay historical overdue notifications (admin/one-off):

```sh
curl -X POST "https://<vercel-url>/api/cron/bill-overdue-check?force=true" \
  -H "x-cron-secret: $CRON_SECRET"
```

## WebSocket (WS-01, WS-02)

**Decision:** Ticket chat runs on **HTTP polling fallback** in production. No standalone WebSocket server is deployed.

**Why:**
- Vercel serverless does not host long-lived WS connections.
- Current load (9,000 residents, bursty chat) is handled adequately by polling.
- Running a standalone WS server (Railway/Fly.io) adds operational cost not justified at current scale.

**Future:** Migration to Supabase Realtime is tracked as **ENH-04** in `.planning/REQUIREMENTS.md` and is out of scope for v3.1.

**How to run a standalone WS server (optional, not required for v3.1):**
1. Deploy `artifacts/ws-server/` (if present) to Railway or Fly.io.
2. Set `NEXT_PUBLIC_WS_URL` and `WS_BROADCAST_URL` in Vercel to point at it.
3. Redeploy the web app.

Until then, leave `NEXT_PUBLIC_WS_URL` and `WS_BROADCAST_URL` blank in Vercel — the client code already falls back to polling when they are unset.

## Smoke Test Checklist (post-deploy)

Plan 35-02 walks through this. Minimum path:
1. Resident login + dashboard loads (bills visible).
2. Admin login (separate theme) + admin dashboard loads.
3. Manual cron invocation returns 200 JSON.
4. Chat widget opens in a ticket and receives polled updates.

See `.planning/phases/35-vercel-deployment/` for the full phase plan.
