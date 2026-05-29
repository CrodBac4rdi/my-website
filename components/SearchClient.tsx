'use client';

import { useState } from "react";
import { Search as SearchIcon, Loader2, Sparkles, AlertCircle } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

export default function SearchClient({ initialResults, initialQuery }: { initialResults: any[], initialQuery: string }) {
  const [results, setResults] = useState<any[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setQuery(searchInput);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchInput.trim())}`);
      const data = await res.json();
      const filtered = data?.results?.filter((item: any) => 
        (item.media_type === 'tv' || item.media_type === 'movie') && item.poster_path
      ) || [];
      setResults(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 container mx-auto px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-12">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 text-blue-400 font-bold uppercase tracking-[0.2em] text-xs">
            <SearchIcon size={16} /> Datenbank-Recherche
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter leading-none">
            {query ? `Ergebnisse für "${query}"` : "Suche"}
          </h1>
          
          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative mt-8 group">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              type="text"
              placeholder="Anime oder Film suchen..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-[2rem] py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-100 placeholder:text-slate-600 backdrop-blur-sm"
            />
          </form>
        </div>

        {query && !loading && (
          <div className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-6 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2">
            <Sparkles size={16} />
            {results.length} Ergebnisse gefunden
          </div>
        )}
      </div>

      {/* RESULTS AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="animate-spin text-blue-500" size={64} />
          <p className="font-bold text-slate-500 animate-pulse tracking-widest uppercase text-sm">Durchsuche Archiv...</p>
        </div>
      ) : results.length === 0 && query !== "" ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-slate-900/20 rounded-[3rem] border border-slate-800 border-dashed">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
             <AlertCircle size={64} className="text-slate-700" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Keine Treffer</h2>
            <p className="text-slate-500 max-w-xs mx-auto font-medium">Wir konnten leider nichts finden, was zu deiner Suche passt. Versuche es mit einem anderen Begriff.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((media: any, index: number) => (
            <AnimeCard key={media.id} media={media} index={index} />
          ))}
        </div>
      )}

      {/* NO SEARCH STATE */}
      {!query && !loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
          <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center text-blue-500">
             <SearchIcon size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Worauf hast du Lust?</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Gib oben einen Titel ein, um unsere umfangreiche TMDB-Datenbank zu durchsuchen.</p>
          </div>
        </div>
      )}
    </div>
  );
}
