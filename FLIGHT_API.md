# Flight Search API Adapter

The repository had no flight API client, endpoint configuration, or response type before the flight-search redesign. The old flight examples were static dummy listings and have been removed from the flight flow.

Set `EXPO_PUBLIC_FLIGHT_SEARCH_URL` to the live search endpoint. The adapter sends a `POST` JSON request using the `FlightSearchRequest` shape in `src/components/flights/types.ts` and expects a JSON object with an `offers` array in the normalized `FlightSearchResponse` shape from the same file. Map the actual provider response in `src/components/flights/flightApi.ts` if its contract differs; do not add local sample offers as a fallback.

Each offer must provide an ID, airline name/code, flight number, departure and arrival times and airport codes, duration in minutes, stop count, and a price amount/currency. Logo URL, airport names, aircraft, baggage, fare text, and refundability are optional and appear only when returned by the API. Optional `fareOptions` are rendered exactly as provided; each includes its API ID/name and total/currency, with optional base fare, taxes, fees, cabin, baggage, cancellation, date-change, seat-selection, and refundability fields.

Without the endpoint configuration, search displays an explicit API-not-connected state. An empty `offers` array displays the no-results state.