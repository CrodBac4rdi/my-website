-- Alte Signatur (boolean-Rückgabe) entfernen, da sich der Rückgabetyp ändert.
drop function if exists public.check_rate_limit(text, int, int);

create or replace function public.check_rate_limit(p_action text, p_max int, p_window_seconds int)
returns table(allowed boolean, retry_after_seconds int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
  v_oldest timestamptz;
begin
  if v_uid is null then
    return query select false, p_window_seconds;
    return;
  end if;

  delete from public.rate_limit_events
   where user_id = v_uid and action = p_action
     and created_at < now() - make_interval(secs => p_window_seconds);

  select count(*), min(created_at) into v_count, v_oldest
  from public.rate_limit_events
  where user_id = v_uid and action = p_action;

  if v_count >= p_max then
    return query select false,
      greatest(1, ceil(extract(epoch from (v_oldest + make_interval(secs => p_window_seconds) - now())))::int);
    return;
  end if;

  insert into public.rate_limit_events(user_id, action) values (v_uid, p_action);
  return query select true, 0;
end;
$$;

revoke execute on function public.check_rate_limit(text,int,int) from anon, public;
grant execute on function public.check_rate_limit(text,int,int) to authenticated;
