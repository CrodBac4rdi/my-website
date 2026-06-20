import SearchClient from "@/components/SearchClient";
import { searchMedia } from "@/lib/tmdb";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  
  // Initial server-side fetch for faster first load
  let initialResults: any[] = [];
  if (query) {
    const data = await searchMedia(query);
    initialResults = data?.results?.filter((item: any) => 
      (item.media_type === 'tv' || item.media_type === 'movie') && item.poster_path
    ) || [];
  } else {
    // If no query, fetch trending as fallback
    const { getTrendingAnime } = await import('@/lib/tmdb');
    const data = await getTrendingAnime();
    initialResults = data?.results?.filter((item: any) => item.poster_path).slice(0, 18) || [];
  }

  return (
    <SearchClient initialResults={initialResults} initialQuery={query} />
  );
}
