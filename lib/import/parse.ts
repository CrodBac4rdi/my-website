import type { WatchlistStatus } from '@/lib/validation/watchlist';

export type ImportEntry = { title: string; status: WatchlistStatus };

/**
 * Normalisiert MAL-/AniList-Status-Strings auf unser Watchlist-Enum.
 * Deckt beide Schreibweisen ab (MAL: "Plan to Watch", AniList: "PLANNING").
 */
export function normalizeStatus(raw: string | null | undefined): WatchlistStatus {
  const s = (raw ?? '').trim().toUpperCase().replace(/[\s_-]/g, '');
  switch (s) {
    case 'WATCHING':
    case 'CURRENT':
    case 'CURRENTLYWATCHING':
    case 'REPEATING':
      return 'watching';
    case 'COMPLETED':
      return 'completed';
    case 'ONHOLD':
    case 'PAUSED':
      return 'on_hold';
    case 'DROPPED':
      return 'dropped';
    case 'PLANTOWATCH':
    case 'PLANNING':
    case 'PLANTOWATCHED':
      return 'plan_to_watch';
    default:
      return 'plan_to_watch';
  }
}

/** MAL-Export (XML): <myanimelist><anime><series_title>..</series_title><my_status>..</my_status>. */
export function parseMAL(xml: string): ImportEntry[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const nodes = Array.from(doc.getElementsByTagName('anime'));
  const entries: ImportEntry[] = [];
  for (const node of nodes) {
    const title =
      node.getElementsByTagName('series_title')[0]?.textContent?.trim() ||
      node.getElementsByTagName('title')[0]?.textContent?.trim() ||
      '';
    const status = node.getElementsByTagName('my_status')[0]?.textContent;
    if (title) entries.push({ title, status: normalizeStatus(status) });
  }
  return entries;
}

/**
 * AniList/Generic JSON. Unterstützt mehrere gängige Formen:
 * - [{ title, status }]
 * - { entries: [...] }
 * - AniList: { lists: [{ entries: [{ status, media: { title: { romaji|english } } }] }] }
 */
export function parseJSON(text: string): ImportEntry[] {
  const data = JSON.parse(text);
  const entries: ImportEntry[] = [];

  const pushEntry = (title: unknown, status: unknown) => {
    if (typeof title === 'string' && title.trim()) {
      entries.push({ title: title.trim(), status: normalizeStatus(status as string) });
    }
  };

  const handleAniListEntry = (e: any) => {
    const title =
      e?.media?.title?.romaji ||
      e?.media?.title?.english ||
      e?.media?.title?.native ||
      e?.title ||
      e?.name ||
      e?.series_title;
    pushEntry(title, e?.status);
  };

  if (Array.isArray(data)) {
    data.forEach(handleAniListEntry);
  } else if (Array.isArray(data?.entries)) {
    data.entries.forEach(handleAniListEntry);
  } else if (Array.isArray(data?.lists)) {
    // AniList Standard-Export: lists[].entries[]
    data.lists.forEach((l: any) => (l?.entries ?? []).forEach(handleAniListEntry));
  }

  return entries;
}

/** Dispatcher anhand Dateiname/Inhalt. Dedupliziert nach Titel. */
export function parseImportFile(filename: string, content: string): ImportEntry[] {
  const trimmed = content.trimStart();
  const isXml = filename.toLowerCase().endsWith('.xml') || trimmed.startsWith('<');
  const raw = isXml ? parseMAL(content) : parseJSON(content);

  const seen = new Set<string>();
  return raw.filter((e) => {
    const key = e.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
