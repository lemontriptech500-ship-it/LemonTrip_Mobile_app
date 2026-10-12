import { useAppLanguage } from '@/utils/intl';
import HotelDetailsScreen from '@/components/hotels/HotelDetailsScreen';

export default function HotelDetailsRoute() {
  useAppLanguage();
  return <HotelDetailsScreen />;
}