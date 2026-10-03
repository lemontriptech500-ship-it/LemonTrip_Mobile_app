import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';

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

const artwork: Record<TravelArtworkName, ImageSourcePropType> = {
  flight: require('../../assets/images/flight.png'),
  hotel: require('../../assets/images/hotels_new.png'),
  package: require('../../assets/images/holiday.png'),
  train: require('../../assets/images/trains.png'),
  bus: require('../../assets/images/buses.png'),
  visa: require('../../assets/images/visa.png'),
  offer: require('../../assets/images/offers.png'),
  saved: require('../../assets/images/saved.png'),
  stories: require('../../assets/images/travel_stories.png'),
  cart: require('../../assets/images/cart.png'),
  help: require('../../assets/images/help.png'),
  explore: require('../../assets/images/exploreall.png'),
};

export function TravelArtworkIcon({ name, size = 36 }: { name: TravelArtworkName; size?: number }) {
  return <Image source={artwork[name]} style={{ width: size, height: size }} resizeMode="contain" accessible={false} />;
}