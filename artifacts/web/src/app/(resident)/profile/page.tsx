import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
            <p className="text-muted-foreground">
              User account not found. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Profile</h2>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{dbUser.name}</CardTitle>
            <Badge
              variant={
                dbUser.userType === "resident" ? "default" : "secondary"
              }
            >
              {dbUser.userType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{dbUser.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{dbUser.phone}</p>
            </div>
            {dbUser.unitNumber && (
              <div>
                <p className="text-muted-foreground">Unit Number</p>
                <p className="font-medium">{dbUser.unitNumber}</p>
              </div>
            )}
            {dbUser.residentId && (
              <div>
                <p className="text-muted-foreground">Resident ID</p>
                <p className="font-medium">{dbUser.residentId}</p>
              </div>
            )}
            {dbUser.developmentName && (
              <div>
                <p className="text-muted-foreground">Development</p>
                <p className="font-medium">{dbUser.developmentName}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(dbUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <EditForm name={dbUser.name} phone={dbUser.phone} />
        </CardContent>
      </Card>
    </div>
  );
}
