import { Colors } from '@/constants/colors';
import { addBooking } from '@/utils/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const paymentOptions = ['Credit / Debit Card', 'UPI', 'Wallet'];
const steps = ['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'];

export default function HotelPaymentScreen() {
  const params = useLocalSearchParams<{
    hotelId?: string;
    hotelName?: string;
    roomName?: string;
    price?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  }>();
  const [selectedMethod, setSelectedMethod] = useState('Credit / Debit Card');
  const [paying, setPaying] = useState(false);

  const hotelName = typeof params.hotelName === 'string' ? params.hotelName : 'Hotel stay';
  const roomName = typeof params.roomName === 'string' ? params.roomName : 'Standard room';
  const totalText = typeof params.price === 'string' ? params.price : '₹0';
  const guests = typeof params.guests === 'string' ? params.guests : '2';
  const rooms = typeof params.rooms === 'string' ? params.rooms : '1';
  const checkIn = typeof params.checkIn === 'string' ? params.checkIn : '';
  const checkOut = typeof params.checkOut === 'string' ? params.checkOut : '';

  const handlePay = () => {
    if (paying) return;
    setPaying(true);

    const bookingId = `hotel-${Date.now()}`;
    addBooking({
      id: bookingId,
      serviceName: 'Hotels',
      itemName: `${hotelName} · ${roomName}`,
      price: totalText,
      bookedAt: new Date().toLocaleDateString('en-IN'),
      tripDate: checkIn || new Date().toISOString().slice(0, 10),
      destination: hotelName,
      status: 'confirmed',
    });

    setTimeout(() => {
      router.replace({ pathname: '/confirmation', params: { bookingId } });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerStep}>Step 6/7</Text>
      </View>

      <View style={styles.progressRow}>
        {steps.map((label, index) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, index <= 3 && styles.progressDotActive]}>
              <Text style={[styles.progressNumber, index <= 3 && styles.progressNumberActive]}>{index + 1}</Text>
            </View>
            <Text style={[styles.progressLabel, index === 3 && styles.progressLabelActive]}>{label}</Text>
            {index < steps.length - 1 ? <View style={[styles.progressLine, index < 3 && styles.progressLineActive]} /> : null}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>BOOKING SUMMARY</Text>
          <Text style={styles.hotelName}>{hotelName}</Text>
          <Text style={styles.roomName}>{roomName}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dates</Text>
            <Text style={styles.summaryValue}>{checkIn && checkOut ? `${checkIn} - ${checkOut}` : 'Dates not set'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{guests} guests · {rooms} room</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{totalText}</Text>
          </View>
        </View>

        <View style={styles.methodCard}>
          <Text style={styles.methodEyebrow}>PAYMENT METHOD</Text>
          <Text style={styles.methodTitle}>Choose how to pay</Text>

          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setSelectedMethod(option)}
              style={[styles.methodRow, selectedMethod === option && styles.methodRowActive]}
            >
              <Ionicons name={selectedMethod === option ? 'radio-button-on' : 'radio-button-off'} size={18} color={selectedMethod === option ? Colors.primary : Colors.textLight} />
              <Text style={styles.methodText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handlePay} style={[styles.primaryButton, paying && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>{paying ? 'Processing...' : `Pay ${totalText}`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  headerStep: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 10 },
  progressItem: { flex: 1, alignItems: 'center', position: 'relative' },
  progressDot: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  progressDotActive: { backgroundColor: Colors.primary },
  progressNumber: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  progressNumberActive: { color: Colors.white },
  progressLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 5 },
  progressLabelActive: { color: Colors.primary, fontWeight: '900' },
  progressLine: { position: 'absolute', top: 12, left: '60%', right: '-40%', height: 1, backgroundColor: Colors.border },
  progressLineActive: { backgroundColor: Colors.primary },
  page: { paddingHorizontal: 16, paddingBottom: 24 },
  summaryCard: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  summaryEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  hotelName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900', marginTop: 8 },
  roomName: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, marginTop: 3 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  summaryLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  summaryValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  totalValue: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  methodCard: { marginTop: 18, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  methodEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  methodTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 5 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: Colors.border },
  methodRowActive: { backgroundColor: '#f3faf6', borderColor: Colors.primary },
  methodText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, backgroundColor: Colors.surface },
  primaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900' },
});
