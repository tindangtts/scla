import { useState } from "react";
import { useLocation } from "wouter";
import { useListAnnouncements, getListAnnouncementsQueryKey, useListPromotions, getListPromotionsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronRight, Pin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"announcements" | "offers">("announcements");

  const { data: announcements, isLoading: annLoading } = useListAnnouncements(
    {},
    { query: { queryKey: getListAnnouncementsQueryKey({}) } }
  );

  const { data: promotions, isLoading: promoLoading } = useListPromotions(
    {},
    { query: { queryKey: getListPromotionsQueryKey({}) } }
  );

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <h1 className="text-lg font-semibold text-primary-foreground mb-4">Discover</h1>
          <div className="flex gap-1 bg-primary-foreground/10 p-1 rounded-xl">
            {(["announcements", "offers"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t ? "bg-primary-foreground text-primary shadow-sm" : "text-primary-foreground/70"
                }`}
                data-testid={`tab-${t}`}
              >
                {t === "announcements" ? "Notices" : "Offers"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 pb-6 space-y-3">
          {tab === "announcements" ? (
            annLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : (announcements ?? []).map(ann => (
              <div
                key={ann.id}
                className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setLocation(`/discover/${ann.id}`)}
                data-testid={`card-announcement-${ann.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ann.isPinned && <Pin className="w-3 h-3 text-amber-600 flex-shrink-0" />}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ann.type === "newsletter" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {ann.type === "newsletter" ? "Newsletter" : "Notice"}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-foreground line-clamp-2">{ann.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(ann.publishedAt)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          ) : (
            promoLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : (promotions ?? []).map(promo => (
              <div
                key={promo.id}
                className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setLocation(`/discover/${promo.id}`)}
                data-testid={`card-promo-${promo.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-accent/15 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <span className="text-accent font-bold text-lg">%</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">{promo.category}</span>
                    <p className="font-medium text-sm text-foreground mt-1 line-clamp-1">{promo.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{promo.partnerName}</p>
                    {promo.validUntil && (
                      <p className="text-xs text-muted-foreground mt-0.5">Valid until {formatDate(promo.validUntil)}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
