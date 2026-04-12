import { SubHeaderSkeleton, ListSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <SubHeaderSkeleton />
      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        <ListSkeleton rows={5} />
      </div>
    </>
  );
}
