import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { PreferencesForm } from "./preferences-form";

export const dynamic = "force-dynamic";

export default async function NotificationPreferencesPage() {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Link href="/notifications" className="text-sm text-blue-600 hover:underline">
        &larr; Back to Notifications
      </Link>

      <h2 className="text-xl font-bold">Notification Preferences</h2>

      <Card>
        <CardContent className="pt-6">
          <PreferencesForm emailNotifications={dbUser.emailNotifications} />
        </CardContent>
      </Card>
    </div>
  );
}
