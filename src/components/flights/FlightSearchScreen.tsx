import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, Chip, FlowScreen, Notice, PrimaryButton, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { addDaysISO, defaultTravelDate, formatShortDate, fromISO, isRealDate, upcomingDates } from '@/data/trains';
import { recordRecentSearch } from '@/utils/personalStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AirportPicker } from './AirportPicker';
import { POPULAR_FLIGHT_ROUTES, airportLabel, getAirport, resolveAirport } from './airports';
import { searchFlights } from './flightApi';
import { setFlightSelection } from './flightSelectionStore';
import FlightResults from './FlightResults';
import type { FlightOffer, FlightSearchRequest, SpecialFare, TripType } from './types';

const TRIP_TYPES: { id: TripType; label: string }[] = [{ id: 'oneWay', label: 'One way' }, { id: 'roundTrip', label: 'Round trip' }, { id: 'multiCity', label: 'Multi city' }];
const CABINS = ['Economy', 'Premium', 'Business', 'First'];
const FARES: { id: SpecialFare; label: string }[] = [{ id: 'regular', label: 'Regular' }, { id: 'student', label: 'Student' }, { id: 'seniorCitizen', label: 'Senior citizen' }, { id: 'armedForces', label: 'Armed forces' }];
type PickerTarget = 'from' | 'to' | 'from2' | 'to2' | null;

/** Free text from older searches/home ("New Delhi") → airport code when we recognise it. */
const toCode = (v?: string) => resolveAirport(v)?.code ?? (v ?? '').trim();

export default function FlightSearchScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const lastSearch = useRef<string | undefined>(undefined);
  const dates = useMemo(() => upcomingDates(14), []);

  const [tripType, setTripType] = useState<TripType>('oneWay');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(defaultTravelDate());
  const [returnDate, setReturnDate] = useState(addDaysISO(defaultTravelDate(), 3));
  const [origin2, setOrigin2] = useState('');
  const [destination2, setDestination2] = useState('');
  const [date2, setDate2] = useState(addDaysISO(defaultTravelDate(), 3));
  const [travellers, setTravellers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [specialFare, setSpecialFare] = useState<SpecialFare>('regular');
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<'live' | 'mock' | null>(null);
  const [request, setRequest] = useState<FlightSearchRequest | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);

  const runSearch = async (req: FlightSearchRequest) => {
    void recordRecentSearch('Flights', `${req.origin} → ${req.destination}`, JSON.stringify(req));
    setLoading(true); setHasSearched(true); setError(null); setResultSource(null); setRequest(req); setOffers([]);
    try {
      const response = await searchFlights(req);
      setOffers(response.offers);
      setResultSource(response.source ?? 'live');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Flight search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!origin || !destination) { setErrorMsg('Choose both a departure and an arrival airport.'); return; }
    if (origin === destination) { setErrorMsg('Departure and arrival airports must be different.'); return; }
    if (tripType === 'roundTrip' && returnDate < departureDate) { setErrorMsg('Return date must be on or after the departure date.'); return; }
    if (tripType === 'multiCity' && (!origin2 || !destination2)) { setErrorMsg('Complete the second leg of your multi-city journey.'); return; }
    setErrorMsg('');
    void runSearch({
      tripType, origin, destination, departureDate,
      ...(tripType === 'roundTrip' ? { returnDate } : {}),
      ...(tripType === 'multiCity' ? { multiCityLegs: [{ origin: origin2, destination: destination2, departureDate: date2 }] } : {}),
      travellers, cabinClass, specialFare,
    });
  };

  // Searches launched from Home / Recent searches arrive as a JSON `search` param.
  useEffect(() => {
    if (!search || search === lastSearch.current) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      lastSearch.current = search;
      try {
        const p = JSON.parse(search) as FlightSearchRequest;
        if (typeof p.origin !== 'string' || typeof p.destination !== 'string' || typeof p.departureDate !== 'string' || !['oneWay', 'roundTrip', 'multiCity'].includes(p.tripType) || !Number.isInteger(p.travellers) || p.travellers < 1 || p.travellers > 9) throw new Error('Invalid search');
        const req: FlightSearchRequest = { ...p, origin: toCode(p.origin), destination: toCode(p.destination) };
        setTripType(req.tripType); setOrigin(req.origin); setDestination(req.destination);
        if (isRealDate(req.departureDate)) setDepartureDate(req.departureDate);
        if (req.returnDate && isRealDate(req.returnDate)) setReturnDate(req.returnDate);
        setTravellers(req.travellers); setCabinClass(req.cabinClass || 'Economy'); setSpecialFare(req.specialFare || 'regular');
        if (req.origin && req.destination) void runSearch(req);
      } catch { setError('Please enter your journey details and search again.'); setHasSearched(true); }
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectFlight = (offer: FlightOffer) => {
    if (!request) return;
    setFlightSelection(request, offer);
    router.push('/(tabs)/explore/flight-details');
  };

  const pick = (code: string) => {
    if (picker === 'from') setOrigin(code); else if (picker === 'to') setDestination(code);
    else if (picker === 'from2') setOrigin2(code); else if (picker === 'to2') setDestination2(code);
    setPicker(null); setErrorMsg('');
  };
  const pickerExclude = picker === 'from' ? destination : picker === 'to' ? origin : picker === 'from2' ? destination2 : picker === 'to2' ? origin2 : undefined;
  const pickerTitle = picker === 'from' || picker === 'from2' ? 'Departure airport' : 'Arrival airport';
  const swap = () => { setOrigin(destination); setDestination(origin); };

  const routeEyebrow = request ? `${request.origin.toUpperCase()} → ${request.destination.toUpperCase()}` : 'FLIGHTS';

  return (
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ScreenHeader title="Book flight tickets" subtitle="Search routes, compare fares and pick the flight that suits you." eyebrow="LEMONTRIP / FLIGHTS" onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explore'))} rightAction={{ label: 'Cart', icon: 'bag-outline', onPress: () => router.push('/cart') }} />

          <Card>
            <SectionTitle eyebrow="PLAN YOUR JOURNEY" title="Where are you flying?" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={{ marginBottom: 14 }}>
              {TRIP_TYPES.map((t) => <Chip key={t.id} label={t.label} selected={tripType === t.id} onPress={() => { setTripType(t.id); setErrorMsg(''); }} />)}
            </ScrollView>

            <View style={s.stations}>
              <AirportButton label="FROM" code={origin} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from')} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap airports" onPress={swap} style={s.swap}><Ionicons name="swap-vertical" size={18} color={Colors.primaryDark} /></TouchableOpacity>
              <AirportButton label="TO" code={destination} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to')} />
            </View>

            <DateStrip label="DEPARTURE DATE" dates={dates} value={departureDate} onChange={(d) => { setDepartureDate(d); if (returnDate < d) setReturnDate(d); }} />
            {tripType === 'roundTrip' ? <DateStrip label="RETURN DATE" dates={dates.filter((d) => d >= departureDate)} value={returnDate} onChange={setReturnDate} /> : null}

            {tripType === 'multiCity' ? (
              <>
                <Text style={s.label}>SECOND LEG</Text>
                <View style={s.stations}>
                  <AirportButton label="FROM" code={origin2} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from2')} />
                  <AirportButton label="TO" code={destination2} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to2')} />
                </View>
                <DateStrip label="SECOND LEG DATE" dates={dates.filter((d) => d >= departureDate)} value={date2} onChange={setDate2} />
              </>
            ) : null}

            <Text style={s.label}>TRAVELLERS</Text>
            <View style={s.counter}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove traveller" disabled={travellers <= 1} onPress={() => setTravellers((c) => Math.max(1, c - 1))} style={s.counterBtn}><Ionicons name="remove" size={18} color={travellers <= 1 ? Colors.borderStrong : Colors.primary} /></TouchableOpacity>
              <Text style={s.counterText}>{travellers} {travellers === 1 ? 'traveller' : 'travellers'}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add traveller" disabled={travellers >= 9} onPress={() => setTravellers((c) => Math.min(9, c + 1))} style={s.counterBtn}><Ionicons name="add" size={18} color={travellers >= 9 ? Colors.borderStrong : Colors.primary} /></TouchableOpacity>
            </View>

            <Text style={s.label}>CABIN CLASS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              {CABINS.map((c) => <Chip key={c} label={c} selected={cabinClass === c} onPress={() => setCabinClass(c)} />)}
            </ScrollView>

            <Text style={s.label}>SPECIAL FARES (OPTIONAL)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              {FARES.map((f) => <Chip key={f.id} label={f.label} selected={specialFare === f.id} onPress={() => setSpecialFare(f.id)} />)}
            </ScrollView>

            {errorMsg ? <Text accessibilityRole="alert" style={s.error}>{errorMsg}</Text> : null}
            <View style={{ marginTop: 14 }}><PrimaryButton label="Search flights" icon="search" loading={loading} onPress={submit} /></View>
          </Card>

          {!hasSearched ? (
            <Card>
              <SectionTitle eyebrow="QUICK PICKS" title="Popular routes" />
              <View style={s.popular}>
                {POPULAR_FLIGHT_ROUTES.map((r) => (
                  <TouchableOpacity key={`${r.from}-${r.to}`} accessibilityRole="button" onPress={() => { setOrigin(r.from); setDestination(r.to); setErrorMsg(''); }} style={s.route}>
                    <Text style={s.routeText}>{getAirport(r.from)?.city}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /><Text style={s.routeText}>{getAirport(r.to)?.city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ) : (
            <View style={s.pad}>
              <View style={s.resultHead}>
                <Text style={s.eyebrow}>{routeEyebrow}{request ? `  ·  ${formatShortDate(request.departureDate)}${request.returnDate ? ` – ${formatShortDate(request.returnDate)}` : ''}  ·  ${request.travellers} ${request.travellers === 1 ? 'traveller' : 'travellers'}` : ''}</Text>
                <Text style={s.resultTitle}>{loading ? 'Searching available flights' : 'Available flights'}</Text>
              </View>
              {error ? (
                <View style={s.errorPanel}>
                  <View style={s.errorIcon}><Ionicons name="cloud-offline-outline" size={21} color={Colors.error} /></View>
                  <View style={{ flex: 1, minWidth: 0 }}><Text style={s.errorTitle}>Unable to load flights</Text><Text style={s.errorMessage}>{error}</Text></View>
                  {request ? <TouchableOpacity accessibilityRole="button" onPress={() => runSearch(request)} style={s.retry}><Ionicons name="refresh" size={15} color={Colors.primaryDark} /><Text style={s.retryText}>Retry</Text></TouchableOpacity> : null}
                </View>
              ) : (
                <FlightResults offers={offers} loading={loading} onSelect={selectFlight} dateLabel={request ? formatShortDate(request.departureDate) : undefined} />
              )}
            </View>
          )}

          {resultSource === 'mock' ? <Notice tone="warn" icon="information-circle-outline" title="Demo inventory">Sample flight data for preview only. Prices and availability are not real; payment is disabled.</Notice> : <Notice icon="shield-checkmark-outline" title="Live fares">Live prices appear when the flight service is connected. Sample results are clearly marked.</Notice>}
        </View>
      </ScrollView>

      <AirportPicker visible={picker !== null} title={pickerTitle} exclude={pickerExclude} onClose={() => setPicker(null)} onSelect={pick} />
    </FlowScreen>
  );
}

function AirportButton({ label, code, placeholder, icon, onPress }: { label: string; code: string; placeholder: string; icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  const a = getAirport(code);
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label} airport: ${code ? airportLabel(code) : 'not selected'}`} onPress={onPress} style={s.station}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.stationLabel}>{label}</Text>
        <Text style={[s.stationValue, !code && { color: Colors.textLight, fontWeight: FontWeight.semibold }]} numberOfLines={1}>{code ? (a?.city ?? code) : placeholder}</Text>
        {code ? <Text style={s.stationCode} numberOfLines={1}>{a ? `${a.code} · ${a.name}` : code}</Text> : null}
      </View>
      <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

function DateStrip({ label, dates, value, onChange }: { label: string; dates: string[]; value: string; onChange: (iso: string) => void }) {
  const list = dates.includes(value) ? dates : [value, ...dates];
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dates}>
        {list.map((iso) => {
          const d = fromISO(iso); const on = iso === value;
          return (
            <TouchableOpacity key={iso} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={d.toDateString()} onPress={() => onChange(iso)} style={[s.date, on && s.dateOn]}>
              <Text style={[s.dow, on && s.dateTextOn]}>{d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}</Text>
              <Text style={[s.dayNum, on && s.dateTextOn]}>{d.getDate()}</Text>
              <Text style={[s.mon, on && s.dateTextOn]}>{d.toLocaleDateString('en-IN', { month: 'short' })}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  pad: { paddingHorizontal: Ui.space.page },
  chips: { gap: 8, alignItems: 'center' },
  stations: { gap: 8, position: 'relative' },
  station: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  stationLabel: { ...Ui.eyebrow, color: Colors.textLight, letterSpacing: 1 },
  stationValue: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 2 },
  stationCode: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  swap: { position: 'absolute', right: 44, top: '50%', marginTop: -19, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.surface, zIndex: 2 },
  label: { ...Ui.eyebrow, color: Colors.textLight, marginTop: 16, marginBottom: 8 },
  dates: { gap: 8 },
  date: { width: 58, alignItems: 'center', paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  dateOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dow: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.textLight, letterSpacing: 0.6 },
  dayNum: { fontFamily: FontFamily.sans, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginVertical: 1 },
  mon: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight },
  dateTextOn: { color: Colors.white },
  counter: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  counterBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  counterText: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 10 },
  popular: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  routeText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  resultHead: { marginBottom: 12, marginTop: 4 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  resultTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 3 },
  errorPanel: { ...Ui.card, flexDirection: 'row', alignItems: 'center', gap: 10, padding: Ui.space.card, borderColor: Colors.errorBorder },
  errorIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.errorSoft },
  errorTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  errorMessage: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 3 },
  retry: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  retryText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
});
