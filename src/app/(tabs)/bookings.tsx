import { useAppLanguage } from '@/utils/intl';
import { translate } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Card, Chip, EmptyState, Pill, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDate, normalizeStatus, serviceIcon, shortId, statusStyles } from '@/utils/bookingFormat';
import { useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { requestPinWidget } from 'react-native-android-widget';

const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const QUICK_ACTIONS: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; route: string }[] = [
  { label: 'Book Flights', icon: 'airplane-outline', route: '/(tabs)/explore/flights' },
  { label: 'Book Hotels', icon: 'business-outline', route: '/(tabs)/explore/hotels' },
  { label: 'Book Trains', icon: 'train-outline', route: '/(tabs)/explore/trains' },
  { label: 'Book Bus', icon: 'bus-outline', route: '/(tabs)/explore/buses' },
];

type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  useAppLanguage();
  const bookings = useBookings();
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setRefreshing(false);
  };

  const handleAddWidget = async () => {
    if (Platform.OS !== 'android') {
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(translate('The Upcoming Trip widget is available on the Android app only.')); else Alert.alert('Android feature', 'The Upcoming Trip widget is currently available on Android.');
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
    <AppScreen edges={['top']} headerTone="light">
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home' as never))} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>My Trips</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[styles.topBtn, styles.topBtnTint]}>
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        <View style={styles.content}>
          <View style={styles.bannerWrap}>
            <View style={styles.tripBanner}><Image source={require('../../../assets/images/Tropical Travel Essentials in Green.png')} style={styles.tripBannerImage} resizeMode="cover" />
              <View style={styles.tripBannerCopy}>
                <Text style={styles.bannerEyebrow}>YOUR JOURNEYS</Text>
                <Text style={styles.bannerTitle}>My Trips</Text>
                <Text style={styles.bannerSub}>Every detail of your journey, in one place.</Text>
              </View>
            </View>
          </View>

          {/* Widget banner */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetIconBox}><Ionicons name="grid-outline" size={26} color={Colors.primaryDark} /></View>
            <View style={styles.flex}>
              <Text style={styles.widgetTitle}>Upcoming Trip Widget</Text>
              <Text style={styles.widgetSub}>See your next trip right on your Home Screen.</Text>
              <TouchableOpacity accessibilityRole="button" disabled={addingWidget} onPress={handleAddWidget} style={styles.addBtn}>
                <Text style={styles.addBtnText}>{addingWidget ? 'Please wait...' : 'Add widget'}</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.widgetImgWrap}>
              <Image source={require('../../../assets/images/mytrips-widget.png')} resizeMode="cover" style={styles.widgetImg} />
              <Fade color="#FFF4C2" style={styles.widgetFade} />
            </View>
          </View>

          {bookings.length > 0 ? (
            <>
              {/* Transactions entry */}
              <TouchableOpacity accessibilityRole="button" activeOpacity={0.9} onPress={() => router.push('/transactions' as never)}>
                <Card style={styles.rowCard}>
                  <View style={styles.iconBox}>
                    <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>Transactions</Text>
                    <Text style={styles.cardSub}>Payments and refunds</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                </Card>
              </TouchableOpacity>

              {/* Status tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
                {statusTabs.map((tab) => (
                  <Chip
                    key={tab.key}
                    label={tab.label + ' (' + counts[tab.key] + ')'}
                    selected={activeTab === tab.key}
                    onPress={() => setActiveTab(tab.key)}
                  />
                ))}
              </ScrollView>

              {/* Voucher cards */}
              {visibleBookings.length ? (
                visibleBookings.map((booking) => {
                  const normalized = normalizeStatus(booking.status);
                  const status = statusStyles[normalized];
                  const tone = normalized === 'cancelled' ? 'bad' : normalized === 'completed' ? 'neutral' : 'good';
                  return (
                    <TouchableOpacity
                      key={booking.id}
                      accessibilityRole="button"
                      activeOpacity={0.9}
                      onPress={() => router.push(('/booking/' + booking.id) as never)}
                    >
                      <Card>
                        <View style={styles.top}>
                          <View style={styles.iconBox}>
                            <Ionicons name={serviceIcon(booking.serviceName)} size={22} color={Colors.primary} />
                          </View>
                          <View style={styles.flex}>
                            <Text style={styles.eyebrow} numberOfLines={1}>{(booking.serviceName ?? '').toUpperCase()}</Text>
                            <Text style={styles.itemName} numberOfLines={2}>{booking.itemName}</Text>
                            {booking.destination ? (
                              <View style={styles.destRow}>
                                <Ionicons name="location-outline" size={13} color={Colors.textLight} />
                                <Text style={styles.destText} numberOfLines={1}>{booking.destination}</Text>
                              </View>
                            ) : null}
                          </View>
                          <Pill label={status.label} tone={tone} icon={status.icon} />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.bottom}>
                          <View>
                            <Text style={styles.label}>BOOKING ID</Text>
                            <Text style={styles.value}>{shortId(booking.id)}</Text>
                          </View>
                          <View>
                            <Text style={styles.label}>{booking.tripDate ? 'TRIP DATE' : 'BOOKED ON'}</Text>
                            <Text style={styles.value}>{formatDate(booking.tripDate ?? booking.bookedAt)}</Text>
                          </View>
                          <View style={styles.right}>
                            <Text style={styles.label}>TOTAL</Text>
                            <Text style={styles.price}>{booking.price}</Text>
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <EmptyState
                  icon="filter-outline"
                  title={'No ' + activeTab + ' bookings'}
                  text="Try another tab to see your other trips."
                  action={<PrimaryButton label="Show all" variant="soft" onPress={() => setActiveTab('all')} />}
                />
              )}
            </>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}><Ionicons name="airplane-outline" size={30} color={Colors.primaryDark} /></View>
              <Text style={styles.emptyTitle}>Your next journey could start here</Text>
              <Text style={styles.emptyText}>You do not have any bookings yet. Explore flights, hotels and experiences to plan your next adventure.</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore' as never)} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Explore journeys</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickCard}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity key={a.label} accessibilityRole="button" onPress={() => router.push(a.route as never)} style={styles.quickItem}>
                <View style={styles.quickIcon}><Ionicons name={a.icon} size={26} color={Colors.primaryDark} /></View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Helpful for your next trip</Text>
          <View style={styles.helpCard}>
            <View style={styles.helpIcon}><Ionicons name="shield-checkmark-outline" size={26} color={Colors.primaryDark} /></View>
            <View style={styles.flex}>
              <Text style={styles.helpTitle}>Travel with confidence</Text>
              <Text style={styles.helpSub}>Your LemonTrip travel details stay organized in one place.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function Fade({ color, style }: { color: string; style: object }) {
  return (
    <View pointerEvents="none" style={[{ flexDirection: 'row' }, style]}>
      {Array.from({ length: 24 }).map((_, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: color, opacity: 1 - i / 23 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { marginHorizontal: Ui.space.page, marginTop: 8, marginBottom: Ui.space.section, minHeight: 190, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#103D30' },
  bannerImg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '62%', height: '100%' },
  bannerEyebrow: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.5, color: Colors.accent },
  bannerTitle: { fontFamily: INTER.bold, fontSize: 30, color: Colors.white, marginTop: 6 },
  bannerSub: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: 'rgba(255,255,255,0.85)', marginTop: 6, maxWidth: 200 },
  widgetCard: { marginHorizontal: Ui.space.page, marginBottom: Ui.space.section, borderRadius: 24, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14, backgroundColor: '#FFF4C2' },
  widgetIconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE97A' },
  widgetTitle: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: Colors.textDark },
  widgetSub: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  addBtn: { alignSelf: 'flex-start', marginTop: 10, minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: Colors.accent },
  addBtnText: { fontFamily: INTER.bold, fontSize: TextSize.body, color: Colors.primaryDark },
  widgetImgWrap: { width: 150, height: 135 },
  widgetImg: { width: '100%', height: '100%' },
  widgetFade: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 40 },
  bannerFade: { position: 'absolute', top: 0, bottom: 0, left: '38%', width: 70 },
  bannerWrap: { paddingHorizontal: Ui.space.page, marginTop: 14, marginBottom: 16 },
  tripBanner: { width: '100%', aspectRatio: 2170 / 725, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: '#103D30' },
  tripBannerImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  tripBannerCopy: { width: '66%', paddingLeft: 18 },
  topBar: { backgroundColor: Colors.surface, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: Ui.space.page },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.semibold, fontSize: 18, color: Colors.textDark },
  emptyCard: { marginHorizontal: Ui.space.page, marginBottom: Ui.space.section, alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1A8' },
  emptyTitle: { fontFamily: INTER.bold, fontSize: TextSize.title, color: Colors.primaryDark, textAlign: 'center', marginTop: 12 },
  emptyText: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: Colors.textLight, textAlign: 'center', marginTop: 6 },
  emptyBtn: { alignSelf: 'stretch', minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, borderRadius: 25, backgroundColor: '#103D30' },
  emptyBtnText: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: Colors.white },
  sectionTitle: { fontFamily: INTER.bold, fontSize: TextSize.heading, color: Colors.primaryDark, marginHorizontal: Ui.space.page, marginTop: 8, marginBottom: 10 },
  quickCard: { marginHorizontal: Ui.space.page, marginBottom: Ui.space.section, flexDirection: 'row', gap: 8, padding: 10, borderRadius: 24, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  quickItem: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  quickLabel: { fontFamily: INTER.medium, fontSize: TextSize.caption, color: Colors.textDark, textAlign: 'center' },
  helpCard: { marginHorizontal: Ui.space.page, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: Colors.surfaceMuted },
  helpIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  helpTitle: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: Colors.primaryDark },
  helpSub: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  scroll: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  cardTitle: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: Colors.textDark },
  cardSub: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  widgetBtn: { alignSelf: 'flex-start', marginTop: 10 },
  tabRow: { paddingHorizontal: Ui.space.page, gap: 8, paddingBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  itemName: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: Colors.textDark, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  destText: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, flexShrink: 1 },
  divider: { height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong, marginVertical: 14 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  label: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.1, color: Colors.textLight, marginBottom: 4 },
  value: { fontFamily: INTER.bold, fontSize: TextSize.body, color: Colors.textDark },
  right: { alignItems: 'flex-end' },
  price: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: Colors.primaryDark },
  noticeGap: { marginTop: 4 },
});
