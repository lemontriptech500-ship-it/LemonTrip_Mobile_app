import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FlightOffer } from './types';

type FlightCardProps = { offer: FlightOffer; onSelect: (offer: FlightOffer) => void };

function formatTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`;
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

export default function FlightCard({ offer, onSelect }: FlightCardProps) {
  const stopLabel = offer.stops === 0 ? 'Nonstop' : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`;
  const fareNote = offer.fareInfo ?? (offer.refundable === true ? 'Refundable' : offer.refundable === false ? 'Non-refundable' : null);

  return (
    <View style={styles.card}>
      <View style={styles.airline}>
        {offer.airline.logoUrl ? (
          <Image source={{ uri: offer.airline.logoUrl }} style={styles.logo} resizeMode="contain" accessibilityLabel={`${offer.airline.name} logo`} />
        ) : (
          <View style={styles.logoFallback}><Ionicons name="airplane" size={18} color={Colors.primary} /></View>
        )}
        <View style={styles.airlineCopy}>
          <Text style={styles.airlineName} numberOfLines={1}>{offer.airline.name}</Text>
          <Text style={styles.flightNumber}>{offer.flightNumber}</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.airport}>
          <Text style={styles.time}>{formatTime(offer.departure.time)}</Text>
          <Text style={styles.airportCode}>{offer.departure.airportCode}</Text>
          {offer.departure.airportName ? <Text style={styles.airportName} numberOfLines={1}>{offer.departure.airportName}</Text> : null}
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{formatDuration(offer.durationMinutes)}</Text>
          <View style={styles.routeLine}><View style={styles.routeDot} /><View style={styles.line} /><Ionicons name="airplane" size={13} color={Colors.primary} /><View style={styles.line} /><View style={styles.routeDot} /></View>
          <Text style={styles.stops}>{stopLabel}</Text>
        </View>
        <View style={[styles.airport, styles.arrival]}>
          <Text style={styles.time}>{formatTime(offer.arrival.time)}</Text>
          <Text style={styles.airportCode}>{offer.arrival.airportCode}</Text>
          {offer.arrival.airportName ? <Text style={styles.airportName} numberOfLines={1}>{offer.arrival.airportName}</Text> : null}
        </View>
      </View>

      <View style={styles.purchase}>
        <View style={styles.purchaseInfo}>
          <Text style={{ color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginBottom: 3 }}>FARE</Text><Text style={styles.price}>{formatPrice(offer.price.amount, offer.price.currency)}</Text>
          <Text style={styles.baggage} numberOfLines={1}>{offer.baggage ?? 'Baggage details unavailable'}</Text>
          {fareNote ? <Text style={styles.fareNote}>{fareNote}</Text> : null}
        </View>
        <TouchableOpacity accessibilityRole="button" onPress={() => onSelect(offer)} style={styles.selectButton}>
          <Text style={styles.selectText}>Select</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...Ui.card, padding: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card },
  airline: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingBottom: 8 },
  logo: { width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.background },
  logoFallback: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  airlineCopy: { flex: 1 },
  airlineName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  flightNumber: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 2 },
  route: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 8 },
  airport: { flex: 1, minWidth: 62 },
  arrival: { alignItems: 'flex-end' },
  time: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800' },
  airportCode: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', marginTop: 3 },
  airportName: { maxWidth: 92, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 16, marginTop: 3 },
  durationBlock: { flex: 1.2, alignItems: 'center', minWidth: 80 },
  duration: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  routeLine: { width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  routeDot: { width: 5, height: 5, borderWidth: 1, borderColor: Colors.primary, borderRadius: 3 },
  line: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  stops: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  purchase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.border },
  purchaseInfo: { flex: 1, minWidth: 0 },
  price: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  baggage: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, marginTop: 3 },
  fareNote: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', marginTop: 3 },
  selectButton: { minWidth: 82, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Ui.radius.control, backgroundColor: Colors.primary, paddingHorizontal: 18 },
  selectText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
});