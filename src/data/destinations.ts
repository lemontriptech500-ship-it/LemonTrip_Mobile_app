export interface Destination {
  id: string;
  name: string;
  image: string;
  priceFrom: string;
}

export const destinations: Destination[] = [
  {
    id: 'dubai',
    name: 'Dubai',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    priceFrom: '₹24,999',
  },
  {
    id: 'maldives',
    name: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
    priceFrom: '₹29,999',
  },
  {
    id: 'thailand',
    name: 'Thailand',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',
    priceFrom: '₹19,999',
  },
  {
    id: 'singapore',
    name: 'Singapore',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
    priceFrom: '₹22,999',
  },
  {
    id: 'europe',
    name: 'Europe',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
    priceFrom: '₹49,999',
  },
  {
    id: 'kashmir',
    name: 'Kashmir',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
    priceFrom: '₹15,999',
  },
];