# SCLA User Flow Map

**Star City Living App (SCLA)**
**Generated:** 2026-04-11
**Covers:** Resident App + Admin Portal

---

## PART 1: RESIDENT APP (Mobile-First SPA)

Global navigation: Bottom tab bar with 5 items (Home, Bills, Bookings, StarAssist, Profile). All pages wrap in `AppLayout` with `max-w-md` centered container.

---

### FLOW 1: Guest Registration

**Route:** `/register`
**Entry Point:** "Register" link on Login page, or "Create account" link on Profile page

```
[Login Page]
    |
    |-- Tap "Register" link
    v
[Register Page] /register
    |
    |-- Form fields:
    |     - Name (required)
    |     - Email (required, type=email)
    |     - Phone (required, placeholder "09-XXXX-XXXX")
    |     - Password (required, min 8 chars)
    |
    |-- Back button --> /login
    |
    +-- Tap "Register"
         |
         +-- [API: POST /auth/register]
              |
              +-- SUCCESS:
              |     - Auto-login (token + user stored)
              |     - Navigate to / (Home)
              |     - Toast: "Welcome to StarCity!"
              |     - User type = "guest"
              |
              +-- ERROR:
                    - Toast: "Registration failed"
                    - Stay on page, form preserved
```

---

### FLOW 2: Guest Login

**Route:** `/login`
**Entry Point:** Direct URL, redirect from protected pages, links from Profile/Register pages

```
[Login Page] /login
    |
    |-- Form fields:
    |     - Email (required)
    |     - Password (required)
    |
    |-- Demo credentials shown:
    |     guest: demo@starcity.com / password123
    |     resident: resident@starcity.com / password123
    |
    +-- Tap "Sign In"
         |
         +-- [API: POST /auth/login]
              |
              +-- SUCCESS:
              |     - Store token + user object
              |     - Navigate to / (Home)
              |
              +-- ERROR:
                    - Toast: "Invalid email or password"
                    - Stay on page
    |
    +-- Tap "Register" link --> /register
```

---

### FLOW 3: Guest-to-Resident Upgrade Request

**Route:** `/upgrade`
**Entry Point:** Gold upgrade banner on Home (guest view), "Apply Now" on Profile page (when upgradeStatus = "none")

```
[Home (Guest View)]                [Profile (Guest)]
    |                                   |
    |-- Tap upgrade banner              |-- Tap "Apply Now"
    v                                   v
[Upgrade Page] /upgrade
    |
    |-- Info banner: "Link your StarCity unit..."
    |
    |-- Form fields:
    |     - Development: [City Loft | Estella | ARA] (toggle grid)
    |     - Unit Number (required, e.g. "A-12-03")
    |     - Resident ID (required, e.g. "SC-2023-00142")
    |
    |-- Back button --> /profile
    |
    +-- Tap "Submit Request"
         |
         +-- [API: POST /auth/upgrade-request]
              |
              +-- SUCCESS:
              |     - Show confirmation screen:
              |       "Request Submitted"
              |       "Under review. 1-2 working days."
              |     - Button: "Return to Dashboard" --> /
              |
              +-- ERROR:
                    - Toast: "Submission failed"
                    - Stay on form
```

**Post-submission states visible on Profile page:**
- `none` --> "Apply Now" button shown
- `pending` --> Status badge "Pending" (no action button)
- `approved` --> User type changes to "resident" (full app access)
- `rejected` --> Status badge "Rejected"

---

### FLOW 4: Home Dashboard

**Route:** `/` (root)
**Entry Point:** Bottom nav "Home", app launch, redirect after login

```
[Home Page] /
    |
    +-- BRANCH: Check authentication state
         |
         +-- [UNAUTHENTICATED]:
         |     - Greeting: "Good morning/afternoon/evening, Guest"
         |     - Star Assist card (visible to all)
         |     - Quick action grid: Book SCSC, Info Centre, Newsletters
         |     - Latest announcement (if any)
         |     - Promotions (if any)
         |     - Login prompt CTA: "Sign In / Register" --> /login
         |
         +-- [GUEST (authenticated, not resident)]:
         |     - Greeting with user name
         |     - Gold upgrade banner --> /upgrade
         |     - Star Assist card with open ticket count
         |     - Quick actions grid
         |     - Latest announcement
         |     - Promotions
         |
         +-- [RESIDENT]:
               - Greeting with name + unit info (e.g. "City Loft . Unit A-12-03")
               - Push notification opt-in prompt (if supported, not denied, not subscribed)
               - Outstanding balance card:
               |   - Total amount in MMK
               |   - Pending invoice count
               |   - "Pay Bills" button --> /bills
               - Star Assist card with open ticket count --> /star-assist
               - Quick actions: Book SCSC, Info Centre, Newsletters
               - Latest announcement --> /discover/:id
               - Promotions --> /discover/:id

INTERACTIVE ELEMENTS:
    - Bell icon (top right) --> /notifications
    - Outstanding balance card --> /bills
    - Star Assist card --> /star-assist
    - Quick: Book SCSC --> /bookings
    - Quick: Info Centre --> /info
    - Quick: Newsletters --> /discover
    - "View All" announcements --> /discover
    - "View All" offers --> /discover
    - Individual announcement card --> /discover/:id
    - Individual promotion card --> /discover/:id
    - Push notification "Enable" button --> triggers browser permission + API subscription
```

---

### FLOW 5: Bills -- View Invoices, Filter, Pay

**Routes:** `/bills`, `/bills/:id`
**Entry Point:** Home dashboard "Pay Bills" button, bottom nav

```
[Bills Page] /bills
    |
    |-- Header: Total outstanding amount (MMK)
    |     - Pending invoice count
    |
    |-- Status filter pills: [All | Unpaid | Partial | Paid]
    |     |-- Tap filter --> re-fetch with status param
    |
    |-- Invoice list (grouped by month, sorted descending):
    |     Each invoice card shows:
    |       - Status badge (unpaid/partially_paid/paid)
    |       - Description
    |       - Invoice number + due date
    |       - Total amount
    |       - Paid amount (if partial)
    |
    |-- Back button --> /
    |
    |-- EMPTY STATE: "No Bills" icon + message
    |
    +-- Tap invoice card
         |
         v
    [Bill Detail Page] /bills/:id
         |
         |-- Header: Invoice number
         |-- Summary card:
         |     - Description, unit number
         |     - Status badge
         |     - Issue date, due date
         |     - Total amount, paid amount
         |
         |-- Line items breakdown:
         |     - Each item: description, quantity x unit price, amount
         |     - Subtotal
         |
         +-- BRANCH: invoice.status
              |
              +-- [PAID]: No payment section. View only.
              |
              +-- [UNPAID or PARTIALLY_PAID]:
                    |
                    |-- Amount to pay (outstanding = total - paid)
                    |
                    |-- Payment method selection:
                    |     [WavePay] [KBZPay]  (toggle selection)
                    |
                    |-- Agreement checkbox:
                    |     "I agree to the payment policy..."
                    |
                    |-- "Pay [amount] Securely" button
                    |     (disabled until method selected + checkbox checked)
                    |
                    +-- Tap "Pay"
                         |
                         +-- [API: POST /invoices/:id/pay]
                              |
                              +-- SUCCESS:
                              |     - Payment confirmation screen
                              |     - Button: "Back to Bills" --> /bills
                              |
                              +-- ERROR (insufficient_balance):
                              |     - Toast: wallet balance insufficient
                              |
                              +-- ERROR (other):
                                    - Toast: "Payment failed"
```

---

### FLOW 6: Star Assist -- Tickets

**Routes:** `/star-assist`, `/star-assist/new`, `/star-assist/:id`
**Entry Point:** Home Star Assist card, bottom nav

```
[Star Assist Page] /star-assist
    |
    |-- Header: summary counters (Open / In Progress / Completed)
    |-- "+ New" button (top right) --> /star-assist/new
    |
    |-- Status filter pills: [All | Open | In Progress | Completed]
    |
    |-- Ticket list: each card shows
    |     - Status badge + ticket number (SA-XXXX)
    |     - Title (1-line clamp)
    |     - Category tag + created date
    |
    |-- EMPTY STATE: "No Tickets" + "Create your first ticket" button
    |
    +-- Tap ticket card --> /star-assist/:id
    +-- Tap "+ New" --> /star-assist/new


[New Ticket Page] /star-assist/new
    |
    |-- Back button --> /star-assist
    |
    |-- Form (single card):
    |     1. Title (text input, required)
    |     2. Category (2-col grid of 8 options):
    |          Electricals, Plumbing, Housekeeping, A/C,
    |          Pest Control, Civil Works, Enquiry, Other
    |     3. Service Type (appears after category selected):
    |          Dynamic sub-options based on category
    |     4. Unit Number:
    |          - Resident: pre-filled, read-only
    |          - Guest: shown only for general_enquiry, optional
    |     5. Description (textarea, required)
    |     6. Photo Attachment (optional):
    |          - Tap "Attach Photo" --> camera/file picker
    |          - 5MB limit enforced (toast error if exceeded)
    |          - Preview shown with X to remove
    |          - Stored as base64 data URL
    |
    +-- Tap "Submit Ticket"
         |
         +-- [API: POST /tickets]
              |
              +-- SUCCESS:
              |     - Toast: "Ticket created [number]"
              |     - Navigate to /star-assist/:id (ticket detail)
              |
              +-- ERROR:
                    - Toast: "Failed to create ticket"


[Ticket Detail Page] /star-assist/:id
    |
    |-- Header: ticket number + title + status badge
    |-- Back button --> /star-assist
    |
    |-- Details card (2-col grid):
    |     - Category, Service Type, Unit, Submitted date
    |     - Description (full text)
    |
    |-- Attachment (if exists): image preview
    |
    |-- Updates section (legacy ticket updates):
    |     - Chronological list of messages
    |     - Staff messages: left-aligned, shield icon
    |     - Resident messages: right-aligned, user icon
    |
    |-- Chat with Support section (real-time WebSocket):
    |     - Connection indicator (green/red dot)
    |     - Message thread (scrollable):
    |       - Staff: left-aligned bubble
    |       - Resident: right-aligned primary-colored bubble
    |     - Input field + Send button
    |     - Enter key sends message
    |     - Auto-scroll on new messages
    |     - Polling fallback on WebSocket failure
    |
    +-- Type message + tap Send
         |
         +-- [WebSocket: send / API fallback: POST /tickets/:id/messages]
              +-- Message appears in thread immediately
              +-- Staff receives via WebSocket on admin side
```

---

### FLOW 7: Bookings -- SCSC Facility Booking

**Routes:** `/bookings`, `/bookings/:facilityId`
**Entry Point:** Home quick action "Book SCSC", bottom nav

```
[Bookings Page] /bookings
    |
    |-- Header: "SCSC Bookings"
    |-- Tab toggle: [Facilities | My Bookings]
    |
    +-- TAB: Facilities
    |     |
    |     |-- Facility list: each card shows
    |     |     - Category icon + label
    |     |     - Name, description (2-line clamp)
    |     |     - Rate (MMK/hr), hours, capacity
    |     |
    |     +-- Tap facility card --> /bookings/:facilityId
    |
    +-- TAB: My Bookings
          |
          |-- Booking list: each card shows
          |     - Status badge (upcoming/completed/cancelled)
          |     - Recurring badge (if recurringGroupId exists)
          |     - Facility name
          |     - Date + time slot
          |     - Total amount + booking number (BK-XXXX)
          |
          |-- If recurring + upcoming:
          |     "Cancel all future bookings" button
          |     +-- Tap --> confirm --> [API: POST /bookings/:id/cancel-group]


[Booking Detail / Slot Selection Page] /bookings/:facilityId
    |
    |-- Facility info card: name, description, rate, hours, max capacity
    |
    |-- STEP 1: Select Date
    |     - Horizontal scroll: 7 days starting today
    |     - Tap date --> reload slots
    |
    |-- STEP 2: Select Time
    |     - 3-col grid of time slots
    |     - Available: selectable / Unavailable: greyed out
    |
    |-- STEP 3 (appears when slot selected):
    |     Booking summary card:
    |       - Date, time range, total price
    |       - "Repeat Weekly" toggle (creates 4 bookings)
    |       - "Confirm Booking" button
    |
    +-- Tap "Confirm Booking"
         |
         +-- [API: POST /bookings]
              +-- SUCCESS: Confirmation screen --> "View My Bookings"
              +-- ERROR: Toast "Booking failed"
```

---

### FLOW 8: Discover -- Announcements and Promotions

**Routes:** `/discover`, `/discover/:id`
**Entry Point:** Home "Newsletters" quick action, Home "View All" links

```
[Discover Page] /discover
    |
    |-- Tab toggle: [Announcements | Offers]
    |
    +-- TAB: Announcements
    |     |-- List: pin icon, type badge, title, summary, date
    |     +-- Tap card --> /discover/:id
    |
    +-- TAB: Offers
          |-- List: category badge, title, partner name
          +-- Tap card --> /discover/:id


[Discover Detail Page] /discover/:id
    |
    +-- [ANNOUNCEMENT]: Category, title, date, content
    +-- [PROMOTION]: Category, title, partner, valid until, description
    +-- NOT FOUND: "Content not found"
```

---

### FLOW 9: Info Centre

**Routes:** `/info`, `/info/:id`

```
[Info Centre Page] /info
    |
    +-- STATE 1: Category grid (2-col)
    |     - Icon, category name, article count
    |     +-- Tap category --> STATE 2
    |
    +-- STATE 2: Article list (in-page transition)
          |-- Back button --> reset to grid
          |-- Article cards: title, summary, date
          +-- Tap article --> /info/:id

[Info Article Page] /info/:id
    |-- Category label, title, date
    |-- Content (markdown-like rendering)
```

---

### FLOW 10: Wallet

**Route:** `/wallet`

```
[Wallet Page] /wallet
    |
    |-- Balance cards: Wallet (MMK) / Deposit (MMK)
    |-- Tab toggle: [Wallet | Security Deposit]
    |-- Type filter chips: [All | Credits | Debits]
    |
    |-- Transaction list:
    |     - Icon: TrendingUp (credit, green) / TrendingDown (debit, red)
    |     - Description, date, reason (if exists), amount
    |
    |-- EMPTY STATE: "No wallet transactions yet"
```

---

### FLOW 11: Notifications

**Route:** `/notifications`

```
[Notifications Page] /notifications
    |
    |-- Notification list:
    |     - Type-specific icon + color
    |     - Title (bold if unread), body, timestamp
    |     - Unread: blue pulsing dot + white bg
    |
    |-- EMPTY STATE: bell icon + "You're all caught up"
```

---

### FLOW 12: Profile

**Route:** `/profile`

```
[Profile Page] /profile
    |
    +-- [NOT AUTHENTICATED]: Login/Register prompts
    |
    +-- [AUTHENTICATED]:
          |-- Avatar, name, user type badge
          |
          +-- [RESIDENT]: Unit details (Development, Unit, Resident ID)
          +-- [GUEST]: Upgrade card with status + "Apply Now"
          |
          |-- Quick links: Notifications, Wallet (residents)
          |-- Contact info: Email, Phone
          |-- Settings: Language toggle (EN/MY), Theme toggle (Light/System/Dark)
          +-- "Sign Out" button --> logout + /login
```

---

### FLOW 13: Push Notification Subscription

```
[Home Page - Resident Only]
    |
    |-- Conditions: resident + supported + not denied + not subscribed
    |
    +-- Tap "Enable"
         +-- Request browser permission
         +-- Get push subscription from service worker
         +-- [API: POST /push/subscribe]
         +-- Banner disappears on success
```

---

## PART 2: ADMIN PORTAL (Desktop Dashboard)

Global navigation: Sidebar via `AdminLayout`. AuthGuard protects all routes.

---

### FLOW 14: Admin Login

**Route:** `/login` (admin app)

```
[Admin Login] /login
    |-- Email + Password form
    |-- Demo credentials: admin/content/support accounts
    +-- Sign in --> [API: POST /admin/auth/login] --> /dashboard
```

---

### FLOW 15: Admin Dashboard

**Route:** `/dashboard`

```
[Dashboard] /dashboard
    |-- KPI cards: Open Tickets, Pending Verifications, Today's Bookings, Total Users
    |-- User Breakdown card: Residents, Guests, In Progress
    |-- Recent Tickets table
    |-- Recent Registrations table
```

---

### FLOW 16: User Management

**Routes:** `/users`, `/users/:id`

```
[Users] /users
    |-- Search + type filter (All/Guest/Resident)
    |-- Table: Name, Email, Type, Unit, Upgrade status, Joined
    +-- Tap row --> /users/:id
         |-- Account info card
         |-- Change User Type (dropdown + "Update")
         |-- User's tickets + bookings lists
```

---

### FLOW 17: Upgrade Requests

**Route:** `/upgrade-requests`

```
[Upgrade Requests] /upgrade-requests
    |-- Tabs: [Pending | Approved | Rejected]
    |-- Table: User, Unit, Resident ID, Development, Date
    +-- Pending tab actions:
         |-- "Approve" button --> [API: PATCH approve]
         +-- "Reject" button --> reason input --> [API: PATCH reject]
```

---

### FLOW 18: Content Management

**Route:** `/content`

```
[Content] /content
    |-- Tabs: [Announcements | Promotions]
    |-- Table with Edit/Delete actions per row
    +-- "New" button --> Modal form
         |-- Announcements: Title, Summary, Content, Type, Audience, Pinned, Draft
         +-- Promotions: Title, Category, Partner, Description, Active
```

---

### FLOW 19: Ticket Management

**Route:** `/tickets` (admin)

```
[Tickets] /tickets
    |-- Split panel: List (left) + Detail (right)
    |-- List: Search + status filter, ticket cards
    +-- Select ticket:
         |-- Status dropdown + Assigned To + Save
         |-- Updates section (legacy)
         +-- Chat section (WebSocket real-time)
              - Connection indicator, message thread, input + send
```

---

### FLOW 20: Booking Management

**Route:** `/facilities` (Bookings tab)

```
[Bookings Tab] /facilities
    |-- Status filter: [All | Upcoming | Completed | Cancelled]
    |-- Table: Booking#, User, Facility, Date/Time, Amount, Status
    +-- Cancel button (upcoming only) --> confirm --> [API: PATCH cancel]
```

---

### FLOW 21: Facility Management

**Route:** `/facilities` (Facilities tab)

```
[Facilities Tab] /facilities
    |-- Table: Name, Category, Rates, Hours, Status
    |-- Edit/Delete actions per row
    +-- "New Facility" --> Modal: Name, Category, Description, Rates,
         Hours, Capacity, Available checkbox
```

---

### FLOW 22: FAQ Management

**Route:** `/faqs`

```
[FAQs] /faqs
    |-- Grouped by category (accordion)
    |-- Each: Question, expand for answer, Draft badge
    |-- Edit/Delete actions
    +-- "New FAQ" --> Modal: Question, Answer, Category, Order, Published
```

---

### FLOW 23: Staff Management

**Route:** `/staff`

```
[Staff] /staff
    |-- Table: Name, Email, Role badge, Status, Created
    |-- Edit + Deactivate/Activate actions
    +-- "New Staff" --> Modal: Name, Email, Password (new only), Role dropdown
```

---

### FLOW 24: Audit Logs

**Route:** `/audit-logs`

```
[Audit Logs] /audit-logs
    |-- Filters: Action dropdown, From date, To date, Search button
    |-- Table: Date, Actor, Action, Target Type, Target ID, Details
    |-- Pagination: Previous / Page X of Y / Next
```

---

## CROSS-CUTTING CONCERNS

### Authentication State Machine

```
[Unauthenticated] --Register--> [Guest] --Upgrade Approved--> [Resident]
[Unauthenticated] --Login-----> [Guest] or [Resident]
[Any Authenticated] --Logout--> [Unauthenticated]
```

### Feature Access by User Type

| Feature | Unauth | Guest | Resident |
|---------|--------|-------|----------|
| Home, Discover, Info | Yes | Yes | Yes |
| Star Assist, Bookings | View | Yes | Yes |
| Bills, Wallet, Push | No | No | **Resident only** |
| Upgrade Request | No | **Guest only** | No |

### Admin Role Permissions

| Role | Staff | Content | Tickets | Bookings | Upgrades | Audit |
|------|-------|---------|---------|----------|----------|-------|
| admin | Yes | Yes | Yes | Yes | Yes | Yes |
| content_manager | - | Yes | - | - | - | - |
| ticket_handler | - | - | Yes | - | - | - |
| booking_manager | - | - | - | Yes | - | - |
| user_verifier | - | - | - | - | Yes | - |

### API Route Summary

```
Auth:           POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/upgrade-request
Home:           GET /home-summary
Invoices:       GET /invoices, GET /invoices/:id, GET /invoices/summary, POST /invoices/:id/pay
Tickets:        GET /tickets, POST /tickets, GET /tickets/:id, GET /tickets/summary
Ticket Chat:    GET /tickets/:id/messages, POST /tickets/:id/messages (+ WebSocket)
Facilities:     GET /facilities, GET /facilities/:id/slots
Bookings:       GET /bookings, POST /bookings, POST /bookings/:id/cancel-group
Announcements:  GET /announcements, GET /announcements/:id
Promotions:     GET /promotions, GET /promotions/:id
Info:           GET /info-categories, GET /info-articles, GET /info-articles/:id
Wallet:         GET /wallet, GET /deposit
Push:           GET /push/vapid-public-key, POST /push/subscribe, POST /push/unsubscribe
Notifications:  GET /notifications
Admin Auth:     POST /admin/auth/login, GET /admin/auth/me
Admin:          GET /admin/dashboard, /admin/users, /admin/upgrade-requests,
                /admin/tickets, /admin/facilities, /admin/bookings,
                /admin/content/announcements, /admin/content/promotions,
                /admin/faqs, /admin/staff, /admin/audit-logs,
                POST /admin/wallet/:userId/adjust
Health:         GET /healthz
```

---

*Generated from codebase analysis on 2026-04-11*
