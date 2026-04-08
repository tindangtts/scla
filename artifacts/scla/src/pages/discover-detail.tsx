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
        <div className="p-5 pt-14 space-y-5">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-[1.5rem]" />
        </div>
      </AppLayout>
    );
  }

  const item = announcement ?? promotion;
  if (!item) {
    return <AppLayout><div className="p-5 pt-20 text-center text-muted-foreground font-bold">Content not found</div></AppLayout>;
  }

  const isPromo = !announcement;

  return (
    <AppLayout>
      <div className="page-enter bg-white min-h-[100dvh]">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 blur-2xl rounded-full" />
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={() => setLocation("/discover")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <span className="text-[11px] font-black tracking-widest uppercase text-primary-foreground/80">
              {isPromo ? (promotion as { category: string }).category : (announcement as { type: string }).type === "newsletter" ? "Newsletter" : "Notice"}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 pb-12 -mt-4 relative z-20">
          <h1 className="text-2xl font-black text-foreground leading-tight mb-3 tracking-tight" data-testid="text-item-title">{item.title}</h1>
          
          {!isPromo && announcement && (
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">{formatDate(announcement.publishedAt)}</p>
          )}
          
          {isPromo && promotion && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 bg-accent/20 text-accent-foreground rounded-md">{promotion.partnerName}</span>
              {promotion.validUntil && (
                <span className="text-xs font-bold text-muted-foreground">Valid until {formatDate(promotion.validUntil)}</span>
              )}
            </div>
          )}
          
          {isPromo && promotion && (
            <div className="bg-accent/10 border-l-4 border-l-accent rounded-r-[1rem] p-5 mb-6">
              <p className="text-base font-medium text-foreground leading-relaxed">{promotion.description}</p>
            </div>
          )}
          
          {!isPromo && announcement && (
            <div className="prose prose-sm md:prose-base max-w-none text-foreground font-medium leading-relaxed">
              {announcement.content.split("\n").map((line, i) => (
                <p key={i} className="mb-4">{line || "\u00A0"}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
