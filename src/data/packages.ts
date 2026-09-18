export interface TravelPackage {
  id: string;
  title: string;
  image: string;
  duration: string;
  rating: string;
  badge: string;
  price: string;
  description: string;
  highlights: string[];
}

export const travelPackages: TravelPackage[] = [
  {
    id: 'pkg-1',
    title: 'Dubai Luxury Escape',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
    duration: '5 Nights / 6 Days',
    rating: '★ 4.9',
    badge: 'BEST SELLER',
    price: '₹24,999',
    description: 'Experience the glitz and glamour of Dubai with luxury stays, desert safaris, and iconic skyline views.',
    highlights: ['Desert Safari', 'Burj Khalifa Visit', 'Luxury Hotel Stay'],
  },
  {
    id: 'pkg-2',
    title: 'Bali Signature Journey',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
    duration: '6 Nights / 7 Days',
    rating: '★ 4.8',
    badge: 'POPULAR',
    price: '₹32,999',
    description: 'Explore the tropical paradise of Bali with its stunning beaches, ancient temples, and vibrant culture.',
    highlights: ['Temple Tours', 'Beach Resorts', 'Cultural Experiences'],
  },
  {
    id: 'pkg-3',
    title: 'Kashmir Scenic Retreat',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85',
    duration: '5 Nights / 6 Days',
    rating: '★ 4.9',
    badge: 'LUXURY',
    price: '₹15,999',
    description: 'Discover the breathtaking beauty of Kashmir with houseboats, snow-capped mountains, and lush gardens.',
    highlights: ['Houseboat Stay', 'Shikara Ride', 'Mountain Views'],
  },
];