-- Profil-Sichtbarkeit: privat per Default. public_fields steuert optionale Felder.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_fields jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.is_public IS 'Default false. Wenn true: Profil öffentlich (Username+Avatar+Watchlist immer sichtbar).';
COMMENT ON COLUMN public.profiles.public_fields IS 'Optionale Sichtbarkeits-Flags, z.B. {"stats":true,"bio":true,"activity":true}.';

-- Watchlist öffentlicher Profile ist für alle lesbar (Pflicht-Sichtbarkeit).
DROP POLICY IF EXISTS "watchlist_select_public" ON public.user_watchlist;
CREATE POLICY "watchlist_select_public" ON public.user_watchlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_watchlist.user_id AND p.is_public = true
    )
  );

-- Aktivität öffentlicher Profile nur lesbar, wenn per Flag freigegeben.
DROP POLICY IF EXISTS "activities_select_public" ON public.user_activities;
CREATE POLICY "activities_select_public" ON public.user_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_activities.user_id
        AND p.is_public = true
        AND COALESCE((p.public_fields->>'activity')::boolean, false)
    )
  );
