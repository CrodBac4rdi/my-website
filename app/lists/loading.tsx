export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto pt-8 pb-20 space-y-12">
      <div className="h-10 w-56 rounded bg-white/[.06] animate-pulse" />
      <div className="h-28 w-full rounded-3xl bg-white/[.04] border border-line animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-3xl bg-white/[.04] border border-line animate-pulse" />
        ))}
      </div>
    </div>
  );
}
