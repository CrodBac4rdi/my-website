'use client';

import { Star, Plus, Play, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/tmdb';
import { fetchTrailerKey } from '@/lib/actions';
import { toast } from '@/lib/toast';
import { addToWatchlistAction, removeFromWatchlistAction } from '@/lib/actions/watchlist';

const STATUS_LABELS: Record<string, string> = {
  plan_to_watch: 'Geplant',
  watching:      'Schaut gerade',
  completed:     'Abgeschlossen',
  dropped:       'Abgebrochen',
  on_hold:       'Pausiert',
};

const STATUS_COLORS: Record<string, string> = {
  plan_to_watch: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  watching:      'bg-green-500/20 text-green-300 border-green-500/30',
  completed:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  dropped:       'bg-red-500/20 text-red-300 border-red-500/30',
  on_hold:       'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

interface AnimeCardProps {
  media: any;
  index: number;
  watchlistStatus?: string;
  watchlistRating?: number;
  onStatusChange?: (status: string) => void;
  onRatingChange?: (rating: number) => void;
}

export default function AnimeCard({
  media,
  index,
  watchlistStatus,
  watchlistRating,
  onStatusChange,
  onRatingChange,
}: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [isWlLoading, setIsWlLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const wlRef = useRef(false); // Guard gegen Doppelklick auf Watchlist-Toggle
  const router = useRouter();

  const mediaId = media.id;

  useEffect(() => {
    async function checkStatus() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .maybeSingle();

      if (data) setIsOnWatchlist(true);
    }
    checkStatus();
  }, [mediaId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isHovered && !fetchAttempted && media.media_type !== 'person') {
      timeoutId = setTimeout(async () => {
        setFetchAttempted(true);
        const key = await fetchTrailerKey(mediaId, media.media_type || 'tv');
        if (key) setTrailerKey(key);
      }, 500);
    }
    return () => clearTimeout(timeoutId);
  }, [isHovered, fetchAttempted, mediaId, media.media_type]);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wlRef.current) return;
    wlRef.current = true;

    if (!supabase) { wlRef.current = false; return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      wlRef.current = false;
      return;
    }

    // Optimistisches Update: UI sofort umschalten, bei Fehler zurückrollen.
    const wasOnWatchlist = isOnWatchlist;
    setIsOnWatchlist(!wasOnWatchlist);
    setIsWlLoading(true);
    try {
      const res = wasOnWatchlist
        ? await removeFromWatchlistAction(mediaId)
        : await addToWatchlistAction({
            mediaId,
            title: media.name || media.title || media.original_name || 'Unbekannt',
            type: media.media_type === 'movie' ? 'movie' : 'tv',
            posterPath: media.poster_path ?? null,
          });

      if (res.ok) {
        toast.success(wasOnWatchlist ? 'Entfernt.' : 'Zur Watchlist hinzugefügt!');
      } else {
        setIsOnWatchlist(wasOnWatchlist); // rollback
        toast.error(res.error);
      }
    } catch (err) {
      console.error('Watchlist error:', err);
      setIsOnWatchlist(wasOnWatchlist); // rollback
      toast.error('Unbekannter Fehler.');
    } finally {
      wlRef.current = false;
      setIsWlLoading(false);
    }
  };

  const handleCardClick = () => {
    const type = media.media_type || 'tv';
    router.push(`/media/${mediaId}?type=${type}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-lg overflow-hidden border border-line bg-elev transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop"
    >
      {/* IMAGE AREA */}
      <div className="aspect-[2/3] w-full relative overflow-hidden">
        <img
          src={getImageUrl(media.poster_path)}
          alt={media.name || media.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* RATING TAG */}
        {media.vote_average > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Star size={12} className="text-gold fill-gold" />
              {media.vote_average.toFixed(1)}
            </div>
          </div>
        )}

        {/* HOVER OVERLAY */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 overflow-hidden"
            >
              {trailerKey ? (
                <div className="absolute inset-0 bg-black scale-150 pointer-events-none">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailerKey}`}
                    title="Trailer"
                    frameBorder="0"
                    allow="autoplay"
                    className="opacity-70 object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                <div className="space-y-3">
                  <p className="text-xs text-white/85 line-clamp-3 leading-relaxed">
                    {media.overview || 'Keine Beschreibung verfügbar.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleCardClick(); }}
                      className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play size={14} fill="currentColor" /> Details
                    </button>
                    <button
                      onClick={toggleWatchlist}
                      disabled={isWlLoading}
                      className={`w-9 h-9 flex items-center justify-center rounded-md border transition-all ${
                        isOnWatchlist
                          ? 'bg-danger/15 border-line text-danger hover:bg-danger/25'
                          : 'bg-white/10 border-line text-white hover:bg-white/20'
                      }`}
                    >
                      {isWlLoading
                        ? <Loader2 size={16} className="animate-spin" />
                        : isOnWatchlist
                        ? <Trash2 size={16} />
                        : <Plus size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INFO AREA */}
      <div className="p-3">
        <h3 className="font-semibold text-fg text-sm line-clamp-1 group-hover:text-primary-400 transition-colors">
          {media.name || media.title || media.original_name}
        </h3>
        <p className="mt-0.5 text-xs text-faint">
          {media.first_air_date?.split('-')[0] || media.release_date?.split('-')[0] || 'TBA'}
          {' · '}
          {media.media_type === 'movie' ? 'Film' : 'TV'}
        </p>

        {/* STATUS & RATING (nur auf Watchlist-Seite) */}
        {watchlistStatus && (
          <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
            <select
              value={watchlistStatus}
              onChange={e => onStatusChange?.(e.target.value)}
              onClick={e => e.stopPropagation()}
              className={`w-full text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-1.5 border focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer ${STATUS_COLORS[watchlistStatus] || 'bg-surface-2 border-line text-muted'}`}
            >
              <option value="plan_to_watch">Geplant</option>
              <option value="watching">Schaut gerade</option>
              <option value="completed">Abgeschlossen</option>
              <option value="dropped">Abgebrochen</option>
              <option value="on_hold">Pausiert</option>
            </select>

            {/* Rating-Bar (1-10) */}
            <div className="flex gap-0.5" title="Bewertung">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={e => { e.stopPropagation(); onRatingChange?.(n); }}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    watchlistRating && watchlistRating >= n ? 'bg-primary-500' : 'bg-white/10 hover:bg-white/25'
                  }`}
                  title={`${n}/10`}
                />
              ))}
            </div>
            {watchlistRating && (
              <p className="text-[9px] text-faint text-center">{watchlistRating}/10</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
