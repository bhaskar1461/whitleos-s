# Whiteleo's Mobile

Premium React Native / Expo app for the Whiteleo's platform.

## What It Includes

- Landing screen with Whiteloo brand styling
- Login and signup flows against the existing Next.js backend
- Member dashboard with drink preference controls
- Meal plan, workout, steps, journal, progress, and contact tools
- Admin console for users, waitlist, locations, and analytics

## Backend Requirement

This app talks to the existing web platform API. Set the API base URL before starting Expo.

Copy `.env.example` to `.env` and update:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.7:3000
```

Use your laptop's LAN IP when testing on a phone. For a deployed backend, use your public HTTPS URL instead.

## Run Locally

```bash
cd mobile-expo
npm install
npm run start
```

Then:

1. Open Expo Go on Android
2. Scan the QR code shown in the terminal/browser
3. Make sure your phone and laptop are on the same Wi-Fi

## Useful Commands

```bash
npm run android
npm run web
npm run typecheck
```

## Notes

- The app uses Expo Router with screens defined in `src/app/`
- Session requests use the same Whiteleo's API endpoints as the web app
- Admin login can use `admin@123` / `admin123` if the backend is running with the local bootstrap logic
