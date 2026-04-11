import { db } from "@/lib/db";
import {
  ticketsTable,
  usersTable,
  staffUsersTable,
  type Ticket,
  type StaffUser,
} from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

export type AdminTicket = Ticket & {
  userName: string;
  userEmail: string;
};

/**
 * Get all tickets (not user-scoped) with optional status filter.
 * Joins users table for submitter info.
 */
export async function getAllTickets(status?: string): Promise<AdminTicket[]> {
  const conditions: ReturnType<typeof eq>[] = [];

  if (
    status &&
    ["open", "in_progress", "completed", "closed"].includes(status)
  ) {
    conditions.push(
      eq(
        ticketsTable.status,
        status as "open" | "in_progress" | "completed" | "closed"
      )
    );
  }

  const rows = await db
    .select({
      ticket: ticketsTable,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(ticketsTable)
    .innerJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ticketsTable.createdAt));

  return rows.map((r) => ({
    ...r.ticket,
    userName: r.userName,
    userEmail: r.userEmail,
  }));
}

/**
 * Get a single ticket by ID (not user-scoped) with submitter info.
 */
export async function getTicketById(
  id: string
): Promise<AdminTicket | null> {
  const rows = await db
    .select({
      ticket: ticketsTable,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(ticketsTable)
    .innerJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
    .where(eq(ticketsTable.id, id))
    .limit(1);

  if (rows.length === 0) return null;

  return {
    ...rows[0].ticket,
    userName: rows[0].userName,
    userEmail: rows[0].userEmail,
  };
}

/**
 * Get active staff members for assignment dropdown.
 */
export async function getStaffMembers(): Promise<StaffUser[]> {
  return db
    .select()
    .from(staffUsersTable)
    .where(eq(staffUsersTable.isActive, true));
}
