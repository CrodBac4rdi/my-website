'use client';

import { useEffect } from 'react';
import { addRecentMedia, type RecentItem } from '@/lib/recentHistory';

// Unsichtbarer Recorder: auf der Medien-Detailseite gemountet, schreibt den
// Titel in die "Zuletzt angesehen"-Historie (Command-Palette bei leerer Suche).
export default function RecordRecentView({ item }: { item: RecentItem }) {
  useEffect(() => {
    addRecentMedia(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return null;
}
