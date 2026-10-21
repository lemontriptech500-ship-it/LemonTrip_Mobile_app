import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { removeFromCart, useCart } from '@/utils/cartStore';
import { router } from 'expo-router';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

const INTER = { regular: 'Inter-Regular', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const GREEN = '#103D30';

export default function CartScreen() {
  useAppLanguage();
  const cart = useCart();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  const handleCheckout = () => router.push('/checkout');

  const banner = (
    <View style={styles.bannerWrap}>
      <View style={styles.banner}>
        <Image source={require('../../assets/images/Travel Booking Cart in Emerald Landscape.png')} resizeMode="cover" style={styles.bannerImg} />
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerEyebrow} numberOfLines={1}>READY WHEN YOU ARE</Text>
          <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Your trip cart</Text>
          <Text style={styles.bannerSub} numberOfLines={2}>Review everything before checkout.</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView headerTone="light" style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={styles.topTitle}>Your trip cart</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[styles.topBtn, styles.topBtnTint]}>
          <Ionicons name="settings-outline" size={22} color={GREEN} />
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={styles.flex}>
          {banner}
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Ionicons name="bag-handle-outline" size={36} color={GREEN} /></View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Browse flights, hotels, and packages to add items to your cart.
            </Text>
            <TouchableOpacity accessibilityRole="button" style={styles.browseButton} onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.browseButtonText}>Browse Services</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={banner}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTag}>{item.serviceName}</Text>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove from cart" onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.footer}>
            <TouchableOpacity accessibilityRole="button" style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout ({cart.length})</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN },
  bannerWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, width: '100%', maxWidth: 820, alignSelf: 'center' },
  banner: { width: '100%', aspectRatio: 2.993, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: GREEN },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { width: '60%', paddingLeft: 18 },
  bannerEyebrow: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.2, color: Colors.accent },
  bannerTitle: { fontFamily: INTER.bold, fontSize: 24, lineHeight: 30, color: Colors.white, marginTop: 4 },
  bannerSub: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 17, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1B8', marginBottom: 16 },
  emptyTitle: { fontFamily: INTER.extrabold, fontSize: 20, color: GREEN, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontFamily: INTER.regular, fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  browseButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24, borderRadius: 24, backgroundColor: GREEN },
  browseButtonText: { color: Colors.white, fontFamily: INTER.bold, fontSize: 15 },
  list: { paddingHorizontal: 0, paddingBottom: 20, gap: 10 },
  card: { marginHorizontal: 16, paddingHorizontal: 18, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  serviceTag: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 0.8, color: '#1B6B4A', marginBottom: 4 },
  itemName: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: Colors.textDark, marginBottom: 4 },
  price: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: GREEN },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  checkoutButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 27, backgroundColor: GREEN },
  checkoutButtonText: { color: Colors.white, fontFamily: INTER.bold, fontSize: TextSize.bodyLarge },
});