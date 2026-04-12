import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createFaq } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewFaqPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/content/faqs" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to FAQs
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">New FAQ</h1>

      <form action={createFaq} className="space-y-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Input id="question" name="question" required />
        </div>

        <div>
          <Label htmlFor="answer">Answer</Label>
          <textarea
            id="answer"
            name="answer"
            required
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue="General" />
        </div>

        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPublished" name="isPublished" defaultChecked />
          <Label htmlFor="isPublished">Published</Label>
        </div>

        <Button type="submit">Create FAQ</Button>
      </form>
    </div>
  );
}
