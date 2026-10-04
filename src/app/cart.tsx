import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
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
      <ScreenHeader title="Your trip cart" subtitle="Review everything before checkout." eyebrow="READY WHEN YOU ARE" onBack={handleBack} />

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><TravelArtworkIcon name="cart" size={40} /></View>
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
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
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
  header: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 18 },
  backArrow: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, marginBottom: 10 },
  headerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 27, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  browseButton: { backgroundColor: Colors.accent, borderRadius: 2, paddingVertical: 13, paddingHorizontal: 24 },
  browseButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  list: { paddingHorizontal: 22, paddingTop: 15, paddingBottom: 20, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 15,
  },
  serviceTag: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', color: Colors.secondary, marginBottom: 4 },
  itemName: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  price: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.primary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  checkoutButton: { backgroundColor: Colors.accent, borderRadius: 2, paddingVertical: 15, alignItems: 'center' },
  checkoutButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  emptyIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, marginBottom: 18 },
});