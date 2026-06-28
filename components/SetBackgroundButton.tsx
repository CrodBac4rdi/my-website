'use client';

import { useBackground } from "./BackgroundProvider";
import { Image as ImageIcon } from "lucide-react";

export default function SetBackgroundButton({ backdropUrl }: { backdropUrl: string }) {
  const { backgroundUrl, setBackgroundUrl } = useBackground();
  
  const isActive = backgroundUrl === backdropUrl;

  const handleToggle = () => {
    if (isActive) {
      setBackgroundUrl(null);
    } else {
      setBackgroundUrl(backdropUrl);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black uppercase tracking-widest transition-all ${
        isActive 
          ? 'bg-primary-600/20 text-primary-400 border-2 border-primary-500/50 hover:bg-danger/10 hover:text-danger hover:border-danger/30' 
          : 'bg-white/5 text-muted border-2 border-white/10 hover:bg-white hover:text-black hover:border-white shadow-[0_0_20px_rgba(255,255,255,0.0)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
      }`}
    >
      <ImageIcon size={20} />
      {isActive ? 'Als Hintergrund entfernen' : 'Hintergrund für Home nutzen'}
    </button>
  );
}
