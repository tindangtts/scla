# Phase 35: Vercel Deployment - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Auto-generated — deployment infrastructure

<domain>
## Phase Boundary

Ship the Next.js app to Vercel production with all env vars, daily cron schedule, verified deploy (preview → prod), and clean separation from Replit (archived). WebSocket chat continues on polling fallback (WS-01, WS-02 — just documentation + verification).

This phase splits into **prep work (local, no auth)** and **deploy work (requires Vercel CLI + user browser login)**.

</domain>

<decisions>
## Implementation Decisions

### Prep work (can do without Vercel CLI)

- **vercel.json**: create at repo root with monorepo config:
  ```json
  {
    "installCommand": "pnpm install --frozen-lockfile",
    "buildCommand": "pnpm --filter @workspace/web build",
    "framework": "nextjs",
    "outputDirectory": "artifacts/web/.next",
    "crons": [
      {
        "path": "/api/cron/bill-overdue-check",
        "schedule": "0 2 * * *"
      }
    ]
  }
  ```
  Note: Vercel Cron uses GET unless app handles POST — our route handler is POST. Needs adjustment: make cron handler accept both methods, OR use a simple wrapper.

- **Cron handler adjustment**: add `GET` export to `/api/cron/bill-overdue-check/route.ts` that delegates to the existing POST logic — Vercel Cron sends GET.

- **Vercel Cron secret verification**: Vercel sends `Authorization: Bearer $CRON_SECRET` header (standard). Update cron handler to accept either `x-cron-secret` OR `Authorization: Bearer $CRON_SECRET` for compatibility.

- **Replit cleanup**: delete `.replit`, `.replitignore`, `replit.md`. These are no longer relevant.

- **WS-01/02 docs**: add a short section to `README.md` (or create `DEPLOYMENT.md`) documenting:
  - WebSocket chat runs on polling fallback in production
  - Planned future: migrate to Supabase Realtime (ENH-04)
  - To run WS server standalone (optional): instructions for Railway/Fly.io

- **Env var reference**: create `artifacts/web/.env.example` with all prod env var keys (values blank) so Vercel dashboard setup is easy.

### Deploy work (requires user)

- User runs: `pnpm add -g vercel && vercel login` (one-time browser OAuth)
- From repo root: `vercel link` → create project, select monorepo root = `artifacts/web`
- Set env vars via `vercel env add` or via dashboard — all from local `.env.local`
- `vercel deploy` → preview URL
- Smoke test preview (login, resident dashboard, admin dashboard, cron route)
- `vercel deploy --prod` → production URL
- Verify cron runs the next day (check Vercel logs)

### Claude's Discretion

- Exact cron time (02:00 UTC = 08:30 Yangon — residents asleep, good time to run)
- Whether to use `vercel.json` or configure all via dashboard
- Whether to add `VERCEL_GIT_PULL_REQUEST_ID` check to cron route to skip on preview deployments

</decisions>

<code_context>
## Existing Code Insights

### Files to Create
- `/Users/tindang/workspaces/tts/yoma/scla/vercel.json` — new
- `/Users/tindang/workspaces/tts/yoma/scla/artifacts/web/.env.example` — new
- `/Users/tindang/workspaces/tts/yoma/scla/DEPLOYMENT.md` — new

### Files to Modify
- `/Users/tindang/workspaces/tts/yoma/scla/artifacts/web/src/app/api/cron/bill-overdue-check/route.ts` — add GET method + Bearer auth support

### Files to Delete
- `/Users/tindang/workspaces/tts/yoma/scla/.replit`
- `/Users/tindang/workspaces/tts/yoma/scla/.replitignore`
- `/Users/tindang/workspaces/tts/yoma/scla/replit.md`

### Current Cron Secret
Already generated locally: `CRON_SECRET=2f68b7c70f219a884ec4d8378c8c8cc2352c29563202d7e5ccc094ecdf06d75c`
(from artifacts/web/.env.local, Phase 29)

</code_context>

<specifics>
## Specific Ideas

- Target: `*.vercel.app` subdomain for v3.1 (custom domain deferred to infra milestone)
- Region: `sin1` (Singapore) — closest Vercel region to Yangon
- Keep polling fallback for WebSocket chat; don't try Supabase Realtime in this phase (that's ENH-04)

</specifics>

<deferred>
## Deferred Ideas

- Custom domain setup — separate DNS/infra work
- Supabase Realtime chat migration — ENH-04
- Standalone WS server on Railway/Fly.io — documented as option but not built
- Branch preview deploys for every PR — Vercel does this by default

</deferred>
