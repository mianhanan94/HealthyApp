# HealthyApp

A React Native mobile app built with [Expo](https://expo.dev) and TypeScript.

## Getting started

```bash
npm install
npm start          # starts the Expo dev server
```

Then:

- **Phone:** install the **Expo Go** app (Android / iOS) and scan the QR code shown in the terminal.
- **Android emulator:** press `a` in the terminal (or `npm run android`).
- **iOS simulator (macOS only):** press `i` (or `npm run ios`).
- **Browser:** press `w` (or `npm run web`).

## Checks

```bash
npx tsc --noEmit   # typecheck
npx expo-doctor    # check dependency/config issues
```

## Project structure

- `App.tsx` – the app's root screen (currently a daily water-intake tracker)
- `index.ts` – entry point that registers the root component
- `app.json` – Expo app config (name, icons, splash, etc.)
- `assets/` – app icons and images
