-- Rate-Limiting (DB-gestützt, serverless-tauglich)
create table if not exists public.rate_limit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_limit_events_lookup on public.rate_limit_events(user_id, action, created_at desc);
alter table public.rate_limit_events enable row level security;
-- Keine Policies: nur die SECURITY-DEFINER-Funktion greift zu.

create or replace function public.check_rate_limit(p_action text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then return false; end if;
  delete from public.rate_limit_events
   where user_id = v_uid and action = p_action
     and created_at < now() - make_interval(secs => p_window_seconds);
  select count(*) into v_count from public.rate_limit_events
   where user_id = v_uid and action = p_action;
  if v_count >= p_max then
    return false;
  end if;
  insert into public.rate_limit_events(user_id, action) values (v_uid, p_action);
  return true;
end;
$$;
revoke execute on function public.check_rate_limit(text,int,int) from anon, public;
grant execute on function public.check_rate_limit(text,int,int) to authenticated;

-- Web-Push-Subscriptions
create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions(user_id);
alter table public.push_subscriptions enable row level security;
create policy push_sub_select_own on public.push_subscriptions for select using (user_id = (select auth.uid()));
create policy push_sub_insert_own on public.push_subscriptions for insert with check (user_id = (select auth.uid()));
create policy push_sub_delete_own on public.push_subscriptions for delete using (user_id = (select auth.uid()));

-- „Beliebte öffentliche Profile" (für Community-Discovery)
create or replace view public.popular_public_profiles
with (security_invoker = true) as
select
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  (select count(*) from public.follows f where f.following_id = p.id) as followers
from public.profiles p
where p.is_public = true;
