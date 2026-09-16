export interface BlogPost {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'Destinations',
    date: 'Apr 22, 2026',
    title: 'Best Hill Stations to Visit in India This Summer',
    excerpt: 'Escape the heat with these stunning hill stations across India. From Shimla to Munnar, plan your perfect getaway.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85',
  },
  {
    id: 'blog-2',
    category: 'Travel Tips',
    date: 'Mar 08, 2026',
    title: 'Business Travel: Packing Light for Short Trips',
    excerpt: 'Master the art of minimalist packing for business trips. Look sharp with just a carry-on bag.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=85',
  },
  {
    id: 'blog-3',
    category: 'Budget Travel',
    date: 'Feb 14, 2026',
    title: 'How to Travel India on ₹500 a Day',
    excerpt: 'Smart budgeting tips for exploring India without breaking the bank. From street food to budget stays.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=85',
  },
];