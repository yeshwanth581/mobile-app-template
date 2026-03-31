# Leben in Deutschland App Template

Expo Router starter for single-test prep apps.

## Current state

- Built for `Leben in Deutschland`
- Bundles `33` questions locally so the mock exam flow is testable end to end
- Uses local persistence with Zustand + AsyncStorage
- Supports `de` and `en` UI/testing right now
- Ad and subscription code is scaffolded, but Expo Go testing uses the placeholder banner

## Run

```bash
npm install
npx expo start
```

Open the project in Expo Go on iOS or Android.

## What to swap for the next app

1. Replace [`src/data/questions.ts`](/Users/yeshwanthgollapalli/Desktop/ryg apps/template/src/data/questions.ts)
2. Update [`src/config/app.config.ts`](/Users/yeshwanthgollapalli/Desktop/ryg apps/template/src/config/app.config.ts)
3. Adjust `app.json` package identifiers and display name
4. Add store assets and native monetization config when moving beyond Expo Go

## Before production

- Replace the starter question bank with the full official catalog
- Add real app icons and splash assets
- Add remaining UI locales only when their strings are fully translated
- Re-enable AdMob and RevenueCat in a development build or EAS build
