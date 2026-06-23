'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/tmdb';
import { toast } from '@/lib/toast';

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
      if (!supabase) { toast.error('Auth nicht konfiguriert.'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Bitte zuerst einloggen!');
        return;
      }

      if (isOnWatchlist) {
        const { error } = await supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', mediaId);

        if (error) {
          toast.error('Fehler beim Entfernen.');
          console.error('Watchlist delete error:', error);
        } else {
          setIsOnWatchlist(false);
          toast.success('Von der Watchlist entfernt.');
        }
      } else {
        // Erst Media in Cache-Tabelle sichern
        const { error: mediaError } = await supabase.from('media').upsert({
          id: mediaId,
          title: anime.name || anime.title || anime.original_name || 'Unbekannt',
          type: anime.media_type || 'tv',
          cover_url: getImageUrl(anime.poster_path),
        });

        if (mediaError) {
          toast.error('Fehler beim Hinzufügen.');
          console.error('Media upsert error:', mediaError);
          return; // kein watchlist-Insert wenn media fehlschlägt
        }

        const { error } = await supabase
          .from('user_watchlist')
          .insert({ user_id: user.id, media_id: mediaId, status: 'plan_to_watch' });

        if (error) {
          toast.error('Fehler beim Hinzufügen.');
          console.error('Watchlist insert error:', error);
        } else {
          setIsOnWatchlist(true);
          toast.success('Zur Watchlist hinzugefügt!');
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
