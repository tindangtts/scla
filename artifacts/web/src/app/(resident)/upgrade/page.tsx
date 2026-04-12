import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UpgradeForm } from "./upgrade-form";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">User account not found. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dbUser.userType === "resident") {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Already Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You are already a verified resident.</p>
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dbUser.upgradeStatus === "pending") {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Request Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your upgrade request is pending review. Our team will verify your details within 1-2
              business days.
            </p>
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Upgrade to Resident</h1>
      <Card>
        <CardHeader>
          <CardTitle>Submit Upgrade Request</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your apartment details below. Our management team will verify your information and
            approve your upgrade.
          </p>
          <UpgradeForm />
        </CardContent>
      </Card>
    </div>
  );
}
