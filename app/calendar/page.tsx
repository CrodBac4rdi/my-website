import { Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";

async function getSchedules() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/schedules", {
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return [];
  }
}

export default async function CalendarPage() {
  const schedule = await getSchedules();
  
  const days = [
    { key: "monday", color: "bg-accent-blue" },
    { key: "tuesday", color: "bg-accent-green" },
    { key: "wednesday", color: "bg-accent-yellow" },
    { key: "thursday", color: "bg-accent-pink" },
    { key: "friday", color: "bg-accent-purple" },
    { key: "saturday", color: "bg-accent-orange" },
    { key: "sunday", color: "bg-white" },
  ];
  
  return (
    <div className="space-y-12 pb-20">
      
      {/* HEADER BENTO */}
      <div className="bento-box bg-accent-yellow p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1 font-black uppercase italic text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <CalendarIcon size={18} />
            <span>SEASONAL SCHEDULE</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-black leading-none">
            RELEASES
          </h1>
          <p className="text-black font-black uppercase italic tracking-tight text-lg max-w-xl">
            Wann kommen neue Folgen? Hier ist dein unschlagbarer Wochenplan für die aktuelle Anime-Season.
          </p>
        </div>
        <div className="hidden lg:block rotate-12">
          <div className="w-48 h-48 border-8 border-black bg-white flex items-center justify-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-8xl font-black italic">!</span>
          </div>
        </div>
      </div>

      {/* DAYS GRID */}
      <div className="space-y-24">
        {days.map((day) => {
          const dayAnime = schedule.filter((a: any) => 
            a.broadcast?.day?.toLowerCase().includes(day.key) || 
            a.day?.toLowerCase() === day.key
          );
          
          if (dayAnime.length === 0) return null;

          return (
            <section key={day.key} className="space-y-10">
              <div className="flex items-center gap-6">
                <div className={`bento-box ${day.color} px-8 py-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] -rotate-1`}>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black">
                    {day.key === 'sunday' ? day.key.toUpperCase() : day.key.toUpperCase()}
                  </h2>
                </div>
                <div className="h-2 flex-1 bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {dayAnime.map((anime: any, index: number) => (
                  <div key={anime.mal_id} className="relative group">
                    <AnimeCard anime={anime} index={index} />
                    {anime.broadcast?.time && (
                      <div className="absolute -top-3 -right-3 z-30 bg-black text-white border-2 border-white px-3 py-1 font-black italic text-[10px] shadow-[4px_4px_0px_0px_rgba(0,102,255,1)] uppercase">
                        {anime.broadcast.time} JST
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* FOOTER BENTO */}
      <div className="bento-box bg-accent-blue p-12 text-center border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
        <h3 className="text-4xl font-black uppercase italic text-white mb-6 tracking-tighter">Nichts verpassen?</h3>
        <Link href="/" className="btn-brutalist bg-accent-yellow text-black text-2xl inline-flex items-center gap-4">
          ZURÜCK ZUR ÜBERSICHT <ChevronRight size={32} />
        </Link>
      </div>

    </div>
  );
}