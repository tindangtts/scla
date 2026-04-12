import { requireAdmin } from "@/lib/auth";
import { getPromotionById } from "@/lib/queries/admin-content";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { updatePromotion } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const promotion = await getPromotionById(id);

  if (!promotion) {
    notFound();
  }

  const validFromStr = promotion.validFrom.toISOString().split("T")[0];
  const validUntilStr = promotion.validUntil
    ? promotion.validUntil.toISOString().split("T")[0]
    : "";

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/content/promotions"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Promotions
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">Edit Promotion</h1>

      <form action={updatePromotion} className="space-y-4">
        <input type="hidden" name="id" value={promotion.id} />

        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={promotion.title} required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={promotion.description}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={promotion.category} required />
        </div>

        <div>
          <Label htmlFor="partnerName">Partner Name</Label>
          <Input
            id="partnerName"
            name="partnerName"
            defaultValue={promotion.partnerName}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="validFrom">Valid From</Label>
            <Input id="validFrom" name="validFrom" type="date" defaultValue={validFromStr} />
          </div>
          <div>
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input id="validUntil" name="validUntil" type="date" defaultValue={validUntilStr} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked={promotion.isActive}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <Button type="submit">Update Promotion</Button>
      </form>
    </div>
  );
}
