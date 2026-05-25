'use client';

import { useState, useEffect } from "react";
import { Flame, Search, Filter, ChevronDown, PlusCircle, Globe, PlayCircle, Loader2 } from "lucide-react";
import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import { getAllProviders, getDiscoverAnime } from "@/lib/tmdb";

export default function LandingPage() {
  const [topAnime, setTopAnime] = useState<any[]>([]);
  const [discoverAnime, setDiscoverAnime] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState("");
  const [provider, setProvider] = useState("");

  const genres = [
    { id: 1, name: "Action" }, { id: 2, name: "Adventure" }, { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" }, { id: 10, name: "Fantasy" }, { id: 22, name: "Romance" },
    { id: 24, name: "Sci-Fi" }, { id: 36, name: "Slice of Life" }, { id: 37, name: "Supernatural" },
  ];

  useEffect(() => {
    fetchTop();
    fetchDiscover(1, "", "");
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const data = await getAllProviders();
    // Only keep major ones for the filter to keep it clean
    const major = data.filter((p: any) => 
      ['Netflix', 'Amazon Prime Video', 'Crunchyroll', 'Disney Plus', 'Apple TV Plus', 'WOW'].includes(p.provider_name)
    );
    setProviders(major);
  };

  const fetchTop = async () => {
    try {
      const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=6");
      const data = await res.json();
      setTopAnime(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchDiscover = async (p: number, g: string, pr: string) => {
    setLoading(true);
    try {
      if (pr) {
        // Use TMDB for provider filtering
        const data = await getDiscoverAnime(p, pr);
        const formatted = data.results.map((item: any) => ({
          mal_id: item.id, // Note: This is TMDB ID, might need mapping but for now we use it
          title: item.name || item.original_name,
          images: { jpg: { large_image_url: `https://image.tmdb.org/t/p/w500${item.poster_path}` } },
          type: "TV",
          score: item.vote_average,
          synopsis: item.overview,
          status: "Live on TMDB"
        }));
        if (p === 1) setDiscoverAnime(formatted);
        else setDiscoverAnime(prev => [...prev, ...formatted]);
      } else {
        // Use Jikan for general discovery
        const genreParam = g ? `&genres=${g}` : "";
        const res = await fetch(`https://api.jikan.moe/v4/anime?page=${p}&limit=12&order_by=popularity&sort=asc${genreParam}`);
        const data = await res.json();
        if (p === 1) setDiscoverAnime(data.data || []);
        else setDiscoverAnime(prev => [...prev, ...(data.data || [])]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleGenreChange = (gId: string) => {
    setGenre(gId);
    setProvider(""); // Reset provider when genre changes to avoid conflict
    setPage(1);
    fetchDiscover(1, gId, "");
  };

  const handleProviderChange = (pId: string) => {
    setProvider(pId);
    setGenre(""); // Reset genre when provider changes
    setPage(1);
    fetchDiscover(1, "", pId);
  };

  const loadMore = () => {
    const nextP = page + 1;
    setPage(nextP);
    fetchDiscover(nextP, genre, provider);
  };

  return (
    <div className="space-y-24 pb-20">
      
      <Hero />

      {/* TRENDING SECTION */}
      <section className="space-y-10">
        <div className="flex items-center gap-6">
          <div className="bento-box bg-accent-pink px-8 py-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rotate-1">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white flex items-center gap-4">
              <Flame size={48} /> TRENDING
            </h2>
          </div>
          <div className="h-2 flex-1 bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {topAnime.map((anime: any, index: number) => (
            <AnimeCard key={anime.mal_id} anime={anime} index={index} />
          ))}
        </div>
      </section>

      {/* DISCOVER SECTION */}
      <section className="space-y-12">
        <div className="bento-box bg-black p-8 md:p-12 space-y-10 border-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-none">DISCOVER</h2>
              <p className="text-accent-blue font-black uppercase italic tracking-[0.2em] text-sm md:text-xl">Find your next obsession</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
              {/* GENRE FILTER */}
              <div className="relative">
                <select 
                  value={genre}
                  onChange={(e) => handleGenreChange(e.target.value)}
                  className="w-full btn-brutalist bg-white text-black text-sm pr-12 appearance-none cursor-pointer border-4"
                >
                  <option value="">ALLE GENRES</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
              </div>

              {/* PROVIDER FILTER */}
              <div className="relative">
                <select 
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full btn-brutalist bg-accent-yellow text-black text-sm pr-12 appearance-none cursor-pointer border-4"
                >
                  <option value="">ANBIETER (DE)</option>
                  {providers.map(p => (
                    <option key={p.provider_id} value={p.provider_id}>{p.provider_name.toUpperCase()}</option>
                  ))}
                </select>
                <Globe size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {discoverAnime.map((anime: any, index: number) => (
            <AnimeCard key={anime.mal_id} anime={anime} index={index} />
          ))}
        </div>

        {discoverAnime.length > 0 && (
          <div className="flex justify-center pt-12">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="btn-brutalist btn-green text-3xl flex items-center gap-4 py-6 px-16 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={40} />
              ) : (
                <>
                  <PlusCircle size={40} className="group-hover:rotate-90 transition-transform duration-300" /> 
                  SHOW ME MORE
                </>
              )}
            </button>
          </div>
        )}
      </section>

    </div>
  );
}