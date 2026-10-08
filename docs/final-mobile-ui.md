# Final LemonTrip mobile UI

The supplied mobile brief is implemented using the existing forest green/yellow onboarding direction, Manrope typography, rounded white cards, outline service icons, and `assets/images/web_logo_news.png` for the shared navigation brand. Routes below omit the Expo `(tabs)` group where it is optional in URLs.

Bottom navigation is **Home | Explore | My Trips | Wallet | Profile**. Discovery, services, favourites, support, and the assistant remain accessible within those destinations. `/assistant` is the only conversational assistant; the former planner route redirects there and Help links to it. Conversations reset when the account changes.

## Brief coverage

Related stages deliberately reuse the shared checkout, account, or booking-detail screen, while retaining their distinct entry points and selected journey. The brief's 86 items are mapped here.

| Brief items | Screens / UI |
| --- | --- |
| 1–2 Splash, 2–3 onboarding screens | Native Expo splash + branded loading state, `/` three onboarding slides; returning users enter Home |
| 3–5 Login, signup, OTP | `/login`, `/signup`; existing verified Firebase phone OTP challenge/resend/verification UI within auth |
| 6 Recovery / reset | `/forgot-password`, `/reset-password`; phone sign-in alternative and account support |
| 7 Google login / setup | Existing Google login in auth; `/manage/account-setup`, `/manage/edit-profile` |
| 8 Home | Six service shortcuts, compact live flight search, offers, destinations, recent searches, featured packages/recommendations, travel stories, support and assistant |
| 9 Search | `/search` → `/manage/search`, unified service search; recent/saved searches |
| 10 Notifications | `/notifications` → `/manage/notifications`, booking updates and notification settings |
| 11–13 Flights, results, details | `/explore/flights` search/results/filters/sort; `/explore/flight-details` fare and itinerary details |
| 14–17 Flight travellers, seats/add-ons, payment, confirmation | Selection → cart → `/checkout` → `/add-ons` → `/review` → `/payment`; `/confirmation?bookingId=…` for an account booking |
| 18–20 Hotels, results, details | `/explore/hotels` search/results/filter/sort; `/explore/hotel-details` photos, property, amenities, policies |
| 21–24 Rooms, guests, payment, confirmation | Provider room selection within hotel details → cart → shared checkout/review/payment/confirmation |
| 25–28 Buses, results, details, seats | `/explore/buses` search/results/filters; `/explore/bus-details` route details and labelled seat-selection preview |
| 29–31 Bus passengers/payment/confirmation | Bus selection → cart → shared traveller/review/payment/confirmation |
| 32–34 Trains, results, details | `/explore/trains`; `/explore/train-details?id=…` catalog details and support |
| 35–37 Train passengers/payment/confirmation | Train details → prepare passengers → shared checkout/review/payment; confirmation requires an actual account booking |
| 38–43 Holidays, listing, details, booking/payment/confirmation | `/packages`, `/packages/[id]` expandable itinerary and inclusions; selection → cart → shared checkout/review/payment/confirmation |
| 44–47 Visa services/details/application/documents | `/explore/visa`, `/explore/visa/[id]`; existing application form and document upload within service detail |
| 48–49 Visa tracking / application details | `/explore/visa/applications`, `/visa-application/[id]`; provider status, applicant, reference, document history and secure document access |
| 50 My Trips | `/bookings`; account API bookings with All/Upcoming/Completed/Cancelled filters and refresh |
| 51–54 Details, ticket/voucher, cancellation/refunds, sharing | `/booking/[id]`, `?view=ticket`, `?view=refund`; booking reference, actual status/payment state, support, Share sheet and ticket/voucher request |
| 55 Wishlist | `/wishlist`; existing save/remove controls on discovery and packages |
| 56–57 Travellers/searches | `/manage/travellers` add/edit/remove names; saved-name selection in checkout; `/manage/saved-searches` and `/manage/recent-searches`, repeat/save/remove |
| 58 Wallet | `/wallet`, Wallet tab; verified balance when optional service is configured, website wallet access |
| 59–63 Transactions, top-up, methods, coupons, status | `/wallet/transactions`, `/wallet/add-money`, `/wallet/payment-methods`, `/wallet/coupons`, `/wallet/payment-status` |
| 64–67 Offers/stories and details | `/offers`, `/offers/[id]`, `/blog`, `/blog/[id]` |
| 68–69 Destinations and details | `/destinations`, `/destinations/[id]`; searchable inspiration/catalog, related packages and travel services |
| 70–74 Support, FAQ, contact, requests, assistant | `/help` (FAQ), `/contact`, `/manage/support-requests`, `/assistant` |
| 75–78 Profile/edit/personal information/my travellers | `/profile`, `/manage/edit-profile`, `/manage/personal-information`, `/manage/travellers` |
| 79–82 Security/notifications/language/currency | `/manage/security`, `/manage/notification-settings`, `/manage/language`, `/manage/currency`, `/settings` |
| 83–86 Privacy/terms/about/logout | `/privacy`, `/terms`, `/manage/about`; authenticated logout controls in Profile and Settings |

## Data and integration boundaries

- My Trips, booking details, notifications, and profile booking counts read the authenticated `/api/bookings` endpoint. They do not show another account's cached bookings. Local legacy booking storage remains available to the existing Android widget code; it is not the source for these account screens.
- Flights use the existing flight provider. Content uses the existing content API. Hotel room information and published itinerary data are displayed only when supplied.
- Bus seats are labelled as a local preview. Train fares/routes are catalog information. Flight seat/assistance choices are unconfirmed preferences. None of these selections reserves inventory.
- Shared checkout validates contact and traveller names, retains the selected cart, supports saved traveller names, preferences, review, and the existing payment UI. The current app has no connected payment gateway: payment submission stays disabled, and a UI action never invents a successful payment or confirmed booking.
- Confirmation requires the requested account booking ID, and distinguishes confirmed bookings from other statuses. Provider-issued tickets, cancellation/refund results, and downloadable ticket files are not supplied by the current API. The UI offers a document request, trip-detail sharing, and booking-reference support instead.
- Wallet top-ups/payment lookup/card vault/coupon redemption are not exposed by the current API. The native wallet screens show unavailable states. No sample balance, transaction, discount, or payment success is presented as real.
- Recovery/reset has a dedicated UI but is disabled until the backend supports secure reset tokens. Profile editing has an optional adapter; support request tracking is unavailable. Existing OTP and Google authentication remain the working auth entry points.
- Saved names/searches and preferences are scoped to the account (or guest) on the current device. Notification selections are local choices, not claims of server delivery changes. English is the available interface language. A preferred currency does not silently convert provider fares.
- One assistant uses the existing chat endpoint. The backend still controls assistant context and must supply current booking/provider/support information.

## Optional adapter contracts

Add nonsecret public endpoint configuration in `.env` only when the appropriate service is available; placeholders are documented in `.env.example`.

- `EXPO_PUBLIC_WALLET_API_URL`: service base. `GET /wallet` returns `{ balance: number, currency: ISO4217, status: string }`. `GET /wallet/transactions?page=1&limit=20` returns `{ transactions: [{ id, description, amount, status, date }] }`. Both require the current Bearer token.
- `EXPO_PUBLIC_ACCOUNT_API_URL`: service base. `PATCH /profile` accepts `{ name, email, phone }` with Bearer authentication. Save remains disabled without this adapter. The account service remains responsible for verifying contact changes.
- `EXPO_PUBLIC_CONTACT_URL`: exact POST endpoint accepting `{ name, email, phone, subject, message }`; otherwise contact composes an email to the website's published support address.
- `EXPO_PUBLIC_WEBSITE_URL`: website base for wallet access, default `https://lemontrip.in`. Website sign-in is separate.

## Validation

Run `npx tsc --noEmit`, `npx expo lint`, and Expo production exports for web and Android. Browser checks cover narrow 320px and 390px layouts, route rendering, saved traveller/search interactions, package/hotel/story navigation, itinerary expansion, and checkout validation through payment's unavailable state. Android export validates bundling, not a device installation or configured native Google/Firebase credentials.
