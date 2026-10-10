export type HelpFaq = { question: string; answer: string; category: string };

/** General help copy for browsing until the support knowledge-base service is connected. */
export const mockHelpFaqs: HelpFaq[] = [
  { category: 'Bookings', question: 'Where can I find my booking details?', answer: 'Open Your bookings from the profile tab. Select a trip to see its booking ID, status, date, and amount.' },
  { category: 'Bookings', question: 'Can I change or cancel a booking?', answer: 'Booking changes and cancellations depend on the provider and fare rules. Enter your booking ID below so our team can guide you to the right option.' },
  { category: 'Payments', question: 'What payment methods can I use?', answer: 'Payment method availability is shown during checkout. LemonTrip does not store your card details in this app.' },
  { category: 'Flights', question: 'When will I receive my flight confirmation?', answer: 'Your booking record appears in Your bookings after checkout. Keep the booking ID handy if you need help locating a confirmation.' },
  { category: 'Hotels', question: 'Can I request a special hotel arrangement?', answer: 'Send your request to lemontripindia@gmail.com with your booking ID and the property name. The hotel team will confirm what is possible.' },
  { category: 'Visa', question: 'How long does visa assistance take?', answer: 'Indicative processing times vary by destination and visa type. Review the destination guidance, then contact an advisor before applying.' },
];
