import { notFound } from "next/navigation";
import { getAnnouncementById } from "@/lib/queries/discover";
import { AppSubHeader } from "@/components/layout/app-header";
import { formatDate } from "@/lib/format";
import { Pin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  const tags = (announcement.tags as string[] | null) ?? [];

  return (
    <>
      <AppSubHeader title="Announcement" backHref="/discover" backLabel="Discover" />

      <div className="px-5 -mt-6 pb-8 relative z-20">
        <article className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5">
          <header className="space-y-2">
            {announcement.isPinned ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-[10px] font-bold uppercase tracking-wider">
                <Pin className="w-2.5 h-2.5" aria-hidden="true" />
                Pinned
              </span>
            ) : null}
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              {announcement.title}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Published {formatDate(announcement.publishedAt)}
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

          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </div>
        </article>
      </div>
    </>
  );
}
