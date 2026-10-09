import { parseSavedQuery, recordRecentSearch } from '@/utils/personalStore';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { BusListing } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { selectBus, setBusSearch } from '@/utils/busSearchStore';

const typeFilters = [
  { id: 'ac', label: 'AC', matches: (bus: BusListing) => /\bAC\b/i.test(bus.busType) },
  { id: 'non-ac', label: 'Non AC', matches: (bus: BusListing) => !/\bAC\b/i.test(bus.busType) },
  { id: 'sleeper', label: 'Sleeper', matches: (bus: BusListing) => /sleeper/i.test(bus.busType) },
  { id: 'seater', label: 'Seater', matches: (bus: BusListing) => /seater/i.test(bus.busType) },
];

function getPrice(price: string) {
  const match = price.match(/[\d,]+(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : Number.POSITIVE_INFINITY;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export default function BusesScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const initial = parseSavedQuery(query);
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [from, setFrom] = useState(typeof initial.from === 'string' ? initial.from : '');
  const [to, setTo] = useState(typeof initial.to === 'string' ? initial.to : '');
  const [travelDate, setTravelDate] = useState(typeof initial.travelDate === 'string' ? initial.travelDate : '');
  const [searched, setSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { items: allListings, loading, error } = useContentItems<BusListing>('listing');
  const busListings = allListings.filter((item) => item.serviceId === 'buses');

  const results = useMemo(() => busListings.filter((bus) => {
    const fromMatch = !searched || !from.trim() || bus.origin.toLowerCase().includes(from.trim().toLowerCase());
    const toMatch = !searched || !to.trim() || bus.destination.toLowerCase().includes(to.trim().toLowerCase());
    const filtersMatch = activeFilters.every((filter) => {
      if (filter === 'under-1000') return getPrice(bus.price) < 1000;
      if (filter === '1000-plus') return getPrice(bus.price) >= 1000;
      return typeFilters.find((option) => option.id === filter)?.matches(bus) ?? false;
    });
    return fromMatch && toMatch && filtersMatch;
  }), [activeFilters, busListings, from, searched, to]);

  const handleSearch = () => {
    if (travelDate && !validDate(travelDate)) {
      Alert.alert('Travel date', 'Enter your travel date as YYYY-MM-DD.');
      return;
    }
    void recordRecentSearch('Buses', `${from || 'Origin'} → ${to || 'Destination'}`, JSON.stringify({ from, to, travelDate }));
    setSearched(true);
    setBusSearch({ from, to, travelDate });
  };

  const openBus = (bus: BusListing) => {
    setBusSearch({ from, to, travelDate });
    selectBus(bus);
    router.push('/(tabs)/explore/bus-details');
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
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Find your bus" subtitle="Choose a route and compare available services." eyebrow="LEMONTRIP / BUS BOOKING" onBack={handleBack} />

          <View style={styles.searchPanel}>
            <View style={styles.searchTitleRow}><View style={styles.busIcon}><TravelArtworkIcon name="bus" size={36} /></View><View><Text style={styles.searchTitle}>Where are you headed?</Text><Text style={styles.searchSubtitle}>Plan your next road journey.</Text></View></View>
            <View style={styles.fields}>
              <View style={styles.field}>
                <Text style={styles.label}>FROM</Text>
                <View style={styles.inputWrap}><Ionicons name="radio-button-on-outline" size={15} color={Colors.primary} /><TextInput value={from} onChangeText={setFrom} placeholder="Departure city" placeholderTextColor={Colors.textLight} style={styles.input} /></View>
              </View>
              <View style={styles.swapMark}><Ionicons name="arrow-forward" size={15} color={Colors.textLight} /></View>
              <View style={styles.field}>
                <Text style={styles.label}>TO</Text>
                <View style={styles.inputWrap}><Ionicons name="location-outline" size={15} color={Colors.primary} /><TextInput value={to} onChangeText={setTo} placeholder="Destination city" placeholderTextColor={Colors.textLight} style={styles.input} /></View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>TRAVEL DATE</Text>
                <View style={styles.inputWrap}><Ionicons name="calendar-outline" size={15} color={Colors.primary} /><TextInput value={travelDate} onChangeText={setTravelDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} style={styles.input} /></View>
              </View>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={handleSearch} style={styles.searchButton}><Ionicons name="search-outline" size={16} color={Colors.primaryDark} /><Text style={styles.searchButtonText}>Search buses</Text></TouchableOpacity>
          </View>

          <View style={[styles.resultsLayout, desktop && styles.resultsLayoutDesktop]}>
            <View style={[styles.filterPanel, desktop && styles.filterPanelDesktop]}>
              <View style={styles.filterHeading}><Ionicons name="options-outline" size={16} color={Colors.primary} /><Text style={styles.filterTitle}>Filters</Text></View>
              <Text style={styles.filterGroupTitle}>Bus type</Text>
              {typeFilters.map((filter) => <FilterOption key={filter.id} label={filter.label} selected={activeFilters.includes(filter.id)} onPress={() => toggleFilter(filter.id)} />)}
              <Text style={styles.filterGroupTitle}>Departure</Text>
              <Text style={styles.unavailable}>Departure times are not included in this listing.</Text>
              <Text style={styles.filterGroupTitle}>Price</Text>
              <FilterOption label="Under ₹1,000" selected={activeFilters.includes('under-1000')} onPress={() => toggleFilter('under-1000')} />
              <FilterOption label="₹1,000 and above" selected={activeFilters.includes('1000-plus')} onPress={() => toggleFilter('1000-plus')} />
              <Text style={styles.filterGroupTitle}>Operator</Text>
              <Text style={styles.unavailable}>Operator details are not provided.</Text>
            </View>

            <View style={styles.resultColumn}>
              <View style={styles.resultHeading}><View><Text style={styles.eyebrow}>{searched ? 'ROUTES MATCHING YOUR SEARCH' : 'AVAILABLE ROUTES'}</Text><Text style={styles.resultTitle}>{results.length} bus {results.length === 1 ? 'service' : 'services'}</Text></View>
                {activeFilters.length ? <TouchableOpacity onPress={() => setActiveFilters([])}><Text style={styles.clearText}>Clear filters</Text></TouchableOpacity> : null}
              </View>
              {loading ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>Loading bus listings…</Text></View> : error ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>{error}</Text></View> : results.length ? (
                <View style={styles.busList}>
                  {results.map((bus) => <BusResultCard key={bus.id} bus={bus} onPress={() => openBus(bus)} />)}
                </View>
              ) : (
                <View style={styles.emptyState}><TravelArtworkIcon name="bus" size={40} /><Text style={styles.emptyTitle}>No buses match this search</Text><Text style={styles.unavailable}>Try another route or clear a filter.</Text></View>
              )}
              <Text style={styles.dataNote}>Schedule, operator, and seat inventory details appear when supplied by the bus service.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={styles.filterOption}><Ionicons name={selected ? 'checkbox' : 'square-outline'} size={15} color={selected ? Colors.primary : Colors.textLight} /><Text style={styles.filterOptionText}>{label}</Text></TouchableOpacity>;
}

function BusResultCard({ bus, onPress }: { bus: BusListing; onPress: () => void }) {
  return (
    <View style={styles.busCard}>
      <View style={styles.cardHeader}>
        <View style={styles.operatorIcon}><TravelArtworkIcon name="bus" size={30} /></View>
        <View style={styles.operatorInfo}><Text style={styles.operator}>{bus.operator ?? 'Operator not provided'}</Text><Text style={styles.busType}>{bus.busType}</Text></View>
        {bus.rating !== undefined ? <View style={styles.rating}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.ratingText}>{bus.rating.toFixed(1)}</Text></View> : null}
      </View>
      <Text style={styles.route}>{bus.origin} <Ionicons name="arrow-forward" size={13} color={Colors.primary} /> {bus.destination}</Text>
      <View style={styles.scheduleRow}>
        <View style={styles.scheduleItem}><Text style={styles.scheduleTime}>{bus.departure ?? '—'}</Text><Text style={styles.scheduleLabel}>Departure</Text></View>
        <View style={styles.duration}><View style={styles.durationLine} /><Text style={styles.durationText}>{bus.duration ?? 'Duration unavailable'}</Text><View style={styles.durationLine} /></View>
        <View style={[styles.scheduleItem, styles.scheduleArrival]}><Text style={styles.scheduleTime}>{bus.arrival ?? '—'}</Text><Text style={styles.scheduleLabel}>Arrival</Text></View>
      </View>
      <View style={styles.metaGrid}>
        <Meta icon="people-outline" text={bus.seatsAvailable !== undefined ? `${bus.seatsAvailable} seats available` : 'Seat availability not provided'} />
        <Meta icon="navigate-outline" text={bus.boardingPoints?.join(', ') ?? 'Boarding points not provided'} />
        <Meta icon="flag-outline" text={bus.droppingPoints?.join(', ') ?? 'Dropping points not provided'} />
      </View>
      <View style={styles.cardFooter}>
        <View><Text style={styles.price}>{bus.price}</Text><Text style={styles.priceCaption}>per seat</Text></View>
        <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.selectButton}><Text style={styles.selectButtonText}>Choose seats</Text><Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} /></TouchableOpacity>
      </View>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return <View style={styles.metaItem}><Ionicons name={icon} size={13} color={Colors.textLight} /><Text style={styles.metaText} numberOfLines={2}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  searchPanel: { ...Ui.card, marginHorizontal: Ui.space.page, padding: Ui.space.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  searchTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  busIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  searchTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  searchSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 3 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 8 },
  field: { flex: 1, minWidth: 145, marginBottom: 5 },
  label: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 5 },
  inputWrap: { minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.background },
  input: { minHeight: Ui.field.minHeight,  flex: 1, minWidth: 0, paddingVertical: 8, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 },
  swapMark: { width: 22, height: 43, alignItems: 'center', justifyContent: 'center' },
  searchButton: { minHeight: Ui.button.minHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 7, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  searchButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  resultsLayout: { gap: 13, marginTop: 23, paddingHorizontal: 16 },
  resultsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  filterPanel: { ...Ui.card, padding: Ui.space.card, borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterPanelDesktop: { width: 220 },
  filterHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  filterGroupTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 13, marginBottom: 6 },
  filterOption: { minHeight: 29, flexDirection: 'row', alignItems: 'center', gap: 7 },
  filterOptionText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  unavailable: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 },
  resultColumn: { flex: 1, minWidth: 0 },
  resultHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 11 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  resultTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 3 },
  clearText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  busList: { gap: 10 },
  busCard: { ...Ui.card, padding: Ui.space.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  operatorIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accentSoft },
  operatorInfo: { flex: 1 },
  operator: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  busType: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, marginTop: 3 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  route: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginTop: 13 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  scheduleItem: { minWidth: 57 },
  scheduleArrival: { alignItems: 'flex-end' },
  scheduleTime: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  scheduleLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 3 },
  duration: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  durationLine: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  durationText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 11 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '48%' },
  metaText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  price: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800' },
  priceCaption: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  selectButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  selectButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  emptyState: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 7, padding: 18, borderRadius: 14, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  dataNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 13 },
});