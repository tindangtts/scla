import { requireAdmin } from "@/lib/auth";
import { getFaqById } from "@/lib/queries/admin-content";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { updateFaq } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const faq = await getFaqById(id);

  if (!faq) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/content/faqs" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to FAQs
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">Edit FAQ</h1>

      <form action={updateFaq} className="space-y-4">
        <input type="hidden" name="id" value={faq.id} />

        <div>
          <Label htmlFor="question">Question</Label>
          <Input id="question" name="question" defaultValue={faq.question} required />
        </div>

        <div>
          <Label htmlFor="answer">Answer</Label>
          <textarea
            id="answer"
            name="answer"
            required
            rows={4}
            defaultValue={faq.answer}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={faq.category} />
        </div>

        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={String(faq.sortOrder)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            defaultChecked={faq.isPublished}
          />
          <Label htmlFor="isPublished">Published</Label>
        </div>

        <Button type="submit">Update FAQ</Button>
      </form>
    </div>
  );
}
