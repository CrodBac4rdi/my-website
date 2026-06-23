const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Constants for strict Anime filtering
const ANIMATION_GENRE = '16';
const ORIGINAL_LANGUAGE = 'ja';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  // IMPORTANT: This now runs ONLY on the server.
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is missing in environment variables");
    return null;
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'de-DE',
    ...params,
  });

  try {
    const res = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
      next: { revalidate: 3600 } 
    });
    if (!res.ok) throw new Error(`TMDB API Error: ${res.status}`);
    const data = await res.json();

    // Fallback logic for missing descriptions
    if (endpoint.includes('/') && !data.results && data.id) {
       if (!data.overview) {
         const engRes = await fetch(`${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`);
         const engData = await engRes.json();
         data.overview = engData.overview;
       }
    }

    return data;
  } catch (error) {
    console.error(`TMDB Fetch Error (${endpoint}):`, error);
    return null;
  }
}

export async function getTrendingAnime(page = 1, genreId?: string) {
  const params: Record<string, string> = {
    sort_by: 'popularity.desc',
    with_original_language: ORIGINAL_LANGUAGE,
    'vote_count.gte': '10', // Reduced from 50 to get more genre-specific trending results
    page: page.toString()
  };

  if (genreId === '10749') {
    params.with_genres = ANIMATION_GENRE;
    params.with_keywords = '9840|9799'; // Romance or Romantic Comedy keywords
  } else {
    params.with_genres = genreId ? `${ANIMATION_GENRE},${genreId}` : ANIMATION_GENRE;
  }

  return fetchTMDB('/discover/tv', params);
}

export async function getAiringAnime(page = 1) {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return fetchTMDB('/discover/tv', {
    'air_date.gte': formatDate(today),
    'air_date.lte': formatDate(nextWeek),
    with_genres: ANIMATION_GENRE,
    with_original_language: ORIGINAL_LANGUAGE,
    sort_by: 'popularity.desc',
    page: page.toString()
  });
}

export async function getDiscoverMedia(page = 1, providerId?: string, genreId?: string) {
  const params: Record<string, string> = {
    page: page.toString(),
    with_original_language: ORIGINAL_LANGUAGE,
    sort_by: 'popularity.desc',
  };

  if (providerId) {
    params.with_watch_providers = providerId;
    params.watch_region = 'DE';
  }

  if (genreId === '10749') {
    params.with_genres = ANIMATION_GENRE;
    params.with_keywords = '9840|9799'; // Romance or Romantic Comedy keywords
  } else {
    params.with_genres = genreId ? `${ANIMATION_GENRE},${genreId}` : ANIMATION_GENRE;
  }

  return fetchTMDB('/discover/tv', params);
}

export async function getMediaDetails(id: string, type: 'movie' | 'tv' = 'tv') {
  return fetchTMDB(`/${type}/${id}`, {
    append_to_response: 'watch/providers,videos,images,recommendations,reviews,credits'
  });
}

export async function searchMedia(query: string) {
  return fetchTMDB('/search/multi', { query });
}

export async function getAllProviders() {
  const data = await fetchTMDB('/watch/providers/tv', { watch_region: 'DE' });
  return data?.results || [];
}

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return '/file.svg';
  // Already a full URL (z.B. gespeicherte cover_url aus der DB)
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export async function getMediaDetailWithFallback(id: string, preferredType: 'tv' | 'movie' = 'tv') {
  const data = await getMediaDetails(id, preferredType);
  if (data?.id) return { ...data, _fetchedType: preferredType };

  const fallback = preferredType === 'tv' ? 'movie' : 'tv';
  const fallbackData = await getMediaDetails(id, fallback);
  if (fallbackData?.id) return { ...fallbackData, _fetchedType: fallback };

  return null;
}
