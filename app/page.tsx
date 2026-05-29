'use client';

import { useState, useEffect } from "react";
import { Search, ChevronDown, Globe, PlusCircle, Loader2, TrendingUp, Sparkles } from "lucide-react";
import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import { getAllProviders, getDiscoverMedia, getTrendingAnime } from "@/lib/tmdb";

export default function LandingPage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [discover, setDiscover] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState("");
  const [provider, setProvider] = useState("");

  const genres = [
    { id: "16", name: "Animation" }, 
    { id: "10759", name: "Action & Adventure" }, 
    { id: "35", name: "Comedy" },
    { id: "18", name: "Drama" }, 
    { id: "10765", name: "Sci-Fi & Fantasy" },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [trendingData, providerData, discoverData] = await Promise.all([
      getTrendingAnime(),
      getAllProviders(),
      getDiscoverMedia(1)
    ]);
    
    setTrending(trendingData?.results?.slice(0, 6) || []);
    setProviders(providerData?.filter((p: any) => 
      ['Netflix', 'Amazon Prime Video', 'Crunchyroll', 'Disney Plus', 'Apple TV Plus'].includes(p.provider_name)
    ) || []);
    setDiscover(discoverData?.results || []);
    setLoading(false);
  };

  const handleFilterChange = async (g: string, pr: string) => {
    setLoading(true);
    setGenre(g);
    setProvider(pr);
    setPage(1);
    const data = await getDiscoverMedia(1, pr, g);
    setDiscover(data?.results || []);
    setLoading(false);
  };

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const data = await getDiscoverMedia(nextPage, provider, genre);
    if (data?.results) {
      setDiscover(prev => [...prev, ...data.results]);
      setPage(nextPage);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-20 pb-20 bg-[#020617] text-slate-50 min-h-screen">
      
      <Hero />

      {/* TRENDING SECTION */}
      <section className="container px-4 mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Angesagt</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8 hidden md:block"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trending.map((media: any, index: number) => (
            <AnimeCard key={media.id} media={media} index={index} />
          ))}
        </div>
      </section>

      {/* DISCOVER SECTION */}
      <section className="container px-4 mx-auto space-y-12">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 font-semibold uppercase tracking-[0.2em] text-xs">
                <Sparkles size={14} /> Entdecken
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none">Finde deinen Anime</h2>
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              {/* GENRE FILTER */}
              <div className="relative flex-1 min-w-[160px]">
                <select 
                  value={genre}
                  onChange={(e) => handleFilterChange(e.target.value, provider)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Alle Genres</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>

              {/* PROVIDER FILTER */}
              <div className="relative flex-1 min-w-[160px]">
                <select 
                  value={provider}
                  onChange={(e) => handleFilterChange(genre, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Anbieter (DE)</option>
                  {providers.map(p => (
                    <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
                  ))}
                </select>
                <Globe size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {discover.map((media: any, index: number) => (
            <AnimeCard key={media.id} media={media} index={index} />
          ))}
        </div>

        {discover.length > 0 && (
          <div className="flex justify-center pt-8">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" /> 
                  Mehr anzeigen
                </>
              )}
            </button>
          </div>
        )}
      </section>

    </div>
  );
}