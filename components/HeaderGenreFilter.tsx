'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function HeaderGenreFilter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const genres = [
    { id: "16", name: "Animation" }, 
    { id: "10759", name: "Action & Adventure" }, 
    { id: "35", name: "Comedy" },
    { id: "18", name: "Drama" }, 
    { id: "10765", name: "Sci-Fi & Fantasy" },
    { id: "10749", name: "Romance" },
  ];

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (id) {
      router.push(`/?genre=${id}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <div className="relative group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all text-sm font-bold text-slate-300 hover:text-white"
      >
        Genres <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => handleSelect("")}
              className="w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors border-b border-slate-700/50"
            >
              Alle entdecken
            </button>
            {genres.map(g => (
              <button 
                key={g.id}
                onClick={() => handleSelect(g.id)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
              >
                {g.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
