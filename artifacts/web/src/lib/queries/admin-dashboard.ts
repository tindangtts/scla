import { db } from "@/lib/db";
import {
  usersTable,
  ticketsTable,
  bookingsTable,
  invoicesTable,
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getAdminDashboardStats() {
  const [residents] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(eq(usersTable.userType, "resident"));

  const [guests] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(eq(usersTable.userType, "guest"));

  const [openTickets] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ticketsTable)
    .where(eq(ticketsTable.status, "open"));

  const [inProgressTickets] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ticketsTable)
    .where(eq(ticketsTable.status, "in_progress"));

  const [activeBookings] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "upcoming"));

  const [revenue] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoicesTable.paidAmount}), 0)::text`,
    })
    .from(invoicesTable);

  return {
    totalResidents: residents?.count ?? 0,
    totalGuests: guests?.count ?? 0,
    openTickets: openTickets?.count ?? 0,
    inProgressTickets: inProgressTickets?.count ?? 0,
    activeBookings: activeBookings?.count ?? 0,
    totalRevenue: revenue?.total ?? "0",
  };
}
