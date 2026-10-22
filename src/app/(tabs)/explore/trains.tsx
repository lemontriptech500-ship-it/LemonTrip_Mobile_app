import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { ServiceBanner, ServiceTopBar } from '@/components/ui/ServiceHeader';
import { SortBox, SortOptions, type SortChoice } from '@/components/ui/SortBox';
import { StationPicker } from '@/components/trains/StationPicker';
import { TrainCard } from '@/components/trains/TrainCards';
import { Card, Chip, EmptyState, Notice, PrimaryButton, SectionTitle, TRAIN_ROUTES, goTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { DateField } from '@/components/DatePickerField';
import { Ui } from '@/constants/theme';
import { CLASS_INFO, POPULAR_ROUTES, getClassOptions, getStation, isRealDate, lowestFare, resolveStation, searchTrains, stationLabel, timeOfDay, upcomingDates, formatShortDate, type ClassCode } from '@/data/trains';
import { parseSavedQuery, recordRecentSearch } from '@/utils/personalStore';
import { selectTrain, setTrainSearch, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type Sort = 'earliest' | 'fastest' | 'cheapest';
type Slot = 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
const SLOTS: { id: Slot; label: string }[] = [
  { id: 'any', label: 'All' }, { id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }, { id: 'evening', label: 'Evening' }, { id: 'night', label: 'Night' },
];
const SORTS: SortChoice<Sort>[] = [
  { id: 'earliest', label: 'Earliest', icon: 'time-outline' },
  { id: 'fastest', label: 'Fastest', icon: 'flash-outline' },
  { id: 'cheapest', label: 'Cheapest', icon: 'wallet-outline' },
];
const ALL_CLASSES = Object.keys(CLASS_INFO) as ClassCode[];

export default function TrainsScreen() {
  useAppLanguage();
  const { query } = useLocalSearchParams<{ query?: string }>();
  const { search } = useTrainBooking();
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sort, setSort] = useState<Sort>('earliest');
  const [slot, setSlot] = useState<Slot>('any');
  const [sortOpen, setSortOpen] = useState(false);

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
    <AppScreen headerTone="light" edges={['top']}>
      <ServiceTopBar title="Trains" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ServiceBanner eyebrow="LEMONTRIP / RAIL" title="Book train tickets" subtitle="Search routes, compare classes and check seat availability." image={require('../../../../assets/images/Modern Green High-Speed Train Landscape.png')} />

          <Card>
            <SectionTitle eyebrow="PLAN YOUR JOURNEY" title="Where are you headed?" />
            <View style={s.stations}>
              <StationButton label="FROM" code={search.from} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from')} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap stations" onPress={swap} style={s.swap}><Ionicons name="swap-vertical" size={18} color={Colors.primaryDark} /></TouchableOpacity>
              <StationButton label="TO" code={search.to} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to')} />
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <DateField compact label="DEPARTURE DATE" value={search.date} placeholder="Add date" onChange={(d) => setTrainSearch({ date: d })} />
            </View>

            <Text style={s.label}>CLASS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              <Chip label="Any class" selected={search.classCode === 'ANY'} onPress={() => setTrainSearch({ classCode: 'ANY' })} />
              {ALL_CLASSES.map((c) => <Chip key={c} label={c} selected={search.classCode === c} onPress={() => setTrainSearch({ classCode: c })} />)}
            </ScrollView>

            {errorMsg ? <Text style={s.error}>{errorMsg}</Text> : null}
            <View style={{ marginTop: 14 }}><PrimaryButton label="Search trains" icon="search" onPress={runSearch} /></View>
          </Card>

          <View style={s.pad}>
            <View style={s.resultHead}>
              {searched ? <Text style={s.eyebrow} numberOfLines={1}>{`${getStation(search.from)?.code} \u2192 ${getStation(search.to)?.code}  \u00B7  ${formatShortDate(search.date)}`}</Text> : null}
              <View style={s.headRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.count}>Available trains</Text>
                  <Text style={s.found}>{results.length} {results.length === 1 ? 'train' : 'trains'} {searched ? 'found' : 'available'}</Text>
                </View>
                <SortBox currentLabel={SORTS.find((o) => o.id === sort)?.label ?? 'Earliest'} open={sortOpen} onToggle={() => setSortOpen((v) => !v)} />
              </View>
            </View>
            {sortOpen ? <View style={{ marginBottom: 10 }}><SortOptions options={SORTS} selected={sort} onChange={(v) => { setSort(v); setSortOpen(false); }} /></View> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.chips, { marginBottom: 14 }]}>
              {SLOTS.map((o) => <Chip key={o.id} label={o.label} selected={slot === o.id} onPress={() => setSlot(o.id)} />)}
            </ScrollView>
            {results.length ? results.map((r, i) => (
              <TrainCard key={r.train.id} result={r} date={search.date} onOpen={() => open(i)} onSelectClass={(code) => open(i, code)} />
            )) : (
              <EmptyState icon="train-outline" title="No trains match" text={searched ? 'No trains run on this route for the selected date, class or time. Try another date or clear the filters.' : 'No trains available.'} action={<PrimaryButton variant="soft" label="Clear filters" onPress={() => { setSlot('any'); setTrainSearch({ classCode: 'ANY' }); }} />} />
            )}
          </View>

          {!searched ? (
            <Card>
              <SectionTitle eyebrow="QUICK PICKS" title="Popular routes" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.popular}>
                {POPULAR_ROUTES.map((r) => (
                  <TouchableOpacity key={`${r.from}-${r.to}`} accessibilityRole="button" onPress={() => { setTrainSearch({ from: r.from, to: r.to }); setSearched(true); setErrorMsg(''); }} style={s.route}>
                    <Text style={s.routeText}>{getStation(r.from)?.city}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /><Text style={s.routeText}>{getStation(r.to)?.city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          ) : null}

          <Notice icon="shield-checkmark-outline" title="Demo inventory">Schedules, fares and seat availability shown here are sample data for demonstration. No real railway ticket or PNR is issued.</Notice>
        </View>
      </ScrollView>

      <StationPicker visible={picker !== null} title={picker === 'from' ? 'Departure station' : 'Arrival station'} exclude={picker === 'from' ? search.to : search.from}
        onClose={() => setPicker(null)} onSelect={(code) => { setTrainSearch(picker === 'from' ? { from: code } : { to: code }); setPicker(null); setErrorMsg(''); }} />
    </AppScreen>
  );
}

function lowest(r: ReturnType<typeof searchTrains>[number], date: string) { return lowestFare(getClassOptions(r, date)); }

function StationButton({ label, code, placeholder, icon, onPress }: { label: string; code: string; placeholder: string; icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label} station: ${code ? stationLabel(code) : 'not selected'}`} onPress={onPress} style={s.station}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.stationLabel}>{label}</Text>
        <Text style={[s.stationValue, !code && { color: Colors.textLight, fontWeight: FontWeight.semibold }]} numberOfLines={1}>{code ? getStation(code)?.name : placeholder}</Text>
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
  stationValue: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 2 },
  stationCode: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  swap: { position: 'absolute', right: 44, top: '50%', marginTop: -19, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.surface, zIndex: 2 },
  label: { ...Ui.eyebrow, color: Colors.textLight, marginTop: 16, marginBottom: 8 },
  chips: { gap: 8, alignItems: 'center' },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 10 },
  popular: { flexDirection: 'row', gap: 8, paddingRight: Ui.space.page },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  routeText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  resultHead: { marginBottom: 12, marginTop: 4 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  found: { fontFamily: 'Inter-Regular', fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  count: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 3 },
});
