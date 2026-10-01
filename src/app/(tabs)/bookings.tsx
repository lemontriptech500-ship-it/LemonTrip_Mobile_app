import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useBookings, type Booking } from '@/utils/bookingStore';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BookingFilter = 'All' | 'Upcoming' | 'Completed' | 'Cancelled';

const filters: BookingFilter[] = ['All', 'Upcoming', 'Completed', 'Cancelled'];
const serviceIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  flight: 'airplane-outline',
  hotel: 'bed-outline',
  stay: 'bed-outline',
  package: 'map-outline',
  tour: 'map-outline',
  bus: 'bus-outline',
  train: 'train-outline',
  visa: 'document-text-outline',
};

function getTripDate(booking: Booking) {
  if (!booking.tripDate) return null;
  const date = new Date(`${booking.tripDate.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getBookingCategory(booking: Booking): Exclude<BookingFilter, 'All'> | 'Confirmed' {
  if (booking.status === 'cancelled') return 'Cancelled';
  if (booking.status === 'completed') return 'Completed';
  if (booking.status === 'upcoming') return 'Upcoming';
  const tripDate = getTripDate(booking);
  if (tripDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate < today ? 'Completed' : 'Upcoming';
  }
  return 'Confirmed';
}

function getCountdown(booking: Booking) {
  const tripDate = getTripDate(booking);
  if (!tripDate || getBookingCategory(booking) !== 'Upcoming') return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((tripDate.getTime() - today.getTime()) / 86400000);
  if (days < 0) return null;
  if (days === 0) return 'Your trip starts today';
  return `Your trip starts in ${days} ${days === 1 ? 'day' : 'days'}`;
}

function getServiceIcon(serviceName: string) {
  const service = serviceName.toLowerCase();
  const key = Object.keys(serviceIcons).find((item) => service.includes(item));
  return key ? serviceIcons[key] : 'ticket-outline';
}

function getStatusStyle(category: string) {
  if (category === 'Cancelled') return styles.statusCancelled;
  if (category === 'Completed') return styles.statusCompleted;
  if (category === 'Upcoming') return styles.statusUpcoming;
  return styles.statusConfirmed;
}

export default function BookingsScreen() {
  const bookings = useBookings();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 840;
  const emptyAreaHeight = Math.min(Math.max(height - 350, 240), 420);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const visibleBookings = useMemo(() => {
    if (activeFilter === 'All') return bookings;
    return bookings.filter((booking) => getBookingCategory(booking) === activeFilter);
  }, [bookings, activeFilter]);

  const renderBooking = ({ item }: { item: Booking }) => {
    const category = getBookingCategory(item);
    const countdown = getCountdown(item);
    const tripDate = getTripDate(item);
    const displayDate = tripDate
      ? tripDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : `Booked ${item.bookedAt}`;

    return (
      <View style={[styles.bookingCard, desktop && styles.bookingCardDesktop]}>
        <View style={styles.cardTopRow}>
          <View style={styles.serviceIcon}><Ionicons name={getServiceIcon(item.serviceName)} size={19} color={Colors.primary} /></View>
          <View style={[styles.statusPill, getStatusStyle(category)]}>
            <Text style={styles.statusText}>{category}</Text>
          </View>
        </View>

        <Text style={styles.destination} numberOfLines={2}>{item.itemName}</Text>
        <Text style={styles.bookingType}>{item.serviceName}</Text>

        <View style={styles.bookingMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{displayDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>Booking ID · {item.id}</Text>
          </View>
        </View>

        {countdown ? (
          <View style={styles.countdown}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.amountLabel}>AMOUNT</Text>
            <Text style={styles.amount}>{item.price}</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedBooking(item)} style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View details</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.contentWidth}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.eyebrow}>TRAVEL RECORD</Text>
          <View style={styles.totalBadge}>
            <Ionicons name="ticket-outline" size={14} color={Colors.primary} />
            <Text style={styles.totalBadgeText}>{bookings.length}</Text>
          </View>
        </View>
        <Text style={styles.title}>Your bookings</Text>
        <Text style={styles.subtitle}>Everything you've booked, all in one place.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((filter) => {
          const count = filter === 'All' ? bookings.length : bookings.filter((booking) => getBookingCategory(booking) === filter).length;
          return (
            <TouchableOpacity key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              <Text style={[styles.filterCount, activeFilter === filter && styles.filterCountActive]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const emptyState = bookings.length === 0 ? (
    <View style={[styles.emptyArea, { minHeight: emptyAreaHeight }]}>
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}><Ionicons name="airplane-outline" size={24} color={Colors.primary} /></View>
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptySubtitle}>Your next journey could start here.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Explore journeys</Text>
          <Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.secondaryActions}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore/flights')} style={styles.secondaryButton}>
            <Ionicons name="airplane-outline" size={15} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Search flights</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore/hotels')} style={styles.secondaryButton}>
            <Ionicons name="bed-outline" size={15} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Browse hotels</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ) : (
    <View style={[styles.emptyArea, { minHeight: emptyAreaHeight }]}>
      <View style={styles.filteredEmpty}>
        <Ionicons name="filter-outline" size={20} color={Colors.textLight} />
        <Text style={styles.filteredEmptyText}>No {activeFilter.toLowerCase()} bookings.</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        key={desktop ? 'booking-grid' : 'booking-list'}
        data={visibleBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyState}
        numColumns={desktop ? 2 : 1}
        columnWrapperStyle={desktop ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={selectedBooking !== null} transparent animationType="fade" onRequestClose={() => setSelectedBooking(null)}>
        <View style={styles.modalBackdrop}>
          {selectedBooking ? (
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.eyebrow}>TRAVEL RECORD</Text>
                  <Text style={styles.modalTitle}>Booking details</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close booking details" onPress={() => setSelectedBooking(null)} style={styles.closeButton}>
                  <Ionicons name="close" size={18} color={Colors.textDark} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDestination}>{selectedBooking.itemName}</Text>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Booking type</Text><Text style={styles.modalValue}>{selectedBooking.serviceName}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Booking ID</Text><Text style={styles.modalValue}>{selectedBooking.id}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>{selectedBooking.tripDate ? 'Trip date' : 'Booked on'}</Text><Text style={styles.modalValue}>{selectedBooking.tripDate ?? selectedBooking.bookedAt}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Status</Text><Text style={styles.modalValue}>{getBookingCategory(selectedBooking)}</Text></View>
              <View style={[styles.modalRow, styles.modalTotal]}><Text style={styles.modalTotalLabel}>Amount</Text><Text style={styles.modalTotalValue}>{selectedBooking.price}</Text></View>
              <TouchableOpacity onPress={() => setSelectedBooking(null)} style={styles.doneButton}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 24 },
  contentWidth: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  totalBadge: { minWidth: 38, height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 12, backgroundColor: Colors.accentSoft },
  totalBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 29, lineHeight: 35, fontWeight: '900' },
  subtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 4 },
  filterRow: { gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  filterChip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, backgroundColor: Colors.surface },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: Colors.white },
  filterCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  filterCountActive: { color: Colors.accent },
  gridRow: { width: '100%', maxWidth: 1120, alignSelf: 'center', justifyContent: 'space-between', gap: 14, paddingHorizontal: 20, marginBottom: 14 },
  bookingCard: { marginHorizontal: 16, marginBottom: 12, padding: 15, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface },
  bookingCardDesktop: { flex: 1, marginHorizontal: 0, marginBottom: 0 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serviceIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  statusPill: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13 },
  statusUpcoming: { backgroundColor: Colors.accentSoft },
  statusCompleted: { backgroundColor: Colors.surfaceMuted },
  statusCancelled: { backgroundColor: '#fbeaea' },
  statusConfirmed: { backgroundColor: '#e8f4ed' },
  statusText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  destination: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, lineHeight: 21, fontWeight: '800', marginTop: 12 },
  bookingType: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', marginTop: 4 },
  bookingMeta: { gap: 7, marginTop: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: Colors.background },
  countdownText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  amountLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  amount: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900', marginTop: 3 },
  detailsButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors.background },
  detailsButtonText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  emptyArea: { width: '100%', maxWidth: 1120, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  emptyState: { width: '100%', minHeight: 228, alignItems: 'center', justifyContent: 'center', padding: 20, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, backgroundColor: Colors.surface },
  emptyIcon: { width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.accentSoft, marginBottom: 10 },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  emptySubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 4, textAlign: 'center' },
  exploreButton: { minHeight: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 13, paddingHorizontal: 14, borderRadius: 11, backgroundColor: Colors.accent },
  exploreButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  secondaryActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 9 },
  secondaryButton: { minHeight: 33, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 10 },
  secondaryButtonText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  filteredEmpty: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 8 },
  filteredEmptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(8, 26, 18, 0.48)' },
  modalCard: { width: '100%', maxWidth: 480, padding: 18, borderRadius: 18, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', marginTop: 4 },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.background },
  modalDestination: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginTop: 15, marginBottom: 8 },
  modalRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  modalValue: { flex: 1.2, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', textAlign: 'right' },
  modalTotal: { minHeight: 45, marginTop: 5 },
  modalTotalLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  modalTotalValue: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  doneButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 13, borderRadius: 10, backgroundColor: Colors.accent },
  doneText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
});