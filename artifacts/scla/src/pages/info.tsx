import { useState } from "react";
import { useLocation } from "wouter";
import { useListInfoCategories, getListInfoCategoriesQueryKey, useListInfoArticles, getListInfoArticlesQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronRight, FileText, Zap, Phone, Home, Dumbbell, CreditCard, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, React.ElementType> = {
  "file-text": FileText, "zap": Zap, "phone": Phone, "home": Home,
  "dumbbell": Dumbbell, "credit-card": CreditCard,
};

export default function InfoPage() {
  const [, setLocation] = useLocation();
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
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <h1 className="text-lg font-semibold text-primary-foreground">Info Centre</h1>
          <p className="text-primary-foreground/60 text-xs mt-0.5">Estate guidelines, contacts, and useful information.</p>
        </div>

        <div className="px-4 py-4 pb-6 space-y-4">
          {!selectedCategoryId ? (
            <>
              <h2 className="font-semibold text-sm text-muted-foreground">Browse by category</h2>
              {catLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(categories ?? []).map(cat => {
                    const Icon = ICON_MAP[cat.icon] ?? HelpCircle;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="bg-card border border-card-border rounded-xl p-4 text-left hover:bg-muted transition-colors"
                        data-testid={`category-${cat.id}`}
                      >
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-medium text-sm text-foreground leading-tight">{cat.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cat.articleCount} articles</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-sm text-primary font-medium"
                  data-testid="button-back-categories"
                >
                  Categories
                </button>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium text-foreground">{selectedCategory?.name}</span>
              </div>
              {artLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : !articles || articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No articles in this category yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {articles.map(article => (
                    <div
                      key={article.id}
                      className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => setLocation(`/info/${article.id}`)}
                      data-testid={`article-${article.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.summary}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(article.publishedAt)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
