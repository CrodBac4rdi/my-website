import React from "react";
import { Shield, FileText, Code2, AlertTriangle, Database } from "lucide-react";

export const metadata = {
  title: "Legal & Privacy - Horizon",
  description: "Rechtliche Informationen, TMDB Credits und Datenschutzrichtlinien.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen text-fg py-20 px-4 md:px-8 max-w-[1200px] mx-auto space-y-16">
      
      {/* HEADER */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-2xl mb-4 font-bold tracking-widest uppercase text-xs">
          <Shield size={14} /> Rechtliches & Sicherheit
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight">
          Legal & Privacy
        </h1>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          Transparenz ist wichtig. Hier findest du alle rechtlichen Hinweise, Credits zu unseren Datenquellen und unsere Datenschutzrichtlinien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-32 p-6 bg-elev/40 backdrop-blur-xl border border-line-strong/50 rounded-3xl flex flex-col gap-2">
            <a href="#tmdb" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-muted hover:text-white font-medium">
              <Code2 size={18} className="text-primary-400" /> API & Credits
            </a>
            <a href="#privacy" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-muted hover:text-white font-medium">
              <Database size={18} className="text-green-400" /> Privacy Policy
            </a>
            <a href="#tos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-muted hover:text-white font-medium">
              <FileText size={18} className="text-purple-400" /> Terms of Service
            </a>
            <a href="#dmca" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-muted hover:text-white font-medium">
              <AlertTriangle size={18} className="text-danger" /> DMCA Disclaimer
            </a>
          </div>
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* TMDB CREDITS */}
          <section id="tmdb" className="p-8 bg-elev/40 backdrop-blur-xl border border-line-strong/50 rounded-3xl space-y-6 scroll-mt-32">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Code2 className="text-primary-400" /> TMDB API & Credits
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-blue-950/20 border border-primary-700/30 rounded-2xl">
              <div className="w-24 h-24 flex-shrink-0 relative">
                <img 
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cb3fd056e3f7162571d2862136e586114848f2d2249d43cc94edb2a.svg" 
                  alt="TMDB Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-white">The Movie Database (TMDB)</p>
                <p className="text-muted leading-relaxed italic">
                  "This product uses the TMDB API but is not endorsed or certified by TMDB."
                </p>
                <p className="text-muted text-sm">
                  Alle Metadaten, Bilder, Beschreibungen und Release-Daten der auf Horizon angezeigten Anime stammen direkt aus der Community-gepflegten Datenbank von TMDB.
                </p>
              </div>
            </div>
          </section>

          {/* PRIVACY POLICY */}
          <section id="privacy" className="p-8 bg-elev/40 backdrop-blur-xl border border-line-strong/50 rounded-3xl space-y-6 scroll-mt-32">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Database className="text-green-400" /> Privacy Policy (Datenschutz)
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <h3 className="text-xl font-bold text-white pt-2">1. Datenspeicherung & Account</h3>
              <p>
                Diese Website nutzt <strong>Supabase</strong> für die Nutzerverwaltung und Datenbank-Funktionalität. Wenn du einen Account erstellst, wird deine E-Mail-Adresse und ein verschlüsseltes Passwort (oder Auth-Token deines Social-Logins) sicher auf den Servern von Supabase gespeichert. Wir speichern keine weiteren persönlichen Daten.
              </p>
              <h3 className="text-xl font-bold text-white pt-2">2. Cookies & Tracking</h3>
              <p>
                Wir hassen nervige Cookie-Banner genauso sehr wie du. Deshalb verwendet Horizon <strong>keine Tracking-Cookies</strong> (wie Google Analytics) und keine Werbe-Tracker. 
              </p>
              <p>
                Es werden lediglich <strong>technisch zwingend notwendige Session-Tokens</strong> (via LocalStorage/Cookies) verwendet, um dich eingeloggt zu halten und deine personalisierte Watchlist abzurufen. Gemäß der DSGVO ist hierfür kein Cookie-Opt-In-Banner erforderlich.
              </p>
            </div>
          </section>

          {/* TERMS OF SERVICE */}
          <section id="tos" className="p-8 bg-elev/40 backdrop-blur-xl border border-line-strong/50 rounded-3xl space-y-6 scroll-mt-32">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <FileText className="text-purple-400" /> Terms of Service
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Horizon ist ein reines Hobby- und Portfolio-Projekt, entwickelt für die Community. Mit der Nutzung der Seite stimmst du folgenden Punkten zu:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Es besteht kein rechtlicher Anspruch auf die ständige Verfügbarkeit (Uptime) der Server oder der Datenbank.</li>
                <li>Wir behalten uns das Recht vor, Accounts, die das System absichtlich überlasten (Spam, API-Abuse) oder missbrauchen, ohne Vorwarnung zu löschen.</li>
                <li>Der Service ist 100% kostenlos. Es werden keine Abonnements verkauft.</li>
              </ul>
            </div>
          </section>

          {/* DMCA */}
          <section id="dmca" className="p-8 bg-elev/40 backdrop-blur-xl border border-line-strong/50 rounded-3xl space-y-6 scroll-mt-32">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <AlertTriangle className="text-danger" /> DMCA Disclaimer
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                <strong>Horizon hostet keine eigenen Video- oder Bildinhalte.</strong>
              </p>
              <p>
                Alle angezeigten Cover, Poster und Trailer werden über die öffentliche API von TMDB geladen. Die Seite agiert lediglich als Katalog und Metadaten-Tracker, um Anime-Informationen übersichtlich aufzubereiten. 
              </p>
              <p>
                Falls Sie der Meinung sind, dass Bilder, die über die TMDB API eingebunden werden, Ihre Urheberrechte verletzen, wenden Sie sich bitte direkt an <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">The Movie Database (TMDB)</a>, um die entsprechenden Inhalte von deren Servern entfernen zu lassen.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
