import { notFound } from "next/navigation";
import { getNewsletterById } from "@/lib/queries/discover";
import { AppSubHeader } from "@/components/layout/app-header";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewsletterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const newsletter = await getNewsletterById(id);
  if (!newsletter) notFound();

  const tags = (newsletter.tags as string[] | null) ?? [];

  return (
    <>
      <AppSubHeader title="Newsletter" backHref="/discover" backLabel="Discover" />

      <div className="px-5 -mt-6 pb-8 relative z-20">
        <article className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5">
          <header className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              {newsletter.title}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Published {formatDate(newsletter.publishedAt)}
            </p>
          </header>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="prose prose-sm max-w-prose text-foreground whitespace-pre-wrap leading-relaxed">
            {newsletter.content}
          </div>
        </article>
      </div>
    </>
  );
}
