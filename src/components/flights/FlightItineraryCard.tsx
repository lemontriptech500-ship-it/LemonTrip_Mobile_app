import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { FlightOffer } from './types';

type FlightItineraryCardProps = { offer: FlightOffer };

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

export default function FlightItineraryCard({ offer }: FlightItineraryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        {offer.airline.logoUrl ? (
          <Image source={{ uri: offer.airline.logoUrl }} style={styles.logo} resizeMode="contain" accessibilityLabel={`${offer.airline.name} logo`} />
        ) : (
          <View style={styles.logoFallback}><Ionicons name="airplane" size={19} color={Colors.primary} /></View>
        )}
        <View style={styles.airlineDetails}>
          <Text style={styles.airlineName}>{offer.airline.name}</Text>
          <Text style={styles.flightNumber}>{offer.flightNumber}</Text>
        </View>
        <View style={styles.status}><Ionicons name="checkmark-circle" size={14} color={Colors.secondary} /><Text style={styles.statusText}>Selected flight</Text></View>
      </View>

      <View style={styles.timeline}>
        <View style={styles.airport}>
          <Text style={styles.time}>{formatTime(offer.departure.time)}</Text>
          <Text style={styles.code}>{offer.departure.airportCode}</Text>
          {offer.departure.airportName ? <Text style={styles.airportName}>{offer.departure.airportName}</Text> : null}
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{formatDuration(offer.durationMinutes)}</Text>
          <View style={styles.routeLine}><View style={styles.dot} /><View style={styles.line} /><Ionicons name="airplane" size={14} color={Colors.primary} /><View style={styles.line} /><View style={styles.dot} /></View>
          <Text style={styles.stops}>{offer.stops === 0 ? 'Nonstop' : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`}</Text>
        </View>
        <View style={[styles.airport, styles.arrival]}>
          <Text style={styles.time}>{formatTime(offer.arrival.time)}</Text>
          <Text style={styles.code}>{offer.arrival.airportCode}</Text>
          {offer.arrival.airportName ? <Text style={styles.airportName}>{offer.arrival.airportName}</Text> : null}
        </View>
      </View>

      {offer.aircraft?.name || offer.aircraft?.code ? (
        <View style={styles.aircraftRow}>
          <Ionicons name="airplane-outline" size={14} color={Colors.textLight} />
          <Text style={styles.aircraftText}>{[offer.aircraft.name, offer.aircraft.code].filter(Boolean).join(' · ')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  logo: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.background },
  logoFallback: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accentSoft },
  airlineDetails: { flex: 1 },
  airlineName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  flightNumber: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, marginTop: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  timeline: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 18 },
  airport: { flex: 1, minWidth: 76 },
  arrival: { alignItems: 'flex-end' },
  time: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 22, fontWeight: '900' },
  code: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', marginTop: 4 },
  airportName: { maxWidth: 120, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 12, marginTop: 4 },
  durationBlock: { flex: 1.25, minWidth: 86, alignItems: 'center' },
  duration: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  routeLine: { width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  dot: { width: 6, height: 6, borderWidth: 1, borderColor: Colors.primary, borderRadius: 3 },
  line: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  stops: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  aircraftRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.border },
  aircraftText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
});