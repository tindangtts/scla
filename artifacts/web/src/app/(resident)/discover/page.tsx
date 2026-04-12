import { getAnnouncements, getNewsletters, getPromotions } from "@/lib/queries/discover";
import { Card, CardContent } from "@/components/ui/card";
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

export default async function DiscoverPage() {
  const [announcements, newsletters, promotions] = await Promise.all([
    getAnnouncements(),
    getNewsletters(),
    getPromotions(),
  ]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Discover</h2>

      {/* Announcements */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements available</p>
        ) : (
          announcements.slice(0, 5).map((item) => (
            <Link key={item.id} href={`/discover/announcements/${item.id}`}>
              <Card className="hover:bg-muted/50 transition-colors mb-2">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                    {item.isPinned && <Badge variant="secondary">Pinned</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>

      {/* Newsletters */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Newsletters</h3>
        {newsletters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No newsletters available</p>
        ) : (
          newsletters.slice(0, 5).map((item) => (
            <Link key={item.id} href={`/discover/newsletters/${item.id}`}>
              <Card className="hover:bg-muted/50 transition-colors mb-2">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>

      {/* Promotions */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Promotions</h3>
        {promotions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No promotions available</p>
        ) : (
          promotions.slice(0, 5).map((item) => (
            <Link key={item.id} href={`/discover/promotions/${item.id}`}>
              <Card className="hover:bg-muted/50 transition-colors mb-2">
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.partnerName}</span>
                      <span>-</span>
                      <span>
                        {formatDate(item.validFrom)}
                        {item.validUntil && ` - ${formatDate(item.validUntil)}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
