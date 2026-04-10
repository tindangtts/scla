---
phase: 11-security-hardening
plan: "03"
subsystem: api-server
tags: [security, helmet, cors, http-headers]
dependency_graph:
  requires: ["11-01"]
  provides: ["security-headers", "cors-hardening"]
  affects: ["artifacts/api-server/src/app.ts"]
tech_stack:
  added: ["helmet@^8.1.0"]
  patterns: ["security middleware stack ordering (helmet → cors → logger → body parsers)"]
key_files:
  created: []
  modified:
    - artifacts/api-server/src/app.ts
key_decisions:
  - "helmet() placed before pinoHttp to ensure security headers apply even if logger throws"
  - "credentials: false set explicitly since SPA uses Bearer tokens (localStorage), no cookies"
  - "ALLOWED_ORIGIN env var supports Replit deployment URL without hardcoding"
metrics:
  duration: "5m"
  completed_date: "2026-04-10"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
requirements_satisfied: [SEC-03]
---

# Phase 11 Plan 03: Security Headers and CORS Hardening Summary

**One-liner:** helmet middleware for HTTP security headers + CORS restricted to explicit origin allowlist (localhost dev + Replit env var).

## What Was Built

Applied two security layers to `artifacts/api-server/src/app.ts`:

1. **helmet()** — Applies a suite of HTTP security headers including:
   - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
   - `X-Frame-Options: DENY` (prevents clickjacking)
   - `Content-Security-Policy` (default helmet CSP)
   - `X-XSS-Protection`, `Referrer-Policy`, `HSTS`, and others

2. **Tightened CORS** — Replaced `cors()` (allow-all) with an explicit allowlist:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (alternative local port)
   - `process.env.ALLOWED_ORIGIN` (Replit deployment URL injected at runtime)
   - `credentials: false` — Bearer tokens via Authorization header, no cookies needed

## Middleware Ordering

```
helmet()        ← security headers first, always applied
cors()          ← origin filter before any request processing
pinoHttp()      ← logging after security gates
express.json()  ← body parsing
router          ← business logic
```

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install helmet + update app.ts with helmet + tightened CORS | 57c9225 | artifacts/api-server/src/app.ts |

## Decisions Made

- **D-07 honored**: Bearer-token SPA (localStorage) — no CSRF middleware needed, `credentials: false` in CORS config
- **D-08 honored**: CORS tightened from open to explicit allowlist with env-driven Replit URL
- **D-09 honored**: helmet applied globally for security headers

## Deviations from Plan

None — plan executed exactly as written.

Note: `pnpm typecheck` has pre-existing failures across the monorepo (unbuilt workspace composite libs and implicit `any` in route files). These pre-date this plan and are out of scope. The `app.ts` changes are syntactically valid TypeScript with correct types from the installed `helmet` and `cors` packages.

## Known Stubs

None.

## Self-Check: PASSED

- `artifacts/api-server/src/app.ts` — confirmed contains `import helmet`, `app.use(helmet())`, `ALLOWED_ORIGINS`, `process.env.ALLOWED_ORIGIN`, `http://localhost:5173`, `credentials: false`, and no bare `cors()`
- `artifacts/api-server/package.json` — confirmed contains `"helmet": "^8.1.0"`
- Commit `57c9225` — verified exists in git log
