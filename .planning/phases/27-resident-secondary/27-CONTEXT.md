# Phase 27: Resident Secondary - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous mode)

<domain>
## Phase Boundary

Residents can book facilities, browse community content, and manage notification preferences — completing the full resident feature surface in the Next.js app. This phase covers: SCSC facility browsing and booking (including recurring weekly), booking cancellation (including bulk), Discover page (announcements, newsletters, promotions), Info Centre articles, and notification preferences.

</domain>

<decisions>
## Implementation Decisions

### Facilities & Bookings (RES-05, RES-06)
- Facilities list page with Server Component fetching from facilities table
- Facility detail page showing available slots generated from facility_slots
- Booking form: select date, pick hourly slot, optional recurring weekly toggle
- Booking uses Server Action: validates slot availability, creates booking record
- Booking number pattern: BK-XXXX (existing convention)
- My Bookings page showing upcoming/past with cancel button
- Bulk cancel for recurring: cancels all future bookings in the recurring group
- Bookings accessible via bottom nav tab

### Discover Page (RES-07)
- Server Component fetching announcements, newsletters, promotions from respective tables
- Tab or section layout: Announcements | Newsletters | Promotions
- Detail pages for each content type

### Info Centre (RES-08)
- Server Component fetching FAQs/articles from faqs table
- Categorized view with category filter
- Article detail page

### Notifications (RES-09)
- Notification list page fetching from notifications table
- Mark as read on view (Server Action)
- Notification preferences page (push on/off, email on/off)

### Claude's Discretion
- Slot generation algorithm (hourly slots from facility opening/closing times)
- Calendar UI for date selection
- Content card layouts
- Notification preference storage approach

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@workspace/db/schema` — facilities, facility_slots, bookings, announcements, promotions, newsletters, faqs, notifications tables
- `artifacts/web/src/lib/queries/` — query pattern established in Phase 26
- `artifacts/web/src/lib/auth.ts` — getCurrentUser
- `artifacts/web/src/components/ui/` — Button, Card, Input, Badge
- `artifacts/web/src/app/(resident)/layout.tsx` — bottom nav (needs bookings tab link)

### Integration Points
- Bottom nav: add Bookings and Discover tabs
- Notification bell in header (badge count)

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond ROADMAP success criteria.

</specifics>

<deferred>
## Deferred Ideas

- Push notification subscription management — Phase 29
- i18n for content — Phase 30

</deferred>
