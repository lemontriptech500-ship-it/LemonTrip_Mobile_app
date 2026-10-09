import { parseSavedQuery, recordRecentSearch } from '@/utils/personalStore';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import HotelCard from '@/components/hotels/HotelCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Hotel } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { setHotelSearch, selectHotel, type HotelSearchCriteria } from '@/utils/hotelSearchStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

const filterOptions = [
  { id: 'rating-5-star', label: '5 Star', matches: (hotel: Hotel) => hotel.rating === '5 Star' },
  { id: 'rating-4-star', label: '4 Star', matches: (hotel: Hotel) => hotel.rating === '4 Star' },
  { id: 'rating-boutique', label: 'Boutique rating', matches: (hotel: Hotel) => hotel.rating === 'Boutique' },
  { id: 'property-hotel', label: 'Hotel', matches: (hotel: Hotel) => hotel.propertyType?.toLowerCase() === 'hotel' },
  { id: 'property-resort', label: 'Resort', matches: (hotel: Hotel) => hotel.propertyType?.toLowerCase() === 'resort' },
  { id: 'property-homestay', label: 'Homestay', matches: (hotel: Hotel) => hotel.propertyType?.toLowerCase() === 'homestay' },
  { id: 'property-boutique', label: 'Boutique property', matches: (hotel: Hotel) => hotel.propertyType?.toLowerCase() === 'boutique' },
  { id: 'amenity-wifi', label: 'Free WiFi', matches: (hotel: Hotel) => hotel.amenities.some((amenity) => amenity.toLowerCase().includes('free wifi')) },
  { id: 'amenity-pool', label: 'Pool', matches: (hotel: Hotel) => hotel.amenities.some((amenity) => amenity.toLowerCase().includes('pool')) },
  { id: 'amenity-beach', label: 'Beach Access', matches: (hotel: Hotel) => hotel.amenities.some((amenity) => amenity.toLowerCase().includes('beach')) },
  { id: 'breakfast', label: 'Breakfast', matches: (hotel: Hotel) => hotel.breakfast === true || hotel.roomOptions?.some((room) => room.breakfast === true) === true },
  { id: 'cancellation', label: 'Free cancellation', matches: (hotel: Hotel) => Boolean(hotel.cancellation?.toLowerCase().includes('free') || hotel.roomOptions?.some((room) => room.cancellation?.toLowerCase().includes('free'))) },
];
const sortOptions = ['Recommended', 'Price low to high', 'Rating', 'Distance'] as const;
type SortOption = typeof sortOptions[number];

function getPrice(price: string) {
  const match = price.match(/[\d,]+(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : Number.POSITIVE_INFINITY;
}

function toDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function HotelsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const initial = parseSavedQuery(query);
  const { width } = useWindowDimensions();
  const desktop = width >= 950;
  const [destination, setDestination] = useState(typeof initial.destination === 'string' ? initial.destination : '');
  const [checkIn, setCheckIn] = useState(typeof initial.checkIn === 'string' ? initial.checkIn : '');
  const [checkOut, setCheckOut] = useState(typeof initial.checkOut === 'string' ? initial.checkOut : '');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('Recommended');
  const { items: hotels, loading, error } = useContentItems<Hotel>('hotel');

  const search: HotelSearchCriteria = { destination, checkIn, checkOut, guests, rooms };

  const visibleHotels = useMemo(() => {
    const filtered = hotels.filter((hotel) => {
      const query = destination.trim().toLowerCase();
      const matchesLocation = !hasSearched || !query || `${hotel.name} ${hotel.location}`.toLowerCase().includes(query);
      const matchesAmenities = activeFilters.every((id) => filterOptions.find((filter) => filter.id === id)?.matches(hotel) ?? false);
      return matchesLocation && matchesAmenities;
    });

    if (sort === 'Price low to high') filtered.sort((a, b) => getPrice(a.price) - getPrice(b.price));
    if (sort === 'Rating') filtered.sort((a, b) => (b.reviewScore ?? -1) - (a.reviewScore ?? -1));
    if (sort === 'Distance') filtered.sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
    return filtered;
  }, [activeFilters, destination, hasSearched, hotels, sort]);

  const handleSearch = () => {
    const start = toDate(checkIn);
    const end = toDate(checkOut);
    if (checkIn && !start) {
      Alert.alert('Check-in date', 'Use YYYY-MM-DD for your check-in date.');
      return;
    }
    if (checkOut && !end) {
      Alert.alert('Check-out date', 'Use YYYY-MM-DD for your check-out date.');
      return;
    }
    if (start && end && end <= start) {
      Alert.alert('Check-out date', 'Check-out must be after check-in.');
      return;
    }
    void recordRecentSearch('Hotels', destination || 'Your hotel search', JSON.stringify(search));
    setHasSearched(true);
    setHotelSearch(search);
  };

  const openHotel = (hotel: Hotel) => {
    setHotelSearch(search);
    selectHotel(hotel);
    router.push('/(tabs)/explore/hotel-details');
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Find your stay" subtitle="Distinctive stays, chosen for your journey." eyebrow="LEMONTRIP / HOTELS" onBack={handleBack} />

          <View style={styles.searchPanel}>
            <View style={styles.searchTitleRow}><TravelArtworkIcon name="hotel" size={34} /><Text style={styles.searchTitle}>Where are you staying?</Text></View>
            <View style={styles.searchFields}>
              <View style={[styles.field, desktop && styles.destinationField]}>
                <Text style={styles.fieldLabel}>DESTINATION</Text>
                <View style={styles.inputWrap}><Ionicons name="location-outline" size={16} color={Colors.textLight} /><TextInput value={destination} onChangeText={setDestination} placeholder="City, region or property" placeholderTextColor={Colors.textLight} style={styles.input} /></View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CHECK-IN</Text>
                <TextInput value={checkIn} onChangeText={setCheckIn} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} style={styles.dateInput} />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CHECK-OUT</Text>
                <TextInput value={checkOut} onChangeText={setCheckOut} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} style={styles.dateInput} />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>GUESTS & ROOMS</Text>
                <View style={styles.occupancy}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove guest" onPress={() => setGuests((current) => Math.max(1, current - 1))}><Ionicons name="remove-circle-outline" size={19} color={Colors.primary} /></TouchableOpacity>
                  <Text style={styles.occupancyText}>{guests} · {rooms} {rooms === 1 ? 'room' : 'rooms'}</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add guest" onPress={() => setGuests((current) => Math.min(12, current + 1))}><Ionicons name="add-circle-outline" size={19} color={Colors.primary} /></TouchableOpacity>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add room" onPress={() => setRooms((current) => Math.min(6, current + 1))} style={styles.addRoom}><Text style={styles.addRoomText}>+ Room</Text></TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={handleSearch} style={styles.searchButton}>
              <Ionicons name="search-outline" size={17} color={Colors.primaryDark} /><Text style={styles.searchButtonText}>Search hotels</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resultsHeader}>
            <View><Text style={styles.resultsEyebrow}>{hasSearched ? 'STAYS FOR YOUR SEARCH' : 'HANDPICKED PLACES'}</Text><Text style={styles.resultsTitle}>{hasSearched ? `${visibleHotels.length} stays to explore` : 'Places to stay'}</Text></View>
            <View style={styles.sortWrap}>
              <Text style={styles.sortLabel}>SORT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
                {sortOptions.map((option) => <TouchableOpacity key={option} onPress={() => setSort(option)} style={[styles.sortChip, sort === option && styles.sortChipActive]}><Text style={[styles.sortChipText, sort === option && styles.sortChipTextActive]}>{option}</Text></TouchableOpacity>)}
              </ScrollView>
            </View>
          </View>

          <View style={styles.filtersBlock}>
            <View style={styles.filtersTitleRow}><Ionicons name="options-outline" size={15} color={Colors.primary} /><Text style={styles.filtersTitle}>Refine your stay</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterOptions}>
              {filterOptions.map((filter) => <TouchableOpacity key={filter.id} onPress={() => toggleFilter(filter.id)} style={[styles.filterChip, activeFilters.includes(filter.id) && styles.filterChipActive]}><Text style={[styles.filterChipText, activeFilters.includes(filter.id) && styles.filterChipTextActive]}>{filter.label}</Text></TouchableOpacity>)}
            </ScrollView>
            <View style={styles.unavailableFilters}>
              <Text style={styles.unavailableLabel}>Price</Text><Text style={styles.unavailableLabel}>Location</Text>
              <Text style={styles.unavailableNote}>No distance or review data supplied</Text>
            </View>
          </View>

          {loading ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>Loading stays…</Text></View> : error ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>{error}</Text></View> : visibleHotels.length ? (
            <View style={styles.hotelList}>
              {visibleHotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} search={search} onPress={openHotel} />)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={24} color={Colors.primary} />
              <Text style={styles.emptyTitle}>No stays match these filters</Text>
              <Text style={styles.emptyText}>Try a different destination or clear a filter.</Text>
              <TouchableOpacity onPress={() => { setActiveFilters([]); setDestination(''); setHasSearched(false); }} style={styles.clearButton}><Text style={styles.clearButtonText}>Clear search</Text></TouchableOpacity>
            </View>
          )}

          <View style={styles.trustNote}><Ionicons name="shield-checkmark-outline" size={15} color={Colors.secondary} /><Text style={styles.trustText}>Property details shown here come from the available hotel listing.</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  searchPanel: { ...Ui.card, marginHorizontal: Ui.space.page, padding: Ui.space.card, borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  searchTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 13 },
  searchTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  searchFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { flexGrow: 1, flexBasis: '46%', minWidth: 120, marginBottom: 4 },
  destinationField: { flexBasis: '100%' },
  fieldLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 5 },
  inputWrap: { minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: Ui.radius.control, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  input: { minHeight: Ui.field.minHeight,  flex: 1, minWidth: 0, paddingVertical: 8, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 },
  dateInput: { minHeight: Ui.field.minHeight, paddingHorizontal: 9, borderRadius: Ui.radius.control, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 },
  occupancy: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingHorizontal: 8, borderRadius: 9, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  occupancyText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  addRoom: { paddingHorizontal: 5, paddingVertical: 5 },
  addRoomText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  searchButton: { minHeight: Ui.button.minHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 7, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  searchButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  resultsHeader: { marginTop: 23, paddingHorizontal: 16, gap: 12 },
  resultsEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  resultsTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', marginTop: 3 },
  sortWrap: { gap: 6 },
  sortLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  sortOptions: { gap: 6 },
  sortChip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: Ui.radius.pill, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortChipText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  sortChipTextActive: { color: Colors.white },
  filtersBlock: { marginHorizontal: Ui.space.page, marginTop: 14, padding: 11, borderRadius: 13, backgroundColor: Colors.surfaceMuted },
  filtersTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  filtersTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  filterOptions: { gap: 6 },
  filterChip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: Ui.radius.pill, backgroundColor: Colors.surface },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  filterChipTextActive: { color: Colors.white },
  unavailableFilters: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 },
  unavailableLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  unavailableNote: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, textAlign: 'right' },
  hotelList: { paddingHorizontal: 16, gap: 12, marginTop: 14 },
  emptyState: { minHeight: 180, alignItems: 'center', justifyContent: 'center', marginHorizontal: Ui.space.page, marginTop: 14, padding: 20, borderRadius: 15, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 9 },
  emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, marginTop: 4 },
  clearButton: { minHeight: 44,  marginTop: 11, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  clearButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  trustNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: Ui.space.page, marginTop: 19 },
  trustText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
});