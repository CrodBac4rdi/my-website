'use client';

import { useState } from 'react';
import { Check, Shuffle, ImagePlus } from 'lucide-react';

// Generierte Avatare (DiceBear) — keine eigenen Assets nötig, https + allowlisted Host.
const STYLES = ['adventurer', 'fun-emoji', 'bottts', 'lorelei', 'notionists', 'thumbs'];
const SEEDS = ['Sora', 'Yuki', 'Kai', 'Hana', 'Rei', 'Aki', 'Mika', 'Taro', 'Luna', 'Zen', 'Emi', 'Riku'];

function buildOptions(): string[] {
  const opts: string[] = [];
  for (let i = 0; i < SEEDS.length; i++) {
    const style = STYLES[i % STYLES.length];
    opts.push(`https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(SEEDS[i])}`);
  }
  return opts;
}

const OPTIONS = buildOptions();

export default function AvatarPicker({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);

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
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {OPTIONS.map((url) => {
              const active = value === url;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => onSelect(url)}
                  className={`relative aspect-square rounded-full overflow-hidden border-2 transition ${
                    active ? 'border-primary-500 ring-2 ring-primary-500/40' : 'border-line hover:border-line-strong'
                  }`}
                  title="Diesen Avatar wählen"
                >
                  <img src={url} alt="Avatar-Option" className="w-full h-full object-cover bg-surface-2" />
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary-600/40">
                      <Check size={20} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              onSelect(
                `https://api.dicebear.com/9.x/${STYLES[Math.floor(Math.random() * STYLES.length)]}/svg?seed=${Math.random().toString(36).slice(2, 8)}`
              )
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition"
          >
            <Shuffle size={15} /> Zufälligen Avatar generieren
          </button>
        </div>
      )}
    </div>
  );
}
