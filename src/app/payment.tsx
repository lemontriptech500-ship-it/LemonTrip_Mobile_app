import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { addBooking } from '@/utils/bookingStore';
import { clearCart, useCart } from '@/utils/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  const cart = useCart();
  const total = cart.length === 1 ? cart[0]?.price : `${cart.length} items`;

  const completePayment = () => {
    cart.forEach((item) => addBooking({ id: `${item.id}-${Date.now()}`, serviceName: item.serviceName, itemName: item.itemName, price: item.price, bookedAt: new Date().toLocaleDateString(), tripDate: item.tripDate }));
    clearCart();
    Alert.alert('Booking confirmed', 'Your journey has been added to bookings.', [{ text: 'View bookings', onPress: () => router.replace('/(tabs)/bookings') }]);
  };

  return <SafeAreaView style={styles.safeArea} edges={['top']}><ScrollView contentContainerStyle={styles.page}><View style={styles.content}><ScreenHeader title="Payment" subtitle="Review your secure payment step before confirming." eyebrow="CHECKOUT / PAYMENT" onBack={() => router.canGoBack() ? router.back() : router.replace('/cart')} /><View style={styles.progress}>{['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'].map((step, index) => <View key={step} style={styles.progressItem}><View style={[styles.progressDot, index <= 3 && styles.progressDotActive]}><Text style={[styles.progressNumber, index <= 3 && styles.progressNumberActive]}>{index + 1}</Text></View><Text style={[styles.progressLabel, index === 3 && styles.progressLabelActive]}>{step}</Text></View>)}</View><View style={styles.panel}><View style={styles.icon}><Ionicons name="lock-closed-outline" size={21} color={Colors.primary} /></View><Text style={styles.title}>Secure payment</Text><Text style={styles.description}>Payment provider integration will be connected here. Your passenger details are saved for this checkout session.</Text><View style={styles.trust}><Ionicons name="shield-checkmark-outline" size={18} color={Colors.secondary} /><Text style={styles.trustText}>Your payment information is protected and never stored by LemonTrip.</Text></View><View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>{total}</Text></View><TouchableOpacity onPress={completePayment} style={styles.button}><Text style={styles.buttonText}>Confirm booking</Text><Ionicons name="checkmark" size={17} color={Colors.primaryDark} /></TouchableOpacity></View></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 30 }, content: { width: '100%', maxWidth: 620, alignSelf: 'center' }, progress: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 17 }, progressItem: { alignItems: 'center', gap: 5 }, progressDot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted }, progressDotActive: { backgroundColor: Colors.primary }, progressNumber: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' }, progressNumberActive: { color: Colors.white }, progressLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 }, progressLabelActive: { color: Colors.primary, fontWeight: '900' }, panel: { marginHorizontal: 16, padding: 20, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, backgroundColor: Colors.surface }, icon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.accentSoft }, title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 22, fontWeight: '900', marginTop: 14 }, description: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 18, marginTop: 6 }, trust: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 18, padding: 12, borderRadius: 12, backgroundColor: Colors.surfaceMuted }, trustText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15 }, totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 22, paddingTop: 15, borderTopWidth: 1, borderTopColor: Colors.border }, totalLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' }, total: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 20, fontWeight: '900' }, button: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, borderRadius: 11, backgroundColor: Colors.accent }, buttonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
});
