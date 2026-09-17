import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useBookings } from '@/utils/bookingStore';

export default function CartScreen() {
  const bookings = useBookings();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.headerSubtitle}>Review your bookings before checkout</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse flights, hotels, and packages to add items to your cart.
          </Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.browseButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
          <View style={styles.footer}>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
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
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backArrow: {
    color: Colors.accent,
    fontSize: 14,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  checkoutButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});