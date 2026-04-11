import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  ticketMessagesTable,
  ticketsTable,
  usersTable,
  staffUsersTable,
} from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/tickets/[id]/messages
 * Returns all messages for a ticket, ordered chronologically.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ticketId } = await params;
  if (!UUID_RE.test(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  // Verify ticket exists
  const tickets = await db
    .select({ id: ticketsTable.id })
    .from(ticketsTable)
    .where(eq(ticketsTable.id, ticketId))
    .limit(1);

  if (tickets.length === 0) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(ticketMessagesTable)
    .where(eq(ticketMessagesTable.ticketId, ticketId))
    .orderBy(asc(ticketMessagesTable.createdAt));

  return NextResponse.json(messages);
}

/**
 * POST /api/tickets/[id]/messages
 * Creates a new message on a ticket.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ticketId } = await params;
  if (!UUID_RE.test(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  // Verify ticket exists
  const tickets = await db
    .select({ id: ticketsTable.id })
    .from(ticketsTable)
    .where(eq(ticketsTable.id, ticketId))
    .limit(1);

  if (tickets.length === 0) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.content !== "string" || body.content.trim() === "") {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 },
    );
  }

  // Determine sender ID and type from authenticated user
  // Check if user is staff first
  const staffRows = await db
    .select({ id: staffUsersTable.id })
    .from(staffUsersTable)
    .where(eq(staffUsersTable.email, user.email!))
    .limit(1);

  let senderId: string;
  let senderType: "resident" | "staff";

  if (staffRows.length > 0) {
    senderId = staffRows[0].id;
    senderType = "staff";
  } else {
    // Look up resident user
    const userRows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, user.email!))
      .limit(1);

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 },
      );
    }
    senderId = userRows[0].id;
    senderType = "resident";
  }

  const [message] = await db
    .insert(ticketMessagesTable)
    .values({
      ticketId,
      senderId,
      senderType,
      content: body.content.trim(),
    })
    .returning();

  return NextResponse.json(message, { status: 201 });
}
