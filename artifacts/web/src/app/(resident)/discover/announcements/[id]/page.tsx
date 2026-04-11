import { notFound } from "next/navigation";
import { getAnnouncementById } from "@/lib/queries/discover";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/discover"
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Back to Discover
      </Link>

      <h2 className="text-xl font-bold">{announcement.title}</h2>
      <p className="text-sm text-muted-foreground">{formatDate(announcement.publishedAt)}</p>

      {announcement.tags && (announcement.tags as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(announcement.tags as string[]).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {announcement.content}
      </div>
    </div>
  );
}
