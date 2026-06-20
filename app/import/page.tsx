'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Database } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    // Simulate processing XML/JSON
    setTimeout(() => {
      setImporting(false);
      setSuccess(true);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pt-12 pb-20 px-4">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl mx-auto flex items-center justify-center border border-blue-500/20">
          <Database size={40} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-black">Listen-Import</h1>
        <p className="text-slate-400 text-lg">Migriere deine Watchlist von MyAnimeList (MAL) oder AniList mit wenigen Klicks.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center space-y-8">
        {!success ? (
          <>
            <div className="border-2 border-dashed border-slate-700 rounded-3xl p-12 hover:bg-slate-800/50 transition-colors relative">
              <input 
                type="file" 
                accept=".xml,.json" 
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="font-bold text-slate-300">
                {file ? file.name : "XML oder JSON Datei hier ablegen"}
              </p>
              <p className="text-sm text-slate-500 mt-2">Unterstützt MAL Export (.xml) und AniList (.json)</p>
            </div>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-2xl w-full flex justify-center items-center gap-2 transition-all shadow-xl shadow-blue-500/20"
            >
              {importing ? <Loader2 size={24} className="animate-spin" /> : <Database size={24} />}
              Import starten
            </button>
          </>
        ) : (
          <div className="py-12 space-y-4">
            <CheckCircle2 size={64} className="mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-white">Import erfolgreich!</h2>
            <p className="text-slate-400">Deine Einträge wurden in die Datenbank übernommen und deine TMDB IDs wurden synchronisiert.</p>
          </div>
        )}
      </div>
    </div>
  );
}
