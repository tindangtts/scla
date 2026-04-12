# Phase 24: Foundation - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

A working Next.js 15 monolith exists that developers can run locally, connects to Supabase PostgreSQL via Drizzle, and replaces the three-app PNPM workspace structure. This phase delivers the project scaffolding — Next.js App Router with TypeScript, Tailwind CSS 4, Radix UI/shadcn, Supabase client configuration, Drizzle ORM integration with existing schema, PNPM workspace restructure, and seed script compatibility.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key considerations:
- Reuse existing Drizzle schema from lib/db — do not recreate
- Next.js 15 with App Router, route groups for (resident) and (admin)
- Tailwind CSS 4 (already in use) + shadcn/ui for component library
- Supabase client setup with @supabase/ssr for server/client helpers
- Keep existing PostgreSQL schema — migration is auth and routing, not data model

</decisions>

<code_context>
## Existing Code Insights

### Current Structure
- `artifacts/scla` — Resident React SPA (Vite + React 19)
- `artifacts/admin` — Admin React SPA (Vite + React 19)
- `artifacts/api-server` — Express 5 backend
- `lib/db` — Drizzle ORM schema + PostgreSQL connection
- `lib/api-zod` — Zod validation schemas
- `lib/api-client-react` — React Query API client
- `e2e` — Playwright E2E tests
- `scripts` — Seed script and utilities

### Reusable Assets
- Drizzle schema (lib/db/schema.ts) — full data model
- Zod validation schemas (lib/api-zod)
- Tailwind CSS 4 configuration
- Seed script (scripts/)

### Integration Points
- Supabase PostgreSQL connection string (already configured)
- Environment variables from .env
- PNPM workspace configuration (pnpm-workspace.yaml)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
