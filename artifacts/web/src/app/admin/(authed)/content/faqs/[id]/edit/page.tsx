import { requireAdmin } from "@/lib/auth";
import { getFaqById } from "@/lib/queries/admin-content";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateFaq } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const faq = await getFaqById(id);
  if (!faq) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Edit FAQ" backHref="/admin/content/faqs" backLabel="FAQs" />

      <form
        action={updateFaq}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <input type="hidden" name="id" value={faq.id} />

        <div className="space-y-1.5">
          <Label htmlFor="question">Question</Label>
          <Input id="question" name="question" defaultValue={faq.question} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="answer">Answer</Label>
          <Textarea
            id="answer"
            name="answer"
            required
            rows={5}
            defaultValue={faq.answer}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={faq.category} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={String(faq.sortOrder)}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            defaultChecked={faq.isPublished}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="block text-sm font-bold">Published</span>
        </label>

        <Button type="submit" className="font-bold">
          Update FAQ
        </Button>
      </form>
    </div>
  );
}
