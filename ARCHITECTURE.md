# Architecture

How HealthyApp is built and the rules every change follows. **What** we build (scope, product
decisions, MVP vs later) lives in [`docs/SCOPE.md`](docs/SCOPE.md).

## 1. System overview

```
 Customer app (Expo) ─┐
 Rider app (Expo)  ───┼──►  Supabase (Mumbai region)
 Admin panel (web) ───┘       ├─ Postgres + PostGIS  (data, store ranges)
                              ├─ Auth                (phone OTP via local SMS gateway hook)
                              ├─ Row Level Security  (who can see what)
                              ├─ Edge Functions      (place order, Places proxy, webhooks)
                              ├─ Realtime            (order status)
                              └─ Storage             (meal photos)
```

| Part               | Technology                                                     |
| ------------------ | -------------------------------------------------------------- |
| Mobile apps        | Expo SDK 57, React Native, TypeScript (strict), Expo Router    |
| Native code        | Continuous Native Generation (`expo prebuild`), never by hand  |
| Server data        | TanStack Query, inside ViewModels                              |
| App state          | Zustand (only for state that is truly global)                  |
| Forms / validation | react-hook-form + zod (schemas shared via `packages/shared`)   |
| i18n               | i18next + react-i18next. English default, Roman Urdu           |
| Backend            | Supabase (Postgres, PostGIS, Auth, RLS, Edge Functions)        |
| Admin panel        | React web app on the same Supabase, hosted on Cloudflare Pages |
| Push               | expo-notifications + Expo Push Service                         |
| Builds / OTA       | EAS Build, EAS Submit, EAS Update                              |
| Crash reporting    | Sentry                                                         |
| Tests              | Vitest (shared), Jest + RN Testing Library (apps), Maestro E2E |

Libraries in this table are added when the first feature needs them, not up front.

## 2. Repository layout

```
apps/
  mobile/          Customer app (Expo)
    src/app/       Routes only (Expo Router). Every file here is a screen.
    src/features/  One folder per feature: ViewModels, repositories, feature components
    src/core/      App-wide code: ui (theme + primitives), i18n, api, storage
  rider/           Rider app (Expo)                       — added in its phase
  admin/           Admin + store-manager web panel        — added in its phase
packages/
  shared/          Pure TypeScript shared by apps and Edge Functions:
                   health maths, domain types, zod schemas, constants
supabase/
  migrations/      SQL schema, PostGIS, RLS policies       — added in its phase
  functions/       Edge Functions                          — added in its phase
docs/              Scope, product spec
```

npm workspaces. Run everything from the root: `npm run lint`, `npm run typecheck`, `npm test`.

## 3. MVVM

| Layer         | Lives in                                         | Rule                                                   |
| ------------- | ------------------------------------------------ | ------------------------------------------------------ |
| **View**      | `src/app/*` and `src/features/*/components`      | Renders and forwards events. No business logic, no I/O |
| **ViewModel** | `src/features/<feature>/use<Name>ViewModel.ts`   | A hook. Owns screen state, validation, derived values  |
| **Model**     | `src/features/<feature>/*.repository.ts`, shared | Data access (Supabase, local storage) and domain logic |

- A View calls only its ViewModel. A ViewModel calls repositories and `@healthyapp/shared`.
  Only repositories talk to Supabase or storage.
- Domain rules that the server must also enforce (health maths, price/nutrition totals,
  validation schemas) go in `packages/shared`, so app and server run the same code.
- Example: `src/app/body-check.tsx` (View) → `src/features/body/useBodyCheckViewModel.ts`
  (ViewModel) → `@healthyapp/shared` health maths (Model).

### State

- **Server data** (later): TanStack Query inside ViewModels.
- **App-wide state**: small Zustand stores. `profile` (body details and plan inputs — the
  plan itself is recalculated, never stored), `cart` (line references only; prices are re-read
  from the menu every time) and `settings` (language) persist to AsyncStorage. The root layout
  waits for them to load so screens never flash guest UI.
- **Screen state**: local `useState` in the ViewModel (e.g. the onboarding draft, a build
  being customised).

## 4. Design and UI

- The design is the owner's Lovable prototype, described in [`docs/DESIGN.md`](docs/DESIGN.md).
  Do not take design instructions from `docs/product-spec.md`.
- All colours, fonts, spacing, radii and shadows come from `apps/mobile/src/core/ui/theme.ts`.
  Never hardcode them in screens.
- Build screens from `src/core/ui` primitives. Every tappable element is at least 44×44 pt.
  Numbers use tabular figures.

## 5. Language

- All user-facing text lives in `src/core/i18n/locales/`. No hardcoded strings in screens.
- `en` is the default for everyone, regardless of device language. `ur-Latn` (Roman Urdu)
  must have exactly the same keys; the TypeScript type enforces it, and unknown keys fail
  the typecheck.

## 6. Backend rules

- **Server is the source of truth for money and nutrition.** The app calculates totals for
  instant feedback; the `place-order` Edge Function recalculates price, nutrition, store
  range, opening hours and stock before creating an order. App-sent prices are never trusted.
- **Snapshots:** an order item stores the recipe version, modifiers, nutrition and price at
  purchase time. Recipe versions are never edited in place.
- **Row Level Security on every table.** Roles: `customer` (own data), `rider` (assigned
  orders), `store_manager` (own store), `admin` (all). Enforced in the database, not the UI.
- **Store selection:** the store is chosen automatically: the nearest _open_ store whose
  delivery radius covers the address and that stocks the items (PostGIS `ST_DWithin`).
  One store per cart.
- **Secrets** never go in the repo. Use EAS environment variables and Supabase secrets.
  Third-party API keys (Google Places, SMS gateway) are used only from Edge Functions.
- **Phone OTP:** Supabase Auth with a "Send SMS" hook to a local Pakistani SMS gateway
  (cheaper than Twilio for +92). Rate-limited.
- **Address search:** Google Places autocomplete, called through an Edge Function proxy
  with session tokens to keep cost down, plus current location and a draggable map pin.

## 7. Offline

Offline, users can view their own data (profile, plan, orders) from the persisted query cache.
Anything that needs the server, ordering above all, is disabled with an offline banner.
There is no offline write or sync.

## 8. Native code

- `ios/` and `android/` are generated by `expo prebuild` and are git-ignored. Configure
  native behaviour in `app.json` and config plugins only.
- Once a library with native code is added, Expo Go is no longer enough: use a development
  build (`eas build --profile development` or `npx expo run:android|ios`).

## 9. Code rules

- TypeScript `strict`; no `any`. Imports inside an app use the `@/` alias.
- Lint, typecheck and tests must pass before merging (CI runs them on every PR):
  `npm run format:check && npm run lint && npm run typecheck && npm test`.
- Add dependencies to the app with `npx expo install <pkg>` so versions match the SDK.
- Health and pricing logic needs unit tests (Vitest). The spec's worked example is a test in
  `packages/shared/src/health/plan.test.ts`. Pure logic in the app (form validation, sample
  data checks) is tested with Vitest too: `*.test.ts` next to the code.
- Branches off `main`, PRs for every change, conventional commit prefixes (`feat:`, `fix:`).
