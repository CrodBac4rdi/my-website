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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-line pb-12">
        <div className="space-y-4 max-w-2xl w-full">
          <div className="flex items-center gap-3 text-primary-400 font-bold uppercase tracking-[0.2em] text-xs">
            <SearchIcon size={16} /> Datenbank-Recherche
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-fg tracking-tight leading-none">
            {query ? `Ergebnisse für „${query}"` : "Suche"}
          </h1>

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative mt-8 group">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-faint group-focus-within:text-primary-500 transition-colors" size={24} />
            <input
              type="text"
              placeholder="Anime oder Film suchen..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-elev/60 border border-line rounded-xl py-5 pl-14 pr-6 text-lg text-fg placeholder:text-faint transition hover:border-line-strong focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 backdrop-blur-sm"
            />
          </form>
        </div>

        {query && !loading && (
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 px-6 py-3 rounded-md text-sm font-bold flex items-center gap-2 shrink-0">
            <Sparkles size={16} />
            {results.length} Ergebnisse gefunden
          </div>
        )}
      </div>

      {/* RESULTS AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="animate-spin text-primary-500" size={64} />
          <p className="font-bold text-faint animate-pulse tracking-widest uppercase text-sm">Durchsuche Archiv...</p>
        </div>
      ) : results.length === 0 && query !== "" ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-surface-1 rounded-2xl border border-line border-dashed">
          <div className="bg-elev border border-line p-8 rounded-xl">
             <AlertCircle size={64} className="text-faint" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-semibold text-fg tracking-tight">Keine Treffer</h2>
            <p className="text-muted max-w-xs mx-auto font-medium">Wir konnten leider nichts finden, was zu deiner Suche passt. Versuche es mit einem anderen Begriff.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!query && results.length > 0 && (
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <Sparkles className="text-primary-400" size={24} />
              </div>
              <h2 className="text-2xl font-display font-semibold tracking-tight text-fg">Angesagte Animes</h2>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results
              .filter((item, i, self) => self.findIndex(x => x.id === item.id) === i)
              .map((media: any, index: number) => (
                <AnimeCard key={media.id} media={media} index={index} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
