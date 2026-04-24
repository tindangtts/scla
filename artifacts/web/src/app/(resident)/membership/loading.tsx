import { HeroHeaderSkeleton, CardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeroHeaderSkeleton />
      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </>
  );
}
