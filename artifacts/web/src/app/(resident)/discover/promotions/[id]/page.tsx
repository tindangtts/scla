import { notFound } from "next/navigation";
import { getPromotionById } from "@/lib/queries/discover";
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

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotionById(id);

  if (!promotion) {
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

      <h2 className="text-xl font-bold">{promotion.title}</h2>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{promotion.category}</Badge>
        <Badge variant="outline">{promotion.partnerName}</Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          Valid from: {formatDate(promotion.validFrom)}
          {promotion.validUntil && ` to ${formatDate(promotion.validUntil)}`}
        </p>
      </div>

      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {promotion.description}
      </div>
    </div>
  );
}
