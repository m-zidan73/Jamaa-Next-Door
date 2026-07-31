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
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into target
  from public.jamaahs
  where id = target_jamaah_id
  for update;

  if target.id is null then
    raise exception 'Jama''ah not found';
  end if;
  if target.status not in ('scheduled', 'active') or target.starts_at <= timezone('utc', now()) then
    raise exception 'This Jama''ah is closed';
  end if;
  if not exists (
    select 1 from public.jamaah_participants
    where jamaah_id = target_jamaah_id and profile_id = current_user_id and is_active
  ) then
    raise exception 'You are not an active participant';
  end if;

  update public.jamaah_participants
  set is_active = false, left_at = timezone('utc', now())
  where jamaah_id = target_jamaah_id and profile_id = current_user_id;

  if target.host_profile_id = current_user_id then
    select profile_id into next_host
    from public.jamaah_participants
    where jamaah_id = target_jamaah_id and is_active
    order by joined_at asc
    limit 1;

    if next_host is null then
      update public.jamaahs
      set status = 'cancelled', host_profile_id = null, updated_at = timezone('utc', now())
      where id = target_jamaah_id;

      update public.notification_jobs
      set status = 'cancelled'
      where jamaah_id = target_jamaah_id and status = 'pending';
    else
      update public.jamaahs
      set host_profile_id = next_host, updated_at = timezone('utc', now())
      where id = target_jamaah_id;
    end if;
  end if;
end;
$$;

revoke all on function public.leave_jamaah(uuid) from public, anon;
grant execute on function public.leave_jamaah(uuid) to authenticated;

drop function if exists public.list_discoverable_jamaahs();
create function public.list_discoverable_jamaahs()
returns table (
  id uuid, prayer_name text, status public.jamaah_status, starts_at timestamptz,
  approximate_lat double precision, approximate_lng double precision, participant_count bigint
)
language sql
security definer
set search_path = public
as $$
  select j.id, j.prayer_name, j.status, j.starts_at,
    st_y(j.approximate_point::geometry), st_x(j.approximate_point::geometry),
    count(jp.id) filter (where jp.is_active)
  from public.jamaahs j
  left join public.jamaah_participants jp on jp.jamaah_id = j.id
  where j.country_code = 'DE'
    and j.status in ('scheduled', 'active')
    and j.starts_at > timezone('utc', now())
  group by j.id
  order by j.starts_at asc;
$$;

revoke all on function public.list_discoverable_jamaahs() from public, anon;
grant execute on function public.list_discoverable_jamaahs() to authenticated;

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
    update public.jamaahs
    set status = 'concluded', updated_at = timezone('utc', now())
    where status in ('scheduled', 'active')
      and starts_at <= timezone('utc', now())
    returning id
  ), cancelled_jobs as (
    update public.notification_jobs
    set status = 'cancelled'
    where status = 'pending'
      and event_kind = 'reminder'
      and jamaah_id in (select id from updated)
    returning id
  )
  select count(*) into affected_count from updated;

  return affected_count;
end;
$$;

revoke all on function public.conclude_due_jamaahs() from public, anon, authenticated;
grant execute on function public.conclude_due_jamaahs() to service_role;

drop function if exists public.conclude_jamaah(uuid);

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id from cron.job where jobname = 'conclude-due-jamaahs';
  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
end;
$$;

select cron.schedule(
  'conclude-due-jamaahs',
  '* * * * *',
  'select public.conclude_due_jamaahs();'
);
