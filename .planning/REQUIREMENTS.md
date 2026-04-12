# Requirements: Star City Living App (SCLA)

**Defined:** 2026-04-12
**Core Value:** Residents can manage their apartment lifecycle — bills, maintenance, bookings, and community info — from a single mobile-first web app without visiting the management office.

## v3.1 Requirements

Requirements for Deploy-Ready Polish milestone. Each maps to roadmap phases.

### UI Polish

- [x] **UI-01**: Resident login page restores brand warmth — SC logo mark visible, decorative gradient/blur accents behind form, approachable tone
- [x] **UI-02**: Home page push-notification banner renders correctly when resident hasn't subscribed yet, hides after subscription
- [x] **UI-03**: Bottom navigation has stronger active-tab indicator (visible line/dot/color flash) and comfortable tap targets (>=44px)
- [x] **UI-04**: Status badges (.badge-unpaid, .badge-paid, .badge-open, .badge-upcoming, etc.) verified visually across light + dark mode with correct tinted backgrounds
- [x] **UI-05**: Admin login page visually distinct from resident (darker theme confirmed), no regression from v3.0

### Internationalization

- [x] **I18N-01**: All user-facing strings introduced during v3.0 UI migration have Myanmar translations in messages/my.json
- [x] **I18N-02**: Myanmar translation key count matches English (no orphaned keys in either file)
- [x] **I18N-03**: Full EN↔MY toggle pass — every route renders correctly in both locales with no fallback-to-English text

### Type Safety

- [x] **TYPE-01**: All pre-existing typecheck errors in api route test files resolved (`pnpm --filter @workspace/web typecheck` exits 0)
- [x] **TYPE-02**: CI typecheck step runs clean on every PR/push

### Deployment

- [x] **DEPLOY-01**: Vercel project configured with correct monorepo root (`artifacts/web`), install command (`pnpm install --frozen-lockfile`), and build command
- [ ] **DEPLOY-02**: All required env vars set in Vercel project settings (Supabase URL, anon key, service role, database URL, VAPID keys, Resend, CRON_SECRET)
- [x] **DEPLOY-03**: Vercel Cron schedule created to hit POST /api/cron/bill-overdue-check daily with x-cron-secret header
- [ ] **DEPLOY-04**: Preview deployment succeeds, smoke test passes (login, resident dashboard, admin dashboard all render correctly against Supabase)
- [ ] **DEPLOY-05**: Production deployment on main branch, custom or *.vercel.app domain reachable over HTTPS
- [x] **DEPLOY-06**: Replit-specific config (.replit, replit.md) removed or archived — Vercel is the deploy target

### WebSocket Strategy

- [x] **WS-01**: Ticket chat operates on polling fallback in production (WebSocket server not deployed) — verified working
- [x] **WS-02**: Supabase Realtime migration tracked as Future (ENH-04) — not scoped in v3.1

## Future Requirements

Deferred to post-deploy polish.

### Enhancement

- **ENH-01**: Supabase Storage for image uploads (replace base64)
- **ENH-02**: Supabase Row-Level Security (RLS) policies
- **ENH-03**: Real payment integration (WavePay/KBZPay)
- **ENH-04**: Supabase Realtime for chat (replace polling fallback)
- **ENH-05**: Per-route loading.tsx skeletons for deep routes (`/bills/[id]`, `/admin/users/[id]`)
- **ENH-06**: FAQ accordion upgrade from native `<details>` to Radix Accordion

## Out of Scope

| Feature | Reason |
|---------|--------|
| Standalone WebSocket deployment (Railway/Fly.io) | Polling fallback adequate for current load; revisit if user growth warrants |
| Production payment integration | Still waiting on WavePay/KBZPay gateway documents |
| Custom domain setup | Use vercel.app subdomain for v3.1; custom domain deferred to infra milestone |
| UI redesign | v3.0 design language is the target — this milestone closes gaps, doesn't redesign |
| New features | v3.1 is polish + deploy only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 33 | Complete |
| UI-02 | Phase 33 | Complete |
| UI-03 | Phase 33 | Complete |
| UI-04 | Phase 33 | Complete |
| UI-05 | Phase 33 | Complete |
| I18N-01 | Phase 34 | Complete |
| I18N-02 | Phase 34 | Complete |
| I18N-03 | Phase 34 | Complete |
| TYPE-01 | Phase 34 | Complete |
| TYPE-02 | Phase 34 | Complete |
| DEPLOY-01 | Phase 35 | Complete |
| DEPLOY-02 | Phase 35 | Pending |
| DEPLOY-03 | Phase 35 | Complete |
| DEPLOY-04 | Phase 35 | Pending |
| DEPLOY-05 | Phase 35 | Pending |
| DEPLOY-06 | Phase 35 | Complete |
| WS-01 | Phase 35 | Complete |
| WS-02 | Phase 35 | Complete |

**Coverage:**
- v3.1 requirements: 19 total
- Mapped to phases: 19 ✓
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation (v3.1 traceability populated)*
