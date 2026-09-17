import { Colors } from '@/constants/colors';
import { addBooking } from '@/utils/bookingStore';
import { clearCart, removeFromCart, useCart } from '@/utils/cartStore';
import { router } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const cart = useCart();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleCheckout = () => {
    cart.forEach((item) => {
      addBooking({
        id: `${item.id}-${Date.now()}`,
        serviceName: item.serviceName,
        itemName: item.itemName,
        price: item.price,
        bookedAt: new Date().toLocaleDateString(),
      });
    });
    clearCart();
    Alert.alert('Checkout Complete!', 'Your bookings have been confirmed.', [
      { text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.headerSubtitle}>Review your items before checkout</Text>
      </View>

      {cart.length === 0 ? (
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
            data={cart}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTag}>{item.serviceName}</Text>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.footer}>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout ({cart.length})</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingVertical: 20, paddingHorizontal: 20 },
  backArrow: { color: Colors.accent, fontSize: 14, marginBottom: 10 },
  headerTitle: { color: Colors.accent, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: Colors.white, fontSize: 13 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textDark, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  browseButton: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  browseButtonText: { color: Colors.primaryDark, fontWeight: 'bold', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16,
  },
  serviceTag: { fontSize: 12, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: Colors.textDark, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  removeText: { color: Colors.error, fontSize: 13, fontWeight: '600' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  checkoutButton: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  checkoutButtonText: { color: Colors.primaryDark, fontSize: 16, fontWeight: 'bold' },
});