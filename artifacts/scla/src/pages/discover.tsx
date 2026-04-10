import { useState } from "react";
import { useLocation } from "wouter";
import { useListAnnouncements, getListAnnouncementsQueryKey, useListPromotions, getListPromotionsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronRight, Pin, Megaphone, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function DiscoverPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
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
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          
          <h1 className="text-2xl font-black text-primary-foreground tracking-tight mb-5 relative z-10">{t("discover.title")}</h1>
          
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md relative z-10">
            {(["announcements", "offers"] as const).map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  tab === tabKey
                    ? "bg-white text-primary shadow-md scale-[1.02]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                data-testid={`tab-${tabKey}`}
              >
                {tabKey === "announcements" ? <Megaphone className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                {tabKey === "announcements" ? t("discover.announcements") : t("discover.promotions")}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-6 pb-10 space-y-4">
          {tab === "announcements" ? (
            annLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[1.5rem]" />)}
              </div>
            ) : (announcements ?? []).map(ann => (
              <div
                key={ann.id}
                className="bg-card border border-card-border rounded-[1.5rem] p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => setLocation(`/discover/${ann.id}`)}
                data-testid={`card-announcement-${ann.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2.5">
                      {ann.isPinned && <Pin className="w-3.5 h-3.5 text-accent-foreground flex-shrink-0" />}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        ann.type === "newsletter" ? "bg-blue-500/10 text-blue-700" : "bg-accent/20 text-accent-foreground"
                      }`}>
                        {ann.type === "newsletter" ? "Newsletter" : "Notice"}
                      </span>
                    </div>
                    <p className="font-extrabold text-base text-foreground leading-snug line-clamp-2">{ann.title}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{ann.summary}</p>
                    <p className="text-[11px] font-bold text-muted-foreground/70 mt-3 uppercase tracking-wider">{formatDate(ann.publishedAt)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            promoLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-[1.5rem]" />)}
              </div>
            ) : (promotions ?? []).map(promo => (
              <div
                key={promo.id}
                className="bg-card border border-card-border rounded-[1.5rem] p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => setLocation(`/discover/${promo.id}`)}
                data-testid={`card-promo-${promo.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner">
                    <span className="text-accent-foreground font-black text-2xl">%</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-muted text-muted-foreground rounded-md mb-1.5 inline-block">{promo.category}</span>
                    <p className="font-extrabold text-base text-foreground leading-tight line-clamp-1">{promo.title}</p>
                    <p className="text-sm font-bold text-muted-foreground mt-1">{promo.partnerName}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
