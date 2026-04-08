import { useParams, useLocation } from "wouter";
import { useGetInfoArticle, getGetInfoArticleQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InfoArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: article, isLoading } = useGetInfoArticle(id, {
    query: { queryKey: getGetInfoArticleQueryKey(id) }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 pt-12 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return <AppLayout><div className="p-4 pt-12 text-center text-muted-foreground">Article not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/info")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <span className="text-xs text-primary-foreground/60">{article.categoryName}</span>
          </div>
        </div>
        <div className="px-4 py-5 pb-8">
          <h1 className="text-xl font-bold text-foreground leading-tight mb-1">{article.title}</h1>
          <p className="text-xs text-muted-foreground mb-5">{formatDate(article.publishedAt)}</p>
          <div className="prose prose-sm max-w-none text-foreground">
            {article.content.split("\n").map((line, i) => (
              <p key={i} className={`mb-2 leading-relaxed text-sm ${line.startsWith("# ") ? "text-xl font-bold" : line.startsWith("## ") ? "text-lg font-semibold" : line.startsWith("• ") ? "pl-3" : ""}`}>
                {line.replace(/^#+ /, "") || "\u00A0"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
