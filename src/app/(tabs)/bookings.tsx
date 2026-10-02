import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '@/utils/bookingStore';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  const bookings = useBookings();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Your bookings" subtitle="Every detail of your journey, in one place." eyebrow="TRAVEL RECORD" />

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Ionicons name="ticket-outline" size={26} color={Colors.primary} /></View>
          <Text style={styles.emptyTitle}>Nothing booked yet</Text>
          <Text style={styles.emptySubtitle}>
            Your flight, hotel, and package bookings will appear here once you make one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.serviceTag}>{item.serviceName}</Text>
                <Text style={styles.dateText}>{item.bookedAt}</Text>
              </View>
              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 18,
  },
  headerTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 28,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 17,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceTag: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dateText: {
    fontFamily: 'Manrope',
    fontSize: 10,
    color: Colors.textLight,
  },
  itemName: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, marginBottom: 18 },
});