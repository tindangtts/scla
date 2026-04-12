import { Skeleton, CardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-3 w-96" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
