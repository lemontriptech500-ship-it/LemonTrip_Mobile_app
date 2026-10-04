import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { addToCart } from '@/utils/cartStore';
import { getBusSearch, getSelectedBus } from '@/utils/busSearchStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function parsePrice(value: string) {
  const match = value.match(/[\d,]+(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : 0;
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

const seatRows = ['A', 'B', 'C', 'D', 'E'];
const seatColumns = ['1', '2', '3', '4'];

export default function BusDetailsScreen() {
  const bus = getSelectedBus();
  const search = getBusSearch();
  const { width } = useWindowDimensions();
  const desktop = width >= 920;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [continued, setContinued] = useState(false);

  const seats = useMemo(() => seatRows.flatMap((row) => seatColumns.map((column) => `${row}${column}`)), []);
  const total = bus ? parsePrice(bus.price) * selectedSeats.length : 0;

  const toggleSeat = (seat: string) => {
    setSelectedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat]);
    setContinued(false);
  };

  const handleContinue = () => {
    if (!bus || !selectedSeats.length) return;
    addToCart({
      id: `bus-${bus.id}-${Date.now()}`,
      serviceName: 'Bus',
      itemName: `${bus.origin} to ${bus.destination} · ${bus.busType} · Seats ${selectedSeats.join(', ')}`,
      price: formatPrice(total),
      ...(search.travelDate ? { tripDate: search.travelDate } : {}),
    });
    setContinued(true);
    Alert.alert('Seats selected', 'Your bus seats have been added to the trip cart.', [
      { text: 'Continue to cart', onPress: () => router.push('/cart') },
    ]);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore/buses');
  };

  if (!bus) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <TravelArtworkIcon name="bus" size={44} />
          <Text style={styles.notFoundTitle}>Choose a bus service</Text>
          <Text style={styles.notFoundText}>Return to bus search and choose a route to select seats.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/explore/buses')} style={styles.backButton}><Text style={styles.backButtonText}>Search buses</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ScreenHeader title={`${bus.origin} to ${bus.destination}`} subtitle={search.travelDate || 'Travel date not selected'} eyebrow="LEMONTRIP / BUS SEATS" onBack={handleBack} />

          <View style={styles.routeCard}>
            <View style={styles.operatorIcon}><TravelArtworkIcon name="bus" size={32} /></View>
            <View style={styles.routeInfo}>
              <Text style={styles.operator}>{bus.operator ?? 'Operator not provided'}</Text>
              <Text style={styles.busType}>{bus.busType}</Text>
            </View>
            {bus.rating !== undefined ? <View style={styles.rating}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.ratingText}>{bus.rating.toFixed(1)}</Text></View> : null}
          </View>

          <View style={[styles.detailsLayout, desktop && styles.detailsLayoutDesktop]}>
            <View style={styles.mainColumn}>
              <View style={styles.scheduleCard}>
                <View style={styles.schedulePoint}><Text style={styles.scheduleTime}>{bus.departure ?? '—'}</Text><Text style={styles.scheduleCity}>{bus.origin}</Text><Text style={styles.scheduleCaption}>Departure time unavailable</Text></View>
                <View style={styles.durationBlock}><View style={styles.line} /><Text style={styles.durationText}>{bus.duration ?? 'Duration unavailable'}</Text><View style={styles.line} /></View>
                <View style={[styles.schedulePoint, styles.alignRight]}><Text style={styles.scheduleTime}>{bus.arrival ?? '—'}</Text><Text style={styles.scheduleCity}>{bus.destination}</Text><Text style={styles.scheduleCaption}>Arrival time unavailable</Text></View>
              </View>

              <View style={styles.seatSectionHeader}>
                <View><Text style={styles.eyebrow}>PICK YOUR PLACE</Text><Text style={styles.sectionTitle}>Seat layout</Text></View>
                <Text style={styles.selectedCount}>{selectedSeats.length} selected</Text>
              </View>

              <View style={styles.seatLegend}>
                <Legend color={Colors.surface} border={Colors.borderStrong} label="Select" />
                <Legend color={Colors.primary} border={Colors.primary} label="Selected" />
              </View>

              <View style={styles.seatMapCard}>
                <View style={styles.driverRow}><TravelArtworkIcon name="bus" size={32} /><Text style={styles.driverText}>FRONT OF BUS</Text></View>
                <View style={styles.seatGrid}>
                  {seatRows.map((row) => (
                    <View key={row} style={styles.seatRow}>
                      {seatColumns.slice(0, 2).map((column) => <Seat key={`${row}${column}`} id={`${row}${column}`} selected={selectedSeats.includes(`${row}${column}`)} onPress={() => toggleSeat(`${row}${column}`)} />)}
                      <View style={styles.aisle} />
                      {seatColumns.slice(2).map((column) => <Seat key={`${row}${column}`} id={`${row}${column}`} selected={selectedSeats.includes(`${row}${column}`)} onPress={() => toggleSeat(`${row}${column}`)} />)}
                    </View>
                  ))}
                </View>
                <View style={styles.seatNotice}><Ionicons name="information-circle-outline" size={14} color={Colors.textLight} /><Text style={styles.seatNoticeText}>Seat selection is a local preview; live seat availability was not supplied.</Text></View>
              </View>

              <View style={styles.pointsSection}>
                <InfoBlock icon="navigate-outline" title="Boarding points" values={bus.boardingPoints} />
                <InfoBlock icon="flag-outline" title="Dropping points" values={bus.droppingPoints} />
              </View>
            </View>

            {desktop ? <BookingSummary busName={`${bus.origin} to ${bus.destination}`} price={bus.price} selectedSeats={selectedSeats} total={total} onContinue={handleContinue} continued={continued} /> : null}
          </View>
        </View>
      </ScrollView>

      {!desktop ? (
        <View style={styles.mobileBar}>
          <View style={styles.mobileSummary}><Text style={styles.mobileSeats}>{selectedSeats.length ? selectedSeats.join(', ') : 'No seats selected'}</Text><Text style={styles.mobileTotal}>{selectedSeats.length ? formatPrice(total) : bus.price}</Text></View>
          <TouchableOpacity disabled={!selectedSeats.length} onPress={handleContinue} style={[styles.continueButton, !selectedSeats.length && styles.continueDisabled]}><Text style={styles.continueText}>Continue</Text><Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} /></TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Seat({ id, selected, onPress }: { id: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Seat ${id}${selected ? ', selected' : ''}`} accessibilityState={{ selected }} onPress={onPress} style={[styles.seat, selected && styles.seatSelected]}>
      <Text style={[styles.seatText, selected && styles.seatTextSelected]}>{id}</Text>
    </TouchableOpacity>
  );
}

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: color, borderColor: border }]} /><Text style={styles.legendText}>{label}</Text></View>;
}

function InfoBlock({ icon, title, values }: { icon: keyof typeof Ionicons.glyphMap; title: string; values?: string[] }) {
  return <View style={styles.infoBlock}><View style={styles.infoTitleRow}><Ionicons name={icon} size={15} color={Colors.primary} /><Text style={styles.infoTitle}>{title}</Text></View><Text style={styles.infoValue}>{values?.length ? values.join(' · ') : 'Not provided by this listing'}</Text></View>;
}

function BookingSummary({ busName, price, selectedSeats, total, onContinue, continued }: {
  busName: string;
  price: string;
  selectedSeats: string[];
  total: number;
  onContinue: () => void;
  continued: boolean;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.eyebrow}>TRIP SUMMARY</Text>
      <Text style={styles.summaryTitle}>{busName}</Text>
      <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Selected seats</Text><Text style={styles.summaryValue}>{selectedSeats.length ? selectedSeats.join(', ') : 'None'}</Text></View>
      <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Price per seat</Text><Text style={styles.summaryValue}>{price}</Text></View>
      <View style={[styles.summaryRow, styles.summaryTotalRow]}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotal}>{selectedSeats.length ? formatPrice(total) : '—'}</Text></View>
      <TouchableOpacity disabled={!selectedSeats.length} onPress={onContinue} style={[styles.continueButton, !selectedSeats.length && styles.continueDisabled]}><Text style={styles.continueText}>{continued ? 'Added to cart' : 'Continue'}</Text><Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} /></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  page: { paddingBottom: 28 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  routeCard: { flexDirection: 'row', alignItems: 'center', gap: 9, marginHorizontal: 16, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, backgroundColor: Colors.surface },
  operatorIcon: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accentSoft },
  routeInfo: { flex: 1 },
  operator: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  busType: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 3 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  detailsLayout: { gap: 14, marginTop: 18, paddingHorizontal: 16 },
  detailsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { flex: 1, minWidth: 0 },
  scheduleCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 13, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface },
  schedulePoint: { minWidth: 80 },
  alignRight: { alignItems: 'flex-end' },
  scheduleTime: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' },
  scheduleCity: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', marginTop: 3 },
  scheduleCaption: { maxWidth: 90, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 10, marginTop: 3 },
  durationBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  line: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  durationText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  seatSectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 22, marginBottom: 9 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 3 },
  selectedCount: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  seatLegend: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 12, height: 12, borderWidth: 1, borderRadius: 4 },
  legendText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  seatMapCard: { alignSelf: 'center', width: '100%', maxWidth: 380, padding: 15, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface },
  driverRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 13, paddingRight: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  driverText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  seatGrid: { gap: 8, paddingHorizontal: 8 },
  seatRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: 9 },
  aisle: { width: 32 },
  seat: { width: 42, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: 9, backgroundColor: Colors.background },
  seatSelected: { borderColor: Colors.primaryDark, backgroundColor: Colors.primary },
  seatText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  seatTextSelected: { color: Colors.white },
  seatNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  seatNoticeText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12 },
  pointsSection: { gap: 8, marginTop: 12 },
  infoBlock: { padding: 12, borderRadius: 12, backgroundColor: Colors.surface },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  infoValue: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, marginTop: 5 },
  summaryCard: { width: 285, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, position: 'sticky' as 'relative', top: 14 },
  summaryTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', marginTop: 5, marginBottom: 12 },
  summaryRow: { minHeight: 31, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summaryLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  summaryValue: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700', textAlign: 'right' },
  summaryTotalRow: { marginTop: 5, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  summaryTotalLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  summaryTotal: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  continueButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12, borderRadius: 10, backgroundColor: Colors.accent },
  continueDisabled: { opacity: 0.5 },
  continueText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  mobileBar: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 15, paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobileSummary: { flex: 1 },
  mobileSeats: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  mobileTotal: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900', marginTop: 3 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginTop: 10 },
  notFoundText: { maxWidth: 280, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 15, textAlign: 'center', marginTop: 5 },
  backButton: { marginTop: 13, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9, backgroundColor: Colors.accent },
  backButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
});