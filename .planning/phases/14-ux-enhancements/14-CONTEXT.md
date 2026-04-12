# Phase 14: UX Enhancements - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Five independent UX improvements: multi-language support (Myanmar/English), dark mode theme, offline access for tickets/bookings, real image uploads for maintenance tickets, and recurring weekly facility bookings.

</domain>

<decisions>
## Implementation Decisions

### Multi-Language / i18n (ENH-01)
- **D-01:** Use react-i18next with JSON translation files (en.json, my.json)
- **D-02:** Language toggle in profile/settings page
- **D-03:** Store language preference in localStorage (key: `scla_language`)
- **D-04:** Translate: nav labels, page titles, button text, status labels, error messages, form labels
- **D-05:** Do NOT translate user-generated content (announcements, articles, ticket descriptions)
- **D-06:** Default language: English. Myanmar translation for all static UI strings.

### Dark Mode (ENH-02)
- **D-07:** Use Tailwind CSS `dark:` variant with `class` strategy (add `dark` class to `<html>`)
- **D-08:** Toggle in profile/settings page
- **D-09:** Store preference in localStorage (key: `scla_theme`, values: `light`/`dark`/`system`)
- **D-10:** Support system preference detection via `prefers-color-scheme` media query
- **D-11:** Dark mode colors: keep teal primary, adjust background/surface/text for dark palette

### Offline Support (ENH-03)
- **D-12:** Enhance existing `sw.js` (from Phase 13) with cache-first strategy for API responses
- **D-13:** Cache targets: GET /tickets, GET /bookings, GET /announcements (read-only data)
- **D-14:** Show offline banner component when `navigator.onLine` is false
- **D-15:** Read-only offline — no offline form submissions or writes
- **D-16:** Cache invalidation: refresh cached data when back online

### Image Upload (ENH-04)
- **D-17:** File input with `accept="image/*"` and `capture` attribute for mobile camera/gallery
- **D-18:** Store image as base64 data URL in the `attachmentUrl` field on tickets table (reuse existing column)
- **D-19:** Max file size: 5MB. Validate client-side before upload.
- **D-20:** Preview thumbnail before submit
- **D-21:** Display uploaded image in ticket detail view

### Recurring Bookings (ENH-05)
- **D-22:** "Repeat weekly" toggle on booking creation form
- **D-23:** When enabled, create 4 individual booking records (current week + 3 future weeks)
- **D-24:** Each booking gets its own booking number and can be cancelled independently
- **D-25:** "Cancel all future" button on any recurring booking — deletes all upcoming occurrences with same `recurringGroupId`
- **D-26:** New `recurringGroupId` column on bookings table (nullable UUID, links related bookings)

### Claude's Discretion
- i18n namespace structure (single flat file vs namespaced)
- Dark mode transition animation
- Offline cache size limits
- Image compression before base64 encoding
- Recurring booking UI layout details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Frontend Pages (modification targets)
- `artifacts/scla/src/pages/home.tsx` — Home page (i18n, dark mode toggle)
- `artifacts/scla/src/pages/star-assist-new.tsx` — New ticket form (image upload)
- `artifacts/scla/src/pages/star-assist-detail.tsx` — Ticket detail (image display)
- `artifacts/scla/src/pages/bookings.tsx` — Booking creation (recurring toggle)
- `artifacts/scla/src/pages/profile.tsx` — Profile page (language + theme toggles)

### Service Worker
- `artifacts/scla/public/sw.js` — Existing from Phase 13 (enhance for offline caching)

### Database
- `lib/db/src/schema/bookings.ts` — Add recurringGroupId column
- `lib/db/src/schema/tickets.ts` — attachmentUrl already exists (reuse for base64)

### Styling
- `artifacts/scla/src/index.css` or Tailwind config — Dark mode configuration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sw.js` from Phase 13 — enhance rather than replace
- Tailwind CSS 4 already in use — dark: variant support built in
- `attachmentUrl` column on tickets — reuse for image data
- Radix UI components — most support dark mode via CSS variables

### Established Patterns
- localStorage for preferences (token, theme — consistent pattern)
- React Hook Form + Zod for form validation
- React Query for data fetching (cache integration point for offline)

### Integration Points
- Profile page — add language and theme toggles
- App root — wrap with i18n provider, dark mode class management
- Service worker — extend push handler with caching
- Booking creation flow — add recurring toggle and group creation

</code_context>

<specifics>
## Specific Ideas

- User prefers Supabase ecosystem — base64 image storage is MVP, can migrate to Supabase Storage later
- Keep dark mode subtle — teal primary should remain recognizable in both themes

</specifics>

<deferred>
## Deferred Ideas

- Supabase Storage for image uploads (future upgrade from base64)
- Monthly/custom recurring booking patterns (weekly only for v1)
- RTL language support
- Offline write queue with sync

</deferred>

---

*Phase: 14-ux-enhancements*
*Context gathered: 2026-04-10*
