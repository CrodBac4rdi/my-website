'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Database, AlertCircle, XCircle } from 'lucide-react';
import { parseImportFile, type ImportEntry } from '@/lib/import/parse';
import { importChunkAction } from '@/lib/actions/import';
import type { ImportResult } from '@/lib/services/import';
import { toast } from '@/lib/toast';

const CHUNK_SIZE = 10;
const CHUNK_DELAY_MS = 600; // schont das TMDB-Rate-Limit zwischen Chunks

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ImportEntry[] | null>(null);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const runningRef = useRef(false);

  const handleFile = async (f: File | null) => {
    setFile(f);
    setEntries(null);
    setParseError('');
    setResults(null);
    if (!f) return;
    try {
      const text = await f.text();
      const parsed = parseImportFile(f.name, text);
      if (parsed.length === 0) {
        setParseError('Keine Einträge in der Datei gefunden. Unterstützt: MAL-Export (.xml) und AniList/JSON (.json).');
        return;
      }
      setEntries(parsed);
    } catch {
      setParseError('Datei konnte nicht gelesen werden. Ist es ein gültiger MAL-XML- oder AniList-JSON-Export?');
    }
  };

  const handleImport = async () => {
    if (!entries || runningRef.current) return;
    runningRef.current = true;
    setImporting(true);
    setProgress(0);
    const all: ImportResult[] = [];

    try {
      for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = entries.slice(i, i + CHUNK_SIZE);
        const res = await importChunkAction(chunk);
        if (res.ok) {
          all.push(...res.data);
        } else {
          toast.error(res.error);
          // Auth-/Validierungsfehler → Abbruch
          break;
        }
        setProgress(Math.min(i + CHUNK_SIZE, entries.length));
        setResults([...all]);
        if (i + CHUNK_SIZE < entries.length) {
          await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
        }
      }
      const imported = all.filter((r) => r.ok).length;
      toast.success(`${imported} von ${entries.length} importiert.`);
    } finally {
      runningRef.current = false;
      setImporting(false);
    }
  };

  const importedCount = results?.filter((r) => r.ok).length ?? 0;
  const failedCount = results?.filter((r) => !r.ok).length ?? 0;
  const done = results !== null && !importing;

  return (
    <div className="max-w-3xl mx-auto space-y-10 pt-12 pb-20 px-4">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl mx-auto flex items-center justify-center border border-blue-500/20">
          <Database size={40} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-black">Listen-Import</h1>
        <p className="text-slate-400 text-lg">
          Migriere deine Watchlist von MyAnimeList (MAL) oder AniList. Titel werden via TMDB
          abgeglichen.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] space-y-8">
        {/* FILE PICKER */}
        <div className="border-2 border-dashed border-slate-700 rounded-3xl p-10 hover:bg-slate-800/50 transition-colors relative text-center">
          <input
            type="file"
            accept=".xml,.json"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={importing}
          />
          <UploadCloud size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="font-bold text-slate-300">{file ? file.name : 'XML oder JSON Datei hier ablegen'}</p>
          <p className="text-sm text-slate-500 mt-2">MAL Export (.xml) und AniList (.json)</p>
        </div>

        {parseError && (
          <div className="flex items-center gap-3 text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <AlertCircle size={18} /> {parseError}
          </div>
        )}

        {entries && !done && (
          <p className="text-center text-slate-300 font-medium">
            <span className="font-black text-white">{entries.length}</span> Einträge erkannt.
          </p>
        )}

        {/* PROGRESS */}
        {importing && entries && (
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.round((progress / entries.length) * 100)}%` }}
              />
            </div>
            <p className="text-center text-sm text-slate-400">
              {progress} / {entries.length} verarbeitet…
            </p>
          </div>
        )}

        {/* IMPORT BUTTON */}
        {!done && (
          <button
            onClick={handleImport}
            disabled={!entries || importing}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-2xl w-full flex justify-center items-center gap-2 transition-all shadow-xl shadow-blue-500/20"
          >
            {importing ? <Loader2 size={24} className="animate-spin" /> : <Database size={24} />}
            {importing ? 'Importiere…' : 'Import starten'}
          </button>
        )}

        {/* SUMMARY */}
        {done && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <CheckCircle2 size={40} className="mx-auto text-green-500" />
                <p className="text-2xl font-black text-white mt-2">{importedCount}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">importiert</p>
              </div>
              {failedCount > 0 && (
                <div className="text-center">
                  <XCircle size={40} className="mx-auto text-red-400" />
                  <p className="text-2xl font-black text-white mt-2">{failedCount}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">ohne Treffer</p>
                </div>
              )}
            </div>

            {failedCount > 0 && (
              <details className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-400">
                  Nicht importierte Titel anzeigen
                </summary>
                <ul className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                  {results!
                    .filter((r) => !r.ok)
                    .map((r, i) => (
                      <li key={i} className="text-xs text-slate-500">
                        {r.title} <span className="text-slate-700">— {r.reason}</span>
                      </li>
                    ))}
                </ul>
              </details>
            )}

            <a
              href="/watchlist"
              className="block text-center bg-white text-black font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              Zur Watchlist
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
