import { getTrendingAnime } from "@/lib/tmdb";
import BackgroundGallery from "@/components/BackgroundGallery";

export default async function BackgroundsPage() {
  const trending = await getTrendingAnime(1);
  const trendingPage2 = await getTrendingAnime(2);
  
  // Combine 40 trending animes for a good gallery size
  const results = [...(trending?.results || []), ...(trendingPage2?.results || [])]
    .filter((item: any) => item.backdrop_path);

  return (
    <div className="space-y-8 pt-12 pb-32">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
          Hintergründe
        </h1>
        <p className="text-slate-400 font-medium text-lg">
          Wähle einen Anime aus, um sein episches Backdrop als globalen Hintergrund für die gesamte App zu setzen.
        </p>
      </div>

      <BackgroundGallery backgrounds={results} />
    </div>
  );
}
