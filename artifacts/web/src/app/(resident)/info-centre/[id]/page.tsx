import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/queries/info";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <Link
        href={`/info-centre?category=${article.categoryId}`}
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Back to {article.categoryName}
      </Link>

      <h2 className="text-xl font-bold">{article.title}</h2>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">{article.categoryName}</Badge>
        <span className="text-sm text-muted-foreground">
          {formatDate(article.publishedAt)}
        </span>
      </div>

      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {article.content}
      </div>
    </div>
  );
}
