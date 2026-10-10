# Help & Support (screens 70–74)

The support flow follows the supplied reference: dark green headers, a rounded light content surface, compact support rows, expandable FAQs, a contact form with topic selection and a yellow send button, status badges with real update counts, and an assistant shortcut menu with a bottom message composer.

## Routes

- `/help`: Help Center, Contact Us, Terms & Conditions, Privacy Policy, Status Dashboard, About Us, and the AI assistant.
- `/faq`: expandable help topics and search.
- `/contact`: name, email, topic, subject, message, and optional booking/application reference. Sign-in is required for tracked submission; email and WhatsApp remain available to guests.
- `/manage/support-requests`: authenticated request list, status, update counts, expandable request details, and refresh.
- `/assistant`: flights, hotels, bookings, document navigation, local-recommendation prompt, and chat through the existing `/api/chat` service.
- `/travel-documents`: links to booking details and uploaded visa documents.

Profile → Help & Support opens this flow.

## Backend

The mobile account backend exposes `POST /api/support/requests`, `GET /api/support/requests`, and `GET /api/support/requests/:id`. Records and updates are scoped to the authenticated account. Duplicate retries use the same UUID submission key and return the existing request. Client-supplied status fields are rejected.

Migration `012_support_requests.sql` creates `support_requests` and `support_request_updates`. It was applied to the configured shared database with explicit user approval, as a transaction containing only this migration. The database has no mobile migration ledger; no ledger was created or baselined and no other migrations were run. The migration is idempotent and remains checked in for reviewed deployment elsewhere.

New requests have status `new` and one acknowledgement update. Subsequent status changes and update messages are stored by the support team/backend workflow; the app displays the stored values. No example requests are inserted into the live database by this implementation. This API stores tracked requests; it does not send email notifications automatically.

The local account API is running the updated TypeScript source on port 4000. For later restarts:

```sh
cd lemonTripApp/LemonTrip_Mobile_app_backend
npm run dev
```

`EXPO_PUBLIC_API_URL` identifies this backend. The AI assistant requires the existing configured `GROQ_API_KEY` on the backend.

## Verification

Four API tests exercise real Express routes against a temporary PGlite database: field validation/authentication, persistence and retry protection, account-scoped details, and status/update-count refresh.

Headless Chrome at 390 × 844 verified support navigation, FAQ search/expansion, contact validation and successful submission, request status badges/counts/details/refresh, all assistant shortcuts, a chat reply, and preserved input on chat failure. Screenshots here contain synthetic fixture data. Browser request/chat tests used an isolated local API and test replies, with no real support requests or emails sent.

TypeScript checks pass for app and backend. ESLint passes for changed mobile files. The live local backend health and support authentication guard were checked separately. Native keyboard layout and operating-system email/WhatsApp handoff require device verification.
