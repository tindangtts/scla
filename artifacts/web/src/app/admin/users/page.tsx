import { requireAdmin } from "@/lib/auth";
import { getUsers } from "@/lib/queries/admin-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const search = params.search || "";
  const role = params.role || "";

  const users = await getUsers(search || undefined, role || undefined);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users</h2>

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search by name or email..."
          defaultValue={search}
          className="px-3 py-2 border rounded-md text-sm flex-1 min-w-[200px]"
        />
        <select
          name="role"
          defaultValue={role}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Roles</option>
          <option value="guest">Guest</option>
          <option value="resident">Resident</option>
        </select>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-medium">Name</th>
                <th className="py-2 px-3 font-medium">Email</th>
                <th className="py-2 px-3 font-medium">Phone</th>
                <th className="py-2 px-3 font-medium">Type</th>
                <th className="py-2 px-3 font-medium">Unit</th>
                <th className="py-2 px-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="py-2 px-3">{user.email}</td>
                  <td className="py-2 px-3">{user.phone}</td>
                  <td className="py-2 px-3">
                    <Badge
                      variant={
                        user.userType === "resident" ? "default" : "outline"
                      }
                    >
                      {user.userType}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">{user.unitNumber || "-"}</td>
                  <td className="py-2 px-3">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
