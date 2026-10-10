import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import {
  getFlightBookingDraft,
  updateFlightBookingDraft,
  type FlightAddOns,
} from '@/components/flights/flightBookingStore';
import { Brand, Colors, Radius } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const FONT = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
} as const;

const SHADOW = {
  shadowColor: '#0F3D2E',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

// Static seat map for now (real seat data will come from the flight service later).
const ROWS = Array.from({ length: 14 }, (_, i) => i + 1);
const LEFT = ['A', 'B', 'C'];
const RIGHT = ['D', 'E', 'F'];
const TAKEN = new Set(['2B', '3E', '5A', '5B', '7C', '8D', '10F', '11A', '12E', '13B']);
const seatPrice = (row: number) => (row <= 3 ? 500 : 300);

const ADDONS: { key: keyof FlightAddOns; title: string; detail: string; price: number; icon: IconName }[] = [
  { key: 'baggage', title: 'Extra baggage', detail: '+5 kg check-in, per traveller', price: 750, icon: 'bag-handle-outline' },
  { key: 'meal', title: 'In-flight meal', detail: 'Hot meal and a drink, per traveller', price: 350, icon: 'restaurant-outline' },
  { key: 'insurance', title: 'Travel insurance', detail: 'Trip cover, per traveller', price: 199, icon: 'shield-checkmark-outline' },
];

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

export default function SeatsAddOnsScreen() {
  const selection = getFlightSelection();
  const saved = getFlightBookingDraft();
  const count = Math.max(1, selection?.request.travellers ?? 1);

  const [seats, setSeats] = useState<string[]>(saved.seats);
  const [addOns, setAddOns] = useState<FlightAddOns>(saved.addOns);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/flight-booking/traveller' as never);
  };

  if (!selection) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Brand.lemon} />
          <Text style={styles.centerText}>No flight selected</Text>
          <TouchableOpacity style={styles.lemonButton} onPress={() => router.replace('/(tabs)/explore/flights' as never)}>
            <Text style={styles.lemonButtonText}>Search flights</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { offer, fareOption } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;

  const seatTotal = seats.reduce((sum, id) => sum + seatPrice(parseInt(id, 10)), 0);
  const addOnTotal = ADDONS.reduce((sum, item) => sum + (addOns[item.key] ? item.price * count : 0), 0);
  const grandTotal = fareTotal + seatTotal + addOnTotal;

  const toggleSeat = (id: string) => {
    setSeats((current) => {
      if (current.includes(id)) return current.filter((seat) => seat !== id);
      if (current.length >= count) return current;
      return [...current, id];
    });
  };

  const handleContinue = () => {
    updateFlightBookingDraft({ seats, addOns });
    router.push('/flight-booking/payment' as never);
  };

  const renderSeat = (row: number, letter: string) => {
    const id = `${row}${letter}`;
    const taken = TAKEN.has(id);
    const selected = seats.includes(id);
    return (
      <TouchableOpacity
        key={id}
        accessibilityRole="button"
        accessibilityLabel={`Seat ${id}`}
        disabled={taken}
        onPress={() => toggleSeat(id)}
        style={[styles.seat, taken && styles.seatTaken, selected && styles.seatSelected, row <= 3 && !taken && !selected && styles.seatFront]}
      >
        <Text style={[styles.seatText, taken && styles.seatTextTaken, selected && styles.seatTextSelected]}>{letter}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={22} color={Brand.forest} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrowLemon}>STEP 3 OF 5</Text>
          <Text style={styles.pageTitle}>Seats and add-ons</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.flightCard}>
          <View style={styles.flightIcon}>
            <Ionicons name="airplane-outline" size={22} color={Brand.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.flightTitle}>{offer.airline.name} {offer.flightNumber}</Text>
            <Text style={styles.flightSub}>{offer.departure.airportCode} to {offer.arrival.airportCode}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Choose your seats</Text>
            <Text style={styles.cardHint}>{seats.length} of {count} selected</Text>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, styles.seatFront]} /><Text style={styles.legendText}>Front rows</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, styles.seatSelected]} /><Text style={styles.legendText}>Selected</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, styles.seatTaken]} /><Text style={styles.legendText}>Taken</Text></View>
          </View>
          <View style={styles.seatMap}>
            {ROWS.map((row) => (
              <View key={row} style={styles.seatRow}>
                <View style={styles.seatGroup}>{LEFT.map((letter) => renderSeat(row, letter))}</View>
                <Text style={styles.rowNumber}>{row}</Text>
                <View style={styles.seatGroup}>{RIGHT.map((letter) => renderSeat(row, letter))}</View>
              </View>
            ))}
          </View>
          <Text style={styles.priceNote}>Rows 1 to 3: {formatPrice(500, currency)} per seat. Other rows: {formatPrice(300, currency)}. Seats are optional.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add-ons</Text>
          {ADDONS.map((item) => {
            const on = addOns[item.key];
            return (
              <TouchableOpacity
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.addOn, on && styles.addOnOn]}
                onPress={() => setAddOns((current) => ({ ...current, [item.key]: !current[item.key] }))}
              >
                <View style={styles.addOnIcon}>
                  <Ionicons name={item.icon} size={22} color={Brand.forest} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addOnTitle}>{item.title}</Text>
                  <Text style={styles.addOnDetail}>{item.detail}</Text>
                </View>
                <View style={styles.addOnRight}>
                  <Text style={styles.addOnPrice}>{formatPrice(item.price, currency)}</Text>
                  <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={Brand.forest} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>TOTAL</Text>
          <Text style={styles.footerTotal}>{formatPrice(grandTotal, currency)}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue to payment</Text>
          <Ionicons name="arrow-forward" size={18} color={Brand.forest} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  container: { flex: 1, backgroundColor: Brand.cream },
  content: { padding: 16, gap: 16, paddingBottom: 24, width: '100%', maxWidth: 900, alignSelf: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  centerText: { color: Colors.white, fontFamily: FONT.extra, fontSize: 18 },
  lemonButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill, backgroundColor: Brand.lemon },
  lemonButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Brand.forest },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Brand.lemon },
  headerCopy: { flex: 1 },
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.6 },
  pageTitle: { color: Colors.white, fontFamily: FONT.extra, fontSize: 24, marginTop: 2 },

  flightCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.lg, backgroundColor: Colors.white, ...SHADOW },
  flightIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, backgroundColor: Brand.cream },
  flightTitle: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 16 },
  flightSub: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, marginTop: 2 },

  card: { padding: 16, borderRadius: Radius.lg, backgroundColor: Colors.white, ...SHADOW },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 18 },
  cardHint: { color: Colors.textLight, fontFamily: FONT.bold, fontSize: 12 },

  legend: { flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: '#D5D4CB' },
  legendText: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 11 },

  seatMap: { alignItems: 'center', gap: 8, marginTop: 8 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  seatGroup: { flexDirection: 'row', gap: 8 },
  rowNumber: { width: 22, textAlign: 'center', color: Colors.textLight, fontFamily: FONT.bold, fontSize: 12 },
  seat: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#D5D4CB', backgroundColor: Colors.white },
  seatFront: { backgroundColor: '#FFF6C2', borderColor: Brand.lemon },
  seatTaken: { backgroundColor: '#E6EAE8', borderColor: '#E6EAE8' },
  seatSelected: { backgroundColor: Brand.forest, borderColor: Brand.forest },
  seatText: { color: Brand.forest, fontFamily: FONT.bold, fontSize: 12 },
  seatTextTaken: { color: '#9AA3A0' },
  seatTextSelected: { color: Brand.lemon },
  priceNote: { marginTop: 14, color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, lineHeight: 18 },

  addOn: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: '#E4E3DA', backgroundColor: Colors.white },
  addOnOn: { borderColor: Brand.forest, backgroundColor: '#F4F8F5' },
  addOnIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Brand.cream },
  addOnTitle: { color: Brand.forest, fontFamily: FONT.bold, fontSize: 14 },
  addOnDetail: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 11, marginTop: 2 },
  addOnRight: { alignItems: 'flex-end', gap: 4 },
  addOnPrice: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 13 },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.white },
  footerLabel: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 9, letterSpacing: 1.2 },
  footerTotal: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 20 },
  continueButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, borderRadius: Radius.pill, backgroundColor: Brand.lemon },
  continueText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },
});
