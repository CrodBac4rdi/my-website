'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { getImageUrl } from '@/lib/tmdb';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function WatchlistButton({ anime }: { anime: any }) {
  const [loading, setLoading] = useState(true);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const mediaId = anime.id || anime.mal_id;

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .maybeSingle();

      if (!error && data) {
        setIsOnWatchlist(true);
      }
      setLoading(false);
    }

    checkStatus();
  }, [mediaId]);

  const handleToggle = async () => {
    setActionLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Bitte logge dich zuerst ein!");
      setActionLoading(false);
      return;
    }

    if (isOnWatchlist) {
      const { error } = await supabase
        .from('user_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaId);

      if (!error) {
        setIsOnWatchlist(false);
      } else {
        console.error("Delete error:", error);
      }
    } else {
      await supabase.from('media').upsert({
        id: mediaId,
        title: anime.name || anime.title || anime.original_name,
        type: anime.media_type || 'tv',
        cover_url: getImageUrl(anime.poster_path)
      });

      const { error } = await supabase
        .from('user_watchlist')
        .insert({
          user_id: user.id,
          media_id: mediaId,
          status: 'plan_to_watch'
        });

      if (!error) {
        setIsOnWatchlist(true);
      } else {
        console.error("Insert error:", error);
      }
    }
    
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="w-full h-14 bg-white/10 border-2 border-white animate-pulse flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={24} />
      </div>
    );
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={actionLoading}
      className={`w-full font-black py-4 px-6 border-4 border-black uppercase italic tracking-tighter transition-all duration-100 flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 ${
        isOnWatchlist 
          ? "bg-accent-pink text-white" 
          : "bg-accent-green text-black"
      }`}
    >
      {actionLoading ? (
        <Loader2 className="animate-spin" size={24} />
      ) : isOnWatchlist ? (
        <>
          <Trash2 size={24} />
          <span>VON WATCHLIST ENTFERNEN</span>
        </>
      ) : (
        <>
          <Plus size={24} />
          <span>ZUR WATCHLIST HINZUFÜGEN</span>
        </>
      )}
    </button>
  );
}