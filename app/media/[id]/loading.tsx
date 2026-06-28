import { SkeletonText } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-16 pb-32 min-h-screen">
      <div className="h-10 w-12 rounded-2xl bg-white/[.06] animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="xl:col-span-3 space-y-6">
          <div className="aspect-[2/3] rounded-2xl bg-white/[.06] animate-pulse" />
          <div className="h-12 rounded-md bg-white/[.06] animate-pulse" />
        </div>
        <div className="xl:col-span-9 space-y-8">
          <div className="h-16 w-3/4 rounded bg-white/[.06] animate-pulse" />
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-20 rounded bg-white/[.06] animate-pulse" />
            ))}
          </div>
          <SkeletonText lines={5} />
        </div>
      </div>
    </div>
  );
}
