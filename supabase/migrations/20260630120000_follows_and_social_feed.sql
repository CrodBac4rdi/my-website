-- M4.4: Follower-Beziehungen + Social-Activity-Feed-View

create table if not exists public.follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

-- follower_id ist führende PK-Spalte (Index vorhanden); zusätzlicher Index für "wer folgt mir".
create index if not exists follows_following_idx on public.follows(following_id);

alter table public.follows enable row level security;

-- Follow-Graph ist öffentlich lesbar (Counts, Follower-/Following-Listen).
create policy follows_select_all on public.follows
  for select using (true);

-- Man kann nur die eigene Beziehung anlegen und nur öffentlichen Profilen folgen.
create policy follows_insert_own on public.follows
  for insert with check (
    follower_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = following_id and p.is_public = true)
  );

-- Man kann nur die eigene Beziehung löschen.
create policy follows_delete_own on public.follows
  for delete using (follower_id = (select auth.uid()));

-- Social-Feed-View: Aktivität + Medien + Akteur-Profil. security_invoker => RLS
-- von user_activities greift (eigene + öffentliche-mit-activity-Flag).
create or replace view public.social_feed
with (security_invoker = true) as
select
  a.id,
  a.user_id,
  a.activity_type,
  a.media_id,
  a.metadata,
  a.created_at,
  m.title    as media_title,
  m.cover_url as media_cover,
  m.type     as media_type,
  p.username  as actor_username,
  p.avatar_url as actor_avatar
from public.user_activities a
left join public.media m on m.id = a.media_id
left join public.profiles p on p.id = a.user_id;
