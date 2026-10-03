import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type ServiceIcon = ComponentProps<typeof Ionicons>['name'];

export interface TravelService {
  id: string;
  title: string;
  subtitle: string;
  icon: ServiceIcon;
}

export interface Destination {
  id: string;
  name: string;
  image: string;
  priceFrom: string;
}

export type PackageCategory = 'Weekend' | 'Honeymoon' | 'Family' | 'Adventure' | 'Luxury' | 'Spiritual' | 'International' | 'Domestic';

export interface TravelPackage {
  id: string;
  title: string;
  image: string;
  duration: string;
  rating?: string;
  badge?: string;
  price: string;
  description: string;
  highlights: string[];
  destination?: string;
  categories?: PackageCategory[];
  gallery?: string[];
  itinerary?: { day: string; title: string; description: string }[];
  hotels?: string[];
  meals?: string[];
  transfers?: string[];
  inclusions?: string[];
  exclusions?: string[];
  terms?: string;
  cancellation?: string;
}

export interface BlogPost {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  author?: string;
  readingTime: string;
  content: string[];
  relatedDestinationIds?: string[];
  relatedPackageIds?: string[];
}

export interface VisaCountry {
  id: string;
  name: string;
  image: string;
  visaType: string;
  processing: string | null;
  fee: string | null;
  documents: string[];
}

export interface Listing {
  id: string;
  serviceId: string;
  name: string;
  detail: string;
  price: string;
}

export interface BusListing extends Listing {
  origin: string;
  destination: string;
  busType: string;
  duration?: string;
  operator?: string;
  departure?: string;
  arrival?: string;
  seatsAvailable?: number;
  boardingPoints?: string[];
  droppingPoints?: string[];
  rating?: number;
}

export interface HotelRoomOption {
  id: string;
  name: string;
  pricePerNight: string;
  cancellation?: string;
  breakfast?: boolean;
  amenities?: string[];
}

export interface HotelReview {
  id: string;
  author: string;
  score: number;
  comment: string;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: string;
  price: string;
  description: string;
  amenities: string[];
  propertyType?: string;
  reviewScore?: number;
  reviewCount?: number;
  gallery?: string[];
  roomOptions?: HotelRoomOption[];
  cancellation?: string;
  breakfast?: boolean;
  distanceKm?: number;
  address?: string;
  reviews?: HotelReview[];
}
