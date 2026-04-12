import { HeroHeaderSkeleton, ListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeroHeaderSkeleton />
      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-6">
        <ListSkeleton rows={3} />
        <ListSkeleton rows={2} />
      </div>
    </>
  );
}
