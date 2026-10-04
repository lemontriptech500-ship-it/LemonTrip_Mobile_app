import { Colors } from '@/constants/colors';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import { useBookings, type Booking } from '@/utils/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getServiceIcon(serviceName: string): keyof typeof Ionicons.glyphMap {
  const service = serviceName.toLowerCase();
  if (service.includes('flight')) return 'airplane-outline';
  if (service.includes('hotel') || service.includes('stay')) return 'bed-outline';
  if (service.includes('bus')) return 'bus-outline';
  if (service.includes('package') || service.includes('holiday')) return 'map-outline';
  return 'ticket-outline';
}

function formatDate(value?: string) {
  if (!value) return 'Date to be confirmed';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ConfirmationScreen() {
  const bookings = useBookings();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = bookings.find((item) => item.id === bookingId) ?? bookings[0];

  if (!booking) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.emptyState}><View style={styles.emptyIcon}><Ionicons name="checkmark-circle-outline" size={28} color={Colors.primary} /></View><Text style={styles.emptyTitle}>No confirmed trip yet</Text><Text style={styles.emptyText}>Complete a booking to see its confirmation here.</Text><TouchableOpacity onPress={() => router.replace('/(tabs)/explore')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Continue exploring</Text></TouchableOpacity></View></SafeAreaView>;
  }

  const shareBooking = () => Share.share({ title: 'LemonTrip booking confirmation', message: `LemonTrip booking ${booking.id}\n${booking.itemName}\n${formatDate(booking.tripDate)}` });
  const emailConfirmation = () => Linking.openURL(`mailto:?subject=${encodeURIComponent(`LemonTrip booking ${booking.id}`)}&body=${encodeURIComponent(`Booking ID: ${booking.id}\n${booking.itemName}\nTravel date: ${formatDate(booking.tripDate)}\nAmount: ${booking.price}`)}`);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <BrandGradientBar style={styles.topBar}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go to bookings" onPress={() => router.replace('/(tabs)/bookings')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
            </TouchableOpacity>
            <LemonTripBrand size={42} />
            <Text style={[styles.breadcrumb, { color: Colors.white }]}>CONFIRMATION</Text>
          </BrandGradientBar>
          <View style={styles.successHero}>
            <View style={styles.successIcon}><Ionicons name="checkmark" size={34} color={Colors.primaryDark} /></View>
            <Text style={styles.successTitle}>Your trip is confirmed</Text>
            <Text style={styles.successText}>Your booking has been added to your LemonTrip travel record.</Text>
            <View style={styles.bookingId}><Text style={styles.bookingIdLabel}>BOOKING ID</Text><Text style={styles.bookingIdValue}>{booking.id}</Text></View>
            <View style={styles.statusPill}><Ionicons name="shield-checkmark-outline" size={14} color={Colors.secondary} /><Text style={styles.statusText}>{booking.status === 'confirmed' ? 'Payment confirmed' : 'Booking recorded'}</Text></View>
          </View>
          <View style={styles.progress}>{['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'].map((step, index) => <View key={step} style={styles.progressItem}><View style={styles.progressDot}><Text style={styles.progressNumber}>{index + 1}</Text></View><Text style={[styles.progressLabel, index === 4 && styles.progressLabelActive]}>{step}</Text>{index < 4 ? <View style={styles.progressLine} /> : null}</View>)}</View>
          <View style={styles.panel}>
            <View style={styles.panelHeading}><View><Text style={styles.eyebrow}>ITINERARY</Text><Text style={styles.panelTitle}>Your booking details</Text></View><View style={styles.serviceIcon}><Ionicons name={getServiceIcon(booking.serviceName)} size={20} color={Colors.primary} /></View></View>
            <Text style={styles.itemName}>{booking.itemName}</Text><Text style={styles.serviceName}>{booking.serviceName}</Text>
            <View style={styles.detailGrid}><Detail icon="calendar-outline" label="Date" value={formatDate(booking.tripDate)} /><Detail icon="time-outline" label="Time" value="As shown in itinerary" /><Detail icon="location-outline" label="Location" value="Included in booking details" /><Detail icon="person-outline" label="Traveller" value="Passenger details provided" /></View>
            <View style={styles.amountRow}><Text style={styles.amountLabel}>Amount</Text><Text style={styles.amount}>{booking.price}</Text></View>
          </View>
          <View style={styles.actions}>
            <Action icon="download-outline" title="Download ticket" onPress={() => Linking.openURL(`mailto:?subject=${encodeURIComponent(`Ticket request for ${booking.id}`)}&body=${encodeURIComponent(`Please send the ticket for booking ${booking.id}.`)}`)} />
            <Action icon="ticket-outline" title="View booking" onPress={() => router.replace('/(tabs)/bookings')} />
            <Action icon="mail-outline" title="Email confirmation" onPress={emailConfirmation} />
            <Action icon="share-social-outline" title="Share" onPress={shareBooking} />
            <Action icon="calendar-outline" title="Add to calendar" onPress={() => Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.itemName)}&dates=&details=${encodeURIComponent(`LemonTrip booking ${booking.id}`)}`)} />
          </View>
          <View style={styles.support}><Ionicons name="headset-outline" size={21} color={Colors.primary} /><View style={styles.supportCopy}><Text style={styles.eyebrow}>NEED A HAND?</Text><Text style={styles.supportTitle}>Need help with your booking?</Text><Text style={styles.supportText}>Our support team can help with itinerary questions or booking changes.</Text></View><TouchableOpacity onPress={() => router.push('/help')} style={styles.supportButton}><Text style={styles.supportButtonText}>Contact support</Text></TouchableOpacity></View>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/explore')} style={styles.exploreButton}><Text style={styles.exploreButtonText}>Continue exploring</Text><Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) { return <View style={styles.detail}><Ionicons name={icon} size={16} color={Colors.primary} /><View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View></View>; }
function Action({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void }) { return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.action}><View style={styles.actionIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View><Text style={styles.actionTitle}>{title}</Text></TouchableOpacity>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 30 }, content: { width: '100%', maxWidth: 920, alignSelf: 'center' }, topBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16 }, backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surface }, breadcrumb: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1 }, successHero: { alignItems: 'center', marginHorizontal: 16, padding: 22, borderRadius: 20, backgroundColor: Colors.primaryDark }, successIcon: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: 33, backgroundColor: Colors.accent }, successTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 26, fontWeight: '900', marginTop: 13, textAlign: 'center' }, successText: { maxWidth: 380, color: 'rgba(255,255,255,0.75)', fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginTop: 5, textAlign: 'center' }, bookingId: { alignItems: 'center', marginTop: 17, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)' }, bookingIdLabel: { color: 'rgba(255,255,255,0.58)', fontFamily: 'Manrope', fontSize: 7, fontWeight: '900', letterSpacing: 1 }, bookingIdValue: { color: Colors.white, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900', marginTop: 3 }, statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, backgroundColor: Colors.white }, statusText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' }, progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginVertical: 18 }, progressItem: { flex: 1, alignItems: 'center', position: 'relative' }, progressDot: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.primary }, progressNumber: { color: Colors.white, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' }, progressLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, marginTop: 4 }, progressLabelActive: { color: Colors.primary, fontWeight: '900' }, progressLine: { position: 'absolute', top: 12, left: '61%', right: '-39%', height: 1, backgroundColor: Colors.primary }, panel: { marginHorizontal: 16, padding: 17, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, backgroundColor: Colors.surface }, panelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: Colors.border }, eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1.1 }, panelTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 4 }, serviceIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft }, itemName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, lineHeight: 21, fontWeight: '900', marginTop: 15 }, serviceName: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', marginTop: 4 }, detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 17 }, detail: { width: '47%', flexDirection: 'row', alignItems: 'flex-start', gap: 7 }, detailCopy: { flex: 1, minWidth: 0 }, detailLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 }, detailValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, lineHeight: 13, fontWeight: '800', marginTop: 2 }, amountRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 17, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border }, amountLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' }, amount: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginTop: 13 }, action: { width: '31.8%', minHeight: 74, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, backgroundColor: Colors.surface }, actionIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accentSoft }, actionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', textAlign: 'center' }, support: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 14, borderRadius: 15, backgroundColor: Colors.surfaceMuted }, supportCopy: { flex: 1, minWidth: 0 }, supportTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900', marginTop: 3 }, supportText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 13, marginTop: 3 }, supportButton: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 9, backgroundColor: Colors.accent }, supportButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' }, exploreButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, borderRadius: 11, backgroundColor: Colors.accent }, exploreButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' }, emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, emptyIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.accentSoft }, emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900', marginTop: 13 }, emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, textAlign: 'center', marginTop: 5 }, primaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 15, paddingHorizontal: 15, borderRadius: 11, backgroundColor: Colors.accent }, primaryButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
});
