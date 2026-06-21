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

  return (
    <div className="space-y-12 pb-20 pt-10 container mx-auto px-4 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 inline-block">
          <Bookmark className="text-blue-400" size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Deine Watchlist</h1>
        <p className="text-slate-400 font-medium max-w-xl mx-auto">
          Alle deine gemerkten Favoriten auf einen Blick. {watchlist.length} Titel gespeichert.
        </p>
      </div>

      {/* WATCHLIST GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8 pt-8">
        {watchlist.map((item, index) => (
          <AnimeCard 
            key={item.id} 
            index={index}
            media={{
              id: item.media?.id,
              title: item.media?.title,
              poster_path: item.media?.cover_url?.replace('https://image.tmdb.org/t/p/w500', ''), // Extract path
              media_type: item.media?.type,
              vote_average: item.rating || 0
            }}
          />
        ))}
      </div>

    </div>
  );
}