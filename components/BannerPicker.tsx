'use client';

import { useState, useEffect } from 'react';
import { Check, ImagePlus, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

// Banner-Auswahl aus denselben Anime-Backdrops wie die App-Hintergründe.
export default function BannerPicker({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || items.length > 0) return;
    setLoading(true);
    fetch('/api/discover?page=1')
      .then((r) => r.json())
      .then((d) => {
        const list = (d.results || []).filter((x: any) => x.backdrop_path).slice(0, 18);
        setItems(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, items.length]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold bg-white/[.06] hover:bg-white/[.1] border border-line text-fg transition"
      >
        <ImagePlus size={16} /> {open ? 'Auswahl schließen' : 'Banner wählen'}
      </button>

      {open && (
        <div className="p-4 glass rounded-xl">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary-500" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((m) => {
                const url = getImageUrl(m.backdrop_path, 'original');
                const active = value === url;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelect(url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                      active ? 'border-primary-500 ring-2 ring-primary-500/40' : 'border-line hover:border-line-strong'
                    }`}
                    title={m.name || m.title}
                  >
                    <img
                      src={getImageUrl(m.backdrop_path, 'w500')}
                      alt={m.name || m.title || 'Banner-Option'}
                      className="w-full h-full object-cover"
                    />
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center bg-primary-600/40">
                        <Check size={20} className="text-white" />
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
