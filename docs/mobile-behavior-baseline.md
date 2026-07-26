# Mobile Behavior Baseline

This document records the observable Android prototype behavior before architectural refactoring.

## Startup and Navigation

- The root route redirects to `/(auth)/login` on every cold start; there is no session-aware startup gate.
- Login links can open profile setup or bypass authentication and open the prototype shell.
- The shell exposes Jama'ah, Prayer, Qibla, Quran, Azkar, and Settings tabs.
- Jama'ah links open creation and a `demo` details route. Android back behavior is supplied by Expo Router.

## Active Interactions

- Login sends a Supabase magic-link request when public credentials exist and otherwise displays a configuration message.
- Profile setup stores display name, optional phone, and adult consent only in form memory; it does not submit.
- Create Jama'ah validates prayer, delay, optional custom delay, address length, and an optional image URI. It requests photo-library permission, allows image selection, and renders a review summary; it does not publish.
- Prayer times are calculated locally for fixed Frankfurt coordinates with the `adhan` package.
- Settings changes English, German, or Turkish immediately in memory. The current Zustand store does not persist the override across process death.
- Qibla, Quran, Azkar, notifications, report/block, and account-deletion routes are placeholders.

## State and Lifecycle

- Expo configuration locks Android to portrait orientation.
- There is no explicit AppState, rotation, animation, gesture, audio, or notification lifecycle controller.
- Form and UI state normally survive a brief background/foreground transition while Android retains the process, but reset after process death.
- Supabase auth sessions use Expo SecureStore when Supabase is configured.

## External Boundaries

- Screens and helpers directly reference Expo Router, Supabase, SecureStore, image picker, location, localization, i18n, Zustand, and TanStack Query.
- Jama'ah helper functions use the existing `list_discoverable_jamaahs`, `create_jamaah`, and `join_jamaah` RPC contracts.
- Exact-location authorization remains a server/RLS responsibility. No service-role credential may be used by the mobile app.

## Baseline Verification

- Existing core tests: 7 passing.
- Android JavaScript export: passing.
- Expo dependency compatibility: passing.
- Pre-refactor mobile issues recorded during inspection: two TypeScript errors and one lint warning, corrected without intended runtime behavior changes in the characterization-test phase.
