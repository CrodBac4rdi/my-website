'use client';

import { Play, Info, Sparkles, Calendar, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTrendingAnime, getImageUrl } from "@/lib/tmdb";
import { supabase } from "@/lib/supabase";

export default function Hero({ highlights = [] }: { highlights?: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchlistImage, setWatchlistImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchWatchlistCover() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('user_watchlist')
        .select(`media (cover_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const mediaObj = Array.isArray(data.media) ? data.media[0] : data.media;
        if (mediaObj?.cover_url) {
          setWatchlistImage(mediaObj.cover_url);
        }
      }
    }
    fetchWatchlistCover();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  }, [highlights.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
  }, [highlights.length]);

  // Auto-slide every 8 seconds
  useEffect(() => {
    if (highlights.length === 0) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [highlights.length, nextSlide]);

  if (!highlights || highlights.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[600px] animate-pulse">
        <div className="lg:col-span-3 lg:row-span-2 bg-white/5 rounded-[2.5rem] border border-white/10 min-h-[400px] lg:min-h-full"></div>
        <div className="bg-white/5 rounded-[2rem] border border-white/10 min-h-[200px] lg:min-h-full"></div>
        <div className="bg-white/5 rounded-[2rem] border border-white/10 min-h-[200px] lg:min-h-full"></div>
      </div>
    );
  }


  const featured = highlights[currentIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[600px]">
      
      {/* MAIN FEATURE (CAROUSEL) */}
      <div className="lg:col-span-3 lg:row-span-2 relative rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group min-h-[400px] lg:min-h-full">
        
        <AnimatePresence mode="wait">
          <motion.section 
            key={featured.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col justify-end p-8 md:p-16"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-[#020617]/20 to-transparent z-10"></div>
              <img 
                src={getImageUrl(featured.backdrop_path, 'original')} 
                alt={featured.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-20 space-y-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-2xl font-bold uppercase text-xs tracking-widest backdrop-blur-md"
              >
                <Sparkles size={16} />
                <span>Top Highlight</span>
              </motion.div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-7xl font-extrabold tracking-tighter text-white leading-none max-w-2xl drop-shadow-2xl"
              >
                {featured.name || featured.original_name}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-300 font-medium max-w-xl text-sm md:text-lg italic line-clamp-2 leading-relaxed"
              >
                {featured.overview || "Keine Beschreibung verfügbar."}
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <button 
                  onClick={() => router.push(`/media/${featured.id}`)}
                  className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-500/20"
                >
                  <Play size={24} fill="currentColor" /> Jetzt ansehen
                </button>
                <button 
                  onClick={() => router.push(`/media/${featured.id}`)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-md transition-all"
                >
                  <Info size={24} /> Details
                </button>
              </motion.div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* NAVIGATION CONTROLS */}
        <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md text-white transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2 px-2">
            {highlights.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md text-white transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* CALENDAR BLOCK */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => router.push('/calendar')}
        className="relative overflow-hidden bg-slate-900 border border-white/10 p-8 flex flex-col justify-between cursor-pointer group rounded-[2rem] hover:border-white/20 transition-all min-h-[200px] lg:min-h-full"
      >
        {/* Background Image from Highlights[1] */}
        {highlights[1]?.backdrop_path && (
          <>
            <img 
              src={`https://image.tmdb.org/t/p/w780${highlights[1].backdrop_path}`}
              alt="Release Planer Background"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700 ease-in-out"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          </>
        )}

        <div className="relative z-10 p-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
          <Calendar size={32} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold text-white tracking-tight leading-none">Release <br/> Planer</h3>
          <p className="text-blue-300 font-bold mt-2 uppercase text-[10px] tracking-widest drop-shadow-md">Wann kommen neue Folgen?</p>
        </div>
      </motion.div>

      {/* WATCHLIST BLOCK */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push('/watchlist')}
        className="relative overflow-hidden bg-slate-900 border border-white/10 p-8 flex flex-col justify-between cursor-pointer group rounded-[2rem] hover:border-white/20 transition-all min-h-[200px] lg:min-h-full"
      >
        {/* Background Image from Watchlist or Highlights[2] */}
        {(watchlistImage || highlights[2]?.backdrop_path) && (
          <>
            <img 
              src={watchlistImage ? getImageUrl(watchlistImage) : `https://image.tmdb.org/t/p/w780${highlights[2].backdrop_path}`}
              alt="Watchlist Background"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          </>
        )}

        <div className="relative z-10 p-4 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
          <Bookmark size={32} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold text-white tracking-tight leading-none">Deine <br/> Auswahl</h3>
          <p className="text-purple-300 font-bold mt-2 uppercase text-[10px] tracking-widest drop-shadow-md">Deine markierten Favoriten</p>
        </div>
      </motion.div>

    </div>
  );
}