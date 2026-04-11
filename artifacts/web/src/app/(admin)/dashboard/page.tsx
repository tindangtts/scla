import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <Badge>Admin Portal</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-600">Database not connected: {error}</p>
          ) : (
            <p className="text-muted-foreground">
              Staff accounts: {staffCount}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
