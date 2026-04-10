import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useGetInfoArticle, getGetInfoArticleQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronLeft, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InfoArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: article, isLoading } = useGetInfoArticle(id, {
    query: { queryKey: getGetInfoArticleQueryKey(id) }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-5 pt-14 space-y-5">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full rounded-[1.5rem]" />
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return <AppLayout><div className="p-5 pt-20 text-center text-muted-foreground font-bold">Article not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="page-enter bg-white min-h-[100dvh]">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setLocation("/info")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
                <ChevronLeft className="w-5 h-5 text-primary-foreground" />
              </button>
              <span className="text-[11px] font-black uppercase tracking-widest text-primary-foreground/80">{article.categoryName}</span>
            </div>
            <button className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              <Share2 className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-8 pb-12 -mt-4 relative z-20">
          <h1 className="text-2xl font-black text-foreground leading-tight mb-4 tracking-tight">{article.title}</h1>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md">{formatDate(article.publishedAt)}</span>
          </div>
          
          <div className="prose prose-sm md:prose-base max-w-none text-foreground font-medium leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:font-bold">
            {article.content.split("\n").map((line, i) => (
              <p key={i} className={`mb-4 ${line.startsWith("# ") ? "text-2xl font-black mt-8 mb-4 text-foreground tracking-tight" : line.startsWith("## ") ? "text-xl font-extrabold mt-6 mb-3 text-foreground tracking-tight" : line.startsWith("### ") ? "text-lg font-bold mt-5 mb-2 text-foreground" : line.startsWith("• ") ? "pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full before:absolute before:left-0 before:top-2.5" : ""}`}>
                {line.replace(/^#+ /, "").replace(/^• /, "") || "\u00A0"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
