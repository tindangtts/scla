# Phase 33: UI Polish - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Auto-generated (gaps sourced from agent-browser visual review)

<domain>
## Phase Boundary

Close five specific UI gaps surfaced by agent-browser visual review of the v3.0 production build. No new features, no data-flow changes — purely presentation and interaction polish on auth pages, home banner, bottom nav, and status badges. Admin/resident visual distinctness is verified (no change expected).

</domain>

<decisions>
## Implementation Decisions

### UI-01: Resident login brand warmth
- Restore the "SC" logo mark: rotated (~3deg) rounded teal tile with primary/20 shadow, letters in primary-foreground, subtle hover rotation
- Add decorative background accents — one top-right blurred gold circle, one bottom-left blurred teal circle (matching the old `.bg-accent/20 blur-3xl rounded-full` pattern)
- Keep the current split-panel layout on desktop, but ensure the right-side form panel also has the SC logo mark (today only the left gradient panel has brand identity)

### UI-02: Home push-notification banner
- Component: `artifacts/web/src/components/push-prompt.tsx` already exists
- Only render when: browser supports push API + permission !== "denied" + user is not already subscribed
- Layout: rounded-[1.5rem] card, bell icon in primary/10 avatar, "Stay informed" headline, "Enable" CTA calling subscribe action
- Place with `-mt-4 relative z-20` on the home page to overlap the teal hero header (old pattern)

### UI-03: Bottom nav visual weight
- Active tab must have a clear indicator — pick one: (a) top border/line in accent gold, (b) filled primary-tinted tile behind icon, (c) enlarged icon + primary text color. Use (b) for the strongest hierarchy
- Tap target sizing: `min-h-[44px]` on each nav item
- Smooth `transition-colors` between active/inactive states
- Bottom shadow or elevation to separate nav from page content

### UI-04: Status badge verification
- Open each of: /bills, /star-assist, /bookings in both light and dark mode
- Verify `.badge-unpaid`, `.badge-paid`, `.badge-partially-paid`, `.badge-overdue`, `.badge-open`, `.badge-in-progress`, `.badge-completed`, `.badge-closed`, `.badge-upcoming`, `.badge-cancelled` render with proper tinted bg + foreground contrast
- If any badge looks washed out in dark mode, adjust the alpha or bump the lightness in the existing CSS

### UI-05: Admin login distinctness
- Current state (verified via screenshot): admin login shows dark navy panel with "SCLA Admin Portal" vs resident teal panel with "Your building..." tagline
- This is already visually distinct. Verify no regression, no new work expected unless UI-01 changes break symmetry

### Claude's Discretion
- Exact shadow values for SC logo
- Blur blob size and placement (as long as they feel decorative, not dominating)
- Active-tab color choice (primary vs accent)
- Whether to add a small footer tagline on resident login right panel

</decisions>

<code_context>
## Existing Code Insights

### Files to Modify
- `artifacts/web/src/app/login/page.tsx` — resident login (add SC logo + blurs)
- `artifacts/web/src/app/(resident)/page.tsx` — home (verify push-prompt render conditions)
- `artifacts/web/src/components/layout/bottom-nav.tsx` — strengthen active tab + tap targets
- `artifacts/web/src/app/globals.css` — verify/tune badge classes if needed (already defined in Pass 1 of v3.0 UI migration)

### Files to Verify Only (no changes expected)
- `artifacts/web/src/app/admin/login/page.tsx`
- `artifacts/web/src/app/(resident)/bills/page.tsx`
- `artifacts/web/src/app/(resident)/star-assist/page.tsx`
- `artifacts/web/src/app/(resident)/bookings/page.tsx`
- `artifacts/web/src/components/push-prompt.tsx`

### Reference from old Vite app
Old SC logo: `git show 96f4b16^:artifacts/scla/src/pages/login.tsx` lines 55-61 — rotated rounded-3xl tile with hover animation. Port this exact pattern.

Old push banner: `git show 96f4b16^:artifacts/scla/src/pages/home.tsx` lines 85-105 — rounded-[1.5rem] with primary/5 bg + primary/20 border, bell icon in primary/10 rounded-full avatar.

Old bottom nav: `git show 96f4b16^:artifacts/scla/src/components/layout/bottom-nav.tsx` — reference for active indicator + tap target sizing.

</code_context>

<specifics>
## Specific Ideas

- Match the old Vite design language for brand touches — don't invent new decorations
- Keep the E2E test selectors unchanged (`input[name="email"]`, `button[type="submit"]` scoping)
- No need to add new i18n keys — this is visual polish, existing keys cover the strings
- Verify in dev server running at localhost:3000 before committing each gap fix

</specifics>

<deferred>
## Deferred Ideas

- Full redesign of any page — out of scope, v3.0 design language is the target
- New animations or micro-interactions beyond active-tab feedback — nice-to-have
- Changing navigation structure — ship what works

</deferred>
