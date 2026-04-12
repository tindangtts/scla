# Phase 11: Security Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 11-security-hardening
**Areas discussed:** Hash migration strategy, Rate limiting scope, CSRF approach, Session security
**Mode:** Auto (all recommended defaults selected)

---

## Hash Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Re-hash on login | On successful login with SHA256 hash, re-hash with bcrypt and update DB | ✓ |
| Batch migration | Run a script to convert all hashes at once (requires temp password reset) | |
| Dual-write | Write both hashes during transition period | |

**User's choice:** Re-hash on login (auto-selected recommended default)
**Notes:** Zero-downtime approach. Existing sessions unaffected. Users who never log in again keep SHA256 hashes indefinitely (acceptable risk).

---

## Rate Limiting Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Auth endpoints only | Rate limit login, register, admin login (5/min/IP) | ✓ |
| All API endpoints | Global rate limiting across entire API | |
| Tiered | Different limits for auth vs. authenticated vs. public | |

**User's choice:** Auth endpoints only (auto-selected recommended default)
**Notes:** Other endpoints behind JWT tokens. Single-instance Replit deployment doesn't need Redis-backed distributed rate limiting.

---

## CSRF Approach

| Option | Description | Selected |
|--------|-------------|----------|
| SameSite + CORS tightening | Tighten CORS origins, add helmet headers (no CSRF tokens needed for Bearer SPA) | ✓ |
| CSRF tokens | Traditional double-submit cookie pattern | |
| No change | Keep current wide-open CORS | |

**User's choice:** SameSite + CORS tightening (auto-selected recommended default)
**Notes:** Bearer token auth via localStorage means CSRF tokens are unnecessary. Tightening CORS and adding helmet provides equivalent protection for this architecture.

---

## Session Security

| Option | Description | Selected |
|--------|-------------|----------|
| Env var required | Remove hardcoded fallback, fail fast if SESSION_SECRET missing | ✓ |
| Keep fallback | Leave dev fallback but warn in logs | |
| Rotate secrets | Support secret rotation with dual-key verification | |

**User's choice:** Env var required (auto-selected recommended default)
**Notes:** Admin JWT expiry reduced from 30 days to 8 hours. User JWT stays at 30 days.

---

## Claude's Discretion

- bcrypt cost factor
- Rate limiter library
- Helmet configuration details
- Input sanitization approach

## Deferred Ideas

None
