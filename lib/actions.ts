'use server';

import { getMediaDetails } from './tmdb';

export async function fetchTrailerKey(id: string, type: 'movie' | 'tv' = 'tv') {
  const media = await getMediaDetails(id, type);
  if (!media) return null;
  const trailer = media.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  return trailer?.key || null;
}
