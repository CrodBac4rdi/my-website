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
    return <div className="w-full h-12 rounded-md bg-surface-2 animate-pulse" />;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={actionLoading}
      className={`w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md text-sm font-semibold transition active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 disabled:opacity-50 disabled:pointer-events-none ${
        isOnWatchlist
          ? 'bg-danger/12 text-danger border border-line hover:bg-danger/20'
          : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow'
      }`}
    >
      {actionLoading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : isOnWatchlist ? (
        <>
          <Trash2 size={18} />
          <span>Von Watchlist entfernen</span>
        </>
      ) : (
        <>
          <Plus size={18} />
          <span>Zur Watchlist hinzufügen</span>
        </>
      )}
    </button>
  );
}
