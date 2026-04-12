import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAnnouncements } from "@/lib/queries/admin-content";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { deleteAnnouncement } from "./actions";
import { Plus, Megaphone, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireAdmin();
  const announcements = await getAnnouncements();

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        description={`${announcements.length} total · newsletters included`}
        backHref="/admin/content"
        backLabel="Content"
        action={
          <Link
            href="/admin/content/announcements/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New announcement
          </Link>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Post the first update to appear in residents' Discover feed."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">Title</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold">Audience</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Published</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-foreground truncate">{a.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">
                      {a.targetAudience.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          a.isDraft
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                        )}
                      >
                        {a.isDraft ? "Draft" : "Published"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                      {formatDate(a.publishedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/content/announcements/${a.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-bold hover:bg-muted/80"
                        >
                          <Edit className="w-3 h-3" aria-hidden="true" />
                          Edit
                        </Link>
                        <form action={deleteAnnouncement}>
                          <input type="hidden" name="id" value={a.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2.5 text-xs font-bold"
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                            Delete
                          </Button>
                        </form>
                      </div>
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
