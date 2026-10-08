import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

type TravelService = { title: string; shortTitle: string; icon: ComponentProps<typeof Ionicons>['name']; route: Href; description: string; image: string };

// Keep the app's core services aligned with the website's main navigation.
export const travelServices: TravelService[] = [
  { title: 'Flights', shortTitle: 'Flights', icon: 'airplane-outline', route: '/(tabs)/explore/flights', description: 'Compare routes and choose your fare for domestic and international journeys.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=85' },
  { title: 'Hotels', shortTitle: 'Hotels', icon: 'bed-outline', route: '/(tabs)/explore/hotels', description: 'Find comfortable stays with flexible room, date, and guest options.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85' },
  { title: 'Trains', shortTitle: 'Trains', icon: 'train-outline', route: '/(tabs)/explore/trains', description: 'Explore routes and travel classes for rail journeys across India.', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&q=85' },
  { title: 'Buses', shortTitle: 'Buses', icon: 'bus-outline', route: '/(tabs)/explore/buses', description: 'Plan city-to-city journeys and find the bus service that suits you.', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=85' },
  { title: 'Holiday packages', shortTitle: 'Holidays', icon: 'sunny-outline', route: '/packages', description: 'Discover curated itineraries, stays, and memorable experiences.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=85' },
  { title: 'Visa services', shortTitle: 'Visa', icon: 'id-card-outline', route: '/(tabs)/explore/visa', description: 'Understand requirements and get guided support for your travel documents.', image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=900&q=85' },
];

export const supportContact = {
  email: 'lemontripindia@gmail.com',
  whatsapp: 'https://wa.me/919812042030',
  website: (process.env.EXPO_PUBLIC_WEBSITE_URL ?? 'https://lemontrip.in').replace(/\/$/, ''),
};
