export interface Offer {
  id: string;
  category: string;
  title: string;
  description: string;
  code: string;
  image: string;
}

export const offers: Offer[] = [
  {
    id: 'offer-1',
    category: 'Flight Deals',
    title: 'Up to 20% off Domestic Flights',
    description: 'Book your next domestic trip with us and save big on top airlines. Valid on all major routes.',
    code: 'LEMONFLY20',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=85',
  },
  {
    id: 'offer-2',
    category: 'Hotel Discounts',
    title: 'Luxury Stays at Budget Prices',
    description: 'Enjoy 5-star amenities for less. Handpicked hotels for your comfort across India.',
    code: 'STAYLUX',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=85',
  },
  {
    id: 'offer-3',
    category: 'Holiday Packages',
    title: 'Summer Getaway Special',
    description: 'All-inclusive packages to beach destinations. Limited time offer for families.',
    code: 'SUMMER25',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85',
  },
  {
    id: 'offer-4',
    category: 'Visa Assistance',
    title: 'Hassle-free Visa Processing',
    description: 'Get expert guidance for your international travel visas. Quick and reliable.',
    code: 'VISA10',
    image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=900&q=85',
  },
  {
    id: 'offer-5',
    category: 'Train Bookings',
    title: 'Zero Convenience Fee on Trains',
    description: 'Book IRCTC tickets with zero convenience fee. Fast and secure bookings.',
    code: 'TRAIN0',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&q=85',
  },
  {
    id: 'offer-6',
    category: 'Bus Travel',
    title: 'Flat ₹200 off on First Bus Booking',
    description: 'New user exclusive! Get flat ₹200 off on your first bus ticket booking.',
    code: 'BUS200',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=85',
  },
];