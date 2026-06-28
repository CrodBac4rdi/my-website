'use client';

import { useEffect, useState } from "react";
import AnimeCard from "./AnimeCard";
import { Sparkles } from "lucide-react";
import { getMediaDetails } from "@/lib/tmdb";

export default function Recommendations({ animeId }: { animeId: string }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecs() {
      try {
        // Fetch recommendations from TMDB
        const data = await getMediaDetails(animeId, 'tv');
        setRecommendations(data?.recommendations?.results?.slice(0, 6) || []);
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
    <section className="space-y-8 container mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <Sparkles className="text-primary-400" size={24} />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Vorschläge</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-line to-transparent ml-8 hidden md:block"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {recommendations
          .filter((item, i, self) => self.findIndex(x => x.id === item.id) === i)
          .map((media, index) => (
            <AnimeCard key={media.id} media={media} index={index} />
          ))}
      </div>
    </section>
  );
}