import { Brand, Colors, Radius } from '@/constants/colors';
import type { Offer } from '@/data/offers';
import type { TravelPackage } from '@/types/content';
import { getUser, useAuth } from '@/utils/authStore';
import { useContentItems } from '@/utils/contentApi';
import { getOfferValidity, loadOffers } from '@/utils/offerApi';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type AppRoute = Parameters<typeof router.push>[0];

// ---------------------------------------------------------------------
// Static data (swap with real data later)
// ---------------------------------------------------------------------

const TABS: { key: string; label: string; icon: IconName; route: AppRoute }[] = [
  { key: 'flights', label: 'Flights', icon: 'airplane-outline', route: '/(tabs)/explore/flights' },
  { key: 'hotels', label: 'Hotels', icon: 'business-outline', route: '/(tabs)/explore/hotels' },
  { key: 'packages', label: 'Packages', icon: 'sunny-outline', route: '/packages' },
  { key: 'visa', label: 'Visa', icon: 'id-card-outline', route: '/(tabs)/explore/visa' },
  { key: 'ai', label: 'AI Plan', icon: 'sparkles-outline', route: '/ai-planner' },
];

const CATEGORIES = ['Honeymoon', 'Beach & Boating', 'Mountain Treks', 'City Tours', 'Luxury Resorts'];

const samplePackages: TravelPackage[] = [
  { id: 'maldives', title: 'Maldives · 5D/4N', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900', duration: '5 Days 4 Nights', price: '₹1,30,550', badge: '8% OFF', description: '', highlights: [] },
  { id: 'bali', title: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900', duration: '5 Days 4 Nights', price: '₹35,000', description: '', highlights: [] },
  { id: 'kashmir-paradise', title: 'Kashmir Paradise', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=900', duration: '5 Days 4 Nights', price: '₹18,999', badge: 'Best Seller', description: '', highlights: [] },
];

// ---------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------

function SectionHeader({ eyebrow, title, action, onPress }: { eyebrow: string; title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
        <Text style={styles.sectionAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

function SearchField({ icon, label, value, sub, align = 'left' }: { icon?: IconName; label: string; value: string; sub?: string; align?: 'left' | 'right' }) {
  return (
    <View style={{ flex: 1, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        {icon ? <Ionicons name={icon} size={18} color={Brand.forest} /> : null}
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
      {sub ? <Text style={styles.fieldSub}>{sub}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const user = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [verifiedOffers, setVerifiedOffers] = useState<Offer[]>([]);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');

  useEffect(() => {
    let mounted = true;
    loadOffers()
      .then(({ offers, source }) => {
        if (!mounted || source !== 'backend') return;
        setVerifiedOffers(offers.filter((o) => getOfferValidity(o.validUntil) === 'active'));
      })
      .catch(() => {
        if (mounted) setVerifiedOffers([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!fontsLoaded) return null;

  const visiblePackages = (travelPackages.length ? travelPackages : samplePackages).slice(0, 6);
  const visibleOffers = verifiedOffers.slice(0, 5);
  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : null;
  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const handleProfilePress = () => router.push(getUser() ? '/(tabs)/profile' : '/login');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        {/* ---------- Green header ---------- */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoLetter}>L</Text>
              </View>
              <Text style={styles.brandText}>LemonTrip</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Saved places"
                onPress={() => router.push('/(tabs)/wishlist')}
                style={styles.circleButton}
              >
                <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={user ? 'Profile' : 'Login'}
                onPress={handleProfilePress}
                style={styles.avatar}
              >
                {initials ? (
                  <Text style={styles.avatarText}>{initials}</Text>
                ) : (
                  <Ionicons name="person-outline" size={18} color={Brand.forest} />
                )}
              </Pressable>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationText}>New Delhi, IN · Change</Text>
          </View>
        </View>

        {/* ---------- Search card (overlaps header) ---------- */}
        <View style={styles.searchCard}>
          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <Pressable key={tab.key} accessibilityRole="tab" onPress={() => setActiveTab(tab.key)} style={styles.tab}>
                  <Ionicons name={tab.icon} size={22} color={active ? Brand.forest : Colors.textLight} />
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                  <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.routeRow}>
            <SearchField label="FROM" value="New Delhi" sub="DEL, India" />
            <View style={styles.swapButton}>
              <Ionicons name="swap-horizontal" size={18} color={Brand.forest} />
            </View>
            <SearchField label="TO" value="Maldives" sub="MLE, Maldives" align="right" />
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <SearchField icon="calendar-outline" label="DEPARTURE" value="18 Nov" />
            <SearchField icon="calendar-outline" label="RETURN" value="23 Nov" />
            <SearchField icon="people-outline" label="TRAVELERS" value="2 Adults" />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(currentTab.route)}
            style={({ pressed }) => [styles.searchButton, pressed && { opacity: 0.9 }]}
          >
            <Ionicons name="sparkles-outline" size={18} color={Brand.forest} />
            <Text style={styles.searchButtonText}>Search Trips</Text>
          </Pressable>
        </View>

        {/* ---------- Featured packages ---------- */}
        <View style={styles.section}>
          <SectionHeader eyebrow="HANDPICKED FOR YOU" title="Featured packages" action="View all" onPress={() => router.push('/packages')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visiblePackages.map((pkg) => (
              <Pressable
                key={pkg.id}
                accessibilityRole="button"
                onPress={() => router.push(`/packages/${pkg.id}`)}
                style={styles.pkgCard}
              >
                <Image source={{ uri: pkg.image }} contentFit="cover" style={StyleSheet.absoluteFill} />
                <View style={styles.pkgShade} />
                {pkg.badge ? (
                  <View style={styles.pkgBadge}>
                    <Text style={styles.pkgBadgeText}>{pkg.badge}</Text>
                  </View>
                ) : null}
                <View style={styles.pkgCopy}>
                  <Text style={styles.pkgTitle} numberOfLines={1}>{pkg.title}</Text>
                  <Text style={styles.pkgMeta} numberOfLines={1}>From {pkg.price} · {pkg.duration}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} accessibilityRole="button" onPress={() => router.push('/packages')} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ---------- Offers (only when the backend returns active ones) ---------- */}
        {visibleOffers.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="LIMITED TIME" title="Offers for you" action="See all" onPress={() => router.push('/offers')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visibleOffers.map((offer) => (
                <Pressable key={offer.id} accessibilityRole="button" onPress={() => router.push('/offers')} style={styles.offerCard}>
                  <Image source={{ uri: offer.image }} contentFit="cover" style={styles.offerImage} />
                  <View style={styles.offerBody}>
                    <Text style={styles.offerCategory}>{offer.category}</Text>
                    <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>
                    <View style={styles.offerCode}>
                      <Ionicons name="pricetag-outline" size={12} color={Brand.forest} />
                      <Text style={styles.offerCodeText}>Use {offer.code}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* ---------- LemonTrip promises ---------- */}
        <View style={styles.section}>
          <SectionHeader eyebrow="TRAVEL WITH CONFIDENCE" title="LemonTrip promises" action="Learn more" onPress={() => router.push('/help')} />
          <Pressable accessibilityRole="button" onPress={() => router.push('/help')} style={styles.promiseCard}>
            <View style={styles.promiseBadge}>
              <Text style={styles.promiseBadgeText}>24/7</Text>
            </View>
            <Text style={styles.promiseEyebrow}>TRAVELER ASSIST</Text>
            <Text style={styles.promiseTitle}>A real travel expert,{'\n'}whenever you need one.</Text>
            <Text style={styles.promiseSub}>Call · WhatsApp · In-trip support</Text>
            <Ionicons name="call-outline" size={64} color="rgba(255,255,255,0.12)" style={styles.promiseIcon} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  page: { paddingBottom: 32, backgroundColor: Brand.cream },

  // header
  header: {
    backgroundColor: Brand.forest,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 72,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: Brand.lemon, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15, color: Brand.forest },
  brandText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: Brand.lemon },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circleButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0EC', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14, color: Brand.forest },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  locationText: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  // search card
  searchCard: {
    marginHorizontal: 16,
    marginTop: -52,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 18,
    shadowColor: '#0F3D2E',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingTop: 2 },
  tabLabel: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: Colors.textLight },
  tabLabelActive: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: Brand.forest },
  tabUnderline: { height: 3, width: 30, borderRadius: 2, marginTop: 6, backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: Brand.lemon },

  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  swapButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0EC', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  metaRow: { flexDirection: 'row', gap: 8 },

  fieldLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1, color: Colors.textLight },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  fieldValue: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, color: Colors.textDark },
  fieldSub: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: Colors.textLight, marginTop: 2 },

  searchButton: {
    marginTop: 18, height: 54, borderRadius: Radius.md, backgroundColor: Brand.lemon,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  searchButtonText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: Brand.forest },

  // sections
  section: { marginTop: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  eyebrow: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1.5, color: Colors.textLight },
  sectionTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: Colors.textDark, marginTop: 2 },
  sectionAction: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13, color: Colors.textDark },
  hRow: { paddingHorizontal: 20, gap: 12 },

  // package cards
  pkgCard: { width: 250, height: 170, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.surfaceMuted },
  pkgShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,30,20,0.35)' },
  pkgBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: Brand.lemon, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  pkgBadgeText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11, color: Brand.forest },
  pkgCopy: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  pkgTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#FFFFFF' },
  pkgMeta: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  chipsRow: { paddingHorizontal: 20, gap: 8, marginTop: 14 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border },
  categoryChipText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: Colors.textDark },

  // offers
  offerCard: { width: 240, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border },
  offerImage: { width: '100%', height: 110 },
  offerBody: { padding: 12 },
  offerCategory: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 1, color: Colors.textLight },
  offerTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15, color: Colors.textDark, marginTop: 4 },
  offerCode: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: '#FFF6BD' },
  offerCodeText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: Brand.forest },

  // promises
  promiseCard: { marginHorizontal: 20, borderRadius: Radius.lg, backgroundColor: Brand.forest, padding: 18, overflow: 'hidden' },
  promiseBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: Brand.lemon, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm },
  promiseBadgeText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12, color: Brand.forest },
  promiseEyebrow: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 10, letterSpacing: 1.5, color: Brand.lemon },
  promiseTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, lineHeight: 26, color: '#FFFFFF', marginTop: 8 },
  promiseSub: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 8 },
  promiseIcon: { position: 'absolute', right: 14, bottom: 10 },
});