import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFaq } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewFaqPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="New FAQ" backHref="/admin/content/faqs" backLabel="FAQs" />

      <form
        action={createFaq}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="question">Question</Label>
          <Input id="question" name="question" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="answer">Answer</Label>
          <Textarea id="answer" name="answer" required rows={5} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue="General" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
          </div>
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            defaultChecked
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="block text-sm font-bold">Published</span>
        </label>

        <Button type="submit" className="font-bold">
          Create FAQ
        </Button>
      </form>
    </div>
  );
}
