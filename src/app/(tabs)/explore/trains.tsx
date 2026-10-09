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
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Sort = 'earliest' | 'fastest' | 'cheapest';
type Slot = 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
const SLOTS: { id: Slot; label: string }[] = [
  { id: 'any', label: 'Any time' }, { id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }, { id: 'evening', label: 'Evening' }, { id: 'night', label: 'Night' },
];
const ALL_CLASSES = Object.keys(CLASS_INFO) as ClassCode[];

export default function TrainsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const { search } = useTrainBooking();
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
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

  const results = useMemo(() => {
    let list = searchTrains(searched ? { from: search.from, to: search.to, date: search.date } : {});
    if (searched && search.classCode !== 'ANY') list = list.filter((r) => r.train.classes.includes(search.classCode as ClassCode));
    if (slot !== 'any') list = list.filter((r) => timeOfDay(r.departure) === slot);
    return [...list].sort((a, b) => sort === 'fastest' ? a.durationMin - b.durationMin : sort === 'cheapest' ? lowest(a, search.date) - lowest(b, search.date) : a.departure.localeCompare(b.departure));
  }, [search, searched, slot, sort]);

  const swap = () => setTrainSearch({ from: search.to, to: search.from });
  const runSearch = () => {
    if (!search.from || !search.to) { setSearched(false); setErrorMsg('Choose both a departure and an arrival station.'); return; }
    if (search.from === search.to) { setErrorMsg('Departure and arrival stations must be different.'); return; }
    setErrorMsg('');
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
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label} station: ${code ? stationLabel(code) : 'not selected'}`} onPress={onPress} style={s.station}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.stationLabel}>{label}</Text>
        <Text style={[s.stationValue, !code && { color: Colors.textLight, fontWeight: '600' }]} numberOfLines={1}>{code ? getStation(code)?.name : placeholder}</Text>
        {code ? <Text style={s.stationCode}>{code} · {getStation(code)?.city}</Text> : null}
      </View>
      <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  pad: { paddingHorizontal: Ui.space.page },
  stations: { gap: 8, position: 'relative' },
  station: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  stationLabel: { ...Ui.eyebrow, color: Colors.textLight, letterSpacing: 1 },
  stationValue: { fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', color: Colors.textDark, marginTop: 2 },
  stationCode: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 1 },
  swap: { position: 'absolute', right: 44, top: '50%', marginTop: -19, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.surface, zIndex: 2 },
  label: { ...Ui.eyebrow, color: Colors.textLight, marginTop: 16, marginBottom: 8 },
  dates: { gap: 8 },
  date: { width: 58, alignItems: 'center', paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  dateOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dow: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', color: Colors.textLight, letterSpacing: 0.6 },
  dayNum: { fontFamily: 'Manrope', fontSize: 20, fontWeight: '800', color: Colors.textDark, marginVertical: 1 },
  mon: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textLight },
  dateTextOn: { color: Colors.white },
  chips: { gap: 8, alignItems: 'center' },
  error: { fontFamily: 'Manrope', fontSize: 12, color: Colors.error, marginTop: 10 },
  popular: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  routeText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primary },
  resultHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  count: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.textDark, marginTop: 3 },
});
