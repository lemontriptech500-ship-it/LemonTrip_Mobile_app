import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Colors } from '@/constants/colors';
import { supportContact } from '@/constants/navigation';
import { useAuth } from '@/utils/authStore';
import { loadWallet, type WalletData } from '@/utils/featureApi';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Linking, ScrollView, StyleSheet, View } from 'react-native';

// Inter (static weights, loaded in app/_layout.tsx).
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const BRAND = '#103D30';
// Banner artwork lives in assets/images (file name as saved in the project).
const WALLET_BANNER = require('../../assets/images/Emerald Wallet Travel Banner.png');
const PROMO_ART = require('../../assets/images/profile-banner.png');

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const paymentLinks: { title: string; detail: string; icon: IconName; route: string }[] = [
  { title: 'Transactions', detail: 'Top-ups, bookings and refunds', icon: 'receipt-outline', route: '/wallet/transactions' },
  { title: 'Add money', detail: 'Top up securely', icon: 'add-circle-outline', route: '/wallet/add-money' },
  { title: 'Payment methods', detail: 'Choose how to pay', icon: 'card-outline', route: '/wallet/payment-methods' },
  { title: 'Coupons & promo codes', detail: 'A little extra for your journey', icon: 'pricetag-outline', route: '/wallet/coupons' },
  { title: 'Payment status', detail: 'Track a payment', icon: 'checkmark-circle-outline', route: '/wallet/payment-status' },
];

export default function WalletScreen() {
  useAppLanguage();
  const user = useAuth(); const [wallet, setWallet] = useState<{ actor: string; data: WalletData } | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { let active = true; if (!user || !process.env.EXPO_PUBLIC_WALLET_API_URL) return; void Promise.resolve().then(() => { if (active) setLoading(true); return loadWallet(); }).then(data => { if (active) setWallet({ actor: user.id, data }); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Wallet unavailable.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user]);
  const openWebsite = async () => { try { await Linking.openURL(`${supportContact.website}/wallet`); } catch { Alert.alert('LemonTrip wallet', `Open ${supportContact.website}/wallet in your browser.`); } };
  const verified = user && wallet?.actor === user.id ? wallet.data : null;
  const go = (path: string) => router.push(path as Href);
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/home' as Href); };
  const amount = verified ? new Intl.NumberFormat(getAppLocale(), { style: 'currency', currency: verified.currency }).format(verified.balance) : '—';

  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.headerTitle}>My Wallet</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => go('/settings')} style={s.gearButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={BRAND} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={s.content}>
          <View style={s.hero}>
            <ImageBackground source={WALLET_BANNER} style={s.heroTop} resizeMode="cover">
              <View style={s.heroCopy}>
                <Text style={s.eyebrow}>LEMONTRIP WALLET</Text>
                <Text style={s.heroTitle} numberOfLines={1} adjustsFontSizeToFit>Your travel wallet</Text>
                <Text style={s.heroText}>Balance, payments, and a little extra for your next trip.</Text>
              </View>
            </ImageBackground>

            <View style={s.heroBottom}>
              <View style={s.balance}>
                <View style={s.balanceHead}>
                  <View style={s.flex}>
                    <View style={s.labelRow}>
                      <Text style={s.label}>AVAILABLE BALANCE</Text>
                      <TouchableOpacity accessibilityRole="button" accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'} onPress={() => setHidden((v) => !v)} hitSlop={8}>
                        <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={16} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                    {loading ? <ActivityIndicator color={Colors.white} style={{ alignSelf: 'flex-start', marginTop: 10 }} /> : <Text style={s.amount} numberOfLines={1}>{hidden && verified ? '••••••' : amount}</Text>}
                  </View>
                  <View style={s.balanceIcon}><Ionicons name="wallet-outline" size={22} color={BRAND} /></View>
                </View>
                <Text style={s.note}>{loading ? 'Checking your balance…' : !user ? 'Sign in to access your wallet' : verified ? 'Verified wallet balance' : 'Your balance is unavailable right now.'}</Text>
              </View>

              <View style={s.actions}>
                <TouchableOpacity accessibilityRole="button" onPress={() => (user ? go('/wallet/add-money') : router.push('/login'))} style={[s.action, s.actionPrimary]} activeOpacity={0.85}>
                  <View style={s.plusCircle}><Ionicons name={user ? 'add' : 'log-in-outline'} size={16} color={Colors.accent} /></View>
                  <Text style={s.actionPrimaryText} numberOfLines={1}>{user ? 'Add Money' : 'Sign in'}</Text>
                  <Ionicons name="arrow-forward" size={16} color={BRAND} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={() => go('/wallet/transactions')} style={[s.action, s.actionSoft]} activeOpacity={0.85}>
                  <Ionicons name="document-text-outline" size={18} color={Colors.white} />
                  <Text style={s.actionSoftText} numberOfLines={1}>Transactions</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {error ? <View accessibilityRole="alert" style={s.error}><Ionicons name="alert-circle" size={18} color={Colors.error} /><Text style={s.errorText}>{error}</Text></View> : null}

          <View style={s.card}>
            <Text style={s.cardTitle}>Manage your payments</Text>
            {paymentLinks.map((item, index) => (
              <TouchableOpacity key={item.title} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => go(item.route)} activeOpacity={0.75} style={[s.row, index < paymentLinks.length - 1 && s.divider]}>
                <View style={s.iconCircle}><Ionicons name={item.icon} size={20} color={BRAND} /></View>
                <View style={s.flex}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  <Text style={s.rowDetail}>{item.detail}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.promo}>
            <View style={s.promoCopy}>
              <Text style={s.promoTitle}>Explore more, spend smarter!</Text>
              <Text style={s.promoText}>Get exclusive wallet offers and cashbacks on your next trip.</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => go('/offers')} style={s.promoButton} activeOpacity={0.85}>
                <Text style={s.promoButtonText}>View Offers</Text>
                <Ionicons name="arrow-forward" size={16} color={BRAND} />
              </TouchableOpacity>
            </View>
            <Image source={PROMO_ART} style={s.promoArt} resizeMode="contain" />
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Need another way to access your wallet?</Text>
            <Text style={s.body}>View your wallet on the LemonTrip website using your website sign-in.</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => void openWebsite()} style={s.outlineButton} activeOpacity={0.85}>
              <Text style={s.outlineText}>Open website wallet</Text>
              <Ionicons name="open-outline" size={17} color={BRAND} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Wallet support" onPress={() => go('/contact')} activeOpacity={0.8} style={s.support}>
            <View style={s.iconCircle}><Ionicons name="headset-outline" size={20} color={BRAND} /></View>
            <View style={s.flex}>
              <Text style={s.rowTitle}>Wallet support</Text>
              <Text style={s.rowDetail}>Get help with your wallet, payments and refunds</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },

  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: INTER.bold, flex: 1, color: BRAND, fontSize: TextSize.title },
  gearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },

  hero: { marginHorizontal: 16, marginTop: 14, marginBottom: 14, borderRadius: 22, overflow: 'hidden', backgroundColor: Colors.primaryDark },
  heroTop: { width: '100%', aspectRatio: 1.9, justifyContent: 'flex-start', paddingTop: 18 },
  heroCopy: { width: '62%', paddingLeft: 18 },
  eyebrow: { fontFamily: INTER.extrabold, color: Colors.accent, fontSize: TextSize.micro, letterSpacing: 1.2, marginBottom: 4 },
  heroTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.displaySmall },
  heroText: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.body, lineHeight: 18, marginTop: 4 },
  heroBottom: { paddingHorizontal: 14, paddingBottom: 14, marginTop: -59 },
  balance: { padding: 16, borderRadius: 18, backgroundColor: 'rgba(12,48,38,0.78)', borderWidth: 1, borderColor: Colors.onDarkBorder },
  balanceHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: INTER.semibold, color: Colors.white, fontSize: TextSize.micro, letterSpacing: 1.2 },
  amount: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.display, marginTop: 6 },
  balanceIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.white },
  note: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.caption, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  action: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 999 },
  actionPrimary: { backgroundColor: Colors.accent },
  actionSoft: { backgroundColor: 'rgba(255,255,255,0.14)' },
  plusCircle: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: BRAND },
  actionPrimaryText: { flex: 1, fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.caption },
  actionSoftText: { flex: 1, fontFamily: INTER.bold, color: Colors.white, fontSize: TextSize.caption },

  error: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 14, padding: 12, borderRadius: 14, backgroundColor: Colors.errorSoft },
  errorText: { flex: 1, fontFamily: INTER.medium, fontSize: TextSize.caption, lineHeight: 17, color: Colors.error },

  card: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginBottom: 8 },
  row: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  iconCircle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  rowTitle: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body },
  rowDetail: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
  body: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18 },

  promo: { marginHorizontal: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 18, borderRadius: 22, backgroundColor: Colors.accentSoft, overflow: 'hidden' },
  promoCopy: { flex: 1, minWidth: 0 },
  promoTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.bodyLarge },
  promoText: { fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17, marginTop: 4 },
  promoButton: { alignSelf: 'flex-start', minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingHorizontal: 18, borderRadius: 999, backgroundColor: Colors.white },
  promoButtonText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.caption },
  promoArt: { width: 110, height: 90 },

  outlineButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1, borderColor: Colors.secondary, backgroundColor: Colors.surface },
  outlineText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.caption },

  support: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
});