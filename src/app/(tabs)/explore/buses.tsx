import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { ServiceBanner, ServiceTopBar } from '@/components/ui/ServiceHeader';
import { SortBox, SortOptions, type SortChoice } from '@/components/ui/SortBox';
import { BusCard } from '@/components/buses/BusCards';
import { CityPicker } from '@/components/buses/CityPicker';
import { BUS_ROUTES, Card, Chip, EmptyState, Notice, PrimaryButton, SectionTitle, goTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { DateField } from '@/components/DatePickerField';
import { Ui } from '@/constants/theme';
import { POPULAR_ROUTES, getCity, isRealDate, lowestFare, resolveCity, searchBuses, timeOfDay, upcomingDates, formatShortDate, type DeckId } from '@/data/buses';
import { parseSavedQuery, recordRecentSearch } from '@/utils/personalStore';
import { selectBus, setBusSearch, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type Sort = 'earliest' | 'fastest' | 'cheapest' | 'rated';
type Slot = 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
type Kind = 'all' | 'ac' | 'nonac' | 'sleeper' | 'seater';
const SLOTS: { id: Slot; label: string }[] = [
  { id: 'any', label: 'All' }, { id: 'morning', label: 'Morning' }, { id: 'afternoon', label: 'Afternoon' }, { id: 'evening', label: 'Evening' }, { id: 'night', label: 'Night' },
];
const KINDS: { id: Kind; label: string }[] = [
  { id: 'all', label: 'All buses' }, { id: 'ac', label: 'AC' }, { id: 'nonac', label: 'Non-AC' }, { id: 'sleeper', label: 'Sleeper' }, { id: 'seater', label: 'Seater' },
];

const SORTS: SortChoice<Sort>[] = [
  { id: 'earliest', label: 'Earliest', icon: 'time-outline' },
  { id: 'fastest', label: 'Fastest', icon: 'flash-outline' },
  { id: 'cheapest', label: 'Cheapest', icon: 'wallet-outline' },
  { id: 'rated', label: 'Top rated', icon: 'star-outline' },
];

export default function BusesScreen() {
  useAppLanguage();
  const { query } = useLocalSearchParams<{ query?: string }>();
  const { search } = useBusBooking();
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sort, setSort] = useState<Sort>('earliest');
  const [slot, setSlot] = useState<Slot>('any');
  const [kind, setKind] = useState<Kind>('all');
  const [sortOpen, setSortOpen] = useState(false);

  // Restore a saved/recent search (e.g. from Home → Recent searches or the Home search widget).
  useEffect(() => {
    const saved = parseSavedQuery(query);
    const from = typeof saved.from === 'string' ? resolveCity(saved.from)?.code : undefined;
    const to = typeof saved.to === 'string' ? resolveCity(saved.to)?.code : undefined;
    const rawDate = typeof saved.travelDate === 'string' ? saved.travelDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3') : '';
    const date = isRealDate(rawDate) && rawDate >= upcomingDates(1)[0] ? rawDate : undefined;
    if (from || to || date) { setBusSearch({ ...(from ? { from } : {}), ...(to ? { to } : {}), ...(date ? { date } : {}) }); if (from && to && from !== to) setSearched(true); }
  }, [query]);

  const results = useMemo(() => {
    if (!searched) return [];
    let list = searchBuses({ from: search.from, to: search.to, date: search.date });
    if (kind === 'ac') list = list.filter((b) => b.ac);
    if (kind === 'nonac') list = list.filter((b) => !b.ac);
    if (kind === 'sleeper') list = list.filter((b) => b.sleeper);
    if (kind === 'seater') list = list.filter((b) => !b.sleeper);
    if (slot !== 'any') list = list.filter((b) => timeOfDay(b.departure) === slot);
    return [...list].sort((a, b) => sort === 'fastest' ? a.durationMin - b.durationMin : sort === 'cheapest' ? lowestFare(a, search.date) - lowestFare(b, search.date) : sort === 'rated' ? b.rating - a.rating : a.departure.localeCompare(b.departure));
  }, [search, searched, slot, sort, kind]);

  const swap = () => setBusSearch({ from: search.to, to: search.from });
  const runSearch = () => {
    if (!search.from || !search.to) { setSearched(false); setErrorMsg('Choose both a departure and an arrival city.'); return; }
    if (search.from === search.to) { setErrorMsg('Departure and arrival cities must be different.'); return; }
    setErrorMsg('');
    setSearched(true);
    void recordRecentSearch('Buses', `${getCity(search.from)?.name} → ${getCity(search.to)?.name}`, JSON.stringify({ from: getCity(search.from)?.name, to: getCity(search.to)?.name, travelDate: search.date }));
  };
  const open = (index: number, deck?: DeckId) => {
    const b = results[index];
    selectBus({ busId: b.id, fromCode: b.fromCode, toCode: b.toCode, date: search.date });
    goTo(BUS_ROUTES.details, { id: b.id, ...(deck ? { deck } : {}) });
  };
  const clearFilters = () => { setSlot('any'); setKind('all'); };

  return (
    <AppScreen headerTone="light" edges={['top']}>
      <ServiceTopBar title="Buses" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ServiceBanner eyebrow="LEMONTRIP / BUS" title="Book bus tickets" subtitle="Search routes, compare buses and pick your seat." image={require('../../../../assets/images/Emerald Highway Journey.png')} />

          <Card>
            <SectionTitle eyebrow="PLAN YOUR JOURNEY" title="Where are you headed?" />
            <View style={s.stations}>
              <CityButton label="FROM" code={search.from} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from')} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap cities" onPress={swap} style={s.swap}><Ionicons name="swap-vertical" size={18} color={Colors.primaryDark} /></TouchableOpacity>
              <CityButton label="TO" code={search.to} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to')} />
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <DateField compact label="DEPARTURE DATE" value={search.date} placeholder="Add date" onChange={(d) => setBusSearch({ date: d })} />
            </View>

            <Text style={s.label}>BUS TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              {KINDS.map((k) => <Chip key={k.id} label={k.label} selected={kind === k.id} onPress={() => setKind(k.id)} />)}
            </ScrollView>

            {errorMsg ? <Text style={s.error}>{errorMsg}</Text> : null}
            <View style={{ marginTop: 14 }}><PrimaryButton label="Search buses" icon="search" onPress={runSearch} /></View>
          </Card>

          {searched ? (
            <View style={s.pad}>
              <View style={s.resultHead}>
                <Text style={s.eyebrow} numberOfLines={1}>{`${getCity(search.from)?.code} \u2192 ${getCity(search.to)?.code}  \u00B7  ${formatShortDate(search.date)}`}</Text>
                <View style={s.headRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.count}>Available buses</Text>
                    <Text style={s.found}>{results.length} {results.length === 1 ? 'bus' : 'buses'} found</Text>
                  </View>
                  <SortBox currentLabel={SORTS.find((o) => o.id === sort)?.label ?? 'Earliest'} open={sortOpen} onToggle={() => setSortOpen((v) => !v)} />
                </View>
              </View>
              {sortOpen ? <View style={{ marginBottom: 10 }}><SortOptions options={SORTS} selected={sort} onChange={(v) => { setSort(v); setSortOpen(false); }} /></View> : null}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.chips, { marginBottom: 14 }]}>
                {SLOTS.map((o) => <Chip key={o.id} label={o.label} selected={slot === o.id} onPress={() => setSlot(o.id)} />)}
              </ScrollView>
              {results.length ? results.map((b, i) => (
                <BusCard key={b.id} bus={b} date={search.date} onOpen={() => open(i)} onSelectDeck={(deck) => open(i, deck)} />
              )) : (
                <EmptyState icon="bus-outline" title="No buses match" text="No buses run on this route for the selected date, type or time. Try another date or clear the filters." action={<PrimaryButton variant="soft" label="Clear filters" onPress={clearFilters} />} />
              )}
            </View>
          ) : null}

          {!searched ? (
            <Card>
              <SectionTitle eyebrow="QUICK PICKS" title="Popular routes" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.popular}>
                {POPULAR_ROUTES.map((r) => (
                  <TouchableOpacity key={`${r.from}-${r.to}`} accessibilityRole="button" onPress={() => { setBusSearch({ from: r.from, to: r.to }); setSearched(true); setErrorMsg(''); }} style={s.route}>
                    <Text style={s.routeText}>{getCity(r.from)?.name}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /><Text style={s.routeText}>{getCity(r.to)?.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          ) : null}

          <Notice icon="shield-checkmark-outline" title="Demo inventory">Schedules, fares and seat availability shown here are sample data for demonstration. No real bus ticket is issued.</Notice>
        </View>
      </ScrollView>

      <CityPicker visible={picker !== null} title={picker === 'from' ? 'Departure city' : 'Arrival city'} exclude={picker === 'from' ? search.to : search.from}
        onClose={() => setPicker(null)} onSelect={(code) => { setBusSearch(picker === 'from' ? { from: code } : { to: code }); setPicker(null); setErrorMsg(''); }} />
    </AppScreen>
  );
}

function CityButton({ label, code, placeholder, icon, onPress }: { label: string; code: string; placeholder: string; icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  const city = code ? getCity(code) : undefined;
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label} city: ${city ? city.name : 'not selected'}`} onPress={onPress} style={s.station}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.stationLabel}>{label}</Text>
        <Text style={[s.stationValue, !city && { color: Colors.textLight, fontWeight: FontWeight.semibold }]} numberOfLines={1}>{city ? city.name : placeholder}</Text>
        {city ? <Text style={s.stationCode}>{city.code} · {city.state}</Text> : null}
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
