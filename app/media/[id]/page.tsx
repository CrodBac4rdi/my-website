import { Star, Calendar, MonitorPlay, Info, PlayCircle, Clock, Globe, ArrowLeft, Play, LayoutGrid } from "lucide-react";
import Link from "next/link";
import WatchlistButton from "@/components/WatchListButton";
import Recommendations from "@/components/Recommendations";
import ReviewSection from "@/components/ReviewSection";
import { getMediaDetails, getImageUrl } from "@/lib/tmdb";

export default async function MediaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Always use TMDB for details now
  const media = await getMediaDetails(resolvedParams.id, 'tv'); // Default to tv for anime

  if (!media) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <h2 className="text-3xl font-bold">Inhalt nicht gefunden</h2>
        <Link href="/" className="text-blue-400 hover:underline">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const backdrop = getImageUrl(media.backdrop_path, 'original');
  const providers = media['watch/providers']?.results?.DE;
  const trailer = media.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="space-y-12 pb-20 text-slate-200">
      
      {/* HEADER / NAVIGATION */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
          <h1 className="text-lg font-bold truncate leading-none text-slate-100">
            {media.name || media.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* LEFT COLUMN: POSTER & ACTIONS */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img 
              src={getImageUrl(media.poster_path, 'w500')} 
              alt={media.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              {media.vote_average?.toFixed(1) || "N/A"}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
             <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
               <LayoutGrid size={20} className="text-blue-400" /> Watchlist
             </h3>
             <WatchlistButton anime={media} />
          </div>

          {providers && (
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Globe size={20} className="text-green-400" /> Streaming (DE)
              </h3>
              
              {providers.flatrate ? (
                <div className="grid grid-cols-4 gap-3">
                  {providers.flatrate.map((p: any) => (
                    <div key={p.provider_id} title={p.provider_name} className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black hover:border-slate-600 transition-all p-1">
                      <img 
                        src={getImageUrl(p.logo_path, 'w500')} 
                        alt={p.provider_name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-medium">Aktuell kein Flatrate-Streaming verfügbar.</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MAIN DETAILS */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="relative rounded-3xl overflow-hidden h-[400px] border border-slate-800">
             <img src={backdrop} className="w-full h-full object-cover opacity-40" alt="backdrop" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent flex flex-col justify-end p-10">
                <div className="flex flex-wrap gap-2 mb-6">
                  {media.genres?.map((genre: any) => (
                    <span key={genre.id} className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 font-bold text-xs uppercase tracking-wider">
                      {genre.name}
                    </span>
                  ))}
                </div>
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-100 leading-none mb-2">
                  {media.name || media.title}
                </h2>
                <p className="text-slate-400 font-medium text-lg italic">
                  {media.tagline}
                </p>
             </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                <Calendar size={20} className="text-blue-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jahr</span>
                <span className="font-bold text-slate-100 text-lg">
                  {media.first_air_date?.split('-')[0] || media.release_date?.split('-')[0] || 'TBA'}
                </span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                <MonitorPlay size={20} className="text-purple-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                <span className="font-bold text-slate-100 text-lg uppercase">{media.status}</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                <Clock size={20} className="text-orange-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Episoden</span>
                <span className="font-bold text-slate-100 text-lg">{media.number_of_episodes || '-'}</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                <PlayCircle size={20} className="text-green-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Typ</span>
                <span className="font-bold text-slate-100 text-lg uppercase">
                  {media.type || (media.number_of_seasons ? 'TV' : 'Film')}
                </span>
             </div>
          </div>

          {/* STORY */}
          <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl space-y-6">
            <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Info size={24} className="text-blue-400" /> Story
            </h3>
            <p className="text-slate-400 font-medium text-lg leading-relaxed italic">
              {media.overview || "Keine Beschreibung verfügbar."}
            </p>
          </div>

          {/* TRAILER */}
          {trailer && (
            <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-3xl space-y-8">
              <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <PlayCircle size={24} className="text-red-400" /> Trailer
              </h3>
              <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video shadow-2xl">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                  title="Trailer" 
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