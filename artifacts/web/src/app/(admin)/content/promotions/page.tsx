import { requireAdmin } from "@/lib/auth";
import { getPromotions } from "@/lib/queries/admin-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deletePromotion } from "./actions";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  await requireAdmin();
  const promotions = await getPromotions();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Link href="/admin/content/promotions/new">
          <Button size="sm">New Promotion</Button>
        </Link>
      </div>

      {promotions.length === 0 ? (
        <p className="text-muted-foreground">No promotions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Title</th>
                <th className="p-2">Partner</th>
                <th className="p-2">Category</th>
                <th className="p-2">Active</th>
                <th className="p-2">Valid From</th>
                <th className="p-2">Valid Until</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 max-w-xs truncate">{p.title}</td>
                  <td className="p-2">{p.partnerName}</td>
                  <td className="p-2 capitalize">{p.category}</td>
                  <td className="p-2">
                    {p.isActive ? (
                      <Badge variant="secondary" className="text-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </td>
                  <td className="p-2">
                    {p.validFrom.toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {p.validUntil
                      ? p.validUntil.toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/content/promotions/${p.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <form action={deletePromotion}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="destructive"
                        >
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
      )}
    </div>
  );
}
