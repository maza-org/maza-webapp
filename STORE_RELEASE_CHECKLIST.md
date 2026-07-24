# MAZA Mobile Store Release Checklist

## Production Backend

- API base URL: `https://backend.mazas.org/api`
- DigitalOcean backend health: `https://backend.mazas.org/health`
- Data source: DigitalOcean production backend/database

## Expo/EAS

- Expo project: `@mazaapp4/maza`
- EAS project ID: `09ce1481-f9c9-46fd-b8f6-80a03a7e7c26`
- App Store Connect app ID: `6748351782`
- Android package: `org.maza.app`
- iOS bundle identifier: `org.maza.app`
- App version: `4.4.9`
- Android release: `4.4.9 (versionCode 95)`
- iOS release: `4.4.9 (build 4.4.14)`

## QA Before Store Submission

- Create account on a real Android device.
- Create account on iPhone/TestFlight.
- Login with email/username and password.
- Logout and confirm old sessions are cleared.
- Confirm courses load from DigitalOcean.
- Confirm course details, modules, lessons, videos, audio, transcripts and completion.
- Confirm the bot assessment recommends a pathway.
- Confirm jobs/opportunities load from DigitalOcean.
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

- Android EAS AAB (primary store artifact): `builds/MAZA-4.4.9-android-v95-eas.aab`
- Android local AAB (independent fallback): `builds/MAZA-4.4.9-android-v95-local.aab`
- Android release APK used for smoke testing: `builds/MAZA-4.4.9-android-v95-release.apk`
- iOS IPA: `builds/MAZA-4.4.9-ios-4.4.14.ipa`
- iOS EAS build ID: `5039008e-5c05-4ceb-a6a4-8973d881bca0`
- Android EAS build ID: `091b8f32-b1be-43bb-baac-d028fd35a455`
- Android Play status: `95 (4.4.9)` available to internal testers
- Android internal test link: `https://play.google.com/apps/internaltest/4701756380144814003`
- iOS EAS submission ID: `80cf576e-bf23-48d9-bba8-57799827790d`
- iOS submission status: `FINISHED` (delivered to App Store Connect/TestFlight)

## Completed Release Validation

- TypeScript check passed.
- Expo Doctor passed all 18 checks.
- Android and iOS production JavaScript bundles exported successfully.
- Android APK reports package `org.maza.app`, version `4.4.9`, version code `95`, minimum SDK 24 and target SDK 36.
- Android AAB uses the same upload certificate as the previous production AAB.
- Both Android AABs pass JAR signature verification and contain the DigitalOcean production API with no local API fallback.
- Android release APK installed and launched in BlueStacks with no fatal Android runtime exception.
- Android production API `https://backend.mazas.org/api` is embedded in the release.
- iOS IPA reports bundle `org.maza.app`, version `4.4.9`, build `4.4.14`, valid signing and an embedded provisioning profile.

## Submission Status

- Google Play internal testing: published successfully to the existing 19-member tester list.
- Google Play production: not promoted; complete internal acceptance testing first.
- App Store Connect/TestFlight: delivered successfully using the existing EAS API key.

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
