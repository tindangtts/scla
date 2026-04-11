import { getInfoCategories, getArticlesByCategory, getFaqs } from "@/lib/queries/info";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function InfoCentrePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, faqs] = await Promise.all([
    getInfoCategories(),
    getFaqs(),
  ]);

  const articles = category ? await getArticlesByCategory(category) : [];
  const selectedCategory = category
    ? categories.find((c) => c.id === category)
    : null;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Info Centre</h2>

      {category && selectedCategory ? (
        /* Articles for selected category */
        <section className="space-y-3">
          <Link
            href="/info-centre"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back to categories
          </Link>
          <h3 className="text-lg font-semibold">
            {selectedCategory.icon} {selectedCategory.name}
          </h3>

          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No articles in this category yet.
            </p>
          ) : (
            articles.map((article) => (
              <Link key={article.id} href={`/info-centre/${article.id}`}>
                <Card className="hover:bg-muted/50 transition-colors mb-2">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(article.publishedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </section>
      ) : (
        /* Category cards */
        <section className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories available.
            </p>
          ) : (
            categories.map((cat) => (
              <Link key={cat.id} href={`/info-centre?category=${cat.id}`}>
                <Card className="hover:bg-muted/50 transition-colors mb-2">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {cat.articleCount} articles
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </section>
      )}

      {/* FAQs section (shown when no category is selected) */}
      {!category && faqs.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="border rounded-lg overflow-hidden"
              >
                <summary className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-muted/50">
                  {faq.question}
                </summary>
                <div className="px-4 pb-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
