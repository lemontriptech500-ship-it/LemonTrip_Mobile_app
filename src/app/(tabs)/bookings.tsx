import { Ui } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/utils/authStore';
import { useAccountBookings } from '@/utils/accountBookings';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// SafeAreaView from 'react-native' is deprecated — use the safe-area-context version.
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { requestPinWidget } from 'react-native-android-widget';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

const FONT = {
  medium: 'Manrope',
  bold: 'Manrope',
  extra: 'Manrope',
} as const;

const SHADOW = {
  shadowColor: '#0F3D2E',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const quickLinks: { label: string; icon: IconName; route: string }[] = [
  { label: 'Explore', icon: 'compass-outline', route: '/(tabs)/explore' },
  { label: 'Holiday Packages', icon: 'umbrella-outline', route: '/packages' },
  { label: 'Offers', icon: 'pricetag-outline', route: '/offers' },
  { label: 'Visa', icon: 'document-text-outline', route: '/(tabs)/explore/visa' },
];

const normalizeStatus = (status?: string): Exclude<StatusFilter, 'all'> => {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  return 'upcoming'; // upcoming, confirmed or missing
};

const statusStyles = {
  upcoming: { label: 'Upcoming', bg: '#EAF9F2', fg: Colors.primaryDark, icon: 'checkmark-circle' as IconName },
  completed: { label: 'Completed', bg: '#EEF1F4', fg: '#56616F', icon: 'flag' as IconName },
  cancelled: { label: 'Cancelled', bg: '#FDECEC', fg: '#C62828', icon: 'close-circle' as IconName },
};

const serviceIcon = (serviceName?: string): IconName => {
  const name = (serviceName ?? '').toLowerCase();
  if (name.includes('flight')) return 'airplane-outline';
  if (name.includes('hotel') || name.includes('stay')) return 'bed-outline';
  if (name.includes('bus')) return 'bus-outline';
  if (name.includes('train')) return 'train-outline';
  if (name.includes('visa')) return 'document-text-outline';
  if (name.includes('package') || name.includes('holiday')) return 'umbrella-outline';
  return 'ticket-outline';
};

const formatDate = (value?: string) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
};

export default function BookingsScreen() {
  const account = useAccountBookings();
  const bookings = account.bookings;
  const user = useAuth();


  const [addingWidget, setAddingWidget] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');

  const counts = useMemo(() => {
    const base = { all: bookings.length, upcoming: 0, completed: 0, cancelled: 0 };
    bookings.forEach((booking) => {
      base[normalizeStatus(booking.status)] += 1;
    });
    return base;
  }, [bookings]);

  const visibleBookings = useMemo(
    () => bookings.filter((booking) => activeTab === 'all' || normalizeStatus(booking.status) === activeTab),
    [bookings, activeTab],
  );

  const handleAddWidget = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Android feature', 'The Upcoming Trip widget is currently available on Android.');
      return;
    }
    if (addingWidget) return;

    try {
      setAddingWidget(true);
      const requested = await requestPinWidget({ widgetName: 'UpcomingTrip' });
      if (!requested) {
        Alert.alert(
          'Widget not supported',
          'Your launcher does not support direct widget pinning. You can add the LemonTrip widget from the Android Home Screen widget picker.',
        );
      }
    } catch (error) {
      console.error('Widget request failed:', error);
      Alert.alert('Unable to add widget', 'Please try adding the LemonTrip widget manually from the Android Home Screen.');
    } finally {
      setAddingWidget(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={account.loading} onRefresh={account.refresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        {/* Header — same as Home / Explore */}
        <ScreenHeader title="Your journeys" subtitle="Every detail of your journey, in one place." eyebrow="GOOD TIMES AHEAD" rightAction={{ label: 'Saved', icon: 'heart-outline', onPress: () => router.push('/(tabs)/wishlist') }} />

        {account.error ? <View style={styles.filterEmpty}><Text style={styles.filterEmptyText}>{account.error}</Text><TouchableOpacity accessibilityRole="button" onPress={account.refresh}><Text style={styles.linkText}>Try again</Text></TouchableOpacity></View> : null}
        {!user ? <View style={styles.filterEmpty}><Text style={styles.filterEmptyText}>Sign in to see your trips and booking updates.</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/login')}><Text style={styles.linkText}>Sign in</Text></TouchableOpacity></View> : null}
        {/* Widget banner — same style as Home banner */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetIcon}>
            <Ionicons name="grid-outline" size={24} color={Brand.forest} />
          </View>
          <View style={styles.widgetContent}>
            <Text style={styles.widgetTitle}>Upcoming Trip widget</Text>
            <Text style={styles.widgetDescription}>See your next trip right on your Android Home Screen.</Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.widgetButton, addingWidget && styles.disabledButton]}
              activeOpacity={0.85}
              onPress={handleAddWidget}
              disabled={addingWidget}
            >
              {addingWidget ? (
                <ActivityIndicator size="small" color={Brand.forest} style={styles.widgetSpinner} />
              ) : (
                <>
                  <Text style={styles.widgetButtonText}>Add widget</Text>
                  <Ionicons name="arrow-forward" size={16} color={Brand.forest} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions entry */}
        {bookings.length > 0 ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.9}
            style={styles.txCard}
            onPress={() => router.push('/transactions' as never)}
          >
            <View style={styles.txIcon}>
              <Ionicons name="receipt-outline" size={22} color={Brand.forest} />
            </View>
            <View style={styles.txCopy}>
              <Text style={styles.txTitle}>Transactions</Text>
              <Text style={styles.txSub}>Payments and refunds</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Brand.forest} />
          </TouchableOpacity>
        ) : null}

        {bookings.length > 0 ? (
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {statusTabs.map((tab) => {
                const selected = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setActiveTab(tab.key)}
                    style={[styles.tab, selected && styles.tabSelected]}
                  >
                    <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{tab.label}</Text>
                    <View style={[styles.tabCount, selected && styles.tabCountSelected]}>
                      <Text style={[styles.tabCountText, selected && styles.tabCountTextSelected]}>{counts[tab.key]}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {visibleBookings.length ? (
              <View style={styles.bookingList}>
                {visibleBookings.map((booking) => {
                  const status = statusStyles[normalizeStatus(booking.status)];
                  return (
                    <TouchableOpacity key={booking.id} accessibilityRole="button" accessibilityLabel={`View booking ${booking.itemName}`} onPress={() => router.push({ pathname: "/booking/[id]", params: { id: booking.id } })} style={styles.bookingCard}>
                      <View style={styles.bookingTop}>
                        <View style={styles.bookingIcon}>
                          <Ionicons name={serviceIcon(booking.serviceName)} size={24} color={Brand.forest} />
                        </View>
                        <View style={styles.bookingInfo}>
                          <Text style={styles.eyebrowDark} numberOfLines={1}>
                            {(booking.serviceName ?? '').toUpperCase()}
                          </Text>
                          <Text style={styles.itemName} numberOfLines={2}>{booking.itemName}</Text>
                          {booking.destination ? (
                            <View style={styles.destRow}>
                              <Ionicons name="location-outline" size={13} color={Colors.textLight} />
                              <Text style={styles.destText} numberOfLines={1}>{booking.destination}</Text>
                            </View>
                          ) : null}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Ionicons name={status.icon} size={12} color={status.fg} />
                          <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                        </View>
                      </View>

                      <View style={styles.ticketDivider}>
                        <View style={[styles.notch, styles.notchLeft]} />
                        <View style={styles.dash} />
                        <View style={[styles.notch, styles.notchRight]} />
                      </View>

                      <View style={styles.bookingDetails}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>BOOKING ID</Text>
                          <Text style={styles.detailValue}>{shortId(booking.id)}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>{booking.tripDate ? 'TRIP DATE' : 'BOOKED ON'}</Text>
                          <Text style={styles.detailValue}>{formatDate(booking.tripDate ?? booking.bookedAt)}</Text>
                        </View>
                        <View style={styles.priceBox}>
                          <Text style={styles.detailLabel}>TOTAL</Text>
                          <Text style={styles.price}>{booking.price}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.filterEmpty}>
                <Ionicons name="filter-outline" size={26} color={Brand.forest} />
                <Text style={styles.filterEmptyText}>No {activeTab} bookings.</Text>
                <TouchableOpacity onPress={() => setActiveTab('all')}>
                  <Text style={styles.linkText}>Show all</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Empty state */}
            <View style={styles.emptyCard}>
              <View style={styles.emptyCircle}>
                <Ionicons name="airplane-outline" size={38} color={Brand.forest} />
              </View>
              <Text style={styles.emptyTitle}>Your next journey could start here</Text>
              <Text style={styles.emptyDescription}>
                You don’t have any bookings yet. Explore flights, hotels and experiences to plan your next adventure.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={styles.primaryButtonText}>Explore journeys</Text>
                <Ionicons name="arrow-forward" size={18} color={Brand.forest} />
              </TouchableOpacity>
            </View>

            {/* Quick links */}
            <View style={styles.gridCard}>
              <Text style={styles.eyebrowDark}>PLAN AHEAD</Text>
              <Text style={styles.gridTitle}>Plan your next trip</Text>
              <View style={styles.gridRow}>
                {quickLinks.map((link) => (
                  <TouchableOpacity
                    key={link.label}
                    accessibilityRole="button"
                    style={styles.gridItem}
                    activeOpacity={0.85}
                    onPress={() => router.push(link.route as never)}
                  >
                    <Ionicons name={link.icon} size={23} color={Colors.primary} />
                    <Text style={styles.gridLabel}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-checkmark" size={22} color={Brand.lemon} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.eyebrowLemon}>TRAVEL WITH CONFIDENCE</Text>
            <Text style={styles.infoText}>Your LemonTrip travel details stay organized in one place.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surfaceMuted },
  container: { flex: 1, backgroundColor: Colors.surfaceMuted },
  content: { paddingBottom: 32, width: '100%', maxWidth: 900, alignSelf: 'center' },

  // Header
  header: { minHeight: 72, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLockup: { minWidth: 150, height: 56, alignItems: 'flex-start', justifyContent: 'center' },
  headerSpacer: { flex: 1 },
  headerAction: { width: 38, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.accent },
  avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  loginPill: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, borderRadius: 21, backgroundColor: Colors.white },
  loginText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },

  // Title
  titleStrip: { paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  titleCopy: { flex: 1 },
  pageTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 26, fontWeight: '900' },
  pageSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14, marginTop: 3 },
  countPill: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Ui.radius.pill, backgroundColor: SOFT_GREEN },
  countPillText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  countPillLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },

  // Widget banner
  widgetCard: {
    marginTop: 0,
    marginHorizontal: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW,
  },
  widgetIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.accentSoft,
  },
  widgetContent: { flex: 1, minWidth: 0 },
  widgetTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  widgetDescription: { color: 'rgba(255,255,255,0.88)', fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4 },
  widgetButton: { alignSelf: 'flex-start', minHeight: 44, minWidth: 140, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 14, paddingLeft: 18, paddingRight: 5, borderRadius: Ui.radius.control, backgroundColor: Colors.white },
  widgetButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  widgetArrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: Colors.primary },
  widgetSpinner: { paddingHorizontal: 20 },
  disabledButton: { opacity: 0.7 },

  // Transactions entry
  txCard: {
    marginTop: 14,
    marginHorizontal: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...SHADOW,
  },
  txIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.accentSoft,
  },
  txCopy: { flex: 1 },
  txTitle: { color: Colors.primaryDark, fontFamily: FONT.extra, fontSize: 15 },
  txSub: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, marginTop: 2 },

  // Tabs
  section: { paddingTop: 20 },
  tabRow: { paddingHorizontal: 16, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 15, paddingRight: 8, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  tabSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  tabTextSelected: { color: Colors.white },
  tabCount: { minWidth: 24, height: 24, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: SOFT_GREEN },
  tabCountSelected: { backgroundColor: Colors.accent },
  tabCountText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900' },
  tabCountTextSelected: { color: Colors.primaryDark },

  // Booking cards
  bookingList: { paddingHorizontal: 16, paddingTop: 14, gap: 14 },
  bookingCard: { ...Ui.card, padding: Ui.space.card, borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  bookingTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookingIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: SOFT_GREEN, borderWidth: 1, borderColor: Colors.border },
  bookingInfo: { flex: 1, minWidth: 0 },
  serviceName: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' },
  itemName: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 16, lineHeight: 24, marginTop: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },

  ticketDivider: { height: 20, marginVertical: 14, marginHorizontal: -16, flexDirection: 'row', alignItems: 'center' },
  notch: { width: 20, height: 20, borderRadius: 10, backgroundColor: Brand.cream },
  notchLeft: { marginLeft: -10 },
  notchRight: { marginRight: -10 },
  dash: { flex: 1, height: 0, marginHorizontal: 8, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#D5D4CB' },

  bookingDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  detailCol: { flexShrink: 1 },
  detailLabel: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 9, letterSpacing: 1.2, marginBottom: 4 },
  detailValue: { color: Colors.textDark, fontFamily: FONT.bold, fontSize: 13 },
  priceBox: { alignItems: 'flex-end', marginLeft: 'auto' },
  price: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 20 },

  filterEmpty: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
  },
  filterEmptyText: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 14, textTransform: 'capitalize' },
  linkText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },

  // Empty state
  emptyCard: { ...Ui.card, marginTop: 16, marginHorizontal: 16, paddingHorizontal: 22, paddingVertical: 28, alignItems: 'center', borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  emptyCircle: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderRadius: 46, backgroundColor: SOFT_GREEN, borderWidth: 1, borderColor: Colors.border },
  emptyTitle: { textAlign: 'center', color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 22, lineHeight: 28, fontWeight: '900' },
  emptyDescription: { textAlign: 'center', maxWidth: 320, marginTop: 8, marginBottom: 20, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14, lineHeight: 21 },
  primaryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 22, paddingRight: 6, borderRadius: Ui.radius.control, backgroundColor: Colors.primary },
  primaryButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  primaryArrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.accent },

  // Quick link grid
  gridCard: { ...Ui.card, marginTop: 16, marginHorizontal: 16, paddingTop: 16, paddingBottom: 6, paddingHorizontal: 8, borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  gridTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', paddingHorizontal: 10, marginBottom: 10 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 },
  gridLabel: { marginTop: 6, textAlign: 'center', color: Colors.textLight, fontFamily: FONT.bold, fontSize: 10, lineHeight: 14 },

  // Info
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.2 },
  infoCard: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.lg,
    backgroundColor: Brand.forest,
  },
  infoIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Brand.forestLight,
  },
  infoContent: { flex: 1 },
  infoTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  infoText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 18, marginTop: 2 },
});