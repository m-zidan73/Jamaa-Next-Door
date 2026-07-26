# Mobile Architecture

## Dependency direction

```text
Expo Router routes -> feature screens/components -> controller hooks
                                         |-> domain models and pure utilities
                                         |-> repository/service ports
Concrete adapters -> Supabase, SecureStore, Expo Location, Expo Image Picker
```

Routes and components render state and forward user actions. Controller hooks own
screen state and orchestration. Ports define the operations controllers and use
cases need without exposing Supabase or Expo SDK types.

## Assembly

`AppProvider` is the mobile composition root. `app-dependencies.ts` creates the
default adapters once and `DependenciesProvider` makes those interfaces available
to controllers. Tests can provide alternate implementations without modifying
screens or global mutable state.

## Boundaries

- `src/features`: screen-specific models, controller hooks, and focused UI parts.
- `src/ports`: auth, jamaah, image-library, and location contracts.
- `src/services`: concrete Supabase and Expo adapters plus dependency assembly.
- `src/navigation/routes.ts`: application route destinations.
- `src/lib`: compatibility helpers and infrastructure clients; feature code does
  not call concrete clients directly.

Supabase configuration remains optional. Configless prototype behavior and error
messages are preserved, while live data operations require the public mobile
credentials described in `.env.example`.
