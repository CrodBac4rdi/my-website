'use client';

import { Play, Info, Sparkles, Zap, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [featured, setFeatured] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch("https://api.jikan.moe/v4/seasons/now?limit=1");
        const data = await res.json();
        setFeatured(data.data?.[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchHero();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[600px] animate-pulse">
        <div className="md:col-span-3 md:row-span-2 bento-box bg-slate-900 border-white/20"></div>
        <div className="bento-box bg-slate-900 border-white/20"></div>
        <div className="bento-box bg-slate-900 border-white/20"></div>
      </div>
    );
  }

  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
      
      {/* MAIN FEATURE (BENTO LARGE) */}
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:col-span-3 md:row-span-2 bento-box relative overflow-hidden flex flex-col justify-end p-8 md:p-12"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
          <img 
            src={featured.images?.jpg?.large_image_url} 
            alt={featured.title} 
            className="w-full h-full object-cover transition-all duration-700"
          />
        </div>

        <div className="relative z-20 space-y-4">
          <div className="inline-flex items-center gap-2 bg-accent-yellow text-black px-3 py-1 border-2 border-black font-black uppercase text-xs tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles size={14} />
            <span>SEASONAL HIGHLIGHT</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none max-w-2xl">
            {featured.title_english || featured.title}
          </h1>
          <p className="text-slate-300 font-bold max-w-xl text-sm md:text-lg uppercase tracking-tight line-clamp-2">
            {featured.synopsis}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => router.push(`/media/${featured.mal_id}`)}
              className="btn-brutalist btn-blue flex items-center gap-2 text-lg md:text-xl"
            >
              <Play size={24} fill="currentColor" /> JETZT ANSEHEN
            </button>
            <button 
              onClick={() => router.push(`/media/${featured.mal_id}`)}
              className="btn-brutalist bg-white text-black flex items-center gap-2 text-lg md:text-xl"
            >
              <Info size={24} /> DETAILS
            </button>
          </div>
        </div>
      </motion.section>

      {/* STATS BLOCK (BENTO SMALL) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => router.push('/calendar')}
        className="bento-box bg-accent-pink p-6 flex flex-col justify-between cursor-pointer group"
      >
        <Zap size={48} className="text-black group-hover:scale-110 transition-transform" />
        <div>
          <h3 className="text-3xl md:text-4xl font-black text-black uppercase leading-none">NEUE <br/> FOLGEN</h3>
          <p className="text-black/70 font-black mt-2 uppercase text-xs md:text-base">Check den Kalender</p>
        </div>
      </motion.div>

      {/* TRENDING BLOCK (BENTO SMALL) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push('/search?q=trending')}
        className="bento-box bg-accent-green p-6 flex flex-col justify-between cursor-pointer group"
      >
        <TrendingUp size={48} className="text-black group-hover:scale-110 transition-transform" />
        <div>
          <h3 className="text-3xl md:text-4xl font-black text-black uppercase leading-none">TOP <br/> TRENDS</h3>
          <p className="text-black/70 font-black mt-2 uppercase text-xs md:text-base">Was alle gerade lieben</p>
        </div>
      </motion.div>

    </div>
  );
}