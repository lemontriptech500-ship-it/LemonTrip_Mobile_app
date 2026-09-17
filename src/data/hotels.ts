export interface Hotel {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: string;
  price: string;
  description: string;
  amenities: string[];
}

export const hotels: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'Taj Palace, Mumbai',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85',
    location: 'Mumbai, Maharashtra',
    rating: '5 Star',
    price: '₹8,500/night',
    description: 'A luxurious 5-star hotel offering world-class hospitality with stunning views of the city skyline.',
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Fine Dining', 'Fitness Center'],
  },
  {
    id: 'hotel-2',
    name: 'Beach Resort, Goa',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=85',
    location: 'Goa',
    rating: '4 Star',
    price: '₹5,200/night',
    description: 'A beachfront resort with panoramic sea views, perfect for a relaxing tropical getaway.',
    amenities: ['Sea View', 'Free WiFi', 'Beach Access', 'Bar & Lounge', 'Water Sports'],
  },
  {
    id: 'hotel-3',
    name: 'Hill View Homestay, Manali',
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=85',
    location: 'Manali, Himachal Pradesh',
    rating: 'Boutique',
    price: '₹2,800/night',
    description: 'A cozy boutique homestay nestled in the mountains, offering a peaceful escape with local charm.',
    amenities: ['Mountain View', 'Free WiFi', 'Home-cooked Meals', 'Bonfire', 'Trekking Assistance'],
  },
];