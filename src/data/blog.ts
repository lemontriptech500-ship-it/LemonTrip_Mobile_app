export interface BlogPost {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  readingTime: string;
  content: string[];
  relatedDestinationIds?: string[];
  relatedPackageIds?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'Destinations',
    date: 'Apr 22, 2026',
    title: 'Best Hill Stations to Visit in India This Summer',
    excerpt: 'Escape the heat with these stunning hill stations across India. From Shimla to Munnar, plan your perfect getaway.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85',
    author: 'LemonTrip editorial',
    readingTime: '6 min read',
    content: [
      'When the summer heat settles in, the best escape is often higher ground. India is full of mountain towns where cool mornings, long walks, and unhurried meals become part of the itinerary.',
      'Kashmir is a natural place to begin. Stay close to the water, make time for a shikara ride, and leave room for the landscape to set the pace. The most memorable days here are not always the busiest ones.',
      'For a smoother summer journey, book transport and stays early, pack one warm layer for evenings, and keep a flexible day for weather. A little space in the plan makes the mountains feel even bigger.',
    ],
    relatedDestinationIds: ['kashmir'],
    relatedPackageIds: ['pkg-3'],
  },
  {
    id: 'blog-2',
    category: 'Travel Tips',
    date: 'Mar 08, 2026',
    title: 'Business Travel: Packing Light for Short Trips',
    excerpt: 'Master the art of minimalist packing for business trips. Look sharp with just a carry-on bag.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=85',
    author: 'LemonTrip editorial',
    readingTime: '4 min read',
    content: [
      'A short business trip rewards a small, deliberate bag. Start with one versatile outfit for the meeting, one comfortable travel look, and shoes that can handle a full day between the airport and the city.',
      'Use a simple three-part system: a slim packing cube for clothes, a protected sleeve for documents, and one small pouch for cables. Keeping each group in its place saves time when you are moving through a busy itinerary.',
      'Dubai makes an excellent test for this approach. Days can move from a cool meeting room to a warm evening outside, so choose breathable layers and keep a light overshirt within reach.',
    ],
    relatedDestinationIds: ['dubai'],
    relatedPackageIds: ['pkg-1'],
  },
  {
    id: 'blog-3',
    category: 'Budget Travel',
    date: 'Feb 14, 2026',
    title: 'How to Travel India on ₹500 a Day',
    excerpt: 'Smart budgeting tips for exploring India without breaking the bank. From street food to budget stays.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=85',
    author: 'LemonTrip editorial',
    readingTime: '5 min read',
    content: [
      'Budget travel works best when the plan is clear but not rigid. Spend first on getting where you want to go, then let local food, public transport, and free walking routes shape the rest of the day.',
      'A useful daily rhythm is one paid anchor activity, one simple meal, and plenty of time outdoors. Booking a clean stay near a transport connection can save more than choosing the cheapest room far from everything.',
      'For a longer escape, compare the total journey rather than a single ticket price. Packages such as the Kashmir Scenic Retreat can make stays, transfers, and signature experiences easier to plan together.',
    ],
    relatedDestinationIds: ['kashmir'],
    relatedPackageIds: ['pkg-3'],
  },
];