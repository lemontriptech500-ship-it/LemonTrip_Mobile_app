import { PolicyScreen } from '@/components/PolicyScreen';

// Policy text mirrors the website's published local source.
export default function PrivacyScreen() {
  return <PolicyScreen title="Privacy Policy" introduction="LemonTrip respects your privacy and uses your information only to provide travel services, process bookings, respond to support requests, and improve our website." sections={[
  {
    "title": "Information we collect",
    "paragraphs": [
      "We may collect contact details, account information, booking details, and messages you submit through our services."
    ]
  },
  {
    "title": "How we use information",
    "paragraphs": [
      "We use this information to provide requested services, manage your account, process bookings, communicate important updates, prevent misuse, and meet legal obligations. LemonTrip does not sell personal information."
    ]
  },
  {
    "title": "Your choices",
    "paragraphs": [
      "You can review or update your profile details from your account. Contact support if you need help accessing, correcting, or deleting information associated with your account."
    ]
  },
  {
    "title": "Contact",
    "paragraphs": [
      "For privacy questions, contact lemontripindia@gmail.com."
    ]
  }
]} />;
}
