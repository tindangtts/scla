import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ResidentHomePage() {
  let userCount: number | null = null;
  let error: string | null = null;

  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.usersTable);
    userCount = result[0]?.count ?? 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome to Star City Living</h2>
      {error ? (
        <p className="text-red-600">Database not connected: {error}</p>
      ) : (
        <p className="text-gray-700">Registered users: {userCount}</p>
      )}
    </div>
  );
}
