import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createPromotion } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/content/promotions"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Promotions
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">New Promotion</h1>

      <form action={createPromotion} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" required />
        </div>

        <div>
          <Label htmlFor="partnerName">Partner Name</Label>
          <Input id="partnerName" name="partnerName" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="validFrom">Valid From</Label>
            <Input id="validFrom" name="validFrom" type="date" />
          </div>
          <div>
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input id="validUntil" name="validUntil" type="date" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <Button type="submit">Create Promotion</Button>
      </form>
    </div>
  );
}
