import { requireAdmin } from "@/lib/auth";
import { getAllStaff } from "@/lib/queries/admin-staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function StaffPage() {
  await requireAdmin();
  const staffList = await getAllStaff();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Staff</h2>
        <Link href="/admin/staff/new">
          <Button size="sm">New Staff</Button>
        </Link>
      </div>

      {staffList.length === 0 ? (
        <p className="text-muted-foreground">No staff members found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-medium">Name</th>
                <th className="py-2 px-3 font-medium">Email</th>
                <th className="py-2 px-3 font-medium">Role</th>
                <th className="py-2 px-3 font-medium">Active</th>
                <th className="py-2 px-3 font-medium">Created</th>
                <th className="py-2 px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{s.name}</td>
                  <td className="py-2 px-3">{s.email}</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline">{formatRole(s.role)}</Badge>
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={s.isActive ? "default" : "destructive"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">{s.createdAt.toLocaleDateString()}</td>
                  <td className="py-2 px-3">
                    <Link
                      href={`/admin/staff/${s.id}/edit`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
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
