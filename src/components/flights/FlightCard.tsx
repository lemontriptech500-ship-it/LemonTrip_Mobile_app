import { Brand, Colors, Radius } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { FlightOffer } from './types';

type FlightCardProps = {
  offer: FlightOffer;
  onSelect: (offer: FlightOffer) => void;
  /** Highlights the card as the best deal (yellow border + tag). */
  best?: boolean;
};

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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

export default function FlightCard({ offer, onSelect, best = false }: FlightCardProps) {
  const stopLabel = offer.stops === 0 ? 'Direct' : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`;
  const fareNote =
    offer.fareInfo ??
    (offer.refundable === true ? 'Refundable' : offer.refundable === false ? 'Non-refundable' : null);
  const subtitle = [offer.flightNumber, fareNote].filter(Boolean).join(' · ');

  return (
    <View style={[styles.card, best && styles.cardBest]}>
      {best || offer.isDemo ? (
        <View style={styles.bestTag}>
          <Ionicons name={offer.isDemo ? 'information-circle' : 'sparkles'} size={12} color={Brand.forest} />
          <Text style={styles.bestTagText}>{offer.isDemo ? (best ? 'SAMPLE · BEST PRICE' : 'SAMPLE RESULT') : 'LEMONTRIP BEST DEAL'}</Text>
        </View>
      ) : null}

      {/* Airline */}
      <Pressable accessibilityRole="button" onPress={() => onSelect(offer)} style={styles.airlineRow}>
        {offer.airline.logoUrl ? (
          <Image
            source={{ uri: offer.airline.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel={`${offer.airline.name} logo`}
          />
        ) : (
          <View style={[styles.logo, styles.logoFallback]}>
            <Text style={styles.logoFallbackText}>{offer.airline.code}</Text>
          </View>
        )}
        <View style={styles.airlineCopy}>
          <Text style={styles.airlineName} numberOfLines={1}>{offer.airline.name}</Text>
          <Text style={styles.airlineSub} numberOfLines={1}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textDark} />
      </Pressable>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.airport}>
          <Text style={styles.time}>{formatTime(offer.departure.time)}</Text>
          <Text style={styles.airportCode}>{offer.departure.airportCode}</Text>
        </View>

        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{formatDuration(offer.durationMinutes)} · {stopLabel}</Text>
          <View style={styles.routeLine}>
            <View style={styles.line} />
            <Ionicons name="airplane" size={14} color={Brand.forest} />
            <View style={styles.line} />
          </View>
        </View>

        <View style={[styles.airport, styles.arrival]}>
          <Text style={styles.time}>{formatTime(offer.arrival.time)}</Text>
          <Text style={styles.airportCode}>{offer.arrival.airportCode}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Price + select */}
      <View style={styles.purchase}>
        <View style={styles.purchaseInfo}>
          <Text style={styles.priceLabel}>PER TRAVELER · INCL. TAXES</Text>
          <Text style={styles.price}>{formatPrice(offer.price.amount, offer.price.currency)}</Text>
          <View style={styles.baggageRow}>
            <Ionicons name="briefcase-outline" size={12} color={Colors.textLight} />
            <Text style={styles.baggage} numberOfLines={1}>{offer.baggage ?? 'Baggage details unavailable'}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(offer)}
          style={({ pressed }) => [styles.selectButton, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.selectText}>Select</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#0F3D2E',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardBest: { borderColor: Brand.lemon, borderWidth: 1.5 },

  bestTag: {
    position: 'absolute',
    top: -13,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.lemon,
  },
  bestTagText: { fontFamily: 'Manrope', fontSize: 10, letterSpacing: 0.5, color: Brand.forest },

  airlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 50, height: 50, borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  logoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.forest },
  logoFallbackText: { fontFamily: 'Manrope', fontSize: 15, color: '#FFFFFF' },
  airlineCopy: { flex: 1, minWidth: 0 },
  airlineName: { fontFamily: 'Manrope', fontSize: 16, color: Colors.textDark },
  airlineSub: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 2 },

  route: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, gap: 10 },
  airport: { minWidth: 64 },
  arrival: { alignItems: 'flex-end' },
  time: { fontFamily: 'Manrope', fontSize: 26, color: Colors.textDark },
  airportCode: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 4 },
  durationBlock: { flex: 1, alignItems: 'center' },
  duration: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight },
  routeLine: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  line: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },

  purchase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  purchaseInfo: { flex: 1, minWidth: 0 },
  priceLabel: { fontFamily: 'Manrope', fontSize: 9, letterSpacing: 1, color: Colors.textLight },
  price: { fontFamily: 'Manrope', fontSize: 28, color: Colors.textDark, marginTop: 4 },
  baggageRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  baggage: { flexShrink: 1, fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight },
  selectButton: {
    minWidth: 124,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Brand.forest,
    paddingHorizontal: 18,
  },
  selectText: { fontFamily: 'Manrope', fontSize: 14, color: '#FFFFFF' },
});
