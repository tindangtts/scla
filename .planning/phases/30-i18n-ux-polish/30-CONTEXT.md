# Phase 30: i18n & UX Polish - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

The app renders correctly in both English and Myanmar, dark mode works with system detection and manual toggle, the mobile layout uses bottom navigation, the PWA installs and caches content offline, and all async pages show loading states.

</domain>

<decisions>
## Implementation Decisions

### i18n (UX-01)
- Use next-intl for Next.js App Router i18n (well-supported, SSR-compatible)
- Two locales: en (English), my (Myanmar/Burmese)
- Locale detection from browser preference, manual toggle in UI
- Translation files in messages/en.json and messages/my.json
- ~107 existing translation keys to migrate from old react-i18next setup

### Dark Mode (UX-02)
- Tailwind CSS dark mode via class strategy (already configured in Tailwind 4)
- next-themes for system detection and manual toggle
- Theme toggle component in header/settings
- All existing UI components already use Tailwind classes — add dark: variants

### Mobile Layout (UX-03)
- Bottom navigation already implemented in Phase 24 resident layout
- Ensure it's properly responsive (hidden on desktop, visible on mobile)
- Touch-friendly tap targets (min 44px)

### PWA/Offline (UX-04)
- next-pwa or manual service worker for PWA manifest + caching
- App manifest (manifest.json) with icons, theme color, display: standalone
- Cache-first strategy for static assets, network-first for API calls
- Offline fallback page

### Loading States (UX-05)
- loading.tsx files in route groups for Suspense boundaries
- Skeleton components for common layouts (card grid, list, detail)
- error.tsx files for error boundaries
- not-found.tsx for 404 pages

### Claude's Discretion
- Translation key naming conventions
- Skeleton component designs
- PWA icon sizes and colors
- Dark mode color palette specifics

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- All UI components use Tailwind — dark mode via adding dark: classes
- Bottom nav in (resident)/layout.tsx — Phase 24
- Service worker exists at public/sw.js — Phase 29 (push notifications)

### Integration Points
- Root layout needs i18n provider + theme provider
- All pages need translation keys for UI text
- Manifest.json in public/
- loading.tsx/error.tsx in each route group

</code_context>

<specifics>
## Specific Ideas

- Previous app used react-i18next with 107 keys — migrate these
- Myanmar language support is critical for the user base in Yangon

</specifics>

<deferred>
## Deferred Ideas

None — this phase completes all UX requirements.

</deferred>
