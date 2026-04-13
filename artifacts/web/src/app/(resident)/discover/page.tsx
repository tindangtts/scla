import Link from "next/link";
import { getAnnouncements, getNewsletters, getPromotions } from "@/lib/queries/discover";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { Megaphone, Newspaper, Tag, Pin, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const [announcements, newsletters, promotions] = await Promise.all([
    getAnnouncements(),
    getNewsletters(),
    getPromotions(),
  ]);

  return (
    <>
      <AppHeader name="Discover" subtitle="News, promotions, and community updates" />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-6">
        <Section
          title="Announcements"
          icon={Megaphone}
          tint="text-primary bg-primary/10"
          empty="No announcements available"
        >
          {announcements.slice(0, 5).map((item) => (
            <ContentCard
              key={item.id}
              href={`/discover/announcements/${item.id}`}
              title={item.title}
              summary={item.summary}
              meta={formatDate(item.publishedAt)}
              pinned={item.isPinned}
            />
          ))}
        </Section>

        <Section
          title="Newsletters"
          icon={Newspaper}
          tint="text-violet-600 bg-violet-500/10"
          empty="No newsletters available"
        >
          {newsletters.slice(0, 5).map((item) => (
            <ContentCard
              key={item.id}
              href={`/discover/newsletters/${item.id}`}
              title={item.title}
              summary={item.summary}
              meta={formatDate(item.publishedAt)}
            />
          ))}
        </Section>

        <Section
          title="Promotions"
          icon={Tag}
          tint="text-amber-600 bg-amber-500/10"
          empty="No promotions available"
        >
          {promotions.slice(0, 5).map((item) => (
            <ContentCard
              key={item.id}
              href={`/discover/promotions/${item.id}`}
              title={item.title}
              summary={item.description}
              meta={`${item.partnerName} · ${formatDate(item.validFrom)}${item.validUntil ? ` – ${formatDate(item.validUntil)}` : ""}`}
            />
          ))}
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  icon: Icon,
  tint,
  empty,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tint: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.filter(Boolean).length > 0;

  return (
    <section aria-labelledby={`section-${title.toLowerCase()}`} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className={cn("p-2 rounded-xl", tint)}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <h2
          id={`section-${title.toLowerCase()}`}
          className="text-base font-bold tracking-tight"
        >
          {title}
        </h2>
      </div>
      {hasItems ? (
        <ul className="space-y-2.5">{children}</ul>
      ) : (
        <EmptyState icon={Sparkles} title={empty} />
      )}
    </section>
  );
}

function ContentCard({
  href,
  title,
  summary,
  meta,
  pinned,
}: {
  href: string;
  title: string;
  summary?: string | null;
  meta: string;
  pinned?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <p className="text-sm font-bold text-foreground truncate">{title}</p>
          {pinned ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-[10px] font-bold uppercase tracking-wider shrink-0">
              <Pin className="w-2.5 h-2.5" aria-hidden="true" />
              Pinned
            </span>
          ) : null}
        </div>
        {summary ? (
          <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-2">{summary}</p>
        ) : null}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground font-semibold">{meta}</p>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}
