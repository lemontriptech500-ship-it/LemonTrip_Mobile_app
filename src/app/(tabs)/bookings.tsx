import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, Chip, EmptyState, Notice, Pill, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDate, normalizeStatus, serviceIcon, shortId, statusStyles } from '@/utils/bookingFormat';
import { useAccountBookings } from '@/utils/accountBookings';
import { useAuth } from '@/utils/authStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { requestPinWidget } from 'react-native-android-widget';

type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  const account = useAccountBookings();
  const bookings = account.bookings;
  const user = useAuth();
  const refreshing = account.loading;
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
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert('The Upcoming Trip widget is available on the Android app only.'); else Alert.alert('Android feature', 'The Upcoming Trip widget is currently available on Android.');
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
    <AppScreen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={account.refresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        <View style={styles.content}>
          <ScreenHeader title="My Trips" subtitle="Every detail of your journey, in one place." eyebrow="YOUR JOURNEYS" />

          {/* Widget banner */}
          <Card style={styles.rowCard}>
            <View style={styles.iconBox}>
              <Ionicons name="grid-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>Upcoming Trip widget</Text>
              <Text style={styles.cardSub}>See your next trip right on your Android Home Screen.</Text>
              <View style={styles.widgetBtn}>
                <PrimaryButton label="Add widget" icon="arrow-forward" onPress={handleAddWidget} loading={addingWidget} />
              </View>
            </View>
          </Card>

          {account.error ? (
            <EmptyState icon="alert-circle-outline" title="Trips could not be loaded" text={account.error} action={<PrimaryButton label="Try again" variant="soft" onPress={account.refresh} />} />
          ) : !user ? (
            <EmptyState icon="person-outline" title="Sign in to view your trips" text="Your bookings and travel updates are available after you sign in." action={<PrimaryButton label="Sign in" icon="arrow-forward" onPress={() => router.push('/login' as never)} />} />
          ) : bookings.length > 0 ? (
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
            <EmptyState
              icon="airplane-outline"
              title="Your next journey could start here"
              text="You do not have any bookings yet. Explore flights, hotels and experiences to plan your next adventure."
              action={<PrimaryButton label="Explore journeys" icon="arrow-forward" onPress={() => router.push('/(tabs)/explore' as never)} />}
            />
          )}

          <View style={styles.noticeGap}>
            <Notice icon="shield-checkmark-outline" tone="good" title="Travel with confidence">
              Your LemonTrip travel details stay organized in one place.
            </Notice>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  cardTitle: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark },
  cardSub: { fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  widgetBtn: { alignSelf: 'flex-start', marginTop: 10 },
  tabRow: { paddingHorizontal: Ui.space.page, gap: 8, paddingBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  itemName: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  destText: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, flexShrink: 1 },
  divider: { height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong, marginVertical: 14 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  label: { fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.1, color: Colors.textLight, marginBottom: 4 },
  value: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textDark },
  right: { alignItems: 'flex-end' },
  price: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.primaryDark },
  noticeGap: { marginTop: 4 },
});
