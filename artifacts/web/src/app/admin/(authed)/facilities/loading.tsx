import { CardGridSkeleton, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-72" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
