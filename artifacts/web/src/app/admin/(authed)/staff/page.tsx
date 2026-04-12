import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllStaff } from "@/lib/queries/admin-staff";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, humanizeStatus } from "@/lib/format";
import { Plus, UserCog, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireAdmin();
  const staffList = await getAllStaff();

  return (
    <div>
      <AdminPageHeader
        title="Staff"
        description={`${staffList.length} staff member${staffList.length === 1 ? "" : "s"}`}
        action={
          <Link
            href="/admin/staff/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New staff
          </Link>
        }
      />

      {staffList.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No staff members"
          description="Create staff accounts so they can sign in and manage the estate."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">Name</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Created</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">{s.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                        {humanizeStatus(s.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          s.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/staff/${s.id}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-bold hover:bg-muted/80"
                      >
                        <Edit className="w-3 h-3" aria-hidden="true" />
                        Edit
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
