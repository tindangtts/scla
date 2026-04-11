import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { staffUsersTable } from "./staff_users";
import { upgradeRequestsTable } from "./upgrade_requests";
import { invoicesTable } from "./invoices";
import { bookingsTable } from "./bookings";
import { ticketsTable } from "./tickets";
import { ticketMessagesTable } from "./ticket_messages";
import { notificationsTable } from "./notifications";
import { pushSubscriptionsTable } from "./push_subscriptions";
import { walletTransactionsTable } from "./wallet_transactions";
import { auditLogsTable } from "./audit_logs";
import { facilitiesTable } from "./facilities";
import { infoCategoriesTable, infoArticlesTable } from "./info";

// ─── Users ───────────────────────────────────────────────
export const usersRelations = relations(usersTable, ({ many }) => ({
  upgradeRequests: many(upgradeRequestsTable),
  invoices: many(invoicesTable),
  bookings: many(bookingsTable),
  tickets: many(ticketsTable),
  notifications: many(notificationsTable),
  pushSubscriptions: many(pushSubscriptionsTable),
  walletTransactions: many(walletTransactionsTable),
}));

// ─── Staff Users ─────────────────────────────────────────
export const staffUsersRelations = relations(staffUsersTable, ({ many }) => ({
  assignedTickets: many(ticketsTable),
  auditLogs: many(auditLogsTable),
}));

// ─── Upgrade Requests ────────────────────────────────────
export const upgradeRequestsRelations = relations(upgradeRequestsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [upgradeRequestsTable.userId],
    references: [usersTable.id],
  }),
}));

// ─── Invoices ────────────────────────────────────────────
export const invoicesRelations = relations(invoicesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [invoicesTable.userId],
    references: [usersTable.id],
  }),
}));

// ─── Facilities ──────────────────────────────────────────
export const facilitiesRelations = relations(facilitiesTable, ({ many }) => ({
  bookings: many(bookingsTable),
}));

// ─── Bookings ────────────────────────────────────────────
export const bookingsRelations = relations(bookingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [bookingsTable.userId],
    references: [usersTable.id],
  }),
  facility: one(facilitiesTable, {
    fields: [bookingsTable.facilityId],
    references: [facilitiesTable.id],
  }),
}));

// ─── Tickets ─────────────────────────────────────────────
export const ticketsRelations = relations(ticketsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ticketsTable.userId],
    references: [usersTable.id],
  }),
  assignedStaff: one(staffUsersTable, {
    fields: [ticketsTable.assignedTo],
    references: [staffUsersTable.id],
  }),
  messages: many(ticketMessagesTable),
}));

// ─── Ticket Messages ────────────────────────────────────
export const ticketMessagesRelations = relations(ticketMessagesTable, ({ one }) => ({
  ticket: one(ticketsTable, {
    fields: [ticketMessagesTable.ticketId],
    references: [ticketsTable.id],
  }),
}));

// ─── Notifications ──────────────────────────────────────
export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.userId],
    references: [usersTable.id],
  }),
}));

// ─── Push Subscriptions ─────────────────────────────────
export const pushSubscriptionsRelations = relations(pushSubscriptionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [pushSubscriptionsTable.userId],
    references: [usersTable.id],
  }),
}));

// ─── Wallet Transactions ────────────────────────────────
export const walletTransactionsRelations = relations(walletTransactionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [walletTransactionsTable.userId],
    references: [usersTable.id],
  }),
}));

// ─── Audit Logs ─────────────────────────────────────────
export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  actor: one(staffUsersTable, {
    fields: [auditLogsTable.actorId],
    references: [staffUsersTable.id],
  }),
}));

// ─── Info Categories & Articles ─────────────────────────
export const infoCategoriesRelations = relations(infoCategoriesTable, ({ many }) => ({
  articles: many(infoArticlesTable),
}));

export const infoArticlesRelations = relations(infoArticlesTable, ({ one }) => ({
  category: one(infoCategoriesTable, {
    fields: [infoArticlesTable.categoryId],
    references: [infoCategoriesTable.id],
  }),
}));
