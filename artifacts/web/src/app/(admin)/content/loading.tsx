import { ListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <ListSkeleton rows={6} />
    </div>
  );
}
