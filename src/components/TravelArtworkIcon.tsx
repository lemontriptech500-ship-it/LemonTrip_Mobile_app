import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type TravelArtworkName =
  | 'flight'
  | 'hotel'
  | 'package'
  | 'train'
  | 'bus'
  | 'visa'
  | 'offer'
  | 'saved'
  | 'stories'
  | 'cart'
  | 'help'
  | 'explore';

const icons: Record<TravelArtworkName, ComponentProps<typeof Ionicons>['name']> = {
  flight: 'airplane-outline', hotel: 'bed-outline', package: 'sunny-outline',
  train: 'train-outline', bus: 'bus-outline', visa: 'id-card-outline',
  offer: 'pricetag-outline', saved: 'heart-outline', stories: 'book-outline',
  cart: 'bag-outline', help: 'headset-outline', explore: 'compass-outline',
};

export function TravelArtworkIcon({ name, size = 28 }: { name: TravelArtworkName; size?: number }) {
  return <Ionicons name={icons[name]} size={size} color={Colors.primary} accessible={false} />;
}
