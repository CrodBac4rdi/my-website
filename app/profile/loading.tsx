export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div className="h-64 md:h-80 rounded-3xl bg-white/[.04] border border-line animate-pulse" />
      <div className="px-4 md:px-12 flex flex-col md:flex-row gap-8 -mt-20 relative z-10">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/[.06] border-4 border-bg animate-pulse shrink-0" />
        <div className="flex-1 h-48 rounded-3xl bg-white/[.04] border border-line animate-pulse" />
      </div>
      <div className="px-4 md:px-0 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[.04] border border-line animate-pulse" />
        ))}
      </div>
    </div>
  );
}
