insert into public.profiles (id, display_name, email, locale, is_adult_confirmed)
values
  ('00000000-0000-0000-0000-000000000001', 'Admin Reviewer', 'admin@example.com', 'en', true),
  ('00000000-0000-0000-0000-000000000002', 'Demo User', 'user@example.com', 'en', true)
on conflict do nothing;

insert into public.selfie_verifications (profile_id, storage_path, status)
values
  ('00000000-0000-0000-0000-000000000001', 'selfies/admin.jpg', 'approved'),
  ('00000000-0000-0000-0000-000000000002', 'selfies/user.jpg', 'pending')
on conflict do nothing;

insert into public.admin_roles (profile_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict do nothing;
