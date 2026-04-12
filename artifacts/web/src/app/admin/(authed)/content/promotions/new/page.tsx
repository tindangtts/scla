import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPromotion } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New promotion"
        backHref="/admin/content/promotions"
        backLabel="Promotions"
      />

      <form
        action={createPromotion}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required rows={5} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="partnerName">Partner</Label>
            <Input id="partnerName" name="partnerName" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="validFrom">Valid from</Label>
            <Input id="validFrom" name="validFrom" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="validUntil">Valid until</Label>
            <Input id="validUntil" name="validUntil" type="date" />
          </div>
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="block text-sm font-bold">Active</span>
        </label>

        <Button type="submit" className="font-bold">
          Create promotion
        </Button>
      </form>
    </div>
  );
}
