export interface Service {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const services: Service[] = [
  { id: 'flights', title: 'Flights', subtitle: 'Book domestic & international flights', icon: '✈️' },
  { id: 'hotels', title: 'Hotels', subtitle: 'Handpicked stays across the globe', icon: '🏨' },
  { id: 'buses', title: 'Buses', subtitle: 'Comfortable bus travel', icon: '🚌' },
  { id: 'trains', title: 'Trains', subtitle: 'IRCTC bookings made easy', icon: '🚆' },
  { id: 'packages', title: 'Tours & Packages', subtitle: 'Curated holiday experiences', icon: '🧳' },
  { id: 'visa', title: 'Visa Services', subtitle: 'Expert visa assistance', icon: '🛂' },
];

export interface Listing {
  id: string;
  name: string;
  detail: string;
  price: string;
}

export const dummyListings: Record<string, Listing[]> = {
  flights: [
    { id: '1', name: 'Delhi → Mumbai', detail: 'IndiGo · Non-stop · 2h 10m', price: '₹4,299' },
    { id: '2', name: 'Mumbai → Bangalore', detail: 'Air India · Non-stop · 1h 40m', price: '₹3,899' },
    { id: '3', name: 'Delhi → Dubai', detail: 'Emirates · Non-stop · 3h 45m', price: '₹22,500' },
  ],
  hotels: [
    { id: '1', name: 'Taj Palace, Mumbai', detail: '5 Star · Free Wifi · Pool', price: '₹8,500/night' },
    { id: '2', name: 'Beach Resort, Goa', detail: '4 Star · Sea View', price: '₹5,200/night' },
    { id: '3', name: 'Hill View Homestay, Manali', detail: 'Boutique · Mountain View', price: '₹2,800/night' },
  ],
  buses: [
    { id: '1', name: 'Delhi → Manali', detail: 'Volvo AC Sleeper · 12h', price: '₹1,299' },
    { id: '2', name: 'Bangalore → Goa', detail: 'AC Seater · 9h', price: '₹899' },
  ],
  trains: [
    { id: '1', name: 'Rajdhani Express', detail: 'Delhi → Mumbai · AC 2 Tier', price: '₹2,450' },
    { id: '2', name: 'Shatabdi Express', detail: 'Delhi → Chandigarh · AC Chair', price: '₹950' },
  ],
  packages: [
    { id: '1', name: 'Swiss Alps Explorer', detail: '7 Days, 6 Nights', price: '₹1,29,900' },
    { id: '2', name: 'Tropical Maldives', detail: '5 Days, 4 Nights', price: '₹89,900' },
    { id: '3', name: 'Cultural Japan', detail: '10 Days, 9 Nights', price: '₹1,89,900' },
  ],
  visa: [
    { id: '1', name: 'Tourist Visa - UAE', detail: 'Processing: 3-5 days', price: '₹4,500' },
    { id: '2', name: 'Tourist Visa - Schengen', detail: 'Processing: 10-15 days', price: '₹7,200' },
  ],
};