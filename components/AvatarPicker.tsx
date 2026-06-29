'use client';

import { useState, useEffect } from 'react';
import { Check, ImagePlus, RefreshCw, Loader2 } from 'lucide-react';

// Avatar-Quellen: SFW-Anime-Bilder von nekos.best (nach Kategorie) + generierte
// Avatare (DiceBear) als zusätzliche Kategorie.
type Category = { key: string; label: string; kind: 'nekos' | 'dicebear' };

const CATEGORIES: Category[] = [
  { key: 'neko', label: 'Neko', kind: 'nekos' },
  { key: 'waifu', label: 'Waifu', kind: 'nekos' },
  { key: 'husbando', label: 'Husbando', kind: 'nekos' },
  { key: 'kitsune', label: 'Kitsune', kind: 'nekos' },
  { key: 'dicebear', label: 'Generiert', kind: 'dicebear' },
];

const DICEBEAR_STYLES = ['adventurer', 'fun-emoji', 'bottts', 'lorelei', 'notionists', 'thumbs'];
const DICEBEAR_SEEDS = ['Sora', 'Yuki', 'Kai', 'Hana', 'Rei', 'Aki', 'Mika', 'Taro', 'Luna', 'Zen', 'Emi', 'Riku'];

function dicebearOptions(): string[] {
  return DICEBEAR_SEEDS.map(
    (seed, i) =>
      `https://api.dicebear.com/9.x/${DICEBEAR_STYLES[i % DICEBEAR_STYLES.length]}/svg?seed=${encodeURIComponent(seed)}`
  );
}

async function fetchNekos(category: string): Promise<string[]> {
  const res = await fetch(`https://nekos.best/api/v2/${category}?amount=20`);
  if (!res.ok) throw new Error('nekos.best error');
  const data = await res.json();
  return (data.results || []).map((r: any) => r.url).filter(Boolean);
}

export default function AvatarPicker({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Category>(CATEGORIES[0]);
  const [cache, setCache] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (cat: Category, force = false) => {
    if (cat.kind === 'dicebear') {
      setCache((c) => ({ ...c, dicebear: dicebearOptions() }));
      return;
    }
    if (!force && cache[cat.key]?.length) return;
    setLoading(true);
    setError('');
    try {
      const urls = await fetchNekos(cat.key);
      setCache((c) => ({ ...c, [cat.key]: urls }));
    } catch {
      setError('Konnte Avatare nicht laden. Versuch es erneut.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const options = cache[active.key] || [];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold bg-white/[.06] hover:bg-white/[.1] border border-line text-fg transition"
      >
        <ImagePlus size={16} /> {open ? 'Auswahl schließen' : 'Profilbild wählen'}
      </button>

      {open && (
        <div className="p-4 glass rounded-xl space-y-4">
          {/* Kategorie-Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition ${
                  active.key === cat.key
                    ? 'bg-primary-500/15 border-primary-500 text-primary-400'
                    : 'bg-white/[.06] border-line text-muted hover:text-fg'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {active.kind === 'nekos' && (
              <button
                type="button"
                onClick={() => load(active, true)}
                className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-400 hover:text-primary-300 transition"
              >
                <RefreshCw size={14} /> Neue laden
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary-500" size={24} />
            </div>
          ) : error ? (
            <p className="text-center text-danger text-sm py-6">{error}</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-72 overflow-y-auto scrollbar-hide">
              {options.map((url) => {
                const activeSel = value === url;
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => onSelect(url)}
                    className={`relative aspect-square rounded-full overflow-hidden border-2 transition ${
                      activeSel ? 'border-primary-500 ring-2 ring-primary-500/40' : 'border-line hover:border-line-strong'
                    }`}
                    title="Diesen Avatar wählen"
                  >
                    <img src={url} alt="Avatar-Option" className="w-full h-full object-cover bg-surface-2" loading="lazy" />
                    {activeSel && (
                      <span className="absolute inset-0 flex items-center justify-center bg-primary-600/40">
                        <Check size={18} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
