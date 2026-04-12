import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/queries/info";
import { AppSubHeader } from "@/components/layout/app-header";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <>
      <AppSubHeader
        title={article.categoryName}
        backHref={`/info-centre?category=${article.categoryId}`}
        backLabel={article.categoryName}
      />

      <div className="px-5 -mt-6 pb-8 relative z-20">
        <article className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5">
          <header className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
              {article.categoryName}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              {article.title}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Published {formatDate(article.publishedAt)}
            </p>
          </header>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {article.content}
          </div>
        </article>
      </div>
    </>
  );
}
