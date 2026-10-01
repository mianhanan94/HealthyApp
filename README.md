# HealthyApp

Health-first food and drinks ordering for Pakistan (Lahore and Faisalabad). Users get a
personal nutrition plan from their body details and order healthy meals, shakes and drinks
from our own stores, delivered by our own riders.

- **What we're building:** [`docs/SCOPE.md`](docs/SCOPE.md)
- **How it's built:** [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **Original product spec (reference only):** [`docs/product-spec.md`](docs/product-spec.md)

## Repository

| Path              | What                                                   |
| ----------------- | ------------------------------------------------------ |
| `apps/mobile`     | Customer app (Expo, React Native, Expo Router)         |
| `packages/shared` | Shared TypeScript: health maths, domain types (tested) |
| `docs`            | Scope and product spec                                 |

## Getting started

Requires Node 22.

```bash
npm install
cd apps/mobile
npx expo start
```

Then scan the QR code with **Expo Go** (Android / iOS), or press `a` for an Android emulator,
`i` for the iOS simulator (macOS only).

## Checks

Run from the repository root (CI runs the same on every PR):

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```
