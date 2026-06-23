'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

interface DiscoverFiltersProps {
  initialDiscover: any[];
  initialGenre?: string;
}

export default function DiscoverFilters({ initialDiscover, initialGenre = "" }: DiscoverFiltersProps) {
  const [discover, setDiscover] = useState<any[]>(initialDiscover);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Deduplizieren: TMDB kann dieselbe ID mehrfach in einem Ergebnis-Array zurückgeben
    const deduped = initialDiscover.filter(
      (item, i, self) => self.findIndex(x => x.id === item.id) === i
    );
    setDiscover(deduped);
    setPage(1);
    setHasMore(true);
  }, [initialDiscover, initialGenre]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/discover?page=${nextPage}&genre=${initialGenre}`);
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setDiscover(prev => {
          const newResults = data.results.filter((newItem: any) => 
            !prev.some(existingItem => existingItem.id === newItem.id)
          );
          return [...prev, ...newResults];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, initialGenre]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 xl:gap-12 px-2">
        {discover.map((media: any, index: number) => (
          <AnimeCard key={media.id} media={media} index={index} />
        ))}
      </div>

      <div ref={observerTarget} className="flex justify-center pt-8 pb-16 h-20">
        {loading && <Loader2 className="animate-spin text-blue-500" size={40} />}
        {!loading && !hasMore && <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Keine weiteren Ergebnisse</p>}
      </div>
    </div>
  );
}
