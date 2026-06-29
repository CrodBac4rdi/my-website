'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import { SkeletonGrid } from '@/components/Skeletons';

const GENRES = [
  { id: '', name: 'Alle' },
  { id: '10759', name: 'Action & Adventure' },
  { id: '35', name: 'Comedy' },
  { id: '18', name: 'Drama' },
  { id: '10765', name: 'Sci-Fi & Fantasy' },
  { id: '10749', name: 'Romance' },
  { id: '9648', name: 'Mystery' },
];

const SORTS = [
  { id: 'popularity.desc', name: 'Beliebt' },
  { id: 'vote_average.desc', name: 'Top bewertet' },
  { id: 'first_air_date.desc', name: 'Neueste' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = ['', ...Array.from({ length: 9 }, (_, i) => String(CURRENT_YEAR - i))];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition ${
        active
          ? 'bg-primary-500/15 border-primary-500 text-primary-400'
          : 'bg-white/[.06] border-line text-muted hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}

export default function DiscoverExplorer() {
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  const buildUrl = useCallback(
    (p: number) => `/api/discover?page=${p}&genre=${genre}&year=${year}&sort=${sort}`,
    [genre, year, sort]
  );

  // Reset + Neuladen bei Filterwechsel (mit stale-guard gegen Race-Conditions).
  useEffect(() => {
    const myReq = ++reqId.current;
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetch(buildUrl(1))
      .then((r) => r.json())
      .then((d) => {
        if (myReq !== reqId.current) return;
        const res = (d?.results || []).filter(
          (x: any, i: number, self: any[]) => self.findIndex((y) => y.id === x.id) === i
        );
        setItems(res);
        setHasMore(res.length > 0);
      })
      .catch(() => {})
      .finally(() => {
        if (myReq === reqId.current) setLoading(false);
      });
  }, [buildUrl]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setLoading(true);
    try {
      const d = await fetch(buildUrl(next)).then((r) => r.json());
      const res = d?.results || [];
      if (res.length > 0) {
        setItems((prev) => {
          const seen = new Set(prev.map((x: any) => x.id));
          return [...prev, ...res.filter((x: any) => !seen.has(x.id))];
        });
        setPage(next);
      } else {
        setHasMore(false);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, buildUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-8">
      {/* FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-faint uppercase tracking-wider w-16">Genre</span>
          {GENRES.map((g) => (
            <Chip key={g.id} active={genre === g.id} onClick={() => setGenre(g.id)}>{g.name}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-faint uppercase tracking-wider w-16">Jahr</span>
          {YEARS.map((y) => (
            <Chip key={y || 'all'} active={year === y} onClick={() => setYear(y)}>{y || 'Alle'}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-faint uppercase tracking-wider w-16">Sortierung</span>
          {SORTS.map((s) => (
            <Chip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>{s.name}</Chip>
          ))}
        </div>
      </div>

      {/* RESULTS */}
      {loading && items.length === 0 ? (
        <SkeletonGrid count={15} />
      ) : items.length === 0 ? (
        <p className="text-center text-faint italic py-20">Keine Titel für diese Filter gefunden.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {items.map((media: any, index: number) => (
            <AnimeCard key={media.id} media={{ ...media, media_type: 'tv' }} index={index} />
          ))}
        </div>
      )}

      <div ref={observerTarget} className="flex justify-center pt-4 pb-16 h-16">
        {loading && items.length > 0 && <Loader2 className="animate-spin text-primary-500" size={32} />}
        {!loading && !hasMore && items.length > 0 && (
          <p className="text-faint font-bold uppercase tracking-widest text-sm">Keine weiteren Ergebnisse</p>
        )}
      </div>
    </div>
  );
}
