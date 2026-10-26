import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { FlightBanner } from '@/components/flights/FlightFlowUi';
import { AppScreen } from '@/components/AppScreen';
import { Card, Chip, Notice, PrimaryButton, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { addDaysISO, defaultTravelDate, formatShortDate, isRealDate } from '@/data/trains';
import { recordRecentSearch } from '@/utils/personalStore';
import { Ionicons } from '@expo/vector-icons';
import { DateField, todayISO } from '@/components/DatePickerField';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { AirportPicker } from './AirportPicker';
import { POPULAR_FLIGHT_ROUTES, airportLabel, getAirport, resolveAirport } from './airports';
import { searchFlights } from './flightApi';
import { setFlightSelection } from './flightSelectionStore';
import FlightResults from './FlightResults';
import type { FlightOffer, FlightSearchRequest, SpecialFare, TripType } from './types';

const TRIP_TYPES: { id: TripType; label: string }[] = [{ id: 'roundTrip', label: 'Round trip' }, { id: 'oneWay', label: 'One way' }, { id: 'multiCity', label: 'Multi city' }];
const CABINS = ['Economy', 'Premium', 'Business', 'First'];
const FARES: { id: SpecialFare; label: string }[] = [{ id: 'regular', label: 'Regular' }, { id: 'student', label: 'Student' }, { id: 'seniorCitizen', label: 'Senior citizen' }, { id: 'armedForces', label: 'Armed forces' }];
type PickerTarget = 'from' | 'to' | 'from2' | 'to2' | null;

/** Free text from older searches/home ("New Delhi") → airport code when we recognise it. */
const toCode = (v?: string) => resolveAirport(v)?.code ?? (v ?? '').trim();

export default function FlightSearchScreen() {
  useAppLanguage();
  const { search } = useLocalSearchParams<{ search?: string }>();
  const lastSearch = useRef<string | undefined>(undefined);

  const [tripType, setTripType] = useState<TripType>('roundTrip');
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
  const [menu, setMenu] = useState<'travellers' | 'cabin' | null>(null);
  const [showFares, setShowFares] = useState(false);

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
  const routeLabel = request ? `${request.origin.toUpperCase()} → ${request.destination.toUpperCase()}  ·  ${formatShortDate(request.departureDate)}${request.returnDate ? ` – ${formatShortDate(request.returnDate)}` : ''}  ·  ${request.travellers} ${request.travellers === 1 ? 'traveller' : 'travellers'}` : '';


  return (
    <AppScreen headerTone="light" edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explore'))} style={s.topBtn}>
          <Ionicons name="arrow-back" size={22} color="#103D30" />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.topTitle}>Flights</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[s.topBtn, s.topBtnTint]}>
          <Ionicons name="settings-outline" size={20} color="#103D30" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <FlightBanner />

          <Card style={{ marginTop: -34, marginHorizontal: 10, padding: 14, borderRadius: 22 }}>
            <SectionTitle eyebrow="PLAN YOUR JOURNEY" title="Where are you flying?" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={{ marginBottom: 14 }}>
              {TRIP_TYPES.map((t) => <Chip key={t.id} label={t.label} selected={tripType === t.id} onPress={() => { setTripType(t.id); setErrorMsg(''); }} />)}
            </ScrollView>

            <View style={s.stations}>
              <AirportButton label="FROM" code={origin} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from')} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap airports" onPress={swap} style={s.swap}><Ionicons name="swap-vertical" size={18} color={Colors.white} /></TouchableOpacity>
              <AirportButton label="TO" code={destination} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to')} />
            </View>

            <View style={{ flexDirection: 'row', gap: 14, marginTop: 16 }}>
              <DateField compact label="DEPARTURE" value={departureDate} placeholder="Add date" minDate={todayISO()} onChange={(d) => { setDepartureDate(d); if (returnDate < d) setReturnDate(d); if (date2 < d) setDate2(d); }} />
              {tripType === 'roundTrip' ? <DateField compact label="RETURN" value={returnDate} placeholder="Add date" minDate={departureDate} onChange={setReturnDate} /> : null}
            </View>

            {tripType === 'multiCity' ? (
              <>
                <Text style={s.label}>SECOND LEG</Text>
                <View style={s.stations}>
                  <AirportButton label="FROM" code={origin2} placeholder="Select departure" icon="radio-button-on-outline" onPress={() => setPicker('from2')} />
                  <AirportButton label="TO" code={destination2} placeholder="Select arrival" icon="location-outline" onPress={() => setPicker('to2')} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <DateField compact label="SECOND LEG DATE" value={date2} placeholder="Add date" minDate={departureDate} onChange={setDate2} />
                </View>
              </>
            ) : null}

            <View style={s.pairRow}>
              <SelectField label="TRAVELLERS" icon="person-outline" value={`${travellers} ${travellers === 1 ? 'traveller' : 'travellers'}`} open={menu === 'travellers'} onPress={() => setMenu((m) => (m === 'travellers' ? null : 'travellers'))} />
              <SelectField label="CABIN CLASS" icon="ticket-outline" value={cabinClass} open={menu === 'cabin'} onPress={() => setMenu((m) => (m === 'cabin' ? null : 'cabin'))} />
            </View>
            {menu === 'travellers' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.menuRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <Chip key={n} label={String(n)} selected={travellers === n} onPress={() => { setTravellers(n); setMenu(null); }} />)}
              </ScrollView>
            ) : null}
            {menu === 'cabin' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.menuRow}>
                {CABINS.map((c) => <Chip key={c} label={c} selected={cabinClass === c} onPress={() => { setCabinClass(c); setMenu(null); }} />)}
              </ScrollView>
            ) : null}

            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showFares }} onPress={() => setShowFares((v) => !v)} style={s.faresRow}>
              <Ionicons name="settings-outline" size={18} color={Colors.primary} />
              <Text style={s.faresText}>SPECIAL FARES (OPTIONAL)</Text>
              <Ionicons name={showFares ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textLight} />
            </TouchableOpacity>
            {showFares ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.menuRow}>
                {FARES.map((f) => <Chip key={f.id} label={f.label} selected={specialFare === f.id} onPress={() => setSpecialFare(f.id)} />)}
              </ScrollView>
            ) : null}

            {errorMsg ? <Text accessibilityRole="alert" style={s.error}>{errorMsg}</Text> : null}
            <View style={{ marginTop: 14 }}><PrimaryButton label="Search flights" icon="search" loading={loading} onPress={submit} /></View>
          </Card>

          {hasSearched ? (
            <View style={s.pad}>
              {error ? (
                <View style={s.errorPanel}>
                  <View style={s.errorIcon}><Ionicons name="cloud-offline-outline" size={21} color={Colors.error} /></View>
                  <View style={{ flex: 1, minWidth: 0 }}><Text style={s.errorTitle}>Unable to load flights</Text><Text style={s.errorMessage}>{error}</Text></View>
                  {request ? <TouchableOpacity accessibilityRole="button" onPress={() => runSearch(request)} style={s.retry}><Ionicons name="refresh" size={15} color={Colors.white} /><Text style={s.retryText}>Retry</Text></TouchableOpacity> : null}
                </View>
              ) : (
                <FlightResults offers={offers} loading={loading} routeLabel={routeLabel} onSelect={selectFlight} dateLabel={request ? formatShortDate(request.departureDate) : undefined} />
              )}
            </View>
          ) : null}

          {!hasSearched ? (
            <Card>
              <SectionTitle eyebrow="QUICK PICKS" title="Popular routes" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.popular}>
                {POPULAR_FLIGHT_ROUTES.map((r) => (
                  <TouchableOpacity key={`${r.from}-${r.to}`} accessibilityRole="button" onPress={() => { setOrigin(r.from); setDestination(r.to); setErrorMsg(''); }} style={s.route}>
                    <Text style={s.routeText}>{getAirport(r.from)?.city}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /><Text style={s.routeText}>{getAirport(r.to)?.city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          ) : null}

          {resultSource === 'mock' ? <Notice tone="warn" icon="information-circle-outline" title="Demo inventory">Sample flight data for preview only. Prices and availability are not real; payment is disabled.</Notice> : <Notice icon="shield-checkmark-outline" title="Live fares">Live prices appear when the flight service is connected. Sample results are clearly marked.</Notice>}
        </View>
      </ScrollView>

      <AirportPicker visible={picker !== null} title={pickerTitle} exclude={pickerExclude} onClose={() => setPicker(null)} onSelect={pick} />
    </AppScreen>
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

function SelectField({ label, icon, value, open, onPress }: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; value: string; open: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} accessibilityState={{ expanded: open }} onPress={onPress} style={s.field}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.fieldLabel} numberOfLines={1}>{label}</Text>
        <Text style={s.fieldValue} numberOfLines={1}>{value}</Text>
      </View>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  topBar: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: 'Inter-Bold', fontSize: TextSize.title, color: '#103D30' },
  bannerWrap: { paddingHorizontal: Ui.space.page, marginTop: 14, marginBottom: 16 },
  banner: { width: '100%', aspectRatio: 2172 / 724, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: '#103D30' },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { width: '58%', paddingLeft: 16 },
  bannerEyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: TextSize.micro, letterSpacing: 0.8, color: Colors.white },
  bannerTitle: { fontFamily: 'Inter-Bold', fontSize: 18, lineHeight: 22, color: Colors.white, marginTop: 4 },
  bannerSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  pairRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  field: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 58, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  fieldLabel: { ...Ui.eyebrow, color: Colors.textLight, letterSpacing: 0.4 },
  fieldValue: { fontFamily: 'Inter-SemiBold', fontSize: TextSize.body, color: Colors.textDark, marginTop: 2 },
  menuRow: { marginTop: 10 },
  faresRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, minHeight: 36 },
  faresText: { ...Ui.eyebrow, color: Colors.primary },
  pad: { paddingHorizontal: Ui.space.page },
  chips: { gap: 8, alignItems: 'center' },
  stations: { gap: 8, position: 'relative' },
  station: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  stationLabel: { ...Ui.eyebrow, color: Colors.textLight, letterSpacing: 1 },
  stationValue: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 2 },
  stationCode: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  swap: { position: 'absolute', right: 44, top: '50%', marginTop: -19, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#103D30', borderWidth: 3, borderColor: Colors.surface, zIndex: 2 },
  label: { ...Ui.eyebrow, color: Colors.textLight, marginTop: 16, marginBottom: 8 },
  counter: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  counterBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  counterText: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 10 },
  popular: { flexDirection: 'row', gap: 8, paddingRight: Ui.space.page },
  route: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  routeText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  errorPanel: { ...Ui.card, flexDirection: 'row', alignItems: 'center', gap: 10, padding: Ui.space.card, borderColor: Colors.errorBorder },
  errorIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.errorSoft },
  errorTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  errorMessage: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 3 },
  retry: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, borderRadius: Ui.radius.control, backgroundColor: '#103D30' },
  retryText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
});