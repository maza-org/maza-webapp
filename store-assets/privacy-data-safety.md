# Privacy And Data Safety Draft Answers

Use this as the working answer sheet for Google Play Data safety and Apple App Privacy. Confirm with legal/compliance before final submission.

## Summary

- Data is collected to create accounts, authenticate users, personalize learning, track progress, issue certificates, recommend pathways, show opportunities, support discussions, and maintain service security.
- Data is linked to the user account.
- Data is not sold.
- Data is not used for third-party advertising or tracking.
- The app does not request precise location, camera, contacts, photos, microphone, or advertising ID permissions in the current mobile configuration.
- Production API traffic should use HTTPS.
- Users should be able to request account/data deletion through the support contact or privacy policy process.

## Google Play Data Safety

### Data Collection

Answer `Yes`, the app collects user data.

Data types:

- Personal info: name, email address, phone number, date of birth, gender, occupation, education level, school, province, identity document number.
- App activity: course enrollments, lesson progress, quiz answers, course ratings, certificates, badges, points, assessment attempts, pathway assignment, forum posts.
- App info and performance: basic service events may be stored for account and security operations.
- Device or other IDs: account/user ID and authentication token are used to keep the user signed in.

### Purposes

- App functionality.
- Account management.
- Personalization.
- Analytics for internal learning progress and impact reporting.
- Developer communications for account recovery and important service messages.
- Fraud prevention, security, and compliance.

### Sharing

Answer `No` for sale of data.

Possible service sharing to disclose if enabled in production:

- SMS provider for OTP/password recovery messages.
- Email provider for password recovery and account communications.
- Hosting/database/object storage providers used to operate the service.
- External job/opportunity sources may be opened when users choose to apply.

### Security Practices

- Data is encrypted in transit: `Yes`, for production HTTPS endpoints.
- Users can request deletion: `Yes`, if a support/privacy deletion process is available.
- Independent security review: `No`, unless one has been completed.

## Apple App Privacy

### Data Used To Track Users

No.

### Data Linked To The User

- Contact Info: name, email address, phone number.
- Identifiers: user ID, username, authentication/session identifiers.
- User Content: forum posts, course ratings, quiz/assessment responses where submitted by the user.
- Usage Data: course enrollment, lesson progress, points, badges, certificates, pathway assignment, job application actions.
- Sensitive Info / Other Data: identity document number, date of birth, gender, province, education level, occupation. Apple category selection should be reviewed carefully because some of these may map to Sensitive Info or Other Data depending on App Store Connect's exact prompts.

Purposes:

- App Functionality.
- Personalization.
- Analytics.
- Account Management.

### Data Not Linked To The User

None intentionally collected in the current app.

### Permissions

No camera, contacts, photos, precise location, microphone, or tracking permission is currently declared in `app.json`.

## Privacy Policy Gaps To Confirm

- Live privacy policy URL.
- Support/deletion email.
- Retention period for inactive accounts and logs.
- Whether production SMS/email providers are enabled.
- Whether analytics, crash reporting, or push notification SDKs will be added before launch.
