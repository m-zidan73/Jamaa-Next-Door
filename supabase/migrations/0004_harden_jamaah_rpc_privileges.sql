revoke all on function public.can_view_exact_location(public.jamaahs, uuid) from public, anon, authenticated;
alter function public.can_view_exact_location(public.jamaahs, uuid) security invoker;
grant execute on function public.can_view_exact_location(public.jamaahs, uuid) to authenticated;
revoke all on function public.create_jamaah(text, timestamptz, text, text, double precision, double precision, double precision, double precision) from public, anon;
revoke all on function public.list_discoverable_jamaahs() from public, anon;
revoke all on function public.get_jamaah_details(uuid) from public, anon;
revoke all on function public.join_jamaah(uuid) from public, anon;
revoke all on function public.cancel_jamaah(uuid) from public, anon;
revoke all on function public.conclude_jamaah(uuid) from public, anon;
revoke all on function public.register_device_token(text, text) from public, anon;
revoke all on function public.set_jamaah_notification_preference(boolean) from public, anon;

create policy notification_jobs_service_only on public.notification_jobs for all using (false) with check (false);
create policy jamaah_images_authorized_read on storage.objects for select to authenticated using (
  bucket_id = 'jamaah-location-images' and exists (
    select 1 from public.jamaahs j where j.exact_photo_path = name and public.can_view_exact_location(j, auth.uid())
  )
);
create index if not exists notification_jobs_due_idx on public.notification_jobs(status, run_at);
create index if not exists notification_jobs_jamaah_idx on public.notification_jobs(jamaah_id);
create index if not exists notifications_jamaah_idx on public.notifications(jamaah_id);
create index if not exists notifications_profile_idx on public.notifications(profile_id);
