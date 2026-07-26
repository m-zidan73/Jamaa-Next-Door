create extension if not exists postgis;
create extension if not exists pgcrypto;

create type verification_status as enum ('not_submitted', 'pending', 'approved', 'rejected');
create type jamaah_status as enum ('scheduled', 'active', 'concluded');
create type report_target_type as enum ('user', 'jamaah', 'message');
create type deletion_request_status as enum ('pending', 'approved', 'rejected', 'completed');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  phone text,
  locale text not null default 'en',
  calculation_method text not null default 'MWL',
  madhhab text not null default 'auto',
  is_adult_confirmed boolean not null default false,
  congregational_prayers_joined integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.selfie_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  status verification_status not null default 'not_submitted',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_roles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.jamaahs (
  id uuid primary key default gen_random_uuid(),
  prayer_name text not null,
  status jamaah_status not null default 'scheduled',
  host_profile_id uuid references public.profiles(id) on delete set null,
  hidden_secondary_host_id uuid references public.profiles(id) on delete set null,
  starts_at timestamptz not null,
  country_code text not null default 'DE',
  approximate_point geography(point, 4326) not null,
  exact_point geography(point, 4326) not null,
  exact_address text not null,
  exact_photo_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.jamaah_participants (
  id uuid primary key default gen_random_uuid(),
  jamaah_id uuid not null references public.jamaahs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  left_at timestamptz,
  is_active boolean not null default true,
  unique (jamaah_id, profile_id)
);

create table if not exists public.attendance_confirmations (
  id uuid primary key default gen_random_uuid(),
  jamaah_id uuid not null references public.jamaahs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  attended boolean not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (jamaah_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  jamaah_id uuid not null references public.jamaahs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 500),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  description text,
  blocked_profile_id uuid,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_profile_id uuid not null references public.profiles(id) on delete cascade,
  blocked_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (blocker_profile_id, blocked_profile_id)
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text not null default 'android',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status deletion_request_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid,
  reason text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_roles
    where profile_id = user_id
    limit 1
  );
$$;

create or replace function public.list_discoverable_jamaahs()
returns table (
  id uuid,
  prayer_name text,
  status jamaah_status,
  starts_at timestamptz,
  approximate_lat double precision,
  approximate_lng double precision
)
language sql
security definer
as $$
  select
    j.id,
    j.prayer_name,
    j.status,
    j.starts_at,
    st_y(j.approximate_point::geometry) as approximate_lat,
    st_x(j.approximate_point::geometry) as approximate_lng
  from public.jamaahs j
  where j.country_code = 'DE'
    and j.status <> 'concluded';
$$;

create or replace function public.get_jamaah_details(target_jamaah_id uuid)
returns table (
  id uuid,
  prayer_name text,
  status jamaah_status,
  starts_at timestamptz,
  approximate_lat double precision,
  approximate_lng double precision,
  exact_address text,
  exact_lat double precision,
  exact_lng double precision,
  exact_photo_path text
)
language sql
security definer
as $$
  select
    j.id,
    j.prayer_name,
    j.status,
    j.starts_at,
    st_y(j.approximate_point::geometry) as approximate_lat,
    st_x(j.approximate_point::geometry) as approximate_lng,
    case when public.can_view_exact_location(j, auth.uid()) then j.exact_address else null end,
    case when public.can_view_exact_location(j, auth.uid()) then st_y(j.exact_point::geometry) else null end,
    case when public.can_view_exact_location(j, auth.uid()) then st_x(j.exact_point::geometry) else null end,
    case when public.can_view_exact_location(j, auth.uid()) then j.exact_photo_path else null end
  from public.jamaahs j
  where j.id = target_jamaah_id;
$$;

create or replace function public.create_jamaah(
  p_prayer_name text,
  p_starts_at timestamptz,
  p_exact_address text,
  p_exact_photo_path text,
  p_approximate_lat double precision,
  p_approximate_lng double precision,
  p_exact_lat double precision,
  p_exact_lng double precision
)
returns public.jamaahs
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
  created_row public.jamaahs;
begin
  insert into public.jamaahs (
    prayer_name,
    status,
    host_profile_id,
    starts_at,
    country_code,
    approximate_point,
    exact_point,
    exact_address,
    exact_photo_path
  )
  values (
    p_prayer_name,
    'scheduled',
    case when exists (
      select 1
      from public.profiles
      where id = current_user_id
    ) then current_user_id else null end,
    p_starts_at,
    'DE',
    st_setsrid(st_makepoint(p_approximate_lng, p_approximate_lat), 4326)::geography,
    st_setsrid(st_makepoint(p_exact_lng, p_exact_lat), 4326)::geography,
    p_exact_address,
    p_exact_photo_path
  )
  returning * into created_row;

  return created_row;
end;
$$;

create or replace function public.can_view_exact_location(jamaah_row public.jamaahs, user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.selfie_verifications sv
    join public.jamaah_participants jp
      on jp.profile_id = sv.profile_id
     and jp.jamaah_id = jamaah_row.id
     and jp.is_active = true
    where sv.profile_id = user_id
      and sv.status = 'approved'
  );
$$;

create or replace function public.join_jamaah(target_jamaah_id uuid)
returns public.jamaah_participants
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
  verification_state verification_status;
  inserted_row public.jamaah_participants;
begin
  select status into verification_state
  from public.selfie_verifications
  where profile_id = current_user_id
  order by created_at desc
  limit 1;

  if verification_state is distinct from 'approved' then
    raise exception 'Verification required';
  end if;

  insert into public.jamaah_participants (jamaah_id, profile_id)
  values (target_jamaah_id, current_user_id)
  on conflict (jamaah_id, profile_id) do update
    set is_active = true,
        left_at = null
  returning * into inserted_row;

  update public.jamaahs
  set hidden_secondary_host_id = coalesce(hidden_secondary_host_id, current_user_id),
      host_profile_id = coalesce(host_profile_id, current_user_id),
      updated_at = timezone('utc', now())
  where id = target_jamaah_id;

  return inserted_row;
end;
$$;

create or replace function public.leave_jamaah(target_jamaah_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
  next_host uuid;
begin
  update public.jamaah_participants
  set is_active = false,
      left_at = timezone('utc', now())
  where jamaah_id = target_jamaah_id
    and profile_id = current_user_id;

  select profile_id into next_host
  from public.jamaah_participants
  where jamaah_id = target_jamaah_id
    and is_active = true
  order by joined_at asc
  limit 1;

  update public.jamaahs
  set host_profile_id = next_host,
      updated_at = timezone('utc', now())
  where id = target_jamaah_id
    and host_profile_id = current_user_id;
end;
$$;

create or replace function public.conclude_due_jamaahs()
returns integer
language plpgsql
security definer
as $$
declare
  affected_count integer;
begin
  update public.jamaahs
  set status = 'concluded',
      updated_at = timezone('utc', now())
  where status <> 'concluded'
    and starts_at + interval '5 minutes' <= timezone('utc', now());

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

alter table public.profiles enable row level security;
alter table public.selfie_verifications enable row level security;
alter table public.jamaahs enable row level security;
alter table public.jamaah_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

create policy "selfie_select_own_or_admin"
on public.selfie_verifications for select
using (profile_id = auth.uid() or public.is_admin(auth.uid()));

create policy "jamaahs_select_approximate"
on public.jamaahs for select
using (country_code = 'DE');

create policy "participants_select_own"
on public.jamaah_participants for select
using (profile_id = auth.uid() or public.is_admin(auth.uid()));

create policy "messages_select_joined_or_admin"
on public.messages for select
using (
  public.is_admin(auth.uid()) or exists (
    select 1
    from public.jamaah_participants jp
    where jp.jamaah_id = messages.jamaah_id
      and jp.profile_id = auth.uid()
      and jp.is_active = true
  )
);

create policy "messages_insert_joined_only"
on public.messages for insert
with check (
  exists (
    select 1
    from public.jamaah_participants jp
    where jp.jamaah_id = messages.jamaah_id
      and jp.profile_id = auth.uid()
      and jp.is_active = true
  )
);
