import { parseSavedQuery, recordRecentSearch } from '@/utils/personalStore';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StationPicker } from '@/components/trains/StationPicker';
import { TrainCard } from '@/components/trains/TrainCards';
import { Card, Chip, EmptyState, FlowScreen, Notice, PrimaryButton, SectionTitle, TRAIN_ROUTES, goBackOr, goTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { CLASS_INFO, POPULAR_ROUTES, fromISO, getClassOptions, getStation, isRealDate, lowestFare, resolveStation, searchTrains, stationLabel, timeOfDay, upcomingDates, type ClassCode } from '@/data/trains';
import { parseSavedQuery, recordRecentSearch } from '@/utils/personalStore';
import { selectTrain, setTrainSearch, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

type Sort = 'earliest' | 'fastest' | 'cheapest';
type Slot = 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
const SLOTS: { id: Slot; label: string }[] = [
  { id: 'any', label: 'Any time' }, { id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }, { id: 'evening', label: 'Evening' }, { id: 'night', label: 'Night' },
];
const ALL_CLASSES = Object.keys(CLASS_INFO) as ClassCode[];

export default function TrainsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const initial = parseSavedQuery(query);
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { items: allListings, loading, error } = useContentItems<Listing>('listing');
  const trainListings = allListings.filter((item) => item.serviceId === 'trains');
  const availableClasses = [...new Set(trainListings.flatMap((train) => getClasses(train.detail)))];
  const [from, setFrom] = useState(typeof initial.from === 'string' ? initial.from : '');
  const [to, setTo] = useState(typeof initial.to === 'string' ? initial.to : '');
  const [travelDate, setTravelDate] = useState(typeof initial.travelDate === 'string' ? initial.travelDate : '');
  const [selectedClass, setSelectedClass] = useState('Any class');
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sort, setSort] = useState<Sort>('earliest');
  const [slot, setSlot] = useState<Slot>('any');
  const dates = useMemo(() => { const base = upcomingDates(14); return base.includes(search.date) ? base : [search.date, ...base]; }, [search.date]);

  // Restore a saved/recent search (e.g. from Home → Recent searches).
  useEffect(() => {
    const saved = parseSavedQuery(query);
    const from = typeof saved.from === 'string' ? resolveStation(saved.from)?.code : undefined;
    const to = typeof saved.to === 'string' ? resolveStation(saved.to)?.code : undefined;
    const rawDate = typeof saved.travelDate === 'string' ? saved.travelDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3') : '';
    const date = isRealDate(rawDate) && rawDate >= upcomingDates(1)[0] ? rawDate : undefined;
    if (from || to || date) { setTrainSearch({ ...(from ? { from } : {}), ...(to ? { to } : {}), ...(date ? { date } : {}) }); if (from && to) setSearched(true); }
  }, [query]);

  const handleSearch = () => {
    if (travelDate && !validDate(travelDate)) {
      Alert.alert('Travel date', 'Enter the travel date as YYYY-MM-DD.');
      return;
    }
    void recordRecentSearch('Trains', `${from || 'Origin'} → ${to || 'Destination'}`, JSON.stringify({ from, to, travelDate }));
    setSearched(true);
    void recordRecentSearch('Trains', `${getStation(search.from)?.city} → ${getStation(search.to)?.city}`, JSON.stringify({ from: search.from, to: search.to, travelDate: search.date }));
  };
  const open = (resultIndex: number, classCode?: string) => {
    const r = results[resultIndex];
    const preferred = (classCode as ClassCode | undefined) ?? (search.classCode !== 'ANY' && r.train.classes.includes(search.classCode) ? search.classCode : r.train.classes[0]);
    selectTrain({ trainId: r.train.id, fromCode: r.from.code, toCode: r.to.code, date: search.date, classCode: preferred, quota: 'GN' });
    goTo(TRAIN_ROUTES.details, { id: r.train.id });
  };

  return (
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ScreenHeader title="Book train tickets" subtitle="Search routes, compare classes and check seat availability." eyebrow="LEMONTRIP / RAIL" onBack={() => goBackOr('/(tabs)/explore')} />

          <Card>
            <SectionTitle eyebrow="PLAN YOUR JOURNEY" title="Where are you headed?" />
            <View style={s.stations}>
              <StationButton label="FROM" code={search.from} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from')} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap stations" onPress={swap} style={s.swap}><Ionicons name="swap-vertical" size={18} color={Colors.primaryDark} /></TouchableOpacity>
              <StationButton label="TO" code={search.to} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to')} />
            </View>

            <Text style={s.label}>DEPARTURE DATE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dates}>
              {dates.map((iso) => {
                const d = fromISO(iso); const on = iso === search.date;
                return (
                  <TouchableOpacity key={iso} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={d.toDateString()} onPress={() => setTrainSearch({ date: iso })} style={[s.date, on && s.dateOn]}>
                    <Text style={[s.dow, on && s.dateTextOn]}>{d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}</Text>
                    <Text style={[s.dayNum, on && s.dateTextOn]}>{d.getDate()}</Text>
                    <Text style={[s.mon, on && s.dateTextOn]}>{d.toLocaleDateString('en-IN', { month: 'short' })}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={s.label}>CLASS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              <Chip label="Any class" selected={search.classCode === 'ANY'} onPress={() => setTrainSearch({ classCode: 'ANY' })} />
              {ALL_CLASSES.map((c) => <Chip key={c} label={c} selected={search.classCode === c} onPress={() => setTrainSearch({ classCode: c })} />)}
            </ScrollView>

            {errorMsg ? <Text style={s.error}>{errorMsg}</Text> : null}
            <View style={{ marginTop: 14 }}><PrimaryButton label="Search trains" icon="search" onPress={runSearch} /></View>
          </Card>

          {!searched ? (
            <Card>
              <SectionTitle eyebrow="QUICK PICKS" title="Popular routes" />
              <View style={s.popular}>
                {POPULAR_ROUTES.map((r) => (
                  <TouchableOpacity key={`${r.from}-${r.to}`} accessibilityRole="button" onPress={() => { setTrainSearch({ from: r.from, to: r.to }); setSearched(true); setErrorMsg(''); }} style={s.route}>
                    <Text style={s.routeText}>{getStation(r.from)?.city}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /><Text style={s.routeText}>{getStation(r.to)?.city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ) : null}

          <View style={s.pad}>
            <View style={s.resultHead}>
              <View>
                <Text style={s.eyebrow}>{searched ? `${getStation(search.from)?.code} → ${getStation(search.to)?.code}` : 'ALL ROUTES'}</Text>
                <Text style={s.count}>{results.length} {results.length === 1 ? 'train' : 'trains'} {searched ? 'found' : 'available'}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              <Chip icon="time-outline" label="Earliest" selected={sort === 'earliest'} onPress={() => setSort('earliest')} />
              <Chip icon="flash-outline" label="Fastest" selected={sort === 'fastest'} onPress={() => setSort('fastest')} />
              <Chip icon="wallet-outline" label="Cheapest" selected={sort === 'cheapest'} onPress={() => setSort('cheapest')} />
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.chips, { marginTop: 8, marginBottom: 14 }]}>
              {SLOTS.map((o) => <Chip key={o.id} label={o.label} selected={slot === o.id} onPress={() => setSlot(o.id)} />)}
            </ScrollView>

            {results.length ? results.map((r, i) => (
              <TrainCard key={r.train.id} result={r} date={search.date} onOpen={() => open(i)} onSelectClass={(code) => open(i, code)} />
            )) : (
              <EmptyState icon="train-outline" title="No trains match" text={searched ? 'No trains run on this route for the selected date, class or time. Try another date or clear the filters.' : 'No trains available.'} action={<PrimaryButton variant="soft" label="Clear filters" onPress={() => { setSlot('any'); setTrainSearch({ classCode: 'ANY' }); }} />} />
            )}
          </View>

          <Notice icon="shield-checkmark-outline" title="Demo inventory">Schedules, fares and seat availability shown here are sample data for demonstration. No real railway ticket or PNR is issued.</Notice>
        </View>
      </ScrollView>

      <StationPicker visible={picker !== null} title={picker === 'from' ? 'Departure station' : 'Arrival station'} exclude={picker === 'from' ? search.to : search.from}
        onClose={() => setPicker(null)} onSelect={(code) => { setTrainSearch(picker === 'from' ? { from: code } : { to: code }); setPicker(null); setErrorMsg(''); }} />
    </FlowScreen>
  );
}

function lowest(r: ReturnType<typeof searchTrains>[number], date: string) { return lowestFare(getClassOptions(r, date)); }

function StationButton({ label, code, placeholder, icon, onPress }: { label: string; code: string; placeholder: string; icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  return (
    <View style={styles.trainCard}>
      <View style={styles.trainAccent} />
      <View style={styles.trainCardContent}>
        <View style={styles.trainTop}>
          <View style={styles.trainNumber}><TravelArtworkIcon name="train" size={28} /><Text style={styles.trainNumberText}>Number not provided</Text></View>
          <View style={styles.demoTag}><Text style={styles.demoTagText}>DEMO</Text></View>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View ${train.name} details`} onPress={() => router.push({ pathname: '/(tabs)/explore/train-details', params: { id: train.id } })}><Text style={styles.trainName}>{train.name}</Text><Text style={{ fontFamily: 'Manrope', fontSize: 12, color: Colors.primary, marginTop: 6 }}>View journey details →</Text></TouchableOpacity>
        <View style={styles.routeRow}><Text style={styles.station}>{route.from || 'Station unavailable'}</Text><View style={styles.routeTrack}><View style={styles.trackLine} /><Ionicons name="train" size={14} color={Colors.primary} /><View style={styles.trackLine} /></View><Text style={[styles.station, styles.stationRight]}>{route.to || 'Station unavailable'}</Text></View>

        <View style={styles.railStats}>
          <RailStat label="DEPARTURE" value="Not provided" />
          <RailStat label="ARRIVAL" value="Not provided" />
          <RailStat label="DURATION" value="Not provided" />
          <RailStat label="TRAIN TYPE" value={/express/i.test(train.name) ? 'Express' : 'Not provided'} />
        </View>

        <View style={styles.availableRow}>
          <View style={styles.classWrap}><Text style={styles.classHeading}>CLASSES IN FIXTURE</Text><View style={styles.classList}>{classes.length ? classes.map((trainClass) => <View key={trainClass} style={styles.availableClass}><Text style={styles.availableClassText}>{trainClass}</Text></View>) : <Text style={styles.unavailable}>Not provided</Text>}</View></View>
          <View style={styles.fareBlock}><Text style={styles.classHeading}>DEMO FARE</Text><Text style={styles.fare}>{train.price}</Text></View>
        </View>
        <View style={styles.availability}><Ionicons name="information-circle-outline" size={14} color={Colors.textLight} /><Text style={styles.availabilityText}>Availability not connected · fare is sample data</Text></View>
      </View>
      <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

function RailStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.railStat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 28 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  demoBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, marginHorizontal: 16, padding: 11, borderRadius: 12, backgroundColor: Colors.accentSoft },
  demoIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.7)' },
  demoCopy: { flex: 1 },
  demoTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  demoText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 2 },
  searchPanel: { ...Ui.card, marginHorizontal: 16, marginTop: 12, padding: Ui.space.card, borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  searchHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  railIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  searchTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  searchSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 3 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 8 },
  field: { flex: 1, minWidth: 145, marginBottom: 4 },
  fieldLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 5 },
  inputWrap: { minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: Ui.radius.control, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  input: { minHeight: Ui.field.minHeight,  flex: 1, minWidth: 0, paddingVertical: 8, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 },
  swapIcon: { width: 18, height: 41, alignItems: 'center', justifyContent: 'center' },
  classLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 9 },
  classOptions: { gap: 6, paddingTop: 6 },
  classChip: { paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.pill },
  classChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  classChipTextSelected: { color: Colors.white },
  searchButton: { minHeight: Ui.button.minHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 11, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  searchButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  resultsLayout: { gap: 13, marginTop: 19, paddingHorizontal: 16 },
  resultsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  filterPanel: { ...Ui.card, padding: Ui.space.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  filterPanelDesktop: { width: 215 },
  filterHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  filterGroup: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', marginTop: 12, marginBottom: 5 },
  unavailable: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 },
  filterOption: { minHeight: 27, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterOptionText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  resultColumn: { flex: 1, minWidth: 0 },
  resultHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  resultTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 3 },
  clearText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  trainList: { gap: 9 },
  trainCard: { ...Ui.card, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  trainAccent: { width: 4, backgroundColor: Colors.accent },
  trainCardContent: { flex: 1, minWidth: 0, padding: 12 },
  trainTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trainNumber: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trainNumberText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  demoTag: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: Ui.radius.pill, backgroundColor: Colors.accentSoft },
  demoTagText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  trainName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 6 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  station: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  stationRight: { textAlign: 'right' },
  routeTrack: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  trackLine: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  railStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingVertical: 9, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  railStat: { width: '48%', minHeight: 31 },
  statLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  statValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', marginTop: 4 },
  availableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9 },
  classWrap: { flex: 1 },
  classHeading: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', letterSpacing: 0.7 },
  classList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
  availableClass: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: Colors.surfaceMuted },
  availableClassText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  fareBlock: { alignItems: 'flex-end' },
  fare: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900', marginTop: 4 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  availabilityText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  empty: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  resultsNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 12 },
});