import { HeroHeaderSkeleton, CardSkeleton, ListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeroHeaderSkeleton />
      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        <div className="grid grid-cols-2 gap-2.5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ListSkeleton rows={3} />
      </div>
    </>
  );
}
