import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getPromotions } from "@/lib/queries/admin-content";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { deletePromotion } from "./actions";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  await requireAdmin();
  const promotions = await getPromotions();

  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description={`${promotions.length} total`}
        backHref="/admin/content"
        backLabel="Content"
        action={
          <Link
            href="/admin/content/promotions/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New promotion
          </Link>
        }
      />

      {promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No promotions yet"
          description="Partner offers and discounts will appear here once created."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">Title</th>
                  <th className="py-3 px-4 font-bold">Partner</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Valid</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-foreground truncate">{p.title}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.partnerName}</td>
                    <td className="py-3 px-4 capitalize">{p.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          p.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                      {formatDate(p.validFrom)}
                      {p.validUntil ? ` – ${formatDate(p.validUntil)}` : ""}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/content/promotions/${p.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-bold hover:bg-muted/80"
                        >
                          <Edit className="w-3 h-3" aria-hidden="true" />
                          Edit
                        </Link>
                        <form action={deletePromotion}>
                          <input type="hidden" name="id" value={p.id} />
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
