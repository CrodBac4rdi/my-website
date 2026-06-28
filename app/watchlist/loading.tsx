import { SkeletonGrid } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pt-10 pb-20 space-y-10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[.06] animate-pulse" />
        <div className="h-9 w-64 rounded bg-white/[.06] animate-pulse" />
        <div className="h-4 w-40 rounded bg-white/[.06] animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-white/[.06] animate-pulse" />
        ))}
      </div>
      <SkeletonGrid count={10} />
    </div>
  );
}
