import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { removeFromCart, useCart } from '@/utils/cartStore';
import { router } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function CartScreen() {
  const cart = useCart();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleCheckout = () => router.push('/checkout');

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
  backArrow: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginBottom: 10 },
  headerTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.display, fontWeight: FontWeight.extraBold, marginBottom: 4 },
  headerSubtitle: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginBottom: 8 },
  emptySubtitle: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  browseButton: { minHeight: Ui.button.minHeight,  backgroundColor: Colors.accent, borderRadius: Ui.radius.button, paddingVertical: 13, paddingHorizontal: 24 },
  browseButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontWeight: FontWeight.extraBold, fontSize: TextSize.body },
  list: { paddingHorizontal: 22, paddingTop: 15, paddingBottom: 20, gap: 10 },
  card: { ...Ui.card, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 15,
  },
  serviceTag: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.secondary, marginBottom: 4 },
  itemName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginBottom: 4 },
  price: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.primary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  checkoutButton: { minHeight: Ui.button.minHeight,  backgroundColor: Colors.accent, borderRadius: Ui.radius.button, paddingVertical: 15, alignItems: 'center' },
  checkoutButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  emptyIcon: { borderRadius: 29, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, marginBottom: 18 },
});