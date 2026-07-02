// Loading-Skeletons (Cinematic Dark Glass). Ersetzen Spinner für ruhigeres Laden.
// Reines Server/Client-neutrales Markup (nur CSS), nutzbar in loading.tsx & Komponenten.

export function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden border border-line bg-elev">
      <div className="aspect-[2/3] w-full bg-white/[.06] animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-white/[.06] animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-white/[.06] animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Horizontale Rail aus Skeleton-Karten. */
export function SkeletonRail({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-5 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[150px] shrink-0">
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-white/[.06] animate-pulse"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

/** Block für Detail-/Profil-Seiten (Header + Textzeilen). */
export function SkeletonBlock() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/2 rounded bg-white/[.06] animate-pulse" />
      <SkeletonText lines={4} />
    </div>
  );
}

/** Karte im Format von ProfileCard (Community/Follower-Listen). */
export function SkeletonProfileCard() {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-white/[.06] animate-pulse shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded bg-white/[.06] animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-white/[.06] animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-white/[.06] animate-pulse" />
      </div>
    </div>
  );
}

/** Grid aus Profil-Karten-Skeletons (Community/Follower/Following). */
export function SkeletonProfileGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProfileCard key={i} />
      ))}
    </div>
  );
}
