import { Brand, Colors, Radius } from '@/constants/colors';
import { shortId } from '@/utils/bookingFormat';
import { updateBookingStatus, useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const CANCELLATION_FEE_PERCENT = 10;
const REASONS = [
  'Change of plans',
  'Found a better price',
  'Booked by mistake',
  'Travel dates changed',
  'Other',
];

function parsePrice(price: string) {
  const symbol = price.match(/^[^0-9]*/)?.[0].trim() || '₹';
  const amount = Number(price.replace(/[^0-9.]/g, '')) || 0;
  return { symbol, amount };
}

function money(symbol: string, value: number) {
  return `${symbol}${Math.round(value).toLocaleString('en-IN')}`;
}

export default function CancelBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookings = useBookings();
  const booking = bookings.find((item) => String(item.id) === String(id));
  const [reason, setReason] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/bookings' as never);
  };

  const goToTrips = () => router.replace('/(tabs)/bookings' as never);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Brand.lemon} />
          <Text style={styles.centerText}>Booking not found</Text>
          <TouchableOpacity style={styles.lemonButton} onPress={goToTrips}>
            <Text style={styles.lemonButtonText}>Go to My Trips</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bookingId = shortId(booking.id);
  const { symbol, amount } = parsePrice(booking.price);
  const fee = (amount * CANCELLATION_FEE_PERCENT) / 100;
  const refund = amount - fee;

  const handleConfirm = () => {
    updateBookingStatus(booking.id, 'cancelled');
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={Brand.forest} />
          </View>
          <Text style={styles.centerText}>Booking cancelled</Text>
          <Text style={styles.successSub}>
            Refund of {money(symbol, refund)} will reach your original payment method in 5–7 business days.
          </Text>
          <TouchableOpacity style={styles.lemonButton} onPress={goToTrips}>
            <Text style={styles.lemonButtonText}>Back to My Trips</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={22} color={Brand.forest} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrowLemon}>CANCELLATION</Text>
          <Text style={styles.pageTitle}>Cancel booking</Text>
          <Text style={styles.headerSub}>{bookingId}</Text>
        </View>

        {/* Booking summary */}
        <View style={styles.card}>
          <Text style={styles.eyebrowDark}>{(booking.serviceName ?? '').toUpperCase()}</Text>
          <Text style={styles.itemName}>{booking.itemName}</Text>
          {booking.destination ? (
            <View style={styles.destRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textLight} />
              <Text style={styles.destText}>{booking.destination}</Text>
            </View>
          ) : null}
        </View>

        {/* Reason */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reason for cancellation</Text>
          <View style={styles.chips}>
            {REASONS.map((item) => {
              const active = reason === item;
              return (
                <TouchableOpacity
                  key={item}
                  accessibilityRole="button"
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setReason(item)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Refund summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Refund summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Booking amount</Text>
            <Text style={styles.rowValue}>{money(symbol, amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cancellation fee ({CANCELLATION_FEE_PERCENT}%)</Text>
            <Text style={[styles.rowValue, styles.feeValue]}>- {money(symbol, fee)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Refund amount</Text>
            <Text style={styles.totalValue}>{money(symbol, refund)}</Text>
          </View>
          <Text style={styles.note}>
            Refund goes to your original payment method in 5–7 business days.
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.confirmButton, !reason && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={!reason}
        >
          <Text style={styles.confirmButtonText}>Confirm cancellation</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.keepButton} onPress={goBack}>
          <Text style={styles.keepButtonText}>Keep my booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  container: { flex: 1, backgroundColor: Brand.cream },
  content: { paddingBottom: 32, width: '100%', maxWidth: 900, alignSelf: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 28 },
  centerText: { color: Colors.white, fontFamily: FONT.extra, fontSize: 20, textAlign: 'center' },
  successIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: Brand.lemon,
  },
  successSub: { color: Colors.white, fontFamily: FONT.medium, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  lemonButton: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill, backgroundColor: Brand.lemon },
  lemonButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: Brand.forest,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: Brand.lemon,
  },
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.6 },
  eyebrowDark: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.4 },
  pageTitle: { color: Colors.white, fontFamily: FONT.extra, fontSize: 28, marginTop: 4 },
  headerSub: { color: Colors.white, fontFamily: FONT.medium, fontSize: 13, marginTop: 4, opacity: 0.8 },

  card: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...SHADOW,
  },
  itemName: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 18, lineHeight: 24, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
  destText: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 13, flexShrink: 1 },

  sectionTitle: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 15, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: '#D5D4CB',
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Brand.forest, borderColor: Brand.forest },
  chipText: { color: Colors.textDark, fontFamily: FONT.bold, fontSize: 13 },
  chipTextActive: { color: Brand.lemon },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowLabel: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 13, flexShrink: 1 },
  rowValue: { color: Colors.textDark, fontFamily: FONT.bold, fontSize: 14 },
  feeValue: { color: '#C0392B' },
  separator: { height: 1, backgroundColor: '#E6E5DC', marginVertical: 6 },
  totalLabel: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 15 },
  totalValue: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 22 },
  note: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, lineHeight: 18, marginTop: 8 },

  confirmButton: {
    minHeight: 52,
    marginTop: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Brand.forest,
  },
  confirmButtonText: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 15 },
  disabledButton: { opacity: 0.4 },
  keepButton: {
    minHeight: 52,
    marginTop: 10,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Brand.lemon,
  },
  keepButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 15 },
});