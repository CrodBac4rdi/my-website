'use client';

import { useBackground } from "./BackgroundProvider";
import { getImageUrl } from "@/lib/tmdb";
import { CheckCircle2, Image as ImageIcon, XCircle } from "lucide-react";

export default function BackgroundGallery({ backgrounds }: { backgrounds: any[] }) {
  const { backgroundUrl, setBackgroundUrl } = useBackground();

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-elev/50 backdrop-blur-xl border border-white/10 p-4 rounded-3xl">
        <div className="flex items-center gap-3 text-muted font-medium px-2">
           <ImageIcon size={20} className="text-primary-500" />
           {backgroundUrl ? "Ein Hintergrund ist aktiv." : "Standard-Hintergrund ist aktiv."}
        </div>
        {backgroundUrl && (
          <button 
            onClick={() => setBackgroundUrl(null)}
            className="flex items-center gap-2 bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger px-4 py-2 rounded-xl font-bold transition-all"
          >
            <XCircle size={18} /> Zurücksetzen
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {backgrounds.map((anime) => {
          const url = getImageUrl(anime.backdrop_path, 'original');
          const isActive = backgroundUrl === url;

          return (
            <button
              key={anime.id}
              onClick={() => setBackgroundUrl(url)}
              className={`relative aspect-video rounded-3xl overflow-hidden group border-4 transition-all duration-300 ${
                isActive 
                  ? 'border-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-105 z-10' 
                  : 'border-white/5 hover:border-white/30 hover:scale-105'
              }`}
            >
              <img 
                src={getImageUrl(anime.backdrop_path, 'w500')} 
                alt={anime.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                 <h3 className="text-white font-bold text-sm md:text-base text-left truncate drop-shadow-md">
                   {anime.name || anime.title}
                 </h3>
              </div>
              
              {isActive && (
                <div className="absolute top-3 right-3 bg-primary-500 rounded-full p-1 shadow-lg animate-in fade-in zoom-in">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
