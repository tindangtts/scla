import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getUsers } from "@/lib/queries/admin-users";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { Search, Users as UsersIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <AdminPageHeader
        title="Users"
        description={`${users.length} result${users.length === 1 ? "" : "s"}${role ? ` · ${role}` : ""}${search ? ` · "${search}"` : ""}`}
      />

      {/* Filters */}
      <form
        method="GET"
        className="rounded-2xl bg-card border border-card-border p-3 shadow-sm mb-6 flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            type="search"
            name="search"
            placeholder="Search by name or email..."
            defaultValue={search}
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <select
          name="role"
          defaultValue={role}
          aria-label="Filter by role"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <option value="">All roles</option>
          <option value="guest">Guest</option>
          <option value="resident">Resident</option>
        </select>
        <Button type="submit" size="default" className="sm:w-auto font-bold">
          <Search className="w-4 h-4" aria-hidden="true" />
          Search
        </Button>
      </form>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description="Try clearing filters or adjusting your search."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">Name</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Phone</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold">Unit</th>
                  <th className="py-3 px-4 font-bold">Created</th>
                  <th className="py-3 px-4 font-bold text-right">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">{user.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          user.userType === "resident"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {user.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">{user.unitNumber || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        aria-label={`Open ${user.name}`}
                        className="inline-flex p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
