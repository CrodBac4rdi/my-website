'use client';

import { useEffect, useState } from "react";
import AnimeCard from "./AnimeCard";
import { Sparkles } from "lucide-react";

export default function Recommendations({ animeId }: { animeId: string }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecs() {
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`);
        const data = await res.json();
        setRecommendations(data.data?.slice(0, 6) || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecs();
  }, [animeId]);

  if (loading || recommendations.length === 0) return null;

  return (
    <section className="space-y-10">
      <div className="flex items-center gap-6">
        <div className="bento-box bg-accent-purple px-8 py-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rotate-1">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white flex items-center gap-4">
            <Sparkles size={48} /> NEXT UP
          </h2>
        </div>
        <div className="h-2 flex-1 bg-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {recommendations.map((rec, index) => (
          <AnimeCard 
            key={rec.entry.mal_id} 
            anime={{
              mal_id: rec.entry.mal_id,
              title: rec.entry.title,
              images: rec.entry.images,
              type: "Anime",
              score: ""
            }} 
            index={index} 
          />
        ))}
      </div>
    </section>
  );
}