# MAZA Mobile Store Release Checklist

## Production Backend

- API base URL: `https://backend.mazas.org/api`
- Hetzner backend health: `https://backend.mazas.org/health`
- Data source: Hetzner production backend/database

## Expo/EAS

- Expo project: `@mazaapp4/maza`
- EAS project ID: `09ce1481-f9c9-46fd-b8f6-80a03a7e7c26`
- App Store Connect app ID: `6748351782`
- Android package: `org.maza.app`
- iOS bundle identifier: `org.maza.app`
- App version: `4.4.8`
- Latest Google Play Android production: `4.4.8 (versionCode 88)`
- Next Android build configured locally: `4.4.8 (versionCode 89)`
- Latest App Store Connect/TestFlight iOS build: `4.4.7 (4.4.9)`
- Next iOS build configured locally: `4.4.8 (4.4.10)`

## QA Before Store Submission

- Create account on a real Android device.
- Create account on iPhone/TestFlight.
- Login with email/username and password.
- Logout and confirm old sessions are cleared.
- Confirm courses load from Hetzner.
- Confirm course details, modules, lessons, videos, audio, transcripts and completion.
- Confirm the bot assessment recommends a pathway.
- Confirm jobs/opportunities load from Hetzner.
- Confirm profile edit and password change.
- Confirm minutes-inside-app tracking: stay logged in on the new build for at least 2 minutes, then confirm the dashboard increases after refresh.
- Confirm push/email/SMS integrations that have production keys configured.

## Build Commands

```bash
cd "C:\Users\User\Documents\Antigravity Projects\maza-codex-copy\mobile"
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

## Latest Production Builds

- Build fresh Android and iOS artifacts for `4.4.8`; do not reuse Android `versionCode 88` or the listed iOS `4.4.7` artifacts if the release must include July activity/minutes tracking.

## Submit Blockers

- Google Play upload needs a Google Service Account Key configured in EAS Submit or an interactive `eas submit` run.
- Google Play already has Android `versionCode 88`, so the next Android upload must use `89` or higher.
- App Store Connect upload may still need an interactive Apple session or API key, but `ascAppId` is configured in `eas.json`.

## Submit Commands

```bash
cd "C:\Users\User\Documents\Antigravity Projects\maza-codex-copy\mobile"
npx eas-cli submit --profile production --platform android
npx eas-cli submit --profile production --platform ios
```

## Store Assets Needed

- Privacy policy URL: see `store-assets/privacy-data-safety.md`.
- Support/contact email: add the monitored production email before submission.
- Android Play Console access.
- Apple Developer Program access.
- App screenshots: generated in `store-assets/screenshots/`.
- App description in Portuguese and English: drafted in `store-assets/store-listing.md`.
- Data safety answers for Google Play: drafted in `store-assets/privacy-data-safety.md`.
- App privacy answers for Apple App Store: drafted in `store-assets/privacy-data-safety.md`.
- Reviewer/demo access: drafted in `store-assets/reviewer-access.md`.
- Release signing/versioning notes: drafted in `store-assets/release-signing-versioning.md`.
