# Standalone Android APK

The preview build is a signed, installable APK. It runs directly on Android and
does not require Expo Go.

## Build

Prerequisites:

- Node.js and npm
- Access to the linked Expo project
- An authenticated EAS CLI session (`npm exec eas -- login`)

From the repository root:

```powershell
npm install
npm run test
npm run typecheck
npm run lint
npm run build:android:preview -- --non-interactive --wait
```

EAS prints an artifact URL when the build completes. Save the downloaded file as
`output/android/jamaa-next-door-preview.apk`.

## Install

Enable USB debugging, connect and authorize the Android device, then run:

```powershell
adb devices
adb install -r output/android/jamaa-next-door-preview.apk
```

Increment `expo.android.versionCode` in `apps/mobile/app.json` before publishing
each replacement build.

## Runtime configuration

The EAS `preview` environment currently has no project variables. The APK starts
and its local/static prototype behavior works, but live backend, map, geocoding,
and notification flows still require the corresponding services and public
client configuration.
