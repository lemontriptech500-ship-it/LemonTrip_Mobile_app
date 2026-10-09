# Website and mobile app coverage

LemonTrip's website positions the product as one place for flights, hotels, trains, buses, holiday packages, and visa assistance: **Travel smarter. Travel better.** The mobile redesign retains that purpose alongside the onboarding's forest-green and yellow visual style.

Sources reviewed: website home page, desktop/mobile navigation, navigation constants, services page, contact page, terms/privacy pages, offer details, account recovery, wallet service, and booking routes.

| Website feature | Mobile entry or route | Coverage |
| --- | --- | --- |
| Flights | Home → Flights / `/explore/flights` | Search, results, filters, fare details, and cart |
| Hotels | Home → Hotels / `/explore/hotels` | Search, results, property and room details, and cart |
| Trains | Home → Trains / `/explore/trains` | Catalog search, filters, and `/explore/train-details?id=…` |
| Buses | Home → Buses / `/explore/buses` | Search, details, and seat selection |
| Holidays | Home → Holidays / `/packages` | Catalog, package details, itinerary, wishlist, and cart |
| Visa | Home → Visa / `/explore/visa` | Countries, applications, documents, and application history |
| Services | Home → Services / `/services` | Dedicated directory of all six core services |
| Destinations | Home → Popular destinations / `/explore` | Inspiration, destination browsing, and journey filters |
| Offers | Home → Offers / `/offers` | List, coupon copy, and `/offers/[id]` for full terms |
| Travel stories | Home → Stories / `/blog` | Journal, categories, and article details |
| Cart | Home → Trip cart / `/cart` | Review and remove selections |
| Checkout | Cart → `/checkout` → `/review` → `/payment` | Contact and traveller forms, review, and existing payment screen |
| Bookings | Bottom navigation → Bookings | Booking history and existing confirmation screen |
| Wishlist | Home heart / `/wishlist` | Saved destinations, packages, and stays |
| Profile | Bottom navigation → Profile | Account, wallet access, services, support, settings |
| Contact | Profile / Services → `/contact` | Official website email and WhatsApp; contact form |
| Account recovery | Login → `/forgot-password` | Existing phone OTP and account support |
| Wallet | Profile → `/wallet` | Opens the website wallet; does not invent a native balance |
| Privacy / Terms | Login, signup, settings, review | `/privacy`, `/terms`, text copied from website source |
| AI planner | Bottom navigation → AI Planner | Existing mobile chat service |

## Existing integration limits

The mobile backend exposes auth, bookings, chat, and content routes. It does not currently expose the website's wallet, contact submission, or password-reset routes. The mobile payment screen also has no configured payment methods. These are integration gaps, not missing native payment implementations introduced by the visual redesign.

- Wallet access opens the website wallet and uses its own sign-in session.
- Contact composes an email unless `EXPO_PUBLIC_CONTACT_URL` points to a compatible contact endpoint; it never reports an email draft as sent.
- Account recovery uses the existing phone OTP or support. The website's current forgot-password service is a mock success response and is not copied as a real reset service.
- `EXPO_PUBLIC_WEBSITE_URL` can override the website URL used by wallet access.
- Cart, package, and hotel selections continue through checkout rather than creating confirmed bookings before payment.
- Train availability, live provider fares, payment settlement, refunds, and wallet balances still require the relevant live service integration.

The final mobile brief, all 86 UI items, and integration boundaries are mapped in [final-mobile-ui.md](final-mobile-ui.md).
