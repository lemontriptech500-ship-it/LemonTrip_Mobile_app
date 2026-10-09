import { PolicyScreen } from '@/components/PolicyScreen';

// Policy text mirrors the website's published local source.
export default function TermsScreen() {
  return <PolicyScreen title="Terms of Service" introduction="By using LemonTrip, you agree to use our website and travel services lawfully and to provide accurate information for bookings and support requests." sections={[
  {
    "title": "Bookings and payments",
    "paragraphs": [
      "Availability, prices, supplier terms, cancellations, and refunds may vary by travel product and are shown during the booking process. A booking is confirmed only after the required payment and verification steps complete successfully.",
      "Questions about a booking can be raised through the support channels provided on the website."
    ]
  },
  {
    "title": "Acceptable use",
    "paragraphs": [
      "Do not misuse the website, submit misleading information, interfere with the service, or attempt unauthorized access."
    ]
  },
  {
    "title": "Contact",
    "paragraphs": [
      "For questions about these terms, contact lemontripindia@gmail.com."
    ]
  }
]} />;
}
