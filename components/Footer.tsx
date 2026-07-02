import Link from 'next/link';
import InstallButton from '@/components/InstallButton';

const LINKS: { href: string; label: string }[] = [
  { href: '/discover', label: 'Entdecken' },
  { href: '/community', label: 'Community' },
  { href: '/calendar', label: 'Kalender' },
  { href: '/backgrounds', label: 'Hintergründe' },
  { href: '/faq', label: 'FAQ' },
  { href: '/legal', label: 'Legal & Privacy' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-line-strong bg-elev/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <span className="font-black text-white text-lg">H</span>
            </div>
            <span className="text-lg font-black tracking-tighter text-fg">HORIZON</span>
          </div>
          <p className="text-muted text-sm max-w-xs leading-relaxed">
            Dein Logbuch für Anime, Serien & Filme. Daten von TMDB, kostenlos und werbefrei.
          </p>
          <p className="text-faint text-xs">vibecoded mit Claude Opus 4.8</p>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-faint uppercase tracking-wider">Navigation</p>
          <ul className="space-y-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted hover:text-fg text-sm transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* App */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-faint uppercase tracking-wider">App</p>
          <p className="text-muted text-sm max-w-xs leading-relaxed">
            HORIZON auf den Startbildschirm legen – eigenes Fenster, schneller Zugriff.
          </p>
          <InstallButton className="inline-flex items-center gap-2 bg-surface-3 hover:bg-surface-3 hover:border-primary-500/50 border border-line-strong text-fg font-semibold px-4 h-10 rounded-lg text-sm transition-colors" />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 text-faint text-xs">
          © {new Date().getFullYear()} HORIZON · Kein offizielles TMDB-Produkt.
        </div>
      </div>
    </footer>
  );
}
