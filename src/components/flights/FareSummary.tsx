import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { FlightOffer, FlightSearchRequest } from './types';

type FareSummaryProps = { request: FlightSearchRequest; offer?: FlightOffer };

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function FareSummary({ request, offer }: FareSummaryProps) {
  const origin = offer?.departure.airportCode ?? request.origin;
  const destination = offer?.arrival.airportCode ?? request.destination;
  const route = `${origin.toUpperCase()} → ${destination.toUpperCase()}`;
  const dates = request.returnDate
    ? `${formatDate(request.departureDate)} – ${formatDate(request.returnDate)}`
    : formatDate(request.departureDate);

  return (
    <View style={styles.container}>
      <View style={styles.routeBlock}>
        <Text style={styles.route}>{route}</Text>
        <Text style={styles.date}>{dates}</Text>
      </View>
      <View style={styles.detail}>
        <Ionicons name="people-outline" size={16} color={Colors.textLight} />
        <Text style={styles.detailText}>{request.travellers} {request.travellers === 1 ? 'Traveller' : 'Travellers'}</Text>
      </View>
      <View style={styles.detail}>
        <Ionicons name="briefcase-outline" size={16} color={Colors.textLight} />
        <Text style={styles.detailText}>{request.cabinClass}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, padding: 15, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 15 },
  routeBlock: { flexGrow: 1, minWidth: 150 },
  route: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  date: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 4 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold },
});