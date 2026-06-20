'use client';

import { useState, useEffect } from "react";
import { Globe, PlusCircle, Loader2 } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

interface DiscoverFiltersProps {
  initialDiscover: any[];
  providers: any[];
  initialGenre?: string;
}

export default function DiscoverFilters({ initialDiscover, providers, initialGenre = "" }: DiscoverFiltersProps) {
  const [discover, setDiscover] = useState<any[]>(initialDiscover);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("");

  // Keep internal state synced if the prop changes
  useEffect(() => {
    setDiscover(initialDiscover);
    setPage(1);
  }, [initialDiscover, initialGenre]);

  const handleProviderChange = async (pr: string) => {
    setLoading(true);
    setProvider(pr);
    setPage(1);
    
    try {
      const res = await fetch(`/api/discover?page=1&provider=${pr}&genre=${initialGenre}`);
      const data = await res.json();
      setDiscover(data?.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/discover?page=${nextPage}&provider=${provider}&genre=${initialGenre}`);
      const data = await res.json();
      if (data?.results) {
        setDiscover(prev => [...prev, ...data.results]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 font-semibold uppercase tracking-[0.2em] text-xs">
              Entdecken
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none">Finde deinen Anime</h2>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* PROVIDER FILTER */}
            <div className="relative flex-1 min-w-[160px]">
              <select 
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer text-slate-200"
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
    </div>
  );
}
