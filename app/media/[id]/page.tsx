import { Star, Calendar, MonitorPlay, Info, PlayCircle, Clock, Globe, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import WatchlistButton from '@/components/WatchListButton';
import SetBackgroundButton from '@/components/SetBackgroundButton';
import Recommendations from '@/components/Recommendations';
import ReviewSection from '@/components/ReviewSection';
import RecordRecentView from '@/components/RecordRecentView';
import { getMediaDetailWithFallback, getImageUrl } from '@/lib/tmdb';
import type { Metadata } from 'next';

// Dynamische Share-Previews pro Anime (Title, Description, Backdrop als OG-Image).
// fetch wird innerhalb desselben Requests von Next dedupliziert → kein Doppel-Call.
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const [{ id }, { type }] = await Promise.all([params, searchParams]);
  const media = await getMediaDetailWithFallback(id, type === 'movie' ? 'movie' : 'tv');

  if (!media) return { title: 'Inhalt nicht gefunden' };

  const title: string = media.name || media.title || 'Anime';
  const description: string = (media.overview || `${title} auf HORIZON entdecken und tracken.`)
    .slice(0, 180);
  const backdrop = getImageUrl(media.backdrop_path, 'original');
  const images = backdrop.startsWith('http') ? [backdrop] : undefined;

  return {
    title,
    description,
    openGraph: {
      title: `${title} · HORIZON`,
      description,
      type: 'video.tv_show',
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function MediaDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);

  const preferredType = resolvedSearch.type === 'movie' ? 'movie' : 'tv';
  const media = await getMediaDetailWithFallback(resolvedParams.id, preferredType);

  if (!media) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <h2 className="text-3xl font-bold">Inhalt nicht gefunden</h2>
        <Link href="/" className="text-primary-400 hover:underline">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const backdrop = getImageUrl(media.backdrop_path, 'original');
  const providers = media['watch/providers']?.results?.DE;
  const trailer = media.videos?.results?.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  const cast = media.credits?.cast?.slice(0, 8);
  const nextEpisode = media.next_episode_to_air;

  return (
    <div className="space-y-16 pb-32 text-fg relative min-h-screen">

      <RecordRecentView
        item={{
          id: Number(resolvedParams.id),
          title: media.name || media.title || 'Unbekannt',
          media_type: media._fetchedType === 'movie' ? 'movie' : 'tv',
          poster_path: media.poster_path ?? null,
          year: (media.first_air_date || media.release_date || '').split('-')[0] || '',
        }}
      />

      {/* IMMERSIVE FULLSCREEN BACKGROUND */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <img
          src={backdrop}
          className="w-full h-full object-cover opacity-30 md:opacity-40"
          alt="backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060711]/10 via-[#060711]/80 to-[#060711]" />
      </div>

      {/* BACK NAVIGATION */}
      <div className="flex items-center gap-4 mb-12">
        <Link
          href="/"
          className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* LEFT COLUMN */}
        <div className="xl:col-span-3 space-y-10">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 relative group">
            <img
              src={getImageUrl(media.poster_path, 'w500')}
              alt={media.name || media.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="space-y-4">
            <WatchlistButton anime={{ ...media, media_type: media._fetchedType }} />
            <SetBackgroundButton backdropUrl={backdrop} />
          </div>

          {providers && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Globe size={16} className="text-green-400" /> Streaming (DE)
              </h3>
              {providers.flatrate ? (
                <div className="flex flex-wrap gap-3">
                  {providers.flatrate.map((p: any) => (
                    <div
                      key={p.provider_id}
                      title={p.provider_name}
                      className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 hover:scale-110 transition-transform"
                    >
                      <img
                        src={getImageUrl(p.logo_path, 'w500')}
                        alt={p.provider_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-faint">
                  Kein Flatrate-Streaming in DE verfügbar.
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-9 space-y-16 mt-4 xl:mt-0">

          {/* GENRES */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-2">
              {media.genres?.map((genre: any) => (
                <span
                  key={genre.id}
                  className="text-muted font-bold text-xs uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-white leading-none drop-shadow-2xl">
              {media.name || media.title}
            </h1>

            {nextEpisode && (
              <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-5 py-2.5 rounded-2xl text-green-400 font-bold backdrop-blur-md shadow-lg shadow-green-500/5">
                <Calendar size={18} className="animate-pulse" />
                <span>
                  Nächste Episode ({nextEpisode.episode_number}) am{' '}
                  {new Date(nextEpisode.air_date).toLocaleDateString('de-DE')}
                </span>
              </div>
            )}

            {media.tagline && (
              <p className="text-primary-400/80 font-medium text-xl md:text-2xl italic max-w-3xl leading-relaxed">
                &ldquo;{media.tagline}&rdquo;
              </p>
            )}

            {/* STATS */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white text-lg">
                  {media.vote_average?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <MonitorPlay size={20} className="text-muted" />
                <span className="font-medium text-lg">{media.status}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Calendar size={20} className="text-muted" />
                <span className="font-medium text-lg">
                  {media.first_air_date?.split('-')[0] ||
                    media.release_date?.split('-')[0] ||
                    'TBA'}
                </span>
              </div>
              {media.number_of_episodes && (
                <div className="flex items-center gap-2 text-muted">
                  <Clock size={20} className="text-muted" />
                  <span className="font-medium text-lg">{media.number_of_episodes} Eps.</span>
                </div>
              )}
              {media.runtime && (
                <div className="flex items-center gap-2 text-muted">
                  <Clock size={20} className="text-muted" />
                  <span className="font-medium text-lg">{media.runtime} Min.</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* STORY */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Info size={18} /> Handlung
              </h3>
              <p className="text-muted font-medium text-lg leading-relaxed max-w-4xl">
                {media.overview || 'Keine Beschreibung verfügbar.'}
              </p>
            </div>

            {/* TRAILER */}
            {trailer && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                  <PlayCircle size={18} /> Trailer
                </h3>
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 aspect-video bg-black/50 shadow-2xl">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* CAST */}
            {cast && cast.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                  <Users size={18} /> Besetzung
                </h3>
                <div className="flex flex-col gap-3">
                  {cast.slice(0, 5).map((person: any) => (
                    <div key={person.id} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-3 shrink-0 ring-1 ring-white/10">
                        {person.profile_path ? (
                          <img
                            src={getImageUrl(person.profile_path, 'w500')}
                            alt={person.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <Users size={20} className="text-faint m-auto h-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-base leading-tight group-hover:text-primary-400 transition-colors">
                          {person.name}
                        </p>
                        <p className="text-xs font-medium text-faint uppercase tracking-wider">
                          {person.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-16 pt-16 mt-16 border-t border-white/5">
        <Recommendations animeId={resolvedParams.id} />
        <ReviewSection
          animeId={resolvedParams.id}
          mediaTitle={media.name || media.title || 'Unbekannt'}
          mediaType={media._fetchedType}
          posterPath={media.poster_path ?? null}
        />
      </div>
    </div>
  );
}
