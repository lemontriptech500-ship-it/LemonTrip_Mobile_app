# Offers API

The repository did not contain an offers endpoint or validity dates. Configure `EXPO_PUBLIC_OFFERS_URL` to load current offers from the backend. Without it, the app uses the existing static records as demo content; their booking action is disabled because validity cannot be verified.

The endpoint may return either an array of offers or an object with an `offers` array. Each record must include `id`, `category`, `title`, `description`, and `image`. `code`, `discount`, `terms`, and `validUntil` are optional fields. The backend must supply `validUntil` as an ISO-8601 date-time or `YYYY-MM-DD`; a date-only value is treated as valid through that calendar day. Invalid or absent dates are unverified, not active. Expired records are omitted from the offers marketplace.

Recognized category names are those containing `flight`, `hotel`/`stay`, `bus`, `package`/`holiday`, or `visa` (case-insensitive). `Book now` routes to the relevant LemonTrip search flow and is enabled only for a backend offer with a confirmed, unexpired `validUntil` and a recognized category.
