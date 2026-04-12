import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AppSubHeader } from "@/components/layout/app-header";
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
      <div className="p-5">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  return (
    <>
      <AppSubHeader
        title="Notification preferences"
        backHref="/notifications"
        backLabel="Notifications"
      />

      <div className="px-5 -mt-6 pb-8 relative z-20">
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-5">
            Choose how you want to hear from us. You can change these anytime.
          </p>
          <PreferencesForm emailNotifications={dbUser.emailNotifications} />
        </div>
      </div>
    </>
  );
}
