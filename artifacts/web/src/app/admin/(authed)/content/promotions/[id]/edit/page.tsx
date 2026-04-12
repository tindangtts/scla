import { requireAdmin } from "@/lib/auth";
import { getPromotionById } from "@/lib/queries/admin-content";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePromotion } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const promotion = await getPromotionById(id);
  if (!promotion) notFound();

  const validFromStr = promotion.validFrom.toISOString().split("T")[0];
  const validUntilStr = promotion.validUntil
    ? promotion.validUntil.toISOString().split("T")[0]
    : "";

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit promotion"
        backHref="/admin/content/promotions"
        backLabel="Promotions"
      />

      <form
        action={updatePromotion}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <input type="hidden" name="id" value={promotion.id} />

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={promotion.title} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={promotion.description}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={promotion.category} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partnerName">Partner</Label>
            <Input
              id="partnerName"
              name="partnerName"
              defaultValue={promotion.partnerName}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="validFrom">Valid from</Label>
            <Input id="validFrom" name="validFrom" type="date" defaultValue={validFromStr} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="validUntil">Valid until</Label>
            <Input id="validUntil" name="validUntil" type="date" defaultValue={validUntilStr} />
          </div>
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked={promotion.isActive}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="block text-sm font-bold">Active</span>
        </label>

        <Button type="submit" className="font-bold">
          Update promotion
        </Button>
      </form>
    </div>
  );
}
