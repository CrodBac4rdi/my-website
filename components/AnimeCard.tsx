'use client';

import { Star, Plus, Info, Play, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/lib/tmdb";

interface AnimeCardProps {
  media: any;
  index: number;
}

export default function AnimeCard({ media, index }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [isWlLoading, setIsWlLoading] = useState(false);
  const router = useRouter();

  // Unified ID handling: TMDB only
  const mediaId = media.id || media.mal_id;

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

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsWlLoading(true);
    try {
      if (isOnWatchlist) {
        await supabase.from('user_watchlist').delete().eq('user_id', user.id).eq('media_id', mediaId);
        setIsOnWatchlist(false);
      } else {
        await supabase.from('media').upsert({
          id: mediaId,
          title: media.name || media.title || media.original_name,
          type: media.media_type || 'tv',
          cover_url: getImageUrl(media.poster_path)
        });
        await supabase.from('user_watchlist').insert({ user_id: user.id, media_id: mediaId, status: 'plan_to_watch' });
        setIsOnWatchlist(true);
      }
    } catch (err) {
      console.error("Watchlist error:", err);
    } finally {
      setIsWlLoading(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/media/${mediaId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative cursor-pointer bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all duration-300"
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
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
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
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end z-20"
            >
              <div className="space-y-3">
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {media.overview || "Keine Beschreibung verfügbar."}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play size={14} fill="currentColor" /> DETAILS
                  </button>
                  <button 
                    onClick={toggleWatchlist}
                    disabled={isWlLoading}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                      isOnWatchlist 
                      ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {isWlLoading ? <Loader2 size={16} className="animate-spin" /> : isOnWatchlist ? <Trash2 size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* INFO AREA */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
        <h3 className="font-bold text-slate-100 text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
          {media.name || media.title || media.original_name}
        </h3>
        <div className="mt-1 flex items-center justify-between opacity-60">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {media.first_air_date?.split('-')[0] || media.release_date?.split('-')[0] || 'TBA'} • {media.media_type === 'movie' ? 'FILM' : 'TV'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}