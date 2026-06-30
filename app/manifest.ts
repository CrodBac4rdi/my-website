import type { MetadataRoute } from 'next';

// Next 16 File-Convention: wird unter /manifest.webmanifest ausgeliefert.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'HORIZON — Anime Tracker',
    short_name: 'HORIZON',
    description: 'Dein persönliches Logbuch für Animes, Serien und Filme.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'de',
    background_color: '#060711',
    theme_color: '#060711',
    categories: ['entertainment', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Entdecken', url: '/discover', description: 'Animes & Filme entdecken' },
      { name: 'Watchlist', url: '/watchlist', description: 'Deine Watchlist öffnen' },
      { name: 'Suche', url: '/search', description: 'Datenbank durchsuchen' },
    ],
  };
}
