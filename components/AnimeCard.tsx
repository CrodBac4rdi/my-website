'use client';

import { Star, Plus, Info, Play, Trash2, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

interface AnimeCardProps {
  anime: any;
  index: number;
}

export default function AnimeCard({ anime, index }: AnimeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);
  const [isWlLoading, setIsWlLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', anime.mal_id)
        .maybeSingle();

      if (data) setIsOnWatchlist(true);
    }
    checkStatus();
  }, [anime.mal_id]);

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsWlLoading(true);
    if (isOnWatchlist) {
      await supabase.from('user_watchlist').delete().eq('user_id', user.id).eq('media_id', anime.mal_id);
      setIsOnWatchlist(false);
    } else {
      await supabase.from('media').upsert({
        id: anime.mal_id,
        title: anime.title_english || anime.title,
        type: anime.type,
        cover_url: anime.images?.jpg?.large_image_url
      });
      await supabase.from('user_watchlist').insert({ user_id: user.id, media_id: anime.mal_id, status: 'plan_to_watch' });
      setIsOnWatchlist(true);
    }
    setIsWlLoading(false);
  };

  const handleCardClick = () => {
    router.push(`/media/${anime.mal_id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (index % 10) * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="bento-box cursor-pointer group flex flex-col h-full bg-black relative"
    >
      {/* IMAGE AREA */}
      <div className="aspect-[2/3] w-full relative overflow-hidden border-b-4 border-white">
        <img 
          src={anime.images?.jpg?.large_image_url || "/file.svg"} 
          alt={anime.title} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        
        {/* OVERLAY TAGS */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-accent-yellow text-black text-[10px] font-black px-2 py-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-tighter">
            {anime.type}
          </span>
        </div>

        {anime.score && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-white text-black text-[10px] font-black px-2 py-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
              <Star size={10} fill="currentColor" />
              {anime.score}
            </div>
          </div>
        )}

        {/* HOVER CONTENT */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent-blue/90 p-4 flex flex-col justify-between z-20"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {anime.genres?.slice(0, 2).map((g: any) => (
                    <span key={g.name} className="text-[8px] font-black text-white uppercase tracking-widest bg-black px-1.5 py-0.5 border border-white">
                      {g.name}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-white font-black uppercase leading-tight line-clamp-6 italic">
                  {anime.synopsis || "KEINE BESCHREIBUNG VERFÜGBAR."}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/media/${anime.mal_id}`); }}
                  className="flex-1 btn-brutalist bg-white text-black text-[10px] flex items-center justify-center gap-1"
                >
                  <Play size={12} fill="currentColor" /> ANSEHEN
                </button>
                <button 
                  onClick={toggleWatchlist}
                  disabled={isWlLoading}
                  className={`w-10 h-10 btn-brutalist flex items-center justify-center ${isOnWatchlist ? 'bg-accent-pink' : 'bg-accent-green'}`}
                >
                  {isWlLoading ? <Loader2 size={16} className="animate-spin" /> : isOnWatchlist ? <Trash2 size={16} /> : <Plus size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* INFO AREA */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-black group-hover:bg-accent-yellow transition-colors duration-200">
        <h3 className="font-black text-white group-hover:text-black uppercase italic leading-none text-sm line-clamp-2">
          {anime.title_english || anime.title}
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] text-white group-hover:text-black font-black uppercase tracking-widest">
            {anime.status?.replace('Finished Airing', 'END') || 'TBA'}
          </p>
          <div className="w-6 h-6 border-2 border-white group-hover:border-black flex items-center justify-center">
            <Info size={12} className="text-white group-hover:text-black" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}