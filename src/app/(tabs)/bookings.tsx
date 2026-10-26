import { useAppLanguage } from '@/utils/intl';
import { translate } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Card, Pill, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDate, normalizeStatus, serviceIcon, shortId, statusStyles } from '@/utils/bookingFormat';
import { useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
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
            {/* <ImageBackground source={require('../../../assets/images/image1.png')} style={styles.tripBanner} imageStyle={styles.tripBannerImage} resizeMode="cover">
              <LinearGradient pointerEvents="none" colors={['rgba(12,48,38,0.34)', 'rgba(12,48,38,0.18)', 'rgba(12,48,38,0.04)']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
              <View style={styles.tripBannerCopy}>
                <Text style={styles.bannerEyebrow}>YOUR JOURNEYS</Text>
                <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>My Trips</Text>
                <Text style={styles.bannerSub}>Every detail of your journey, in one place.</Text>
              </View>
            </ImageBackground> */}
          </View>

    

          {bookings.length > 0 ? (
            <>
              {/* Transactions entry */}
              <TouchableOpacity accessibilityRole="button" activeOpacity={0.9} onPress={() => router.push('/transactions' as never)}>
                <Card style={[styles.cardBase, styles.rowCard]}>
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
                  <TouchableOpacity
                    key={tab.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeTab === tab.key }}
                    onPress={() => setActiveTab(tab.key)}
                    style={[styles.tabChip, activeTab === tab.key && styles.tabChipOn]}
                  >
                    <Text style={[styles.tabChipText, activeTab === tab.key && styles.tabChipTextOn]}>{tab.label + ' (' + counts[tab.key] + ')'}</Text>
                  </TouchableOpacity>
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
                      <Card style={styles.cardBase}>
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
                <View style={styles.filterEmpty}>
                  <View style={styles.emptyIcon}><Ionicons name="filter-outline" size={26} color={Colors.primaryDark} /></View>
                  <Text style={styles.emptyTitle}>{'No ' + activeTab + ' bookings'}</Text>
                  <Text style={styles.emptyText}>Try another tab to see your other trips.</Text>
                  <PrimaryButton label="Show all" variant="soft" onPress={() => setActiveTab('all')} />
                </View>
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

    {/* Widget banner */}
    <View style={styles.widgetWrap}>
          <ImageBackground source={require('../../../assets/images/Mediterranean Travel App Escape.png')} style={styles.widgetCard} imageStyle={styles.widgetCardImage} resizeMode="cover">
            <View style={styles.widgetCopy}>
              <Text style={styles.widgetTitle}>Upcoming Trip Widget</Text>
              <Text style={styles.widgetSub}>See your next trip right on your Home Screen.</Text>
              <TouchableOpacity accessibilityRole="button" disabled={addingWidget} onPress={handleAddWidget} style={styles.addBtn}>
                <Text style={styles.addBtnText}>{addingWidget ? 'Please wait...' : 'Add widget'}</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
          </View>
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

const styles = StyleSheet.create({
  bannerEyebrow: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.2, color: 'white', marginBottom: 4 },
  bannerTitle: { fontFamily: INTER.extrabold, fontSize: 22, color: Colors.white },
  bannerSub: { fontFamily: INTER.regular, fontSize: 11, lineHeight: 16, color: Colors.white, marginTop: 4 },
  bannerWrap: { paddingHorizontal: 10, marginTop: 14, marginBottom: 16 },
  tripBanner: { width: '100%', aspectRatio: 2.3, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', backgroundColor: '#103D30' },
  tripBannerImage: { borderRadius: 24 },
  tripBannerCopy: { width: '62%', paddingLeft: 18 },
  widgetWrap: { paddingHorizontal: 10, marginBottom: Ui.space.section },
  widgetCard: { width: '100%', aspectRatio: 2.2, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', backgroundColor: '#DCEBE5' },
  widgetCardImage: { borderRadius: 24 },
  widgetCopy: { width: '58%', paddingLeft: 18 },
  widgetTitle: { fontFamily: INTER.extrabold, fontSize: 14, lineHeight: 19, color: Colors.primaryDark },
  widgetSub: { fontFamily: INTER.regular, fontSize: 11, lineHeight: 16, color: Colors.textDark, marginTop: 4 },
  addBtn: { alignSelf: 'flex-start', marginTop: 12, minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: Colors.primary },
  addBtnText: { fontFamily: INTER.bold, fontSize: 12, color: Colors.white },
  topBar: { backgroundColor: Colors.surface, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16 },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: '#103D30' },
  emptyCard: { ...Ui.card, marginHorizontal: 10, marginBottom: Ui.space.section, alignItems: 'center', padding: 18, borderRadius: 24 },
  filterEmpty: { ...Ui.card, marginHorizontal: 10, alignItems: 'center', gap: 6, padding: 18, borderRadius: 24 },
  cardBase: { marginHorizontal: 10, borderRadius: 22 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  emptyTitle: { fontFamily: INTER.bold, fontSize: 16, color: Colors.primaryDark, textAlign: 'center', marginTop: 12 },
  emptyText: { fontFamily: INTER.regular, fontSize: 12, lineHeight: 17, color: Colors.textLight, textAlign: 'center', marginTop: 6 },
  emptyBtn: { alignSelf: 'stretch', minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, borderRadius: 16, backgroundColor: '#103D30' },
  emptyBtnText: { fontFamily: INTER.bold, fontSize: 13, color: Colors.white },
  sectionTitle: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: Colors.primaryDark, marginHorizontal: 14, marginTop: 8, marginBottom: 10 },
  quickCard: { ...Ui.card, marginHorizontal: 10, marginBottom: Ui.space.section, flexDirection: 'row', gap: 8, padding: 10, borderRadius: 22 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  quickLabel: { fontFamily: INTER.medium, fontSize: 11, color: Colors.textDark, textAlign: 'center' },
  helpCard: { marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: Colors.surfaceMuted },
  helpIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  helpTitle: { fontFamily: INTER.bold, fontSize: 14, color: Colors.primaryDark },
  helpSub: { fontFamily: INTER.regular, fontSize: 11, lineHeight: 16, color: Colors.textLight, marginTop: 2 },
  scroll: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  cardTitle: { fontFamily: INTER.extrabold, fontSize: 14, color: Colors.textDark },
  cardSub: { fontFamily: INTER.regular, fontSize: 11, lineHeight: 16, color: Colors.textLight, marginTop: 2 },
  widgetBtn: { alignSelf: 'flex-start', marginTop: 10 },
  tabChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  tabChipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabChipText: { fontFamily: INTER.semibold, fontSize: 12, color: Colors.textDark },
  tabChipTextOn: { color: Colors.white },
  tabRow: { paddingHorizontal: 10, gap: 8, paddingBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  itemName: { fontFamily: INTER.extrabold, fontSize: 14, color: Colors.textDark, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  destText: { fontFamily: INTER.regular, fontSize: 11, color: Colors.textLight, flexShrink: 1 },
  divider: { height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong, marginVertical: 14 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  label: { fontFamily: INTER.extrabold, fontSize: 10, letterSpacing: 1.1, color: Colors.textLight, marginBottom: 4 },
  value: { fontFamily: INTER.bold, fontSize: 12, color: Colors.textDark },
  right: { alignItems: 'flex-end' },
  price: { fontFamily: INTER.extrabold, fontSize: 15, color: Colors.primaryDark },
  noticeGap: { marginTop: 4 },
});