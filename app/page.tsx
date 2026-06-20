import { TrendingUp, Sparkles } from "lucide-react";
import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import DiscoverFilters from "@/components/DiscoverFilters";
import { getAllProviders, getDiscoverMedia, getTrendingAnime } from "@/lib/tmdb";

export default async function LandingPage({ searchParams }: { searchParams: { genre?: string } }) {
  const genreId = searchParams.genre || undefined;

  // Fetch everything on the server
  const [trendingData, providerData, discoverData] = await Promise.all([
    getTrendingAnime(),
    getAllProviders(),
    getDiscoverMedia(1, undefined, genreId)
  ]);
  
  const trending = trendingData?.results?.slice(0, 6) || [];
  const providers = providerData?.filter((p: any) => 
    ['Netflix', 'Amazon Prime Video', 'Crunchyroll', 'Disney Plus', 'Apple TV Plus'].includes(p.provider_name)
  ) || [];
  const initialDiscover = discoverData?.results || [];

  return (
    <div className="space-y-20 pb-20 text-slate-50 min-h-screen">
      
      <Hero />

      {/* TRENDING SECTION */}
      <section className="w-full px-4 md:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Angesagt</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8 hidden md:block"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
          {trending.map((media: any, index: number) => (
            <AnimeCard key={media.id} media={media} index={index} />
          ))}
        </div>
      </section>

      {/* DISCOVER SECTION */}
      <section className="w-full px-4 md:px-8">
         <DiscoverFilters 
           initialDiscover={initialDiscover} 
           providers={providers} 
           initialGenre={genreId}
         />
      </section>

    </div>
  );
}
