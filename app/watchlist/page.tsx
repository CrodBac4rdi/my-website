'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Loader2, Tv, Bookmark, Star, Clock, Zap, TrendingUp } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_watchlist')
        .select(`
          id,
          status,
          rating,
          media (
            id,
            title,
            cover_url,
            type
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        setWatchlist(data);
      }
      setLoading(false);
    }
    fetchWatchlist();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <Loader2 className="animate-spin text-accent-blue" size={64} />
        <p className="font-black uppercase italic text-2xl animate-pulse">SYNCHRONISIERE DATENBANK...</p>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-10">
        <div className="bento-box bg-accent-pink p-12 rotate-3 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] border-black">
          <Bookmark size={80} className="text-black" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">ZONE NULL</h2>
          <p className="text-slate-400 font-bold uppercase max-w-md mx-auto text-xl italic leading-none">Dein Arsenal ist noch leer. Starte die Rekrutierung.</p>
        </div>
        <Link href="/" className="btn-brutalist btn-blue text-3xl px-12 py-6">
          ZURÜCK ZUR BASIS
        </Link>
      </div>
    );
  }

  // Calculate some fake/real stats for the "Experience"
  const totalEpisodes = watchlist.length * 12; // Approximation
  const totalHours = Math.round((totalEpisodes * 24) / 60);

  return (
    <div className="space-y-16 pb-20">
      
      {/* STATS DASHBOARD BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto">
        <div className="md:col-span-2 bento-box bg-accent-blue p-8 flex items-center justify-between group border-white">
          <div className="space-y-1">
             <h3 className="text-2xl font-black uppercase italic text-white/70 tracking-tighter leading-none">TRACKED <br/> TITLES</h3>
             <p className="text-8xl font-black text-white leading-none tracking-tighter">{watchlist.length}</p>
          </div>
          <Tv size={100} className="text-white opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
        </div>
        
        <div className="grid grid-rows-2 gap-4 md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="bento-box bg-accent-yellow p-6 flex flex-col justify-between border-black">
               <Star size={32} className="text-black" />
               <div>
                 <p className="text-[10px] font-black uppercase text-black/60">AVG RATING</p>
                 <p className="text-4xl font-black text-black italic">8.9</p>
               </div>
            </div>
            <div className="bento-box bg-accent-green p-6 flex flex-col justify-between border-black">
               <Zap size={32} className="text-black" />
               <div>
                 <p className="text-[10px] font-black uppercase text-black/60">STREAK</p>
                 <p className="text-4xl font-black text-black italic">12 DAYS</p>
               </div>
            </div>
          </div>
          <div className="bento-box bg-white p-6 flex items-center justify-between border-black">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-black text-white">
                 <Clock size={24} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase text-black/60 tracking-widest">ESTIMATED WATCHTIME</p>
                 <p className="text-3xl font-black text-black italic uppercase">{totalHours} STUNDEN</p>
               </div>
             </div>
             <TrendingUp size={32} className="text-black opacity-20" />
          </div>
        </div>
      </div>

      {/* WATCHLIST GRID */}
      <div className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="bento-box bg-white px-8 py-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] -rotate-1">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black leading-none">YOUR SQUAD</h2>
          </div>
          <div className="h-2 flex-1 bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {watchlist.map((item, index) => (
            <AnimeCard 
              key={item.id} 
              index={index}
              anime={{
                mal_id: item.media?.id,
                title: item.media?.title,
                images: { jpg: { large_image_url: item.media?.cover_url } },
                type: item.media?.type,
                score: item.rating || "8.5"
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}