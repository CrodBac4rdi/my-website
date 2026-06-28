'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

function FilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [activeGenre, setActiveGenre] = useState("");

  const genres = [
    { id: "16", name: "Animation" }, 
    { id: "10759", name: "Action & Adventure" }, 
    { id: "35", name: "Comedy" },
    { id: "18", name: "Drama" }, 
    { id: "10765", name: "Sci-Fi & Fantasy" },
    { id: "10749", name: "Romance" },
  ];

  useEffect(() => {
    const genre = searchParams.get('genre');
    if (genre) {
      const found = genres.find(g => g.id === genre);
      setActiveGenre(found ? found.name : "");
    } else {
      setActiveGenre("");
    }
  }, [searchParams]);

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
        className="flex items-center gap-2 px-4 py-2 bg-elev/40 hover:bg-surface-3/60 border border-line-strong/50 rounded-xl transition-all text-sm font-bold text-muted hover:text-white"
      >
        {activeGenre ? `Genre: ${activeGenre}` : "Genres"} <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-elev/90 backdrop-blur-xl border border-line-strong/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => handleSelect("")}
              className="w-full text-left px-4 py-3 text-sm font-medium text-muted hover:bg-primary-500/10 hover:text-primary-400 transition-colors border-b border-line-strong/50"
            >
              Alle entdecken
            </button>
            {genres.map(g => (
              <button 
                key={g.id}
                onClick={() => handleSelect(g.id)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-muted hover:bg-primary-500/10 hover:text-primary-400 transition-colors"
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

export default function HeaderGenreFilter() {
  return (
    <Suspense fallback={<div className="h-9 w-24 bg-surface-3/50 rounded-xl animate-pulse"></div>}>
      <FilterContent />
    </Suspense>
  );
}
