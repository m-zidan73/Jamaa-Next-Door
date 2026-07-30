create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.device_tokens add constraint device_tokens_expo_push_token_key unique (expo_push_token);
alter table public.notifications
  add column if not exists jamaah_id uuid references public.jamaahs(id) on delete cascade,
  add column if not exists delivery_status text not null default 'pending',
  add column if not exists delivered_at timestamptz,
  add column if not exists data jsonb not null default '{}'::jsonb;

create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  jamaah_alerts_enabled boolean not null default false,
  permission_requested_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  jamaah_id uuid not null references public.jamaahs(id) on delete cascade,
  event_kind text not null check (event_kind in ('created', 'reminder', 'cancelled')),
  title text not null,
  body text not null,
  run_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'delivered', 'failed', 'cancelled')),
  attempts integer not null default 0,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  delivered_at timestamptz,
  unique (profile_id, jamaah_id, event_kind)
);

alter table public.notification_preferences enable row level security;
alter table public.notification_jobs enable row level security;

drop policy if exists notification_preferences_own on public.notification_preferences;
create policy notification_preferences_own on public.notification_preferences
for select to authenticated using (profile_id = auth.uid());

create or replace function public.can_view_exact_location(jamaah_row public.jamaahs, user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select jamaah_row.host_profile_id = user_id or exists (
    select 1
    from public.jamaah_participants jp
    where jp.jamaah_id = jamaah_row.id and jp.profile_id = user_id and jp.is_active
      and exists (
        select 1 from public.selfie_verifications sv
        where sv.profile_id = user_id and sv.status = 'approved'
      )
  );
$$;

drop function if exists public.create_jamaah(text, timestamptz, text, text, double precision, double precision, double precision, double precision);
create function public.create_jamaah(
  p_prayer_name text, p_starts_at timestamptz, p_exact_address text, p_exact_photo_path text,
  p_approximate_lat double precision, p_approximate_lng double precision,
  p_exact_lat double precision, p_exact_lng double precision
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  current_user_id uuid := auth.uid();
  created_id uuid;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles where id = current_user_id) then raise exception 'Complete your profile before creating a Jama''ah'; end if;
  if p_prayer_name not in ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha') then raise exception 'Invalid prayer'; end if;
  if p_starts_at <= timezone('utc', now()) then raise exception 'Start time must be in the future'; end if;
  if length(trim(p_exact_address)) < 5 then raise exception 'A valid exact address is required'; end if;
  if p_exact_photo_path is null or p_exact_photo_path not like current_user_id::text || '/%' then raise exception 'A private user-owned location image is required'; end if;
  if p_exact_lat not between 47.2 and 55.2 or p_exact_lng not between 5.5 and 15.5 then raise exception 'Jama''ahs can only be created in Germany'; end if;
  if p_approximate_lat not between 47.2 and 55.2 or p_approximate_lng not between 5.5 and 15.5 then raise exception 'Approximate location must be in Germany'; end if;

  insert into public.jamaahs (
    prayer_name, status, host_profile_id, starts_at, country_code, approximate_point,
    exact_point, exact_address, exact_photo_path
  ) values (
    p_prayer_name, 'scheduled', current_user_id, p_starts_at, 'DE',
    st_setsrid(st_makepoint(p_approximate_lng, p_approximate_lat), 4326)::geography,
    st_setsrid(st_makepoint(p_exact_lng, p_exact_lat), 4326)::geography,
    trim(p_exact_address), p_exact_photo_path
  ) returning id into created_id;

  insert into public.jamaah_participants (jamaah_id, profile_id) values (created_id, current_user_id);

  insert into public.notification_jobs (profile_id, jamaah_id, event_kind, title, body, run_at)
  select np.profile_id, created_id, 'created', 'New Jama''ah nearby',
    p_prayer_name || ' Jama''ah starts ' || to_char(p_starts_at at time zone 'Europe/Berlin', 'DD Mon HH24:MI'),
    timezone('utc', now())
  from public.notification_preferences np
  where np.jamaah_alerts_enabled and np.profile_id <> current_user_id
  on conflict do nothing;

  insert into public.notification_jobs (profile_id, jamaah_id, event_kind, title, body, run_at)
  values (current_user_id, created_id, 'reminder', p_prayer_name || ' Jama''ah starts soon',
    'Your Jama''ah starts in 10 minutes.', greatest(timezone('utc', now()), p_starts_at - interval '10 minutes'))
  on conflict do nothing;

  return created_id;
end;
$$;

drop function if exists public.list_discoverable_jamaahs();
create function public.list_discoverable_jamaahs()
returns table (
  id uuid, prayer_name text, status public.jamaah_status, starts_at timestamptz,
  approximate_lat double precision, approximate_lng double precision, participant_count bigint
) language sql security definer set search_path = public as $$
  select j.id, j.prayer_name, j.status, j.starts_at,
    st_y(j.approximate_point::geometry), st_x(j.approximate_point::geometry),
    count(jp.id) filter (where jp.is_active)
  from public.jamaahs j
  left join public.jamaah_participants jp on jp.jamaah_id = j.id
  where j.country_code = 'DE' and j.status in ('scheduled', 'active')
  group by j.id order by j.starts_at;
$$;

drop function if exists public.get_jamaah_details(uuid);
create function public.get_jamaah_details(target_jamaah_id uuid)
returns table (
  id uuid, prayer_name text, status public.jamaah_status, starts_at timestamptz,
  approximate_lat double precision, approximate_lng double precision, participant_count bigint,
  exact_address text, exact_lat double precision, exact_lng double precision, exact_photo_path text,
  is_host boolean, is_participant boolean
) language sql security definer set search_path = public as $$
  select j.id, j.prayer_name, j.status, j.starts_at,
    st_y(j.approximate_point::geometry), st_x(j.approximate_point::geometry),
    count(jp.id) filter (where jp.is_active),
    case when public.can_view_exact_location(j, auth.uid()) then j.exact_address end,
    case when public.can_view_exact_location(j, auth.uid()) then st_y(j.exact_point::geometry) end,
    case when public.can_view_exact_location(j, auth.uid()) then st_x(j.exact_point::geometry) end,
    case when public.can_view_exact_location(j, auth.uid()) then j.exact_photo_path end,
    j.host_profile_id = auth.uid(),
    bool_or(jp.profile_id = auth.uid() and jp.is_active)
  from public.jamaahs j left join public.jamaah_participants jp on jp.jamaah_id = j.id
  where j.id = target_jamaah_id group by j.id;
$$;

create or replace function public.join_jamaah(target_jamaah_id uuid)
returns public.jamaah_participants language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := auth.uid(); inserted_row public.jamaah_participants; target public.jamaahs;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  select * into target from public.jamaahs where id = target_jamaah_id;
  if target.id is null then raise exception 'Jama''ah not found'; end if;
  if target.status not in ('scheduled', 'active') then raise exception 'This Jama''ah is closed'; end if;
  if not exists (select 1 from public.selfie_verifications where profile_id = current_user_id and status = 'approved') then raise exception 'Selfie approval is required to join'; end if;
  insert into public.jamaah_participants (jamaah_id, profile_id) values (target_jamaah_id, current_user_id)
  on conflict (jamaah_id, profile_id) do update set is_active = true, left_at = null returning * into inserted_row;
  insert into public.notification_jobs (profile_id, jamaah_id, event_kind, title, body, run_at)
  values (current_user_id, target_jamaah_id, 'reminder', target.prayer_name || ' Jama''ah starts soon',
    'Your Jama''ah starts in 10 minutes.', greatest(timezone('utc', now()), target.starts_at - interval '10 minutes'))
  on conflict do nothing;
  return inserted_row;
end;
$$;

create or replace function public.cancel_jamaah(target_jamaah_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare target public.jamaahs;
begin
  select * into target from public.jamaahs where id = target_jamaah_id for update;
  if target.host_profile_id is distinct from auth.uid() then raise exception 'Only the host can cancel this Jama''ah'; end if;
  if target.status not in ('scheduled', 'active') then raise exception 'This Jama''ah is already closed'; end if;
  update public.jamaahs set status = 'cancelled', updated_at = timezone('utc', now()) where id = target_jamaah_id;
  update public.notification_jobs set status = 'cancelled' where jamaah_id = target_jamaah_id and status = 'pending';
  insert into public.notification_jobs (profile_id, jamaah_id, event_kind, title, body, run_at)
  select jp.profile_id, target_jamaah_id, 'cancelled', target.prayer_name || ' Jama''ah cancelled',
    'The host cancelled this Jama''ah.', timezone('utc', now())
  from public.jamaah_participants jp where jp.jamaah_id = target_jamaah_id and jp.is_active
  on conflict do nothing;
end;
$$;

create or replace function public.conclude_jamaah(target_jamaah_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.jamaahs where id = target_jamaah_id and host_profile_id = auth.uid()) then
    raise exception 'Only the host can conclude this Jama''ah';
  end if;
  update public.jamaahs set status = 'concluded', updated_at = timezone('utc', now())
  where id = target_jamaah_id and status in ('scheduled', 'active');
  update public.notification_jobs set status = 'cancelled'
  where jamaah_id = target_jamaah_id and status = 'pending' and event_kind = 'reminder';
end;
$$;

create or replace function public.register_device_token(p_expo_push_token text, p_platform text default 'android')
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.device_tokens (profile_id, expo_push_token, platform)
  values (auth.uid(), p_expo_push_token, p_platform)
  on conflict (expo_push_token) do update set profile_id = auth.uid(), platform = excluded.platform, updated_at = timezone('utc', now());
end;
$$;

create or replace function public.set_jamaah_notification_preference(enabled boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.notification_preferences (profile_id, jamaah_alerts_enabled, permission_requested_at)
  values (auth.uid(), enabled, timezone('utc', now()))
  on conflict (profile_id) do update set jamaah_alerts_enabled = excluded.jamaah_alerts_enabled,
    permission_requested_at = coalesce(notification_preferences.permission_requested_at, excluded.permission_requested_at),
    updated_at = timezone('utc', now());
end;
$$;

create or replace function public.claim_due_notification_jobs(batch_size integer default 100)
returns setof public.notification_jobs language plpgsql security definer set search_path = public as $$
begin
  return query
  with due as (
    select id from public.notification_jobs
    where status = 'pending' and run_at <= timezone('utc', now())
    order by run_at for update skip locked limit least(batch_size, 100)
  )
  update public.notification_jobs j set status = 'processing', attempts = attempts + 1, locked_at = timezone('utc', now())
  from due where j.id = due.id returning j.*;
end;
$$;

create or replace function public.complete_notification_job(p_job_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.notification_jobs set status = 'delivered', delivered_at = timezone('utc', now()), last_error = null where id = p_job_id;
end;
$$;

create or replace function public.retry_notification_job(p_job_id uuid, p_error text, p_retry boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.notification_jobs set status = case when p_retry and attempts < 5 then 'pending' else 'failed' end,
    run_at = case when p_retry then timezone('utc', now()) + make_interval(mins => least(attempts * 2, 15)) else run_at end,
    last_error = left(p_error, 500), locked_at = null where id = p_job_id;
end;
$$;

revoke all on function public.claim_due_notification_jobs(integer) from public, anon, authenticated;
revoke all on function public.complete_notification_job(uuid) from public, anon, authenticated;
revoke all on function public.retry_notification_job(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.claim_due_notification_jobs(integer) to service_role;
grant execute on function public.complete_notification_job(uuid) to service_role;
grant execute on function public.retry_notification_job(uuid, text, boolean) to service_role;
grant execute on function public.create_jamaah(text, timestamptz, text, text, double precision, double precision, double precision, double precision) to authenticated;
grant execute on function public.list_discoverable_jamaahs() to authenticated;
grant execute on function public.get_jamaah_details(uuid) to authenticated;
grant execute on function public.join_jamaah(uuid) to authenticated;
grant execute on function public.cancel_jamaah(uuid) to authenticated;
grant execute on function public.conclude_jamaah(uuid) to authenticated;
grant execute on function public.register_device_token(text, text) to authenticated;
grant execute on function public.set_jamaah_notification_preference(boolean) to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.jamaahs;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.jamaah_participants;
exception when duplicate_object then null;
end $$;
