```tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { requestPinWidget } from 'react-native-android-widget';

import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useBookings } from '@/utils/bookingStore';

export default function BookingsScreen() {
  const bookings = useBookings();

  const [refreshing, setRefreshing] = useState(false);
  const [addingWidget, setAddingWidget] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setRefreshing(false);
  };

  const handleAddWidget = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Android Feature',
        'The Upcoming Trip Widget is currently available on Android.'
      );
      return;
    }

    if (addingWidget) return;

    try {
      setAddingWidget(true);

      const requested = await requestPinWidget({
        widgetName: 'UpcomingTrip',
      });

      if (!requested) {
        Alert.alert(
          'Widget Not Supported',
          'Your current launcher does not support direct widget pinning. You can add the LemonTrip widget manually from the Android Home Screen widget picker.'
        );
      }
    } catch (error) {
      console.error('Widget request failed:', error);

      Alert.alert(
        'Unable to Add Widget',
        'Please try adding the LemonTrip widget manually from the Android Home Screen.'
      );
    } finally {
      setAddingWidget(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '';

    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'CONFIRMED';

    return status.toUpperCase();
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'cancelled':
        return {
          backgroundColor: '#FDECEC',
          color: '#C62828',
        };

      case 'completed':
        return {
          backgroundColor: '#EEF1F4',
          color: '#56616F',
        };

      case 'upcoming':
      case 'confirmed':
      default:
        return {
          backgroundColor: '#EAF9F2',
          color: Colors.primaryDark,
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <ScreenHeader
          title="Your bookings"
          subtitle="Every detail of your journey, in one place."
          eyebrow="TRAVEL RECORD"
        />

        {/* UPCOMING TRIP WIDGET */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetIcon}>
            <Ionicons
              name="grid-outline"
              size={26}
              color={Colors.primaryDark}
            />
          </View>

          <View style={styles.widgetContent}>
            <Text style={styles.widgetTitle}>
              Upcoming Trip Widget
            </Text>

            <Text style={styles.widgetDescription}>
              See your next trip directly on your Android Home Screen.
            </Text>

            <TouchableOpacity
              style={[
                styles.widgetButton,
                addingWidget && styles.disabledButton,
              ]}
              activeOpacity={0.85}
              onPress={handleAddWidget}
              disabled={addingWidget}
            >
              {addingWidget ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.widgetButtonText}>
                    Add Widget
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* BOOKINGS */}
        {bookings.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Your Journeys
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {bookings.length}{' '}
                  {bookings.length === 1
                    ? 'booking'
                    : 'bookings'}
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {bookings.length}
                </Text>
              </View>
            </View>

            {bookings.map((booking) => {
              const statusStyle = getStatusStyle(
                booking.status
              );

              return (
                <View
                  key={booking.id}
                  style={styles.bookingCard}
                >
                  <View style={styles.bookingTop}>
                    <View style={styles.bookingIcon}>
                      <Ionicons
                        name="airplane-outline"
                        size={23}
                        color={Colors.primary}
                      />
                    </View>

                    <View style={styles.bookingInfo}>
                      <Text
                        style={styles.serviceName}
                        numberOfLines={1}
                      >
                        {booking.serviceName}
                      </Text>

                      <Text
                        style={styles.itemName}
                        numberOfLines={1}
                      >
                        {booking.itemName}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusStyle.backgroundColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: statusStyle.color,
                          },
                        ]}
                      >
                        {getStatusLabel(
                          booking.status
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.bookingDetails}>
                    <View>
                      <Text style={styles.detailLabel}>
                        BOOKED ON
                      </Text>

                      <Text style={styles.detailValue}>
                        {formatDate(booking.bookedAt)}
                      </Text>
                    </View>

                    {booking.tripDate ? (
                      <View>
                        <Text style={styles.detailLabel}>
                          TRIP DATE
                        </Text>

                        <Text style={styles.detailValue}>
                          {formatDate(booking.tripDate)}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.priceBox}>
                      <Text style={styles.detailLabel}>
                        PRICE
                      </Text>

                      <Text style={styles.price}>
                        {booking.price}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyCircle}>
              <Ionicons
                name="airplane-outline"
                size={35}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Your next journey could start here.
            </Text>

            <Text style={styles.emptyDescription}>
              You don't have any bookings yet. Explore
              flights, hotels and experiences and plan your
              next adventure.
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push('/(tabs)/explore')
              }
            >
              <Ionicons
                name="compass-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.exploreButtonText}>
                Explore journeys
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push('/(tabs)/explore')
              }
            >
              <Ionicons
                name="search-outline"
                size={19}
                color={Colors.primaryDark}
              />

              <Text style={styles.searchButtonText}>
                Search flights
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Travel with confidence
            </Text>

            <Text style={styles.infoText}>
              Your LemonTrip travel details stay organized
              in one convenient place.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },

  /* WIDGET */

  widgetCard: {
    flexDirection: 'row',
    backgroundColor: '#EAF9F2',
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#CFEFE0',
    marginBottom: 24,
  },

  widgetIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  widgetContent: {
    flex: 1,
  },

  widgetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#10251D',
    marginBottom: 4,
  },

  widgetDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#527066',
    marginBottom: 12,
  },

  widgetButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  widgetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#7B8491',
    marginTop: 3,
  },

  countBadge: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#EAF9F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primaryDark,
  },

  /* BOOKING CARD */

  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E9EDF2',
  },

  bookingTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bookingIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#EAF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  bookingInfo: {
    flex: 1,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17202A',
  },

  itemName: {
    fontSize: 12,
    color: '#7B8491',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    marginLeft: 8,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 15,
  },

  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9AA2AC',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },

  priceBox: {
    alignItems: 'flex-end',
  },

  price: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9EDF2',
  },

  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    textAlign: 'center',
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 9,
  },

  emptyDescription: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#737D89',
    maxWidth: 310,
    marginBottom: 22,
  },

  exploreButton: {
    width: '100%',
    minHeight: 51,
    borderRadius: 15,
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  searchButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D7E8E1',
    backgroundColor: '#F5FBF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },

  searchButtonText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },

  /* INFO */

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E9EDF2',
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#17202A',
    marginBottom: 3,
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#7B8491',
  },

  bottomSpace: {
    height: 25,
  },
});
```
