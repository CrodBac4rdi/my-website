export default function Loading() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[400px] w-full bg-slate-800/50 rounded-3xl"></div>

      {/* Grid Skeleton */}
      <section className="space-y-6">
        <div className="h-8 w-48 bg-slate-800/50 rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[2/3] w-full bg-slate-800/50 rounded-xl"></div>
              <div className="h-4 w-3/4 bg-slate-800/50 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-800/50 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}