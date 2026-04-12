-- Migration: Add gen_random_uuid() defaults to all UUID id columns
--
-- Context: The original schema was created without DEFAULT clauses on id
-- columns, so Drizzle's `.defaultRandom()` declaration didn't actually apply
-- at the database level. All inserts without explicit IDs would fail with:
--   "null value in column 'id' violates not-null constraint"
--
-- The seed script works because it passes explicit SEED_IDS, but any
-- user-initiated insert (ticket creation, booking, admin CRUD) fails.
--
-- Discovered: 2026-04-12 via Playwright E2E tests against Supabase.
-- Applied to: Supabase project tcpluxdnfznudxfecfkg
--
-- Required extension: pgcrypto (Supabase default)

ALTER TABLE "announcements"       ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "audit_logs"          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "bookings"            ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "facilities"          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "faqs"                ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "info_articles"       ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "info_categories"     ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "invoices"            ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "notifications"       ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "promotions"          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "push_subscriptions"  ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "staff_users"         ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "ticket_messages"     ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "tickets"             ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "upgrade_requests"    ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "users"               ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "wallet_transactions" ALTER COLUMN id SET DEFAULT gen_random_uuid();
