'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Tv, Bookmark, Star, Clock, Zap, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import AnimeCard from '@/components/AnimeCard';
import { supabase } from '@/lib/supabase';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      if (!supabase) {
        setLoading(false);
        return;
      }
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

  if (!supabase) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
           <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
           <h2 className="text-xl font-bold text-white mb-2">Auth nicht konfiguriert</h2>
           <p className="text-slate-400">Bitte füge die Supabase Umgebungsvariablen in .env.local hinzu.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <Loader2 className="animate-spin text-blue-500" size={64} />
        <p className="font-bold text-slate-400 animate-pulse tracking-widest uppercase text-sm">Synchronisiere Datenbank...</p>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-10 container mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="relative bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl">
            <Bookmark size={80} className="text-blue-500" />
          </div>
        </div>
        <div className="text-center space-y-4 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Deine Liste ist leer</h2>
          <p className="text-slate-400 font-medium text-lg">Du hast noch keine Favoriten markiert. Entdecke neue Inhalte und füge sie deiner persönlichen Watchlist hinzu.</p>
        </div>
        <Link href="/" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3">
          <Plus size={20} /> Entdecken starten
        </Link>
      </div>
    );
  }

  const totalTitles = watchlist.length;
  const avgRating = (watchlist.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalTitles || 8.5).toFixed(1);

  return (
    <div className="space-y-16 pb-20 container mx-auto px-4">
      
      {/* STATS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-blue-600 rounded-[2.5rem] p-10 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 bg-white/10 w-64 h-64 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="space-y-1 relative z-10">
             <h3 className="text-lg font-bold uppercase tracking-widest text-blue-100/70 leading-none">Tracked Titles</h3>
             <p className="text-8xl font-black text-white leading-none tracking-tighter">{totalTitles}</p>
          </div>
          <Tv size={120} className="text-white opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 relative z-10" />
        </div>
        
        <div className="grid grid-rows-2 gap-6 md:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
               <Star size={32} className="text-yellow-400 fill-yellow-400" />
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Avg Rating</p>
                 <p className="text-4xl font-extrabold text-white tracking-tight">{avgRating}</p>
               </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between group hover:border-blue-500/30 transition-colors">
               <Zap size={32} className="text-blue-400 fill-blue-400" />
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Streak</p>
                 <p className="text-4xl font-extrabold text-white tracking-tight">12 Days</p>
               </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
             <div className="flex items-center gap-6">
               <div className="p-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl">
                 <Clock size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Experience</p>
                 <p className="text-3xl font-extrabold text-white tracking-tight">LEGENDARY</p>
               </div>
             </div>
             <TrendingUp size={32} className="text-slate-800" />
          </div>
        </div>
      </div>

      {/* WATCHLIST GRID */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Deine Auswahl</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8 hidden md:block"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {watchlist.map((item, index) => (
            <AnimeCard 
              key={item.id} 
              index={index}
              media={{
                id: item.media?.id,
                title: item.media?.title,
                poster_path: item.media?.cover_url?.replace('https://image.tmdb.org/t/p/w500', ''), // Extract path
                media_type: item.media?.type,
                vote_average: item.rating || 8.5
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}