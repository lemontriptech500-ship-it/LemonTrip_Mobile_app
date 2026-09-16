export interface TravelPackage {
  id: string;
  title: string;
  image: string;
  duration: string;
  price: string;
  description: string;
  highlights: string[];
}

export const travelPackages: TravelPackage[] = [
  {
    id: 'pkg-1',
    title: 'Swiss Alps Explorer',
    image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&q=85',
    duration: '7 Days, 6 Nights',
    price: '₹1,29,900',
    description: 'Experience the breathtaking beauty of the Swiss Alps with scenic train rides and cozy stays.',
    highlights: ['Scenic Train Rides', 'Mountain Tours', 'Breakfast Included'],
  },
  {
    id: 'pkg-2',
    title: 'Tropical Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=85',
    duration: '5 Days, 4 Nights',
    price: '₹89,900',
    description: 'Relax in overwater villas and enjoy the crystal-clear waters of the Indian Ocean.',
    highlights: ['Overwater Villa', 'Snorkeling', 'All-Inclusive'],
  },
  {
    id: 'pkg-3',
    title: 'Cultural Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85',
    duration: '10 Days, 9 Nights',
    price: '₹1,89,900',
    description: 'Discover the perfect blend of ancient traditions and modern technology in Japan.',
    highlights: ['Tokyo City Tour', 'Kyoto Temples', 'Bullet Train Pass'],
  },
];