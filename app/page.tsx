import { Play, Star, Plus, Flame } from "lucide-react";
import Link from "next/link";

// Diese Funktion läuft auf dem Server und holt echte Daten
async function getTopAnime() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=8", {
      next: { revalidate: 3600 } 
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fehler beim Laden der Anime-Daten:", error);
    return [];
  }
}

export default async function LandingPage() {
  const topAnime = await getTopAnime();

  return (
    <div className="space-y-12">
      
      {/* HERO SECTION */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-900/40 to-purple-900/40 border border-slate-800 p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Tracke alles, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              was du liebst.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl">
            Dein persönliches Logbuch für Animes, Serien und Filme. Finde heraus, wo du sie streamen kannst und erhalte KI-gestützte Empfehlungen.
          </p>
          <div className="flex justify-center md:justify-start gap-4 pt-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Play size={20} /> Jetzt entdecken
            </button>
          </div>
        </div>
      </section>

      {/* TRENDING SECTION (LIVE DATEN) */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Flame className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold">Top Anime (Live von MyAnimeList)</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {topAnime.map((anime: any) => (
            <Link 
              href={`/media/${anime.mal_id}`} 
              key={anime.mal_id} 
              className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition cursor-pointer block"
            >
              
              {/* Cover Bild */}
              <div className="aspect-[2/3] w-full bg-slate-800 relative">
                <img 
                  src={anime.images.jpg.large_image_url} 
                  alt={anime.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button className="bg-blue-600 text-white p-3 rounded-full hover:scale-110 transition shadow-xl">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
              
              {/* Info Box */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {anime.type} • {anime.episodes ? `${anime.episodes} Eps` : 'Ongoing'}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                    <Star size={14} fill="currentColor" /> {anime.score || "N/A"}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-100 truncate" title={anime.title_english || anime.title}>
                  {anime.title_english || anime.title}
                </h3>
              </div>

            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}