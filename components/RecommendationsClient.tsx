'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Compass } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import { SkeletonGrid } from '@/components/Skeletons';

export default function RecommendationsClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recommendations?full=1')
      .then((r) => r.json())
      .then((d) => setItems(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1500px] mx-auto pb-24 pt-8 space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-[0.2em] text-xs">
          <Sparkles size={16} /> Für dich
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg tracking-tight">Wegen deiner Watchlist</h1>
        <p className="text-muted max-w-xl">
          Vorschläge auf Basis der Titel, die du zuletzt gemerkt hast – ganz ohne KI, rein aus den Verknüpfungen von TMDB.
        </p>
      </header>

      {loading ? (
        <SkeletonGrid count={18} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-20 bg-surface-1 border border-line-strong border-dashed rounded-3xl">
          <Sparkles size={40} className="text-faint" />
          <h2 className="font-display text-2xl font-bold text-fg">Noch keine Empfehlungen</h2>
          <p className="text-muted max-w-sm">
            Setz ein paar Titel auf deine Watchlist – daraus bauen wir dann passende Vorschläge.
          </p>
          <Link href="/discover" className="inline-flex items-center gap-2 text-primary-400 hover:underline font-semibold">
            <Compass size={16} /> Jetzt entdecken
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {items.map((m: any, i: number) => (
            <AnimeCard key={m.id} media={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
