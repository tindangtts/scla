---
phase: 11-security-hardening
verified: 2026-04-10T00:00:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "SHA256 account re-hash on login — live DB test"
    expected: "After logging in with a user whose passwordHash is a 64-char hex string, the DB row's passwordHash changes to a $2b$ prefixed bcrypt hash"
    why_human: "Requires a live DB with a SHA256-hashed row; cannot verify DB mutation from static analysis"
  - test: "Rate limit triggers 429 after 5th attempt"
    expected: "POST /api/auth/login called 6 times from same IP within 60s returns HTTP 429 with error: too_many_requests"
    why_human: "Cannot fire live HTTP requests without a running server"
  - test: "Helmet headers present in HTTP responses"
    expected: "Responses include X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy"
    why_human: "Header presence requires a running server and an HTTP client to inspect response headers"
  - test: "CORS blocks unknown origin"
    expected: "Request with Origin: https://evil.example.com is rejected; request with Origin: http://localhost:5173 is accepted"
    why_human: "Cross-origin enforcement requires live request with Origin header"
---

# Phase 11: Security Hardening Verification Report

**Phase Goal:** The app is hardened against common attacks and resident credentials are stored securely
**Verified:** 2026-04-10
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Resident passwords are stored using bcrypt (SHA256 no longer used for new accounts) | VERIFIED | `auth.ts` line 47: `passwordHash: await hashPasswordBcrypt(password)` in register handler |
| 2 | SHA256-hashed accounts are silently re-hashed to bcrypt on next successful login | VERIFIED | `auth.ts` lines 75-80: `isLegacyHash` check + `db.update` with new bcrypt hash on login |
| 3 | Staff accounts follow the same re-hash migration pattern | VERIFIED | `admin.ts` lines 77-82: same `isLegacyHash` + `db.update` pattern on admin login |
| 4 | The server refuses to start if SESSION_SECRET is absent | VERIFIED | `jwt.ts` lines 3-8: module-scope `if (!process.env.SESSION_SECRET) { throw new Error(...) }` |
| 5 | Admin JWT tokens expire in 8 hours | VERIFIED | `admin.ts` line 26: `exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8` |
| 6 | User JWT tokens expire in 30 days | VERIFIED | `jwt.ts` line 28: `60 * 60 * 24 * 30` — unchanged |
| 7 | The 6th login attempt from the same IP within 60s returns 429 | VERIFIED (code) | `rate-limiter.ts`: `windowMs: 60 * 1000`, `max: 5`, `status(429)` handler |
| 8 | 429 includes a meaningful message | VERIFIED | `rate-limiter.ts` line 16-17: `error: "too_many_requests"`, `message: "Too many attempts..."` |
| 9 | Rate limiting applies to /api/auth/login and /api/auth/register | VERIFIED | `auth.ts` lines 27, 57: both POST handlers include `authRateLimiter` middleware |
| 10 | Rate limiting applies to /api/admin/auth/login | VERIFIED | `admin.ts` line 66: `router.post("/auth/login", authRateLimiter, ...` |
| 11 | Non-auth endpoints are NOT rate limited | VERIFIED | `auth.ts`: GET /me, POST /upgrade, GET /upgrade-requests — no `authRateLimiter` on any |
| 12 | HTTP responses include security headers (X-Content-Type-Options, X-Frame-Options, CSP) | VERIFIED (code) | `app.ts` line 18: `app.use(helmet())` — helmet defaults include all three |
| 13 | CORS requests from non-allowed origins are rejected | VERIFIED (code) | `app.ts` lines 11-26: `ALLOWED_ORIGINS` array with explicit allowlist; old `cors()` no-arg form removed (grep confirms 0 matches) |
| 14 | CORS requests from localhost dev and Replit URL are accepted | VERIFIED | `app.ts`: `http://localhost:5173`, `http://localhost:3000`, `process.env.ALLOWED_ORIGIN` |

**Score:** 14/14 truths verified (4 require live server confirmation — see Human Verification section)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `artifacts/api-server/src/lib/password.ts` | Shared bcrypt helpers: hashPasswordBcrypt, verifyPassword, isLegacyHash | VERIFIED | 45 lines; exports all 3 functions; bcrypt cost 12; timingSafeEqual on legacy path |
| `artifacts/api-server/src/routes/auth.ts` | User login with dual-hash detection and re-hash on success | VERIFIED | Lines 69-80: verifyPassword + isLegacyHash + db.update re-hash path wired |
| `artifacts/api-server/src/routes/admin.ts` | Admin login with dual-hash detection and re-hash on success | VERIFIED | Lines 73-82: same pattern; authRateLimiter on /auth/login |
| `artifacts/api-server/src/seed.ts` | Demo accounts seeded with bcrypt hashes | VERIFIED | All 7 accounts (3 staff + 4 users) use `await hashPasswordBcrypt(...)` |
| `artifacts/api-server/src/lib/jwt.ts` | JWT with fail-fast secret validation, 8h admin expiry in admin.ts | VERIFIED | Lines 3-8: module-scope throw; no `scla-dev-secret-2026` fallback |
| `artifacts/api-server/src/lib/rate-limiter.ts` | Express middleware factory with authRateLimiter export | VERIFIED | windowMs: 60000, max: 5, 429 handler, `standardHeaders: "draft-7"` |
| `artifacts/api-server/src/app.ts` | Express app with helmet and tightened CORS | VERIFIED | helmet() + ALLOWED_ORIGINS; old `cors()` removed |
| `artifacts/api-server/package.json` | bcryptjs, express-rate-limit, helmet dependencies | VERIFIED | bcryptjs@^3.0.3, express-rate-limit@^8.3.2, helmet@^8.1.0 all present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `auth.ts` | `lib/password.ts` | `import { hashPasswordBcrypt, verifyPassword, isLegacyHash }` | WIRED | Line 6 import confirmed; all 3 functions used in register and login handlers |
| `admin.ts` | `lib/password.ts` | `import { hashPasswordBcrypt, verifyPassword, isLegacyHash }` | WIRED | Line 10 import confirmed; verifyPassword + isLegacyHash in /auth/login; hashPasswordBcrypt in POST /staff |
| `auth.ts` | `usersTable.passwordHash` | `db.update after isLegacyHash check` | WIRED | Lines 77-80: `db.update(usersTable).set({ passwordHash: newHash })` |
| `admin.ts` | `staffUsersTable.passwordHash` | `db.update after isLegacyHash check` | WIRED | Lines 78-82: `db.update(staffUsersTable).set({ passwordHash: newHash })` |
| `auth.ts` | `lib/rate-limiter.ts` | `import { authRateLimiter }` | WIRED | Line 7 import; used on router.post("/register") and router.post("/login") |
| `admin.ts` | `lib/rate-limiter.ts` | `import { authRateLimiter }` | WIRED | Line 11 import; used on router.post("/auth/login") |
| `app.ts` | `helmet()` | `app.use(helmet())` | WIRED | Line 18: `app.use(helmet())` present; helmet imported line 3 |
| `app.ts` | `cors({ origin: ALLOWED_ORIGINS })` | `app.use(cors({ origin: ... }))` | WIRED | Lines 11-26: ALLOWED_ORIGINS const; cors configured with origin allowlist |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces middleware and auth logic, not data-rendering components. All artifacts are utility modules or route handlers.

### Behavioral Spot-Checks

Step 7b: SKIPPED for live HTTP checks (require running server). Static module checks performed instead.

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| password.ts exports 3 functions | grep exports | hashPasswordBcrypt, verifyPassword, isLegacyHash all present | PASS |
| No SHA256 password hashing in route/seed files | grep sha256/scla-salt/hashPassword | Only HMAC-SHA256 for JWT signing remains (correct — different primitive) | PASS |
| No hardcoded JWT fallback secret | grep scla-dev-secret-2026 | 0 matches in all src/ files | PASS |
| Admin token uses 8h expiry | grep "60 * 60 * 8" admin.ts | 1 match at line 26 | PASS |
| No open CORS (no-arg form) | grep "cors()" app.ts | 0 matches | PASS |
| authRateLimiter on exactly 3 endpoints | grep authRateLimiter | 2 imports + 3 route usages = 5 matches (exactly as planned) | PASS |
| All security deps in package.json | grep bcryptjs/express-rate-limit/helmet | All 3 found | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEC-01 | 11-01-PLAN.md | Migrate from SHA256 to bcrypt/argon2 password hashing | SATISFIED | password.ts module; auth.ts + admin.ts + seed.ts fully migrated; re-hash-on-login wired |
| SEC-02 | 11-02-PLAN.md | Add rate limiting to authentication endpoints | SATISFIED | authRateLimiter on all 3 auth endpoints (login, register, admin login); 5/min/IP; 429 response |
| SEC-03 | 11-03-PLAN.md | Add CSRF protection | SATISFIED | Per D-07/D-08/D-09: Bearer-token SPA using localStorage — traditional CSRF not applicable; satisfied by helmet security headers + CORS origin allowlist |

All 3 requirements (SEC-01, SEC-02, SEC-03) mapped to Phase 11 in REQUIREMENTS.md traceability table are accounted for. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `admin.ts`, `jwt.ts` | 30, 41, 32, 41 | `createHmac("sha256", ...)` | INFO | This is HMAC-SHA256 for JWT token signing — a correct and standard usage. Not password hashing. Not a security issue. |

No blockers or warnings. The only `sha256` remaining is for JWT HMAC signing, which is the correct cryptographic primitive for that purpose.

### Human Verification Required

#### 1. SHA256 Account Re-hash on Login

**Test:** Create a user row directly in the DB with a 64-char hex SHA256 password hash (`sha256("test" + "scla-salt")`). Log in via `POST /api/auth/login` with that account's credentials. Query the DB row's `passwordHash` after login.
**Expected:** `passwordHash` now starts with `$2b$` (bcrypt prefix); login returns HTTP 200.
**Why human:** Requires a live database with a pre-seeded SHA256 hash; cannot simulate DB mutations via static analysis.

#### 2. Rate Limit Triggers 429

**Test:** Make 6 consecutive POST requests to `/api/auth/login` from the same IP within 60 seconds.
**Expected:** First 5 requests return 200 or 401 (depending on credentials). The 6th returns HTTP 429 with body `{ "error": "too_many_requests", "message": "Too many attempts. Please wait 1 minute before trying again." }`.
**Why human:** Requires a running server; rate limit state is in-memory and cannot be inspected statically.

#### 3. Helmet Security Headers in Responses

**Test:** `curl -I http://localhost:3001/api/auth/login` (or the deployed Replit URL).
**Expected:** Response headers include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and a `Content-Security-Policy` header.
**Why human:** Header presence requires a running server and an HTTP client; helmet is applied via `app.use(helmet())` which is correct but headers are only visible at runtime.

#### 4. CORS Origin Enforcement

**Test:** Two requests to `/api/auth/me`: one with `Origin: http://localhost:5173`, one with `Origin: https://evil.example.com`.
**Expected:** Localhost request succeeds (no CORS error); evil.example.com request is blocked (no `Access-Control-Allow-Origin` header returned, or 403 depending on browser CORS handling).
**Why human:** CORS enforcement requires live HTTP requests with Origin headers; static code confirms the configuration is correct but enforcement requires runtime validation.

### Gaps Summary

No gaps. All 14 observable truths are verified at code level. All required artifacts exist, are substantive, and are fully wired. All 3 requirements (SEC-01, SEC-02, SEC-03) are satisfied.

4 items are routed to human verification for runtime confirmation — these are behavioral checks that require a running server. The code correctness for all 4 behaviors is fully established by static analysis.

---

_Verified: 2026-04-10_
_Verifier: Claude (gsd-verifier)_
