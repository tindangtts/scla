import { requireAdmin } from "@/lib/auth";
import { getUserById, getUserWalletBalance } from "@/lib/queries/admin-users";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateUserRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) {
    notFound();
  }

  const walletBalance = await getUserWalletBalance(id);

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Users
      </Link>

      <h2 className="text-2xl font-bold mb-6">{user.name}</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              {user.email}
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {user.phone}
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <Badge
                variant={
                  user.userType === "resident" ? "default" : "outline"
                }
              >
                {user.userType}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Unit Number:</span>{" "}
              {user.unitNumber || "-"}
            </div>
            <div>
              <span className="text-muted-foreground">Resident ID:</span>{" "}
              {user.residentId || "-"}
            </div>
            <div>
              <span className="text-muted-foreground">Development:</span>{" "}
              {user.developmentName || "-"}
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              {user.createdAt.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {parseFloat(walletBalance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Current Balance
            </p>
          </CardContent>
        </Card>

        {/* Role Assignment Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Role Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateUserRole} className="flex items-end gap-3">
              <input type="hidden" name="userId" value={user.id} />
              <div className="flex-1">
                <label className="text-sm text-muted-foreground block mb-1">
                  User Role
                </label>
                <select
                  name="newRole"
                  defaultValue={user.userType}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="guest">Guest</option>
                  <option value="resident">Resident</option>
                </select>
              </div>
              <Button type="submit">Update Role</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
