# Release Signing And Versioning

## Current App IDs

- Android package: `org.maza.app`
- iOS bundle identifier: `org.maza.app`
- App version: `4.4.6`
- EAS remote iOS build number: `5`
- EAS remote Android version code: `85`
- Expo owner: `olexmaza`
- EAS project ID in `app.json`: `3e6789ad-3ae3-434d-b809-66bb93251a3b`

## EAS Build Configuration

`mobile/eas.json` uses:

- `appVersionSource`: `remote`
- `production.autoIncrement`: `true`
- production API: `https://backend.mazas.org/api`

This means EAS should manage build number/version code increments for production builds. Confirm the remote EAS project settings before the first store upload.

## Build Commands

```bash
cd "C:\Users\User\Documents\Antigravity Projects\maza-codex-copy\mobile"
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

## Submit Commands

```bash
cd "C:\Users\User\Documents\Antigravity Projects\maza-codex-copy\mobile"
npx eas-cli submit --profile production --platform android
npx eas-cli submit --profile production --platform ios
```

## Signing Notes

- Android signing should be managed by EAS credentials for the `org.maza.app` package.
- iOS signing should be managed through the Apple Developer Team connected to EAS for `org.maza.app`.
- `ITSAppUsesNonExemptEncryption` is set to `false` in `app.json`.
- Do a final build with production environment variables and test login, course loading, opportunities, profile, certificates, and logout before submission.

## Pre-Submission Checks

- Confirm live privacy policy URL is reachable.
- Confirm support email is monitored.
- Confirm reviewer account works in production.
- Confirm production backend health endpoint is reachable.
- Confirm no staging/local API URL is present in the production binary.
- Confirm screenshots and store text do not show placeholder credentials.
