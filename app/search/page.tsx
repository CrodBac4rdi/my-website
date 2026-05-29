import SearchClient from "@/components/SearchClient";
import { searchMedia } from "@/lib/tmdb";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  
  // Initial server-side fetch for faster first load
  const data = query ? await searchMedia(query) : null;
  const initialResults = data?.results?.filter((item: any) => 
    (item.media_type === 'tv' || item.media_type === 'movie') && item.poster_path
  ) || [];

  return (
    <SearchClient initialResults={initialResults} initialQuery={query} />
  );
}
