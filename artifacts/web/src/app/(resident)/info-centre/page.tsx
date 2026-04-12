import Link from "next/link";
import { getInfoCategories, getArticlesByCategory, getFaqs } from "@/lib/queries/info";
import { AppHeader, AppSubHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { BookOpen, ChevronRight, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InfoCentrePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, faqs] = await Promise.all([getInfoCategories(), getFaqs()]);

  const articles = category ? await getArticlesByCategory(category) : [];
  const selectedCategory = category ? categories.find((c) => c.id === category) : null;

  if (category && selectedCategory) {
    return (
      <>
        <AppSubHeader
          title={selectedCategory.name}
          backHref="/info-centre"
          backLabel="Categories"
        />
        <div className="px-5 -mt-6 pb-8 relative z-20 space-y-3">
          <div className="rounded-2xl bg-card border border-card-border p-4 shadow-sm flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {selectedCategory.icon}
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight">{selectedCategory.name}</h2>
              <p className="text-xs text-muted-foreground font-medium">
                {selectedCategory.description}
              </p>
            </div>
          </div>

          {articles.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No articles yet"
              description="We'll publish articles in this category soon."
            />
          ) : (
            <ul className="space-y-2.5">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/info-centre/${article.id}`}
                    className="block rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm font-bold text-foreground flex-1">{article.title}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground self-center shrink-0" aria-hidden="true" />
                    </div>
                    {article.summary ? (
                      <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                        {article.summary}
                      </p>
                    ) : null}
                    <p className="text-[11px] text-muted-foreground mt-2 font-semibold">
                      {formatDate(article.publishedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader name="Info Centre" subtitle="Knowledge base & FAQs" />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-6">
        {/* Categories */}
        <section aria-labelledby="categories-heading" className="space-y-3">
          <h2 id="categories-heading" className="text-base font-bold tracking-tight">
            Browse by category
          </h2>
          {categories.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No categories yet"
              description="Articles will appear here once published."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/info-centre?category=${cat.id}`}
                    className="flex flex-col items-start gap-2 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-full"
                  >
                    <span className="text-3xl" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{cat.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {cat.articleCount} article{cat.articleCount === 1 ? "" : "s"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FAQs */}
        {faqs.length > 0 ? (
          <section aria-labelledby="faqs-heading" className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 id="faqs-heading" className="text-base font-bold tracking-tight">
                Frequently asked questions
              </h2>
            </div>
            <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden divide-y divide-border">
              {faqs.map((faq) => (
                <details key={faq.id} className="group">
                  <summary className="px-4 py-3.5 text-sm font-bold cursor-pointer hover:bg-muted/60 flex items-center gap-2 marker:content-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{faq.question}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
