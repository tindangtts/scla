import { db } from "@/lib/db";
import { invoicesTable, bookingsTable, ticketsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export type HistoryItemType = "bill" | "booking" | "ticket";

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  number: string;
  status: string;
  date: Date;
  amount?: string;
  href: string;
}

export async function getUserHistory(
  userId: string,
  type?: HistoryItemType,
  limit = 50,
): Promise<HistoryItem[]> {
  const items: HistoryItem[] = [];

  if (!type || type === "bill") {
    const bills = await db
      .select({
        id: invoicesTable.id,
        invoiceNumber: invoicesTable.invoiceNumber,
        category: invoicesTable.category,
        month: invoicesTable.month,
        status: invoicesTable.status,
        totalAmount: invoicesTable.totalAmount,
        createdAt: invoicesTable.createdAt,
      })
      .from(invoicesTable)
      .where(eq(invoicesTable.userId, userId))
      .orderBy(desc(invoicesTable.createdAt))
      .limit(limit);

    items.push(
      ...bills.map((b) => ({
        id: b.id,
        type: "bill" as const,
        title: `${b.category} - ${b.month}`,
        number: b.invoiceNumber,
        status: b.status,
        date: b.createdAt,
        amount: b.totalAmount,
        href: `/bills/${b.id}`,
      })),
    );
  }

  if (!type || type === "booking") {
    const bookings = await db
      .select({
        id: bookingsTable.id,
        bookingNumber: bookingsTable.bookingNumber,
        facilityName: bookingsTable.facilityName,
        status: bookingsTable.status,
        totalAmount: bookingsTable.totalAmount,
        date: bookingsTable.date,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .where(eq(bookingsTable.userId, userId))
      .orderBy(desc(bookingsTable.createdAt))
      .limit(limit);

    items.push(
      ...bookings.map((b) => ({
        id: b.id,
        type: "booking" as const,
        title: b.facilityName,
        number: b.bookingNumber,
        status: b.status,
        date: b.createdAt,
        amount: b.totalAmount,
        href: `/bookings/${b.id}`,
      })),
    );
  }

  if (!type || type === "ticket") {
    const tickets = await db
      .select({
        id: ticketsTable.id,
        ticketNumber: ticketsTable.ticketNumber,
        title: ticketsTable.title,
        status: ticketsTable.status,
        createdAt: ticketsTable.createdAt,
      })
      .from(ticketsTable)
      .where(eq(ticketsTable.userId, userId))
      .orderBy(desc(ticketsTable.createdAt))
      .limit(limit);

    items.push(
      ...tickets.map((t) => ({
        id: t.id,
        type: "ticket" as const,
        title: t.title,
        number: t.ticketNumber,
        status: t.status,
        date: t.createdAt,
        href: `/star-assist/${t.id}`,
      })),
    );
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}
