'use client';

import { useState } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function WatchlistButton({ anime }: { anime: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    
    // 1. Prüfen, ob der User eingeloggt ist
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Bitte logge dich zuerst ein, um Animes zu speichern!");
      setLoading(false);
      return;
    }

    // 2. Den Anime in die `media` Tabelle eintragen (falls noch nicht existent)
    const { error: mediaError } = await supabase
      .from('media')
      .upsert({
        id: anime.mal_id, // Die ID von MyAnimeList als unsere Datenbank-ID
        title: anime.title_english || anime.title,
        type: anime.type,
        cover_url: anime.images?.jpg?.large_image_url
      });

    if (mediaError) {
      console.error("Media Error:", mediaError);
      alert("Fehler beim Speichern der Basisdaten.");
      setLoading(false);
      return;
    }

    // 3. Den Eintrag in die persönliche Watchlist des Users packen
    const { error: watchlistError } = await supabase
      .from('user_watchlist')
      .insert({
        user_id: user.id,
        media_id: anime.mal_id,
        status: 'plan_to_watch'
      });

    if (watchlistError) {
      if (watchlistError.code === '23505') {
        alert("Dieser Anime ist bereits auf deiner Watchlist!");
      } else {
        console.error("Watchlist Error:", watchlistError);
        alert("Fehler beim Hinzufügen zur Watchlist.");
      }
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  // Wenn erfolgreich gespeichert wurde, zeigen wir einen grünen Haken
  if (success) {
    return (
      <button className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/20 cursor-default">
        <Check size={20} /> Auf der Watchlist
      </button>
    );
  }

  return (
    <button 
      onClick={handleAdd}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
      {loading ? "Wird gespeichert..." : "Zur Watchlist hinzufügen"}
    </button>
  );
}