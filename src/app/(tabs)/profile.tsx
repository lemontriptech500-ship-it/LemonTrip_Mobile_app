import { Ui } from '@/constants/theme';
import { AccountArtworkIcon } from '@/components/AccountArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { Colors } from '@/constants/colors';
import { logout, useAuth } from '@/utils/authStore';
import { useAccountBookings } from '@/utils/accountBookings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

const SOFT_GREEN = Colors.surfaceMuted;
const SHADOW = { shadowColor: '#15372e', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as const;

// Same circle-icon grid pattern as the Home screen.
const travelLinks = [
  { label: 'My trips', artwork: 'flight' as const, route: '/(tabs)/bookings' },
  { label: 'Saved places', artwork: 'saved' as const, route: '/(tabs)/wishlist' },
  { label: 'Visa updates', artwork: 'visa' as const, route: '/(tabs)/explore/visa/applications' },
  { label: 'Offers', artwork: 'offer' as const, route: '/offers' },
];

const accountLinks = [
  { label: 'Personal information', detail: 'Manage your contact details', artwork: 'profile' as const, route: '/manage/personal-information' },
  { label: 'Wallet', detail: 'Balance and transactions on LemonTrip', artwork: 'payment' as const, route: '/wallet' },
  { label: 'Contact LemonTrip', detail: 'Help with bookings and travel plans', artwork: 'help' as const, route: '/contact' },
  { label: 'Travel services', detail: 'Flights, hotels, trains, buses, holidays and visas', artwork: 'booking' as const, route: '/services' },
  { label: 'Payment methods', detail: 'Choose how to pay', artwork: 'payment' as const, route: '/wallet/payment-methods' },
  { label: 'Saved travellers', detail: 'Names for your next journey', artwork: 'profile' as const, route: '/manage/travellers' },
  { label: 'Saved searches', detail: 'Pick up where you left off', artwork: 'booking' as const, route: '/manage/saved-searches' },
  { label: 'Notifications', detail: 'Updates about your journeys', artwork: 'notifications' as const, route: '/notifications' },
  { label: 'Travel assistant', detail: 'One assistant for every service', artwork: 'support' as const, route: '/assistant' },
  { label: 'About LemonTrip', detail: 'Travel smarter. Travel better.', artwork: 'help' as const, route: '/manage/about' },
  { label: 'Settings', detail: 'Preferences, privacy and notifications', artwork: 'settings' as const, route: '/settings' },
];

export default function ProfileScreen() {
  const user = useAuth();
  const { bookings } = useAccountBookings();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'traveller';
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'G';

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will be signed out on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, desktop && styles.contentDesktop]}>

          {/* Header — same as Home / Explore / My Trips */}
          <ScreenHeader title="Your profile" subtitle="Your account, trips and preferences." eyebrow="MAKE YOURSELF AT HOME" rightAction={{ label: 'Settings', icon: 'options-outline', onPress: () => router.push('/settings') }} />

          {/* Identity card */}
          <View style={styles.heroCard}>
            <View pointerEvents="none" style={styles.heroRing} />
            <View style={styles.identityRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.identityCopy}>
                {user ? (
                  <View style={styles.memberPill}>
                    <Ionicons name="sparkles" size={12} color={Colors.primaryDark} />
                    <Text style={styles.memberPillText}>LemonTrip member</Text>
                  </View>
                ) : null}
                <Text style={styles.name} numberOfLines={1}>{user?.name ?? `Welcome, ${firstName}`}</Text>
                <Text style={styles.emailText} numberOfLines={1}>{user?.email ?? 'Sign in to keep your trips together'}</Text>
              </View>
            </View>

            {user ? (
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{bookings.length}</Text>
                  <Text style={styles.statLabel}>{bookings.length === 1 ? 'Booking' : 'Bookings'}</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/bookings')} style={styles.heroButton} activeOpacity={0.85}>
                  <Text style={styles.heroButtonText}>View my trips</Text>
                  <View style={styles.heroButtonArrow}><Ionicons name="arrow-forward" size={16} color={Colors.white} /></View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.guestBlock}>
                <Text style={styles.guestText}>Sign in to save places, track bookings and get trip updates.</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/login')} style={styles.heroButton} activeOpacity={0.85}>
                  <Text style={styles.heroButtonText}>Sign in</Text>
                  <View style={styles.heroButtonArrow}><Ionicons name="arrow-forward" size={16} color={Colors.white} /></View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Travel shortcuts */}
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>Your travel</Text>
            <View style={styles.gridRow}>
              {travelLinks.map((item) => (
                <TouchableOpacity key={item.label} accessibilityRole="button" style={styles.gridItem} activeOpacity={0.85} onPress={() => router.push(item.route as never)}>
                  <View style={styles.gridCircle}>
                    <TravelArtworkIcon name={item.artwork} size={36} />
                    {item.label === 'My trips' && bookings.length > 0 ? (
                      <View style={styles.gridBadge}><Text style={styles.gridBadgeText}>{bookings.length}</Text></View>
                    ) : null}
                  </View>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.lowerLayout, desktop && styles.lowerLayoutDesktop]}>
            {/* Account list */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.menuCard}>
                {accountLinks.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    accessibilityRole="button"
                    onPress={() => router.push(item.route as never)}
                    style={[styles.menuRow, styles.menuDivider]}
                    activeOpacity={0.75}>
                    <View style={styles.menuIcon}><AccountArtworkIcon name={item.artwork} size={28} /></View>
                    <View style={styles.menuCopy}>
                      <Text style={styles.menuTitle}>{item.label}</Text>
                      <Text style={styles.menuDetail}>{item.detail}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore/visa')} style={styles.menuRow} activeOpacity={0.75}>
                  <View style={styles.menuIcon}><TravelArtworkIcon name="visa" size={29} /></View>
                  <View style={styles.menuCopy}>
                    <Text style={styles.menuTitle}>Visa services</Text>
                    <Text style={styles.menuDetail}>Get help planning your next trip</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Discover banner — same treatment as Home banner */}
            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.discoverCard} activeOpacity={0.9}>
              <View pointerEvents="none" style={styles.discoverRing} />
              <View style={styles.discoverIcon}><TravelArtworkIcon name="explore" size={32} /></View>
              <Text style={styles.discoverTitle}>Where will you go next?</Text>
              <Text style={styles.discoverText}>Find a new favourite with handpicked destinations and stays.</Text>
              <View style={styles.discoverCta}>
                <Text style={styles.discoverCtaText}>Explore destinations</Text>
                <View style={styles.discoverCtaArrow}><Ionicons name="arrow-forward" size={16} color={Colors.white} /></View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Log out */}
          {user ? (
            <TouchableOpacity accessibilityRole="button" onPress={confirmLogout} style={styles.logoutButton} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color="#C62828" />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.footer}>LemonTrip. Made for the way you travel.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center' },
  contentDesktop: { maxWidth: 1040 },

  // Header
  header: { minHeight: 72, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLockup: { minWidth: 150, height: 56, alignItems: 'flex-start', justifyContent: 'center' },
  headerSpacer: { flex: 1 },
  settingsButton: { minHeight: 44,  width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Ui.radius.control, backgroundColor: Colors.surface },

  // Title
  titleStrip: { paddingHorizontal: 18, paddingVertical: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 26, fontWeight: '900' },
  pageSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14, marginTop: 3 },

  // Identity card
  heroCard: { marginTop: 16, marginHorizontal: 16, padding: 20, borderRadius: 24, backgroundColor: Colors.primaryDark, overflow: 'hidden' },
  heroRing: { position: 'absolute', width: 190, height: 190, right: -80, top: -90, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatar: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 36, backgroundColor: Colors.accent, borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)' },
  avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 30, fontWeight: '900' },
  identityCopy: { flex: 1, minWidth: 0 },
  memberPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6, borderRadius: Ui.radius.pill, backgroundColor: Colors.accent },
  memberPillText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900' },
  name: { color: Colors.white, fontFamily: 'Manrope', fontSize: 22, fontWeight: '900' },
  emailText: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Manrope', fontSize: 13, marginTop: 3 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  stat: { minWidth: 0 },
  statValue: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 28, lineHeight: 32, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  guestBlock: { gap: 14, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  guestText: { color: 'rgba(255,255,255,0.86)', fontFamily: 'Manrope', fontSize: 14, lineHeight: 20 },
  heroButton: { alignSelf: 'flex-start', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 18, paddingRight: 5, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  heroButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  heroButtonArrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: Colors.primary },

  // Circle grid card
  gridCard: { ...Ui.card, marginTop: 16, marginHorizontal: 16, paddingTop: 16, paddingBottom: 6, paddingHorizontal: 8, borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  gridTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', paddingHorizontal: 10, marginBottom: 10 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 },
  gridCircle: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 33, backgroundColor: SOFT_GREEN, borderWidth: 1, borderColor: Colors.border },
  gridBadge: { position: 'absolute', top: -2, right: -2, minWidth: 22, height: 22, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.surface },
  gridBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  gridLabel: { marginTop: 7, textAlign: 'center', color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 17, fontWeight: '800' },

  // Lower layout
  lowerLayout: { gap: 16, marginTop: 24, paddingHorizontal: 16 },
  lowerLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  menuSection: { flex: 1, minWidth: 0 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 20, fontWeight: '900', marginHorizontal: 2, marginBottom: 12 },
  menuCard: { ...Ui.card, overflow: 'hidden', paddingHorizontal: 14, borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  menuRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 10 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: SOFT_GREEN, borderWidth: 1, borderColor: Colors.border },
  menuCopy: { flex: 1, minWidth: 0 },
  menuTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  menuDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 18, marginTop: 2 },
  soonTag: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, borderRadius: Ui.radius.pill, backgroundColor: SOFT_GREEN, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },

  // Discover banner
  discoverCard: { flexGrow: 1, minWidth: 0, overflow: 'hidden', padding: 20, borderRadius: 24, backgroundColor: Colors.accentSoft },
  discoverRing: { position: 'absolute', width: 150, height: 150, right: -70, bottom: -80, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(6,59,36,0.15)' },
  discoverIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: Colors.surface },
  discoverTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 14 },
  discoverText: { maxWidth: 300, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, lineHeight: 20, marginTop: 6 },
  discoverCta: { alignSelf: 'flex-start', minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, paddingLeft: 18, paddingRight: 5, borderRadius: 24, backgroundColor: Colors.white },
  discoverCtaText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  discoverCtaArrow: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.primary },

  // Log out + footer
  logoutButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 22, marginHorizontal: 16, borderRadius: 26, borderWidth: 1, borderColor: '#F3C9C9', backgroundColor: '#FDF2F2' },
  logoutText: { color: '#C62828', fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  footer: { marginTop: 22, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, textAlign: 'center' },
});
