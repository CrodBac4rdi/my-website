'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { addToWatchlistAction, removeFromWatchlistAction } from '@/lib/actions/watchlist';

export default function WatchlistButton({ anime }: { anime: any }) {
  const [loading, setLoading] = useState(true);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const submittingRef = useRef(false); // synchroner Guard gegen Doppelklick

  const mediaId = anime.id || anime.mal_id;

  useEffect(() => {
    async function checkStatus() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('user_watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .maybeSingle();

      if (!error && data) setIsOnWatchlist(true);
      setLoading(false);
    }
    checkStatus();
  }, [mediaId]);

  const handleToggle = async () => {
    if (submittingRef.current) return; // verhindert Race-Condition bei Doppelklick
    submittingRef.current = true;
    setActionLoading(true);

    try {
      if (isOnWatchlist) {
        const res = await removeFromWatchlistAction(mediaId);
        if (res.ok) {
          setIsOnWatchlist(false);
          toast.success('Von der Watchlist entfernt.');
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await addToWatchlistAction({
          mediaId,
          title: anime.name || anime.title || anime.original_name || 'Unbekannt',
          type: anime.media_type === 'movie' ? 'movie' : 'tv',
          posterPath: anime.poster_path ?? null,
        });
        if (res.ok) {
          setIsOnWatchlist(true);
          toast.success('Zur Watchlist hinzugefügt!');
        } else {
          toast.error(res.error);
        }
      }
    } finally {
      submittingRef.current = false;
      setActionLoading(false);
    }
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
      className={`w-full font-black py-4 px-6 border-4 border-black uppercase italic tracking-tighter transition-all duration-100 flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
        isOnWatchlist
          ? 'bg-accent-pink text-white'
          : 'bg-accent-green text-black'
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
