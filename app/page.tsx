import { Sparkles } from "lucide-react";
import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import DiscoverFilters from "@/components/DiscoverFilters";
import { getAllProviders, getDiscoverMedia, getTrendingAnime } from "@/lib/tmdb";

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const resolvedParams = await searchParams;
  const genreId = resolvedParams.genre || undefined;

  // Fetch everything on the server
  const [trendingData, providerData, discoverData] = await Promise.all([
    getTrendingAnime(1, genreId),
    getAllProviders(),
    getDiscoverMedia(1, undefined, genreId)
  ]);
  
  let heroHighlights = trendingData?.results?.slice(0, 5) || [];

  // Fallback to global trending if genre filtering returns empty results
  if (heroHighlights.length === 0 && genreId) {
    const fallbackTrending = await getTrendingAnime(1);
    heroHighlights = fallbackTrending?.results?.slice(0, 5) || [];
  }

  const initialDiscover = discoverData?.results || [];

  return (
    <div className="space-y-16 md:space-y-32 pb-24 md:pb-32 pt-4 md:pt-8 text-slate-50 min-h-screen max-w-[1800px] mx-auto">
      
      <Hero highlights={heroHighlights} />



      {/* DISCOVER SECTION */}
      <section className="w-full px-4 md:px-8">
         <DiscoverFilters 
           initialDiscover={initialDiscover} 
           initialGenre={genreId}
         />
      </section>

    </div>
  );
}
