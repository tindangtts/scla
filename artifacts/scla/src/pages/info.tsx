import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListInfoCategories, getListInfoCategoriesQueryKey, useListInfoArticles, getListInfoArticlesQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronRight, FileText, Zap, Phone, Home, Dumbbell, CreditCard, HelpCircle, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, React.ElementType> = {
  "file-text": FileText, "zap": Zap, "phone": Phone, "home": Home,
  "dumbbell": Dumbbell, "credit-card": CreditCard,
};

export default function InfoPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading: catLoading } = useListInfoCategories({
    query: { queryKey: getListInfoCategoriesQueryKey() }
  });

  const { data: articles, isLoading: artLoading } = useListInfoArticles(
    selectedCategoryId ? { categoryId: selectedCategoryId } : {},
    { query: { queryKey: getListInfoArticlesQueryKey(selectedCategoryId ? { categoryId: selectedCategoryId } : {}) } }
  );

  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-black text-primary-foreground tracking-tight">{t("info.title")}</h1>
              <p className="text-primary-foreground/80 text-sm font-medium mt-1 leading-snug max-w-[280px]">Estate guidelines, contacts, and useful information.</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="px-5 py-6 pb-10 space-y-6 -mt-4 relative z-20">
          {!selectedCategoryId ? (
            <>
              <h2 className="font-extrabold text-base text-foreground tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Browse Categories
              </h2>
              {catLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[1.5rem]" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {(categories ?? []).map(cat => {
                    const Icon = ICON_MAP[cat.icon] ?? HelpCircle;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="bg-card border border-card-border rounded-[1.5rem] p-5 text-left hover:shadow-md transition-all active:scale-[0.98] shadow-sm flex flex-col"
                        data-testid={`category-${cat.id}`}
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-bold text-sm text-foreground leading-tight">{cat.name}</p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{cat.articleCount} articles</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-card-border">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="p-2 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                  data-testid="button-back-categories"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</p>
                  <p className="text-base font-extrabold text-foreground truncate">{selectedCategory?.name}</p>
                </div>
              </div>
              
              {artLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-[1.5rem]" />)}
                </div>
              ) : !articles || articles.length === 0 ? (
                <div className="bg-card border border-card-border rounded-[1.5rem] p-8 text-center shadow-sm mt-4">
                  <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-bold text-foreground">No articles yet</p>
                  <p className="text-muted-foreground font-medium text-sm mt-1">Check back later for updates.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles.map(article => (
                    <div
                      key={article.id}
                      className="bg-card border border-card-border rounded-[1.5rem] p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-4"
                      onClick={() => setLocation(`/info/${article.id}`)}
                      data-testid={`article-${article.id}`}
                    >
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground line-clamp-1 leading-snug">{article.title}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1">{article.summary}</p>
                        <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-2">{formatDate(article.publishedAt)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
