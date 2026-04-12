import { requireAdmin } from "@/lib/auth";
import { getFaqs } from "@/lib/queries/admin-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteFaq } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  await requireAdmin();
  const faqs = await getFaqs();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <Link href="/admin/content/faqs/new">
          <Button size="sm">New FAQ</Button>
        </Link>
      </div>

      {faqs.length === 0 ? (
        <p className="text-muted-foreground">No FAQs yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Question</th>
                <th className="p-2">Category</th>
                <th className="p-2">Published</th>
                <th className="p-2">Sort Order</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 max-w-sm truncate">{faq.question}</td>
                  <td className="p-2">{faq.category}</td>
                  <td className="p-2">
                    {faq.isPublished ? (
                      <Badge variant="secondary" className="text-green-600">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </td>
                  <td className="p-2">{faq.sortOrder}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/content/faqs/${faq.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <form action={deleteFaq}>
                        <input type="hidden" name="id" value={faq.id} />
                        <Button type="submit" size="sm" variant="destructive">
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
