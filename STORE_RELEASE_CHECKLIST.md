# MAZA Mobile Store Release Checklist

## Production Backend

- API base URL: `https://backend.mazas.org/api`
- Railway backend health: `https://backend.mazas.org/health`
- Data source: Railway SQLite volume at `/data/dev.db`

## Expo/EAS

- Expo project: `@jkedsevene/maza`
- EAS project ID: `3e6789ad-3ae3-434d-b809-66bb93251a3b`
- Android package: `org.maza.app`
- iOS bundle identifier: `org.maza.app`
- App version: `4.4.6`
- EAS remote iOS build number: `5`
- EAS remote Android version code: `85`

## QA Before Store Submission

- Create account on a real Android device.
- Create account on iPhone/TestFlight.
- Login with email/username and password.
- Logout and confirm old sessions are cleared.
- Confirm courses load from Railway.
- Confirm course details, modules, lessons, videos, audio, transcripts and completion.
- Confirm the bot assessment recommends a pathway.
- Confirm jobs/opportunities load from Railway.
- Confirm profile edit and password change.
- Confirm push/email/SMS integrations that have production keys configured.

## Build Commands

```bash
cd "C:\Users\User\Documents\Antigravity Projects\maza-codex-copy\mobile"
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

## Latest Production Builds

- Android AAB, versionCode 3: `https://expo.dev/artifacts/eas/bophpdbGxHW7bXf2mymE1p.aab`
- iOS IPA, buildNumber 4: `https://expo.dev/artifacts/eas/azEvKby4bULXBB96MLfEG3.ipa`
- Android build logs: `https://expo.dev/accounts/olexmaza/projects/maza/builds/541c1919-e7f8-40c8-98cf-02e124595d4f`
- iOS build logs: `https://expo.dev/accounts/olexmaza/projects/maza/builds/4d9586d7-b0d7-4222-9539-80703507f6ba`

## Submit Blockers

- Google Play upload needs a Google Service Account Key configured in EAS Submit or an interactive `eas submit` run.
- App Store Connect upload needs `ascAppId` in `eas.json` or an interactive `eas submit` run.

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
