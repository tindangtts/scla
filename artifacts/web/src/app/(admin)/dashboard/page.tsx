import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let staffCount: number | null = null;
  let error: string | null = null;

  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.staffUsersTable);
    staffCount = result[0]?.count ?? 0;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {error ? (
        <p className="text-red-600">Database not connected: {error}</p>
      ) : (
        <p className="text-gray-700">Staff accounts: {staffCount}</p>
      )}
    </div>
  );
}
