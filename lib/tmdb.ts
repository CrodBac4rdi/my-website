const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function searchTMDB(query: string) {
  if (!TMDB_API_KEY) return null;
  
  try {
    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=de-DE`
    );
    const data = await res.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error("TMDB Search Error:", error);
    return null;
  }
}

export async function getTMDBDetails(id: number, type: 'movie' | 'tv') {
  if (!TMDB_API_KEY) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers,videos,images&language=de-DE`
    );
    return await res.json();
  } catch (error) {
    console.error("TMDB Detail Error:", error);
    return null;
  }
}

export async function getDiscoverAnime(page = 1, providerId?: string) {
  if (!TMDB_API_KEY) return null;

  let url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_keywords=210024&language=de-DE&sort_by=popularity.desc&page=${page}`;
  if (providerId) {
    url += `&with_watch_providers=${providerId}&watch_region=DE`;
  }

  try {
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error("TMDB Discover Error:", error);
    return null;
  }
}

export async function getAllProviders() {
  if (!TMDB_API_KEY) return [];
  try {
    const res = await fetch(`${BASE_URL}/watch/providers/tv?api_key=${TMDB_API_KEY}&watch_region=DE&language=de-DE`);
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}
