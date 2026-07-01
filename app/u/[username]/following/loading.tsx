import { SkeletonProfileGrid } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto pb-24 pt-8 space-y-8">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-white/[.06] animate-pulse" />
        <div className="h-9 w-40 rounded bg-white/[.06] animate-pulse" />
      </div>
      <SkeletonProfileGrid count={4} />
    </div>
  );
}
