import { TrendingUp } from "lucide-react";
import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import DiscoverFilters from "@/components/DiscoverFilters";
import RecommendationsRail from "@/components/RecommendationsRail";
import { getAllProviders, getDiscoverMedia, getTrendingAnime, getTrendingWeek } from "@/lib/tmdb";

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const resolvedParams = await searchParams;
  const genreId = resolvedParams.genre || undefined;

  // Fetch everything on the server
  const [trendingData, , discoverData, trendingWeek] = await Promise.all([
    getTrendingAnime(1, genreId),
    getAllProviders(),
    getDiscoverMedia(1, undefined, genreId),
    getTrendingWeek(),
  ]);

  let heroHighlights = trendingData?.results?.slice(0, 5) || [];

  // Fallback to global trending if genre filtering returns empty results
  if (heroHighlights.length === 0 && genreId) {
    const fallbackTrending = await getTrendingAnime(1);
    heroHighlights = fallbackTrending?.results?.slice(0, 5) || [];
  }

  const initialDiscover = discoverData?.results || [];

  return (
    <div className="space-y-16 md:space-y-24 pb-24 md:pb-32 pt-4 md:pt-8 text-fg min-h-screen max-w-[1800px] mx-auto">

      <Hero highlights={heroHighlights} />

      {/* PERSONALISIERT (nur eingeloggt mit Watchlist) */}
      <RecommendationsRail />

      {/* TRENDING DIESE WOCHE */}
      {trendingWeek.length > 0 && (
        <section className="w-full px-4 md:px-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <TrendingUp className="text-primary-400" size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-primary-400 uppercase tracking-[0.2em]">Diese Woche</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-fg tracking-tight leading-none">
                Trending
              </h2>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {trendingWeek.slice(0, 18).map((m: any, i: number) => (
              <div key={m.id} className="w-[150px] md:w-[168px] shrink-0">
                <AnimeCard media={m} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

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
