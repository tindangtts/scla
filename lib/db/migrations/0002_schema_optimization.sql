-- ============================================================
-- Migration: Schema Optimization for Supabase PostgreSQL
-- Description: UUID PKs/FKs, foreign key constraints, indexes,
--              proper date/time types, sequence fixes, updated_at trigger
-- ============================================================

-- ─── Enable UUID extension (Supabase has this by default) ────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PHASE 1: Convert primary keys from TEXT to UUID
-- ============================================================

-- Users
ALTER TABLE users ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Staff Users
ALTER TABLE staff_users ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE staff_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Facilities
ALTER TABLE facilities ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE facilities ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Announcements
ALTER TABLE announcements ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE announcements ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Promotions
ALTER TABLE promotions ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE promotions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- FAQs
ALTER TABLE faqs ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE faqs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Info Categories
ALTER TABLE info_categories ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE info_categories ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================
-- PHASE 2: Convert FK columns to UUID and add constraints
-- ============================================================

-- Upgrade Requests
ALTER TABLE upgrade_requests ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE upgrade_requests ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE upgrade_requests ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE upgrade_requests ADD CONSTRAINT fk_upgrade_requests_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Invoices
ALTER TABLE invoices ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE invoices ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE invoices ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Bookings
ALTER TABLE bookings ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE bookings ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE bookings ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE bookings ALTER COLUMN facility_id SET DATA TYPE uuid USING facility_id::uuid;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_facility
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE RESTRICT;

-- Tickets
ALTER TABLE tickets ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE tickets ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE tickets ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE tickets ALTER COLUMN assigned_to SET DATA TYPE uuid USING assigned_to::uuid;
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES staff_users(id) ON DELETE SET NULL;

-- Ticket Messages
ALTER TABLE ticket_messages ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE ticket_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE ticket_messages ALTER COLUMN ticket_id SET DATA TYPE uuid USING ticket_id::uuid;
ALTER TABLE ticket_messages ALTER COLUMN sender_id SET DATA TYPE uuid USING sender_id::uuid;
ALTER TABLE ticket_messages ADD CONSTRAINT fk_ticket_messages_ticket
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;

-- Notifications
ALTER TABLE notifications ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE notifications ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE notifications ALTER COLUMN related_id SET DATA TYPE uuid USING related_id::uuid;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Push Subscriptions
ALTER TABLE push_subscriptions ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE push_subscriptions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE push_subscriptions ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE push_subscriptions ADD CONSTRAINT fk_push_subscriptions_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Wallet Transactions
ALTER TABLE wallet_transactions ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE wallet_transactions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE wallet_transactions ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Audit Logs
ALTER TABLE audit_logs ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ALTER COLUMN actor_id SET DATA TYPE uuid USING actor_id::uuid;
ALTER TABLE audit_logs ALTER COLUMN target_id SET DATA TYPE uuid USING target_id::uuid;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_actor
  FOREIGN KEY (actor_id) REFERENCES staff_users(id) ON DELETE RESTRICT;

-- Info Articles
ALTER TABLE info_articles ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;
ALTER TABLE info_articles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE info_articles ALTER COLUMN category_id SET DATA TYPE uuid USING category_id::uuid;
ALTER TABLE info_articles ADD CONSTRAINT fk_info_articles_category
  FOREIGN KEY (category_id) REFERENCES info_categories(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 3: Convert TEXT date/time columns to proper types
-- ============================================================

-- Invoices: issue_date, due_date (TEXT 'YYYY-MM-DD' -> DATE)
ALTER TABLE invoices ALTER COLUMN issue_date SET DATA TYPE date USING issue_date::date;
ALTER TABLE invoices ALTER COLUMN due_date SET DATA TYPE date USING due_date::date;

-- Bookings: date (TEXT 'YYYY-MM-DD' -> DATE), start_time/end_time (TEXT 'HH:MM' -> TIME)
ALTER TABLE bookings ALTER COLUMN date SET DATA TYPE date USING date::date;
ALTER TABLE bookings ALTER COLUMN start_time SET DATA TYPE time USING start_time::time;
ALTER TABLE bookings ALTER COLUMN end_time SET DATA TYPE time USING end_time::time;

-- Facilities: opening_time, closing_time (TEXT 'HH:MM' -> TIME)
ALTER TABLE facilities ALTER COLUMN opening_time SET DATA TYPE time USING opening_time::time;
ALTER TABLE facilities ALTER COLUMN closing_time SET DATA TYPE time USING closing_time::time;

-- ============================================================
-- PHASE 4: Add indexes for performance
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_unit_number ON users(unit_number);
CREATE INDEX IF NOT EXISTS idx_users_development_name ON users(development_name);

-- Staff Users
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role);
CREATE INDEX IF NOT EXISTS idx_staff_users_is_active ON staff_users(is_active);

-- Upgrade Requests
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user_id ON upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON upgrade_requests(status);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_month ON invoices(month);
CREATE INDEX IF NOT EXISTS idx_invoices_unit_number ON invoices(unit_number);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_facility_id ON bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_facility_date ON bookings(facility_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_recurring_group ON bookings(recurring_group_id);

-- Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON tickets(user_id, status);

-- Ticket Messages
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender_id ON ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_created ON ticket_messages(ticket_id, created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_is_draft ON announcements(is_draft);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);

-- Promotions
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON promotions(category);
CREATE INDEX IF NOT EXISTS idx_promotions_valid_from_until ON promotions(valid_from, valid_until);

-- Facilities
CREATE INDEX IF NOT EXISTS idx_facilities_category ON facilities(category);
CREATE INDEX IF NOT EXISTS idx_facilities_is_available ON facilities(is_available);

-- Push Subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Wallet Transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_type ON wallet_transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Info Articles
CREATE INDEX IF NOT EXISTS idx_info_articles_category_id ON info_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_info_articles_published_at ON info_articles(published_at);

-- FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);

-- ============================================================
-- PHASE 5: Fix sequences (increase maxValue, enable cycling)
-- ============================================================

ALTER SEQUENCE IF EXISTS ticket_number_seq MAXVALUE 999999 CYCLE;
ALTER SEQUENCE IF EXISTS booking_number_seq MAXVALUE 999999 CYCLE;

-- ============================================================
-- PHASE 6: Auto-update updated_at trigger (Supabase pattern)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_staff_users
  BEFORE UPDATE ON staff_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tickets
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_faqs
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PHASE 7: Enable Row Level Security (Supabase best practice)
-- ============================================================

-- Enable RLS on user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created separately based on
-- your Supabase Auth integration. Example policy:
--
-- CREATE POLICY "Users can view own data" ON invoices
--   FOR SELECT USING (user_id = auth.uid());
