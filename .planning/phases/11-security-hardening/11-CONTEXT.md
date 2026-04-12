# Phase 11: Security Hardening - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the existing authentication system and API layer against common attacks. Migrate password hashing from SHA256 to bcrypt, add rate limiting to auth endpoints, tighten CORS and add security headers, and enforce JWT secret management. No new features — pure security infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Hash Migration Strategy
- **D-01:** Use "re-hash on login" strategy — when a user logs in successfully with a SHA256-hashed password, re-hash with bcrypt and update the DB row. No batch migration, no downtime.
- **D-02:** Both `auth.ts` and `admin.ts` routes use the same `hashPassword` function — migration must cover both user and staff login paths.
- **D-03:** Add a `hashVersion` field or detect hash format (SHA256 hex is 64 chars, bcrypt starts with `$2b$`) to determine which verification to use during the transition period.

### Rate Limiting
- **D-04:** Rate limit auth endpoints only: `/api/auth/login`, `/api/auth/register`, `/api/admin/auth/login`. Other endpoints are behind JWT tokens.
- **D-05:** Threshold: 5 attempts per minute per IP. Return 429 with `retry-after` header and meaningful error message.
- **D-06:** Use in-memory rate limiting (acceptable for single-instance Replit deployment). No Redis needed.

### CSRF & Security Headers
- **D-07:** This is a Bearer-token SPA (localStorage, not cookies) — traditional CSRF tokens are NOT needed. Instead: tighten CORS origins, add helmet for security headers.
- **D-08:** Tighten CORS from `cors()` (allow all) to specific allowed origins (Replit deployment URL + localhost for dev).
- **D-09:** Add helmet middleware for security headers (X-Content-Type-Options, X-Frame-Options, etc.).

### JWT Secret Management
- **D-10:** Remove the hardcoded fallback `"scla-dev-secret-2026"` in `jwt.ts:3`. Require `SESSION_SECRET` env var — fail fast at startup if missing.
- **D-11:** Keep user JWT at 30-day expiry. Reduce admin JWT to 8-hour expiry for tighter admin session control.

### Claude's Discretion
- Specific bcrypt cost factor (12 rounds is standard, Claude can adjust based on Replit performance)
- Rate limiter library choice (express-rate-limit is standard, Claude can pick)
- Exact helmet configuration (sensible defaults are fine)
- Whether to add input sanitization beyond what Express already provides

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Authentication & Password Hashing
- `artifacts/api-server/src/routes/auth.ts` — Contains `hashPassword()` function (line 10-12) and all user auth endpoints (register, login, upgrade)
- `artifacts/api-server/src/routes/admin.ts` — Admin login uses same `hashPassword()` pattern, separate JWT with `ctx: "admin"`
- `artifacts/api-server/src/lib/jwt.ts` — Custom JWT sign/verify with hardcoded fallback secret (line 3)
- `artifacts/api-server/src/lib/auth-middleware.ts` — JWT verification middleware for protected routes

### App Configuration
- `artifacts/api-server/src/app.ts` — Express app setup with CORS (line 28), no helmet, no rate limiting
- `artifacts/api-server/src/seed.ts` — Database seeding with demo accounts (passwords hashed with SHA256)

### Database Schema
- `lib/db/src/schema/users.ts` — Users table with `passwordHash` column
- `lib/db/src/schema/staff_users.ts` — Staff users table with `passwordHash` column

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hashPassword()` in `auth.ts` — single function to replace with bcrypt-aware version
- `jwt.ts` sign/verify — isolated module, easy to modify secret handling
- `auth-middleware.ts` — existing middleware pattern for adding rate limiting

### Established Patterns
- Express Router pattern — each route file exports a Router, composed in `routes/index.ts`
- Middleware applied globally in `app.ts` (cors, json, pino)
- No existing middleware pattern for per-route rate limiting — will need to introduce

### Integration Points
- `app.ts` — add helmet and tightened CORS config here
- `auth.ts` — modify `hashPassword` and login flow for bcrypt migration
- `admin.ts` — same migration needed for admin login
- `seed.ts` — update demo account passwords to use bcrypt hashes
- `jwt.ts` — remove hardcoded fallback, add startup validation

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard security hardening with recommended defaults applied via auto mode.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-security-hardening*
*Context gathered: 2026-04-10*
