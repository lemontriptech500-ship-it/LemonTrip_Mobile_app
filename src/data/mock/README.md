# Mock data policy

Put demo records in this folder only for flows without a configured backend.

- A mock is selected only when its service endpoint is not configured or when an explicit demo-mode flag is enabled.
- If an endpoint is configured and returns an error, keep showing the error; never replace it with mock records.
- Mark demo prices, inventory, and offers as samples. Do not simulate payments, bookings, account records, or visa application status.
- Content that already comes from the content API (packages, hotels, destinations, stories, and service listings) stays API-backed.
