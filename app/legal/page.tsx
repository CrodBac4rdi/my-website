import React from "react";
import Link from "next/link";
import { Shield, FileText, Code2, AlertTriangle, Database, Sparkles } from "lucide-react";

export const metadata = {
  title: "Legal & Privacy",
  description: "Rechtliche Informationen, TMDB Credits und Datenschutzrichtlinien.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen text-fg py-16 md:py-24 px-4 max-w-5xl mx-auto space-y-20">

      {/* HEADER */}
      <div className="space-y-5 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full font-bold tracking-widest uppercase text-xs">
          <Shield size={14} /> Rechtliches & Sicherheit
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-fg tracking-tight">
          Legal &amp; Privacy
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          Transparenz ist wichtig. Hier findest du alle rechtlichen Hinweise, Credits zu unseren
          Datenquellen und unsere Datenschutzrichtlinien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-1">
          <nav className="sticky top-32 p-4 glass rounded-2xl flex flex-col gap-1">
            <a href="#tmdb" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[.06] transition-colors text-muted hover:text-fg font-medium">
              <Code2 size={18} className="text-primary-400" /> API &amp; Credits
            </a>
            <a href="#privacy" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[.06] transition-colors text-muted hover:text-fg font-medium">
              <Database size={18} className="text-success" /> Privacy Policy
            </a>
            <a href="#tos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[.06] transition-colors text-muted hover:text-fg font-medium">
              <FileText size={18} className="text-primary-400" /> Terms of Service
            </a>
            <a href="#dmca" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[.06] transition-colors text-muted hover:text-fg font-medium">
              <AlertTriangle size={18} className="text-danger" /> DMCA Disclaimer
            </a>
          </nav>
        </aside>

        {/* CONTENT */}
        <div className="lg:col-span-2 space-y-10">

          {/* TMDB CREDITS */}
          <section id="tmdb" className="p-8 md:p-10 glass rounded-2xl space-y-6 scroll-mt-32">
            <h2 className="font-display text-2xl font-bold text-fg flex items-center gap-3">
              <Code2 className="text-primary-400" /> TMDB API &amp; Credits
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-primary-600/10 border border-primary-700/30 rounded-xl">
              <div className="w-20 h-20 flex-shrink-0">
                <img
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cb3fd056e3f7162571d2862136e586114848f2d2249d43cc94edb2a.svg"
                  alt="TMDB Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-fg">The Movie Database (TMDB)</p>
                <p className="text-muted leading-relaxed italic">
                  &bdquo;This product uses the TMDB API but is not endorsed or certified by TMDB.&ldquo;
                </p>
                <p className="text-muted text-sm leading-relaxed">
                  Alle Metadaten, Bilder, Beschreibungen und Release-Daten der auf Horizon
                  angezeigten Anime stammen direkt aus der Community-gepflegten Datenbank von TMDB.
                </p>
              </div>
            </div>
          </section>

          {/* PRIVACY POLICY */}
          <section id="privacy" className="p-8 md:p-10 glass rounded-2xl space-y-6 scroll-mt-32">
            <h2 className="font-display text-2xl font-bold text-fg flex items-center gap-3">
              <Database className="text-success" /> Privacy Policy (Datenschutz)
            </h2>
            <div className="space-y-5 text-muted leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-fg">1. Datenspeicherung &amp; Account</h3>
                <p>
                  Diese Website nutzt <strong className="text-fg font-semibold">Supabase</strong> für
                  Nutzerverwaltung und Datenbank. Wenn du einen Account erstellst, werden deine
                  E-Mail-Adresse und ein verschlüsseltes Passwort sicher auf den Servern von Supabase
                  gespeichert. Wir speichern keine weiteren persönlichen Daten.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-fg">2. Cookies &amp; Tracking</h3>
                <p>
                  Wir hassen nervige Cookie-Banner genauso sehr wie du. Deshalb verwendet Horizon
                  <strong className="text-fg font-semibold"> keine Tracking-Cookies</strong> und keine
                  Werbe-Tracker.
                </p>
                <p>
                  Es werden lediglich <strong className="text-fg font-semibold">technisch notwendige
                  Session-Tokens</strong> verwendet, um dich eingeloggt zu halten und deine Watchlist
                  abzurufen. Gemäß DSGVO ist hierfür kein Cookie-Opt-In-Banner erforderlich.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-fg">3. Deine Daten, dein Recht</h3>
                <p>
                  Du kannst jederzeit alle bei uns gespeicherten Daten (Profil, Watchlist, Listen,
                  Reviews, Follower, Benachrichtigungen) als JSON-Datei herunterladen — in deinem{' '}
                  <Link href="/profile" className="text-primary-400 hover:underline font-semibold">
                    Profil
                  </Link>{' '}
                  unter „Deine Daten". Dort kannst du deinen Account auch vollständig und
                  unwiderruflich löschen.
                </p>
              </div>
            </div>
          </section>

          {/* TERMS OF SERVICE */}
          <section id="tos" className="p-8 md:p-10 glass rounded-2xl space-y-6 scroll-mt-32">
            <h2 className="font-display text-2xl font-bold text-fg flex items-center gap-3">
              <FileText className="text-primary-400" /> Terms of Service
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Horizon ist ein reines Hobby- und Portfolio-Projekt, entwickelt für die Community. Mit
                der Nutzung der Seite stimmst du folgenden Punkten zu:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-primary-500">
                <li>Es besteht kein rechtlicher Anspruch auf die ständige Verfügbarkeit (Uptime) der Server oder Datenbank.</li>
                <li>Wir behalten uns vor, Accounts, die das System absichtlich überlasten (Spam, API-Abuse), ohne Vorwarnung zu löschen.</li>
                <li>Der Service ist 100% kostenlos. Es werden keine Abonnements verkauft.</li>
              </ul>
            </div>
          </section>

          {/* DMCA */}
          <section id="dmca" className="p-8 md:p-10 glass rounded-2xl space-y-6 scroll-mt-32">
            <h2 className="font-display text-2xl font-bold text-fg flex items-center gap-3">
              <AlertTriangle className="text-danger" /> DMCA Disclaimer
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                <strong className="text-fg font-semibold">Horizon hostet keine eigenen Video- oder Bildinhalte.</strong>
              </p>
              <p>
                Alle angezeigten Cover, Poster und Trailer werden über die öffentliche API von TMDB
                geladen. Die Seite agiert lediglich als Katalog und Metadaten-Tracker.
              </p>
              <p>
                Falls du der Meinung bist, dass über die TMDB API eingebundene Bilder deine
                Urheberrechte verletzen, wende dich bitte direkt an{" "}
                <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">
                  The Movie Database (TMDB)
                </a>.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* VIBECODED CREDIT */}
      <div className="max-w-2xl mx-auto text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 border border-line rounded-full text-faint text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} className="text-primary-400" /> Made with AI
        </div>
        <p className="text-muted leading-relaxed">
          Horizon wurde <strong className="text-fg font-semibold">„vibecoded"</strong> — Architektur,
          Datenbank und Code entstanden im Pair-Programming mit{" "}
          <strong className="text-fg font-semibold">Claude Opus 4.8</strong>. Konzept, Entscheidungen,
          Review und der ganze Vibe kamen vom Menschen dahinter. 🤝
        </p>
      </div>
    </div>
  );
}
