import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="p-4 rounded-2xl bg-surface-2 border border-line">
        <WifiOff size={40} className="text-faint" />
      </div>
      <h1 className="font-display text-3xl font-bold text-fg">Du bist offline</h1>
      <p className="text-muted max-w-sm">
        Diese Seite ist gerade nicht im Cache. Sobald du wieder online bist, lädt HORIZON normal weiter.
      </p>
      <Link href="/" className="text-primary-400 hover:underline font-semibold">
        Erneut versuchen
      </Link>
    </div>
  );
}
