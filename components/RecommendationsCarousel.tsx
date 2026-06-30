'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';

// „Wegen deiner Watchlist" — horizontales Endless-Carousel.
// Bewegt sich durch Hovern der seitlichen Zonen (oder Pfeile); nahtloser Loop
// durch verdoppelte Liste. Idle = keine Bewegung. Leer/ausgeloggt -> nichts.
export default function RecommendationsCarousel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const dir = useRef(0); // -1 links, 1 rechts, 0 idle
  const raf = useRef(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const startScroll = (d: number) => {
    if (!reduceMotion.current) dir.current = d;
  };
  const stopScroll = () => (dir.current = 0);

  useEffect(() => {
    fetch('/api/recommendations')
      .then((r) => r.json())
      .then((d) => setItems(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const wrap = (el: HTMLDivElement) => {
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft < 0) el.scrollLeft += half;
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el || items.length === 0) return;
    const step = () => {
      if (dir.current !== 0) {
        el.scrollLeft += dir.current * 7;
        wrap(el);
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [items.length]);

  const nudge = (d: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft += d;
    wrap(el);
  };

  if (loading || items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <section className="w-full space-y-6">
      <div className="flex items-end justify-between gap-3 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/30">
            <Sparkles className="text-primary-400" size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-primary-400 uppercase tracking-[0.2em]">Für dich</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg tracking-tight leading-none">
              Wegen deiner Watchlist
            </h2>
          </div>
        </div>
        <Link
          href="/recommendations"
          className="text-sm font-semibold text-primary-400 hover:underline flex items-center gap-1 shrink-0"
        >
          Alle ansehen <ArrowRight size={15} />
        </Link>
      </div>

      <div className="relative group/carousel">
        {/* Linke Hover-Zone */}
        <div
          onMouseEnter={() => startScroll(-1)}
          onMouseLeave={stopScroll}
          className="absolute left-0 top-0 bottom-4 w-14 md:w-20 z-20 flex items-center justify-start pl-2 bg-gradient-to-r from-bg via-bg/70 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <button
            onClick={() => nudge(-440)}
            aria-label="Zurück"
            className="w-9 h-9 rounded-full bg-elev/90 border border-line-strong text-fg flex items-center justify-center hover:bg-primary-600 hover:border-primary-500 transition-colors shadow-pop"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Rechte Hover-Zone */}
        <div
          onMouseEnter={() => startScroll(1)}
          onMouseLeave={stopScroll}
          className="absolute right-0 top-0 bottom-4 w-14 md:w-20 z-20 flex items-center justify-end pr-2 bg-gradient-to-l from-bg via-bg/70 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <button
            onClick={() => nudge(440)}
            aria-label="Weiter"
            className="w-9 h-9 rounded-full bg-elev/90 border border-line-strong text-fg flex items-center justify-center hover:bg-primary-600 hover:border-primary-500 transition-colors shadow-pop"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div ref={scroller} className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4">
          {loop.map((m: any, i: number) => (
            <div key={`${i}-${m.id}`} className="w-[150px] md:w-[170px] shrink-0">
              <AnimeCard media={m} index={i % items.length} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
