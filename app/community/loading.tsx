import { SkeletonProfileGrid } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto pb-24 pt-8 space-y-12">
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-white/[.06] animate-pulse" />
        <div className="h-10 w-72 rounded bg-white/[.06] animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-white/[.06] animate-pulse" />
      </div>
      <div className="space-y-5">
        <div className="h-7 w-48 rounded bg-white/[.06] animate-pulse" />
        <SkeletonProfileGrid count={6} />
      </div>
      <div className="space-y-5">
        <div className="h-7 w-56 rounded bg-white/[.06] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[.04] border border-line animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
