# Jamaa-Next-Door
A platform to unify Muslims

Jamaa Next Door is a monorepo scaffold for an Android-first prototype focused on helping Muslims in Germany discover, host, and join nearby congregational prayers while protecting sensitive location, chat, and verification data.

## Included

- `apps/mobile`: Expo Router + React Native + TypeScript mobile app.
- `apps/admin`: Next.js administrator portal for selfie review, reports, chats, and audit logs.
- `packages/core`: Shared domain helpers and tests for prayer timing, host succession, and access rules.
- `supabase`: PostgreSQL/PostGIS schema, row-level security policies, SQL functions, and seed data.

## Requirements Coverage

- Android-only mobile client with localized onboarding and settings for English, German, and Turkish.
- Magic-link authentication with profile setup and selfie verification workflow.
- Prayer Times, Jama'ahs, and Settings implemented as first-class features.
- Qibla, Quran, and Azkar navigation slots remain visible and route to localized Coming Soon screens.
- Germany-only discovery and creation assumptions enforced in app logic and database functions.
- Exact address protection separated from approximate discovery data.
- Admin review and moderation schema prepared in Supabase and surfaced in the web portal.

## Environment

Copy `.env.example` to the appropriate app-specific env files before running locally.

- Mobile app expects Expo public variables for Supabase, maps, and geocoding.
- Admin app expects server-side Supabase variables and the same project URL.
- Do not place a service-role key in the mobile app.

## Local Setup

1. Install dependencies with `npm install`.
2. Start Supabase locally or point to an EU-hosted Supabase project.
3. Run migrations from `supabase/migrations`.
4. Seed the database with `supabase/seed.sql`.
5. Start the mobile app with `npm run dev:mobile`.
6. Start the admin portal with `npm run dev:admin`.

## Testing

- `npm run test --workspace @jnd/core`

The current tests cover core timing, host succession, and authorization helpers. Integration tests are scaffolded via SQL policies and function boundaries but still need a live Supabase test environment plus credentials.

## Delivery Notes

- This repository includes real integration points and database policies, but it cannot be executed end-to-end until you supply Supabase, Expo push, and map/geocoding credentials.
- Chat, moderation, and exact-address protection are designed to be enforced server-side through SQL functions and RLS, not only through client checks.
