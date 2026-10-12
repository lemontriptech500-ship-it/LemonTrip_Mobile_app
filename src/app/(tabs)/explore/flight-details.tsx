import { useAppLanguage } from '@/utils/intl';
import FlightDetailsScreen from '@/components/flights/FlightDetailsScreen';

export default function FlightDetailsRoute() {
  useAppLanguage();
  return <FlightDetailsScreen />;
}