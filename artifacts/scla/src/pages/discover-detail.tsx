import { useParams, useLocation } from "wouter";
import { useGetAnnouncement, getGetAnnouncementQueryKey, useGetPromotion, getGetPromotionQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDate } from "@/lib/format";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: announcement, isLoading: annLoading } = useGetAnnouncement(id, {
    query: { queryKey: getGetAnnouncementQueryKey(id), retry: false }
  });

  const { data: promotion, isLoading: promoLoading } = useGetPromotion(id, {
    query: { queryKey: getGetPromotionQueryKey(id), retry: false }
  });

  const isLoading = annLoading || promoLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 pt-12 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const item = announcement ?? promotion;
  if (!item) {
    return <AppLayout><div className="p-4 pt-12 text-center text-muted-foreground">Content not found</div></AppLayout>;
  }

  const isPromo = !announcement;

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/discover")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <span className="text-xs text-primary-foreground/60 capitalize">
              {isPromo ? (promotion as { category: string }).category : (announcement as { type: string }).type === "newsletter" ? "Newsletter" : "Notice"}
            </span>
          </div>
        </div>

        <div className="px-4 py-5 pb-8">
          <h1 className="text-xl font-bold text-foreground leading-tight mb-2" data-testid="text-item-title">{item.title}</h1>
          {!isPromo && announcement && (
            <p className="text-xs text-muted-foreground mb-4">{formatDate(announcement.publishedAt)}</p>
          )}
          {isPromo && promotion && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">{promotion.partnerName}</span>
              {promotion.validUntil && (
                <span className="text-xs text-muted-foreground">Valid until {formatDate(promotion.validUntil)}</span>
              )}
            </div>
          )}
          {isPromo && promotion && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-foreground">{promotion.description}</p>
            </div>
          )}
          {!isPromo && announcement && (
            <div className="prose prose-sm max-w-none text-foreground">
              {announcement.content.split("\n").map((line, i) => (
                <p key={i} className="mb-2 text-sm leading-relaxed">{line || "\u00A0"}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
