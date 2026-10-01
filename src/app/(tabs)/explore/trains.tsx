import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { dummyListings, type Listing } from '@/data/services';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const trainListings = dummyListings.trains ?? [];

function getRoute(detail: string) {
  const route = detail.split('·')[0] ?? '';
  const [from = '', to = ''] = route.split('→').map((station) => station.trim());
  return { from, to };
}

function getClasses(detail: string) {
  const classes: string[] = [];
  if (/AC\s*2\s*Tier/i.test(detail)) classes.push('2A');
  if (/AC\s*3\s*Tier/i.test(detail)) classes.push('3A');
  if (/AC\s*Chair/i.test(detail)) classes.push('CC');
  if (/Sleeper/i.test(detail)) classes.push('SL');
  if (/First\s*AC/i.test(detail)) classes.push('1A');
  if (/General/i.test(detail)) classes.push('General');
  return classes;
}

function parsePrice(price: string) {
  const match = price.match(/[\d,]+(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : Number.POSITIVE_INFINITY;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export default function TrainsScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const availableClasses = [...new Set(trainListings.flatMap((train) => getClasses(train.detail)))];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('Any class');
  const [searched, setSearched] = useState(false);
  const [activeClassFilter, setActiveClassFilter] = useState<string | null>(null);
  const [expressOnly, setExpressOnly] = useState(false);

  const results = useMemo(() => trainListings.filter((train) => {
    const route = getRoute(train.detail);
    const matchesFrom = !searched || !from.trim() || route.from.toLowerCase().includes(from.trim().toLowerCase());
    const matchesTo = !searched || !to.trim() || route.to.toLowerCase().includes(to.trim().toLowerCase());
    const classes = getClasses(train.detail);
    const matchesClass = (!searched || selectedClass === 'Any class' || classes.includes(selectedClass))
      && (!activeClassFilter || classes.includes(activeClassFilter));
    const matchesType = !expressOnly || /express/i.test(train.name);
    return matchesFrom && matchesTo && matchesClass && matchesType;
  }).sort((first, second) => parsePrice(first.price) - parsePrice(second.price)), [activeClassFilter, expressOnly, from, searched, selectedClass, to]);

  const handleSearch = () => {
    if (travelDate && !validDate(travelDate)) {
      Alert.alert('Travel date', 'Enter the travel date as YYYY-MM-DD.');
      return;
    }
    setSearched(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Book train travel" subtitle="Compare routes, classes, and demo fares." eyebrow="LEMONTRIP / RAIL" onBack={handleBack} />

          <View style={styles.demoBanner}>
            <View style={styles.demoIcon}><Ionicons name="information-circle-outline" size={17} color={Colors.primaryDark} /></View>
            <View style={styles.demoCopy}><Text style={styles.demoTitle}>Demo rail listings</Text><Text style={styles.demoText}>Live timetable and seat availability are not connected. Fares below are sample app data.</Text></View>
          </View>

          <View style={styles.searchPanel}>
            <View style={styles.searchHeading}><View style={styles.railIcon}><Ionicons name="train-outline" size={19} color={Colors.primary} /></View><View><Text style={styles.searchTitle}>Plan your rail journey</Text><Text style={styles.searchSubtitle}>Search stations, travel date, and class.</Text></View></View>
            <View style={styles.fields}>
              <SearchField label="FROM STATION" value={from} onChangeText={setFrom} placeholder="Departure station" icon="radio-button-on-outline" />
              <View style={styles.swapIcon}><Ionicons name="arrow-forward" size={14} color={Colors.textLight} /></View>
              <SearchField label="TO STATION" value={to} onChangeText={setTo} placeholder="Arrival station" icon="location-outline" />
              <SearchField label="DATE" value={travelDate} onChangeText={setTravelDate} placeholder="YYYY-MM-DD" icon="calendar-outline" />
            </View>
            <Text style={styles.classLabel}>CLASS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classOptions}>
              {['Any class', ...availableClasses].map((trainClass) => (
                <TouchableOpacity key={trainClass} onPress={() => setSelectedClass(trainClass)} style={[styles.classChip, selectedClass === trainClass && styles.classChipSelected]}>
                  <Text style={[styles.classChipText, selectedClass === trainClass && styles.classChipTextSelected]}>{trainClass}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity accessibilityRole="button" onPress={handleSearch} style={styles.searchButton}><Ionicons name="search-outline" size={16} color={Colors.primaryDark} /><Text style={styles.searchButtonText}>Search trains</Text></TouchableOpacity>
          </View>

          <View style={[styles.resultsLayout, desktop && styles.resultsLayoutDesktop]}>
            <View style={[styles.filterPanel, desktop && styles.filterPanelDesktop]}>
              <View style={styles.filterHeading}><Ionicons name="options-outline" size={15} color={Colors.primary} /><Text style={styles.filterTitle}>Filter trains</Text></View>
              <Text style={styles.filterGroup}>Departure time</Text><Text style={styles.unavailable}>Times are not provided by the demo data.</Text>
              <Text style={styles.filterGroup}>Arrival time</Text><Text style={styles.unavailable}>Times are not provided by the demo data.</Text>
              <Text style={styles.filterGroup}>Train type</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: expressOnly }} onPress={() => setExpressOnly((current) => !current)} style={styles.filterOption}><Ionicons name={expressOnly ? 'checkbox' : 'square-outline'} size={15} color={expressOnly ? Colors.primary : Colors.textLight} /><Text style={styles.filterOptionText}>Express</Text></TouchableOpacity>
              <Text style={styles.filterGroup}>Class</Text>
              {availableClasses.map((trainClass) => <TouchableOpacity key={trainClass} accessibilityRole="button" accessibilityState={{ selected: activeClassFilter === trainClass }} onPress={() => setActiveClassFilter((current) => current === trainClass ? null : trainClass)} style={styles.filterOption}><Ionicons name={activeClassFilter === trainClass ? 'checkbox' : 'square-outline'} size={15} color={activeClassFilter === trainClass ? Colors.primary : Colors.textLight} /><Text style={styles.filterOptionText}>{trainClass}</Text></TouchableOpacity>)}
            </View>

            <View style={styles.resultColumn}>
              <View style={styles.resultHeading}><View><Text style={styles.eyebrow}>{searched ? 'MATCHING DEMO ROUTES' : 'DEMO ROUTES'}</Text><Text style={styles.resultTitle}>{results.length} {results.length === 1 ? 'train' : 'trains'}</Text></View>
                {(activeClassFilter || expressOnly) ? <TouchableOpacity onPress={() => { setActiveClassFilter(null); setExpressOnly(false); }}><Text style={styles.clearText}>Clear filters</Text></TouchableOpacity> : null}
              </View>
              {results.length ? <View style={styles.trainList}>{results.map((train) => <TrainResult key={train.id} train={train} />)}</View> : <View style={styles.empty}><Ionicons name="train-outline" size={23} color={Colors.primary} /><Text style={styles.emptyTitle}>No trains match your search</Text><Text style={styles.unavailable}>Try another station or class.</Text></View>}
              <Text style={styles.resultsNote}>Sample fixtures only · no live availability or booking is performed.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchField({ label, value, onChangeText, placeholder, icon }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; icon: keyof typeof Ionicons.glyphMap }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.inputWrap}><Ionicons name={icon} size={14} color={Colors.primary} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textLight} style={styles.input} /></View></View>;
}

function TrainResult({ train }: { train: Listing }) {
  const route = getRoute(train.detail);
  const classes = getClasses(train.detail);
  return (
    <View style={styles.trainCard}>
      <View style={styles.trainAccent} />
      <View style={styles.trainCardContent}>
        <View style={styles.trainTop}>
          <View style={styles.trainNumber}><Ionicons name="train-outline" size={17} color={Colors.primary} /><Text style={styles.trainNumberText}>Number not provided</Text></View>
          <View style={styles.demoTag}><Text style={styles.demoTagText}>DEMO</Text></View>
        </View>
        <Text style={styles.trainName}>{train.name}</Text>
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
    </View>
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
  demoTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  demoText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, marginTop: 2 },
  searchPanel: { marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  searchHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  railIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  searchTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  searchSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 3 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 8 },
  field: { flex: 1, minWidth: 145, marginBottom: 4 },
  fieldLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.8, marginBottom: 5 },
  inputWrap: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 9, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  input: { flex: 1, minWidth: 0, paddingVertical: 8, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8 },
  swapIcon: { width: 18, height: 41, alignItems: 'center', justifyContent: 'center' },
  classLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.8, marginTop: 9 },
  classOptions: { gap: 6, paddingTop: 6 },
  classChip: { paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 14 },
  classChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700' },
  classChipTextSelected: { color: Colors.white },
  searchButton: { minHeight: 41, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 11, borderRadius: 10, backgroundColor: Colors.accent },
  searchButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  resultsLayout: { gap: 13, marginTop: 19, paddingHorizontal: 16 },
  resultsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  filterPanel: { padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, backgroundColor: Colors.surface },
  filterPanelDesktop: { width: 215 },
  filterHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  filterGroup: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', marginTop: 12, marginBottom: 5 },
  unavailable: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12 },
  filterOption: { minHeight: 27, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterOptionText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  resultColumn: { flex: 1, minWidth: 0 },
  resultHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  resultTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 3 },
  clearText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  trainList: { gap: 9 },
  trainCard: { flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface },
  trainAccent: { width: 4, backgroundColor: Colors.accent },
  trainCardContent: { flex: 1, minWidth: 0, padding: 12 },
  trainTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trainNumber: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trainNumberText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '700' },
  demoTag: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: Colors.accentSoft },
  demoTagText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 6, fontWeight: '900', letterSpacing: 0.8 },
  trainName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900', marginTop: 6 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  station: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  stationRight: { textAlign: 'right' },
  routeTrack: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  trackLine: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  railStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingVertical: 9, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  railStat: { width: '48%', minHeight: 31 },
  statLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800', letterSpacing: 0.7 },
  statValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700', marginTop: 4 },
  availableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9 },
  classWrap: { flex: 1 },
  classHeading: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800', letterSpacing: 0.7 },
  classList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
  availableClass: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: Colors.surfaceMuted },
  availableClassText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  fareBlock: { alignItems: 'flex-end' },
  fare: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900', marginTop: 4 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  availabilityText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7 },
  empty: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  resultsNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12, marginTop: 12 },
});