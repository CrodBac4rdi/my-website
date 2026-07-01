// Zuletzt angesehene Titel (rein clientseitig, localStorage) — Grundlage für
// die "Zuletzt besucht"-Vorschläge in der Command-Palette bei leerer Suche.

export type RecentItem = {
  id: number;
  title: string;
  media_type: 'tv' | 'movie';
  poster_path: string | null;
  year: string;
};

const KEY = 'horizon-recent-media';
const MAX_ITEMS = 8;

export function getRecentMedia(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentMedia(item: RecentItem) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentMedia().filter((i) => i.id !== item.id);
    const next = [item, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage kann in seltenen Fällen (privater Modus, voll) fehlschlagen — kein Fehlerfall.
  }
}
