'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';

// „Weil du X auf der Watchlist hast" — personalisierte Rail auf der Home.
// Rendert nichts für ausgeloggte Nutzer / leere Watchlist (API liefert []).
export default function RecommendationsRail() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recommendations')
      .then((r) => r.json())
      .then((d) => setItems(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Kein Skeleton-Flash für ausgeloggte/leere Nutzer — erst rendern, wenn es etwas gibt.
  if (loading || items.length === 0) return null;

  return (
    <section className="w-full px-4 md:px-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
          <Sparkles className="text-primary-400" size={22} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-primary-400 uppercase tracking-[0.2em]">Für dich</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-fg tracking-tight leading-none">
            Weil du Anime auf deiner Watchlist hast
          </h2>
        </div>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((m: any, i: number) => (
          <div key={m.id} className="w-[150px] md:w-[168px] shrink-0">
            <AnimeCard media={m} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
