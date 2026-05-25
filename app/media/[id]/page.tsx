import { Star, Calendar, MonitorPlay, Info, ExternalLink, PlayCircle, Clock, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import WatchlistButton from "@/components/WatchListButton";
import Recommendations from "@/components/Recommendations";
import ReviewSection from "@/components/ReviewSection";
import { searchTMDB, getTMDBDetails } from "@/lib/tmdb";

async function getAnimeDetails(id: string) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`, {
      next: { revalidate: 3600 } 
    });
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Fehler beim Laden der Details:", error);
    return null;
  }
}

export default async function MediaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const anime = await getAnimeDetails(resolvedParams.id);

  if (!anime) {
    return <div className="text-center py-20 font-black uppercase text-2xl">Anime nicht gefunden.</div>;
  }

  const tmdbSearch = await searchTMDB(anime.title_english || anime.title);
  let tmdbData = null;
  if (tmdbSearch) {
    tmdbData = await getTMDBDetails(tmdbSearch.id, tmdbSearch.media_type as 'movie' | 'tv');
  }

  const backdrop = tmdbData?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` 
    : (anime.trailer?.images?.maximum_image_url || anime.images.jpg.large_image_url);

  const providers = tmdbData?.['watch/providers']?.results?.DE;

  return (
    <div className="space-y-8 pb-20">
      
      {/* TOP NAVIGATION / BREADCRUMB */}
      <div className="flex items-center gap-4">
        <Link href="/" className="btn-brutalist bg-white text-black flex items-center gap-2">
          <ArrowLeft size={20} /> ZURÜCK
        </Link>
        <div className="flex-1 bento-box bg-black p-4 flex items-center">
          <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter truncate leading-none">
            {anime.title_english || anime.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: POSTER & QUICK ACTIONS */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bento-box overflow-hidden relative aspect-[2/3]">
            <img 
              src={anime.images.jpg.large_image_url} 
              alt={anime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-accent-yellow border-2 border-black p-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
              <Star size={16} fill="currentColor" />
              {anime.score || "N/A"}
            </div>
          </div>

          <div className="bento-box bg-accent-blue p-6 space-y-4">
             <h3 className="text-2xl font-black uppercase italic text-white">Watchlist</h3>
             <WatchlistButton anime={anime} />
          </div>

          {providers && (
            <div className="bento-box bg-accent-green p-6 space-y-6">
              <h3 className="text-2xl font-black uppercase italic text-black flex items-center gap-2">
                <Globe size={24} /> STREAMING (DE)
              </h3>
              
              {providers.flatrate ? (
                <div className="grid grid-cols-4 gap-4">
                  {providers.flatrate.map((p: any) => (
                    <div key={p.provider_id} title={p.provider_name} className="bento-box border-2 border-black p-1 hover:bg-white transition-colors">
                      <img 
                        src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
                        alt={p.provider_name} 
                        className="w-full h-full object-contain rounded-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-black uppercase italic text-sm text-black/70">Kein Flatrate-Streaming</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MAIN DETAILS */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bento-box relative overflow-hidden h-[300px]">
             <img src={backdrop} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700" alt="backdrop" />
             <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black to-transparent">
                <div className="flex flex-wrap gap-2 mb-4">
                  {anime.genres?.map((genre: any) => (
                    <span key={genre.mal_id} className="bg-accent-pink text-white px-3 py-1 border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {genre.name}
                    </span>
                  ))}
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">{anime.title_english || anime.title}</h2>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bento-box bg-white text-black p-4 flex flex-col items-center justify-center text-center">
                <Calendar size={24} className="mb-1" />
                <span className="font-black uppercase text-xs italic">Jahr</span>
                <span className="font-black text-xl">{anime.year || anime.aired?.prop?.from?.year || 'TBA'}</span>
             </div>
             <div className="bento-box bg-accent-yellow text-black p-4 flex flex-col items-center justify-center text-center">
                <MonitorPlay size={24} className="mb-1" />
                <span className="font-black uppercase text-xs italic">Typ</span>
                <span className="font-black text-xl uppercase">{anime.type}</span>
             </div>
             <div className="bento-box bg-accent-pink text-white p-4 flex flex-col items-center justify-center text-center">
                <Clock size={24} className="mb-1" />
                <span className="font-black uppercase text-xs italic">Dauer</span>
                <span className="font-black text-xl">{anime.duration.split(' ')[0]} MIN</span>
             </div>
             <div className="bento-box bg-accent-green text-black p-4 flex flex-col items-center justify-center text-center">
                <Globe size={24} className="mb-1" />
                <span className="font-black uppercase text-xs italic">Status</span>
                <span className="font-black text-lg uppercase leading-none">{anime.status?.replace('Finished Airing', 'End')}</span>
             </div>
          </div>

          <div className="bento-box bg-black p-8 space-y-4">
            <h3 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
              <Info size={32} className="text-accent-yellow" /> STORY
            </h3>
            <p className="text-slate-300 font-bold text-lg leading-relaxed uppercase italic">
              {anime.synopsis || "Keine Beschreibung verfügbar."}
            </p>
          </div>

          {anime.trailer?.youtube_id && (
            <div className="bento-box bg-black p-8 space-y-6">
              <h3 className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
                <PlayCircle size={32} className="text-accent-pink" /> TRAILER
              </h3>
              <div className="border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] aspect-video overflow-hidden">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0&rel=0`}
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-12 pt-12">
        <Recommendations animeId={resolvedParams.id} />
        <ReviewSection animeId={resolvedParams.id} />
      </div>
    </div>
  );
}