import { Search as SearchIcon } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";

// Holt die Daten live von der Jikan API basierend auf dem Suchbegriff
async function searchAnime(query: string) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=18`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Fehler bei der Suche:", error);
    return [];
  }
}

// Next.js 15: searchParams ist ein Promise!
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  
  // Wenn es einen Begriff gibt, such danach. Wenn nicht, leeres Array.
  const results = query ? await searchAnime(query) : [];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
            <SearchIcon className="text-blue-500" size={48} />
            {query ? `Suche: "${query}"` : "Suche"}
          </h1>
          <p className="text-slate-500 font-medium italic">Finde deine nächsten Favoriten in unserer Datenbank.</p>
        </div>
        {query && (
          <div className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl">
            {results.length} Ergebnisse
          </div>
        )}
      </div>

      {results.length === 0 && query !== "" && (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Keine Treffer</h2>
            <p className="text-slate-500 max-w-xs mx-auto">Wir konnten leider keinen Anime finden, der zu deiner Suche passt.</p>
          </div>
        </div>
      )}

      {/* Grid für die Ergebnisse */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {results.map((anime: any, index: number) => (
          <AnimeCard key={anime.mal_id} anime={anime} index={index} />
        ))}
      </div>
    </div>
  );
}