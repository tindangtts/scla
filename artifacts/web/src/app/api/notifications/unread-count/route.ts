import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUnreadCount } from "@/lib/queries/notifications";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the app DB user by email
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getUnreadCount(rows[0].id);
  return NextResponse.json({ count });
}
