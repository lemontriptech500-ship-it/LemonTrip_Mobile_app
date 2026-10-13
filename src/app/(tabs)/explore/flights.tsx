import { useAppLanguage } from '@/utils/intl';
import FlightSearchScreen from '@/components/flights/FlightSearchScreen';

export default function FlightsRoute() {
  useAppLanguage();
  return <FlightSearchScreen />;
}