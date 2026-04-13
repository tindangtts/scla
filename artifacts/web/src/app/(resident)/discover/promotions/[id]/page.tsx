import { notFound } from "next/navigation";
import { getPromotionById } from "@/lib/queries/discover";
import { AppSubHeader } from "@/components/layout/app-header";
import { formatDate } from "@/lib/format";
import { CalendarRange, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await getPromotionById(id);
  if (!promotion) notFound();

  return (
    <>
      <AppSubHeader title="Promotion" backHref="/discover" backLabel="Discover" />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        <article className="rounded-2xl bg-gradient-gold text-accent-foreground p-6 shadow-lg shadow-accent/20 relative overflow-hidden">
          <div aria-hidden="true" className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2 flex-wrap text-[10px] uppercase tracking-wider font-bold">
              <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm">
                {promotion.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm">
                <Store className="w-2.5 h-2.5" aria-hidden="true" />
                {promotion.partnerName}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              {promotion.title}
            </h1>
            <p className="text-sm mt-2 font-semibold flex items-center gap-1.5 opacity-90">
              <CalendarRange className="w-3.5 h-3.5" aria-hidden="true" />
              Valid {formatDate(promotion.validFrom)}
              {promotion.validUntil ? ` – ${formatDate(promotion.validUntil)}` : null}
            </p>
          </div>
        </article>

        <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm">
          <div className="prose prose-sm max-w-prose text-foreground whitespace-pre-wrap leading-relaxed">
            {promotion.description}
          </div>
        </div>
      </div>
    </>
  );
}
