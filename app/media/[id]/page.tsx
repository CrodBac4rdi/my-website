import { Star, Plus, Calendar, MonitorPlay, Info } from "lucide-react";
import WatchlistButton from "@/components/WatchListButton";
// Falls das @ bei dir Fehler wirft, nutze: import WatchlistButton from "../../../components/WatchlistButton";
async function getAnimeDetails(id: string) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
      next: { revalidate: 3600 } 
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fehler beim Laden der Details:", error);
    return null;
  }
}

// FIX: params ist in Next.js 15 ein Promise, das wir erwarten (await) müssen!
export default async function MediaDetail({ params }: { params: Promise<{ id: string }> }) {
  // Wir warten, bis die URL entschlüsselt ist
  const resolvedParams = await params;
  
  // Dann laden wir die Daten
  const anime = await getAnimeDetails(resolvedParams.id);

  if (!anime) {
    return <div className="text-center py-20 text-slate-400">Anime nicht gefunden.</div>;
  }

  return (
    <div className="relative">
      
      {/* Hintergrund-Banner */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden -z-10 rounded-3xl opacity-30 mask-image-gradient">
        <img 
          src={anime.trailer?.images?.maximum_image_url || anime.images.jpg.large_image_url} 
          alt="Background" 
          className="w-full h-full object-cover blur-md scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="pt-20 md:pt-32 pb-10 flex flex-col md:flex-row gap-10">
        
        {/* Linke Spalte */}
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800 relative aspect-[2/3]">
            <img 
              src={anime.images.jpg.large_image_url} 
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <WatchlistButton anime={anime} />
        </div>

        {/* Rechte Spalte */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
              {anime.title_english || anime.title}
            </h1>
            <p className="text-xl text-slate-400 font-medium">{anime.title_japanese}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
              <Star size={16} fill="currentColor" />
              <span>{anime.score || "N/A"} Score</span>
            </div>
            <div className="flex items-center gap-2">
              <MonitorPlay size={16} className="text-slate-500" />
              <span>{anime.type} • {anime.episodes ? `${anime.episodes} Episoden` : 'Ongoing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <span>{anime.year || anime.aired?.prop?.from?.year || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-md text-xs">
              {anime.rating}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {anime.genres?.map((genre: any) => (
              <span key={genre.mal_id} className="bg-slate-800/50 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm">
                {genre.name}
              </span>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800/50 space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-lg">
              <Info size={20} className="text-blue-500" />
              <h2>Handlung</h2>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
              {anime.synopsis || "Keine Beschreibung verfügbar."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}