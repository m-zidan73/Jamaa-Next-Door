create or replace function public.leave_jamaah(target_jamaah_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target public.jamaahs;
  next_host uuid;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  select * into target from public.jamaahs where id = target_jamaah_id for update;
  if target.id is null then raise exception 'Jama''ah not found'; end if;
  if target.status not in ('scheduled', 'active') or target.starts_at <= timezone('utc', now()) then raise exception 'This Jama''ah is closed'; end if;
  if not exists (select 1 from public.jamaah_participants where jamaah_id = target_jamaah_id and profile_id = current_user_id and is_active) then
    raise exception 'You are not an active participant';
  end if;

  update public.jamaah_participants set is_active = false, left_at = timezone('utc', now())
  where jamaah_id = target_jamaah_id and profile_id = current_user_id;

  if target.host_profile_id = current_user_id then
    select profile_id into next_host from public.jamaah_participants
    where jamaah_id = target_jamaah_id and is_active order by joined_at asc limit 1;
    if next_host is null then
      update public.jamaahs set status = 'cancelled', host_profile_id = null, updated_at = timezone('utc', now()) where id = target_jamaah_id;
      update public.notification_jobs set status = 'cancelled' where jamaah_id = target_jamaah_id and status = 'pending';
    else
      update public.jamaahs set host_profile_id = next_host, updated_at = timezone('utc', now()) where id = target_jamaah_id;
    end if;
  end if;
end;
$$;

create or replace function public.conclude_due_jamaahs()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer;
begin
  with updated as (
    update public.jamaahs set status = 'concluded', updated_at = timezone('utc', now())
    where status in ('scheduled', 'active') and starts_at <= timezone('utc', now())
    returning id
  ), cancelled_jobs as (
    update public.notification_jobs set status = 'cancelled'
    where status = 'pending' and event_kind = 'reminder' and jamaah_id in (select id from updated)
    returning id
  )
  select count(*) into affected_count from updated;
  return affected_count;
end;
$$;
