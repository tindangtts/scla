import { HeroHeaderSkeleton, ListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeroHeaderSkeleton />
      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <ListSkeleton rows={8} />
      </div>
    </>
  );
}
