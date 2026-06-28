import { Calendar as CalendarIcon, Clock, ArrowRight, Sparkles, AlertCircle, CalendarPlus } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";
import { getAiringAnime } from "@/lib/tmdb";

export default async function CalendarPage() {
  // Use TMDB's "On the Air" endpoint for actual currently airing shows
  const data = await getAiringAnime(1);
  const anime = data?.results || [];
  
  // Filter out shows that don't have a next episode or are likely completed
  // TMDB doesn't give us a "day of week" directly in the list, 
  // but we can show them as "Currently Airing this Week"
  
  return (
    <div className="space-y-16 pb-20 container mx-auto px-4">
      
      {/* HEADER DASHBOARD */}
      <div className="bg-elev/50 border border-line p-12 rounded-[3rem] backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[120px] pointer-events-none"></div>
        
        <div className="space-y-6 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 text-primary-400 px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs">
            <CalendarIcon size={18} />
            <span>Airing this Week</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-bold tracking-tight text-white leading-none">
            SCHEDULE
          </h1>
          <p className="text-muted font-medium text-lg max-w-xl italic leading-relaxed mb-6">
            Deine Übersicht für die aktuelle Woche. Hier siehst du Animes, die momentan im japanischen Fernsehen (und weltweit im Stream) ausgestrahlt werden.
          </p>
          <a 
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Anime+Simulcast+Week&details=Zeit+für+neue+Episoden!" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-bg hover:bg-elev text-white font-bold px-6 py-3 rounded-xl border border-line transition-colors shadow-lg mt-4"
          >
            <CalendarPlus size={20} className="text-primary-400" />
            In Google Kalender eintragen
          </a>
        </div>

        <div className="hidden lg:block relative group">
          <div className="w-56 h-56 bg-bg border border-line rounded-[3rem] flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-2xl relative z-10">
            <Sparkles size={80} className="text-primary-500 opacity-50" />
          </div>
          <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
        </div>
      </div>

      {/* AIRING GRID */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-elev border border-line rounded-2xl text-primary-400">
               <Clock size={24} />
             </div>
             <h2 className="font-display text-3xl font-bold text-white tracking-tight">Aktuell im Simulcast</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-line to-transparent ml-8 hidden md:block"></div>
        </div>

        {anime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {anime.map((item: any, index: number) => (
              <AnimeCard key={item.id} media={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-elev/20 rounded-3xl border border-line border-dashed">
            <AlertCircle size={48} className="text-faint mb-4" />
            <p className="text-faint font-medium italic text-lg">Keine laufenden Ausstrahlungen für diese Woche gefunden.</p>
          </div>
        )}
      </div>

      {/* INFOCARD */}
      <div className="bg-primary-600 rounded-[2.5rem] p-12 text-center relative overflow-hidden group shadow-2xl shadow-primary-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
        <div className="relative z-10 space-y-6">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight leading-none">Immer Up-to-Date</h3>
          <p className="text-blue-100/70 font-medium max-w-md mx-auto italic">Wusstest du? Du kannst Animes auf deine Watchlist setzen, um schnell auf neue Folgen zuzugreifen.</p>
          <div className="pt-4">
            <Link href="/" className="bg-white text-primary-600 hover:bg-slate-100 font-bold py-4 px-10 rounded-2xl transition-all flex items-center gap-3 mx-auto w-fit shadow-xl">
              Zurück zur Basis <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}