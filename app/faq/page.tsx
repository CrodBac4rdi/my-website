import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Sparkles, Smartphone } from 'lucide-react';
import InstallButton from '@/components/InstallButton';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Häufige Fragen zu HORIZON – Watchlist, Profile, Daten und App-Installation.',
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Was ist HORIZON?',
    a: 'HORIZON ist dein persönliches Logbuch für Anime, Serien und Filme: entdecken, auf die Watchlist setzen, mit Status & Rating pflegen, Listen bauen und Reviews lesen.',
  },
  {
    q: 'Kostet HORIZON etwas?',
    a: 'Nein. HORIZON ist ein privates Hobby-Projekt und komplett kostenlos – keine Abos, keine versteckten Kosten, keine Werbung.',
  },
  {
    q: 'Woher kommen die Daten?',
    a: 'Alle Titel, Cover, Trailer und Metadaten stammen von TMDB (The Movie Database) und werden serverseitig zwischengespeichert. HORIZON selbst hostet keine Streams.',
  },
  {
    q: 'Wie funktioniert die Watchlist?',
    a: 'Über das „+" auf jeder Karte landet ein Titel auf deiner Watchlist. Dort setzt du einen Status (geplant, schaut, abgeschlossen, pausiert, abgebrochen) und eine Bewertung von 1–10.',
  },
  {
    q: 'Was bedeutet ein öffentliches Profil?',
    a: 'Standardmäßig ist dein Profil privat. Stellst du es öffentlich, sind Username, Profilbild und Watchlist sichtbar – Statistiken, Bio und Aktivität schaltest du einzeln dazu. Erreichbar unter /u/deinname.',
  },
  {
    q: 'Kann ich anderen folgen?',
    a: 'Ja. Öffentlichen Profilen kannst du folgen; ihre Aktivitäten erscheinen dann in deinem Feed. Privaten Profilen kann man nicht folgen.',
  },
  {
    q: 'Werden meine Daten verkauft?',
    a: 'Nein. Es gibt kein Tracking zu Werbezwecken und keinen Datenverkauf. Details stehen unter Legal & Privacy.',
  },
  {
    q: 'Wie lösche ich meinen Account?',
    a: 'Im Profil unter „Danger Zone" → „Account löschen". Das entfernt Profil, Watchlist, Listen, Reviews und Benachrichtigungen unwiderruflich.',
  },
  {
    q: 'Gibt es Episoden-Tracking?',
    a: 'Bewusst nicht. Manuelles Abhaken einzelner Folgen pflegt auf Dauer niemand – die Watchlist mit Status hält den Überblick schlanker.',
  },
];

function Item({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <details className="group glass rounded-2xl px-5 py-4 open:bg-elev/95 transition-colors">
      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-display font-semibold text-fg">
        {q}
        <ChevronDown size={18} className="text-faint shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="text-muted leading-relaxed mt-3">{a}</p>
    </details>
  );
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto pb-24 pt-8 space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-[0.2em] text-xs">
          <HelpCircle size={16} /> Hilfe
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg tracking-tight">Häufige Fragen</h1>
        <p className="text-muted max-w-xl">Alles Wichtige zu HORIZON auf einen Blick.</p>
      </header>

      {/* INSTALL CTA */}
      <section className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-glow">
          <Smartphone size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-fg">HORIZON als App installieren</h2>
          <p className="text-muted text-sm mt-1 max-w-lg leading-relaxed">
            Lege HORIZON auf den Startbildschirm – eigenes Fenster, schneller Zugriff, funktioniert auch teils offline.
          </p>
        </div>
        <div className="shrink-0">
          <InstallButton />
        </div>
      </section>

      {/* QUESTIONS */}
      <section className="space-y-3">
        {FAQ.map((item) => (
          <Item key={item.q} q={item.q} a={item.a} />
        ))}
      </section>

      <section className="glass rounded-2xl p-6 flex items-center gap-4">
        <Sparkles className="text-primary-400 shrink-0" size={22} />
        <p className="text-muted text-sm">
          Noch eine Frage offen? Schau in die{' '}
          <Link href="/legal" className="text-primary-400 hover:underline font-semibold">Legal &amp; Privacy</Link>{' '}
          oder starte direkt auf der{' '}
          <Link href="/" className="text-primary-400 hover:underline font-semibold">Startseite</Link>.
        </p>
      </section>
    </div>
  );
}
