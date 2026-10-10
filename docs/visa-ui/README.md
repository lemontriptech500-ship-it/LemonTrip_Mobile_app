# Visa services UI and verification

The mobile visa flow follows reference screens 44–49: Visa Services, Service Details, Application, Document Upload, Status Tracking, and Application Details. Screens use light headers, compact white cards, selectable country rows, and green action buttons. Tracking and application details are separate views of the same saved record.

## Setup for live use

Set `EXPO_PUBLIC_VISA_API_URL` to the website visa backend origin (local example: `http://localhost:5000`). Set `EXPO_PUBLIC_API_URL` to the account backend. Both services must share the user database and compatible JWT settings. Restart Expo after changing public environment variables.

For local Expo development, start the visa server with the account API's signing key and database:

```sh
cd website/backendLemonTrip
npm run dev:mobile
```

This reads the mobile backend's `.env` for shared authentication and leaves the website's signing-key configuration unchanged. The local app `.env` must contain `EXPO_PUBLIC_API_URL=http://localhost:4000` and `EXPO_PUBLIC_VISA_API_URL=http://localhost:5000`. Restart Expo after editing `.env`.

Apply website database migrations before using the updated API:

```sh
cd website/backendLemonTrip
npm run db:migrate
```

Migration `006_visa_application_details.sql` adds date-of-birth storage and a unique submission key per account. Existing applications retain nullable date-of-birth values. Configure the backend's existing S3 settings for live document storage.

`EXPO_PUBLIC_VISA_DEMO_MODE=true` permits fixture browsing when no visa API is configured; demo applications cannot be submitted.

## Verified

A headless Chrome run at 390 × 844 exercised the actual Expo web app against an isolated Express API using the production visa controllers and authentication middleware. A temporary PGlite database ran both visa schema migrations. Multipart file parsing used an in-memory test adapter with fixture storage URLs; no live S3 bucket or real application records were used.

- Selected a country and continued to its matching service.
- Blocked incomplete applicant details and accepted valid name, birth date, passport, email, and travel date.
- Preserved applicant values when navigating back from uploads.
- Selected all three fixture files using Chrome's file-input API.
- Submitted a real multipart request and verified its saved application ID and document flags.
- Displayed saved applicant, passport, birth date, travel date, and status values.
- Refreshed submitted, in-review, approved, and rejected statuses.
- Displayed the submitted record in application history.
- Repeated a multipart request with the same submission key: returned the same application ID and stored exactly one record.
- Confirmed anonymous application tracking returns HTTP 401.

TypeScript, ESLint for changed files, and backend visa/catalog/migration tests passed. Backend tests also cover malformed JSON, invalid dates, missing files, invalid submission keys, and ownership-scoped tracking.

Screenshots in this directory show the six views with synthetic test data. Native Android/iOS rendering, the operating-system document chooser, and live S3 document uploads/downloads still require device/deployment verification. Signed document links are validated as HTTPS and fetched afresh when opened.
