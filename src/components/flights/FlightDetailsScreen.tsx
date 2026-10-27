import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatShortDate } from '@/data/trains';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BRAND, FLIGHT_ROUTES, FlightBanner, FlightHeading, FlightShell, FlightSteps, FlightTag, INTER, goBackOr, goTo, replaceTo } from './FlightFlowUi';
import { beginFlightBooking } from './flightBookingStore';
import { airportLabel, getAirport } from './airports';
import { formatDuration, formatPrice, formatTime } from './flightFormat';
import { AirlineBadge } from './FlightParts';
import { getFlightSelection, selectFlightFare } from './flightSelectionStore';
import type { FlightFareOption } from './types';


type IconName = React.ComponentProps<typeof Ionicons>['name'];

const clean = (name: string) => name.replace(/\s*·\s*sample/i, '');
const shortPolicy = (value?: string) => (value ? value.replace(/\s*·\s*sample allowance/i, '').replace(/^sample policy\s*·\s*/i, '') : 'Not provided');
const stopsLabel = (n: number) => (n === 0 ? 'Nonstop' : `${n} ${n === 1 ? 'stop' : 'stops'}`);

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.line}>
      <Text style={[s.lineLabel, bold && s.lineBold]}>{label}</Text>
      <Text style={[s.lineValue, bold && s.lineBold]}>{value}</Text>
    </View>
  );
}

export default function FlightDetailsScreen() {
  useAppLanguage();
  const selection = getFlightSelection();
  const fares = selection?.offer.fareOptions ?? [];
  const [selectedFareId, setSelectedFareId] = useState(fares[0]?.id ?? null);
  const goBack = () => goBackOr(FLIGHT_ROUTES.results);

  if (!selection) {
    return (
      <FlightShell onBack={goBack}>
        <ScrollView>
          <FlightBanner />
          <EmptyState icon="airplane-outline" title="No flight selected" text="Search for a flight and select an offer to view its itinerary and fares." action={<PrimaryButton variant="dark" label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />} />
        </ScrollView>
      </FlightShell>
    );
  }

  const { offer, request } = selection;
  const fare: FlightFareOption | undefined = fares.find((f) => f.id === selectedFareId) ?? fares[0];
  const currency = fare?.price.currency ?? offer.price.currency;
  const total = fare?.price.total ?? offer.price.amount;
  const canContinue = fares.length === 0 || !!fare;
  const date = formatShortDate(request.departureDate);
  const cabin = fare?.cabin ?? request.cabinClass;

  const handleContinue = () => {
    if (fare) selectFlightFare(fare);
    beginFlightBooking(offer.id);
    goTo(FLIGHT_ROUTES.travellers);
  };

  const breakdown: { label: string; amount?: number }[] = fare ? [{ label: 'Base fare', amount: fare.price.baseFare }, { label: 'Taxes', amount: fare.price.taxes }, { label: 'Fees', amount: fare.price.fees }] : [];
  const showBreakdown = breakdown.some((b) => b.amount !== undefined);

  const rules: { icon: ReactNode; label: string; value: string }[] = fare ? [
    { icon: <Ionicons name="briefcase-outline" size={22} color={BRAND} />, label: 'Baggage', value: shortPolicy(fare.baggage) },
    { icon: <Ionicons name="close-circle-outline" size={22} color={BRAND} />, label: 'Cancellation', value: shortPolicy(fare.cancellation) },
    { icon: <Ionicons name="calendar-outline" size={22} color={BRAND} />, label: 'Date change', value: shortPolicy(fare.dateChange) },
    { icon: <MaterialCommunityIcons name="seat-passenger" size={22} color={BRAND} />, label: 'Seat selection', value: shortPolicy(fare.seatSelection) },
    { icon: <Ionicons name="refresh-circle-outline" size={22} color={BRAND} />, label: 'Refundability', value: fare.refundable === undefined ? 'Not provided' : fare.refundable ? 'Refundable' : 'Non-refundable' },
  ] : [];

  const footer = (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption} numberOfLines={1}>{`${fare ? clean(fare.name) : 'Fare'} · per traveller`}</Text>
        <Text style={s.footerAmount} numberOfLines={1}>{formatPrice(total, currency)}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !canContinue }} disabled={!canContinue} onPress={handleContinue} activeOpacity={0.85} style={[s.continue, !canContinue && { opacity: 0.6 }]}>
        <Text style={s.continueText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlightShell onBack={goBack} footer={footer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <FlightBanner />
          <FlightSteps current={0} />

          <View style={s.card}>
            <View style={s.airlineRow}>
              <AirlineBadge offer={offer} size={52} />
              <View style={s.flex}>
                <Text style={s.airline} numberOfLines={1}>{offer.airline.name}</Text>
                <Text style={s.airlineMeta} numberOfLines={1}>{offer.flightNumber} · {cabin}</Text>
              </View>
              <FlightTag label={stopsLabel(offer.stops)} />
            </View>
            <View style={s.times}>
              <View style={s.endpoint}>
                <Text style={s.time}>{formatTime(offer.departure.time)}</Text>
                <Text style={s.code}>{offer.departure.airportCode}</Text>
                <Text style={s.date}>{date}</Text>
              </View>
              <View style={s.mid}>
                <Text style={s.midText}>{formatDuration(offer.durationMinutes)}</Text>
                <View style={s.route}>
                  <View style={s.routeDot} />
                  <View style={s.routeRule} />
                  {offer.stops > 0 ? <View style={s.routeStop} /> : <Ionicons name="airplane" size={14} color={BRAND} />}
                  <View style={s.routeRule} />
                  <View style={s.routeDot} />
                </View>
                <Text style={s.midText}>{stopsLabel(offer.stops)}</Text>
              </View>
              <View style={[s.endpoint, { alignItems: 'flex-end' }]}>
                <Text style={s.time}>{formatTime(offer.arrival.time)}</Text>
                <Text style={s.code}>{offer.arrival.airportCode}</Text>
              </View>
            </View>
          </View>

          <View style={s.card}>
            <FlightHeading eyebrow="STEP 1" title="Choose your fare" />
            {fares.length ? fares.map((f) => {
              const on = f.id === fare?.id;
              const baggage = f.baggage ? shortPolicy(f.baggage) : undefined;
              const detail = f.refundable === undefined ? (baggage ?? 'Details not provided') : `${f.refundable ? 'Refundable' : 'Non-refundable'}${baggage ? ` • ${baggage}` : ''}`;
              return (
                <TouchableOpacity key={f.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setSelectedFareId(f.id)} style={[s.option, on && s.optionOn]} activeOpacity={0.85}>
                  <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                  <View style={s.flex}>
                    <Text style={s.optionTitle} numberOfLines={1}>{clean(f.name)}</Text>
                    <Text style={[s.optionMeta, f.refundable && s.good]} numberOfLines={1}>{detail}</Text>
                  </View>
                  <Text style={s.optionFare}>{formatPrice(f.price.total, f.price.currency)}</Text>
                  <Ionicons name="chevron-forward" size={16} color={BRAND} />
                </TouchableOpacity>
              );
            }) : <Text style={s.empty}>Fare options were not included in the flight response.</Text>}
          </View>

          {fare ? (
            <View style={s.card}>
              <FlightHeading eyebrow="FARE RULES" title="What’s included" />
              <View style={s.rules}>
                {rules.map((r) => (
                  <View key={r.label} style={s.rule}>
                    <View style={s.ruleIcon}>{r.icon}</View>
                    <Text style={s.ruleLabel} numberOfLines={2}>{r.label}</Text>
                    <Text style={s.ruleValue} numberOfLines={3}>{r.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={s.card}>
            <FlightHeading eyebrow="ROUTE" title="Journey timeline" right={<FlightTag icon="time-outline" label={formatDuration(offer.durationMinutes)} />} />
            {[{ code: offer.departure.airportCode, name: offer.departure.airportName, time: offer.departure.time, role: 'Departs' }, { code: offer.arrival.airportCode, name: offer.arrival.airportName, time: offer.arrival.time, role: 'Arrives' }].map((p, i) => (
              <View key={p.role} style={s.stop}>
                <View style={s.rail}>
                  <View style={s.node} />
                  {i === 0 ? <View style={s.link} /> : null}
                </View>
                <View style={[s.flex, { paddingBottom: i === 0 ? 18 : 0 }]}>
                  <Text style={s.stopName}>{getAirport(p.code)?.name ?? p.name ?? p.code} <Text style={s.stopCode}>({p.code})</Text></Text>
                  <Text style={s.stopMeta}>{p.role}{i === 0 ? ` ${date}` : ''}{getAirport(p.code) ? `  ·  ${airportLabel(p.code)}` : ''}</Text>
                </View>
              </View>
            ))}
            <View style={s.tags}>
              <FlightTag icon="airplane-outline" label={stopsLabel(offer.stops)} />
              {offer.aircraft?.name || offer.aircraft?.code ? <FlightTag icon="information-circle-outline" label={[offer.aircraft.name, offer.aircraft.code].filter(Boolean).join(' · ')} /> : null}
              {offer.baggage ? <FlightTag icon="briefcase-outline" label={shortPolicy(offer.baggage)} /> : null}
            </View>
          </View>

          {showBreakdown && fare ? (
            <View style={s.card}>
              <FlightHeading eyebrow="FARE" title="Price breakdown" />
              {breakdown.map((b) => (b.amount !== undefined ? <Line key={b.label} label={b.label} value={formatPrice(b.amount, currency)} /> : null))}
              <View style={s.divider} />
              <Line label="Total per traveller" value={formatPrice(fare.price.total, currency)} bold />
            </View>
          ) : null}

          <View style={[s.notice, !offer.isDemo && s.noticeInfo]}>
            <Ionicons name="shield-checkmark-outline" size={26} color={Colors.textLight} />
            <View style={s.flex}>
              <Text style={s.noticeTitle}>{offer.isDemo ? 'Demo inventory' : 'Fare details'}</Text>
              <Text style={s.noticeText}>{offer.isDemo ? 'Sample fare details only. This journey cannot be booked until the flight service is connected.' : 'Fare details are shown as supplied by the airline.'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </FlightShell>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },




  airlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  airline: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.bodyLarge },
  airlineMeta: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  endpoint: { minWidth: 84 },
  time: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.displaySmall },
  code: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body, marginTop: 6 },
  date: { fontFamily: INTER.regular, color: Colors.secondary, fontSize: TextSize.caption, marginTop: 4 },
  mid: { flex: 1, alignItems: 'center', gap: 6 },
  midText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption },
  route: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight },
  routeStop: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.textLight },
  routeRule: { flex: 1, height: 1.5, backgroundColor: Colors.borderStrong },

  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceMuted, marginBottom: 10 },
  optionOn: { borderColor: BRAND, borderWidth: 1.5, backgroundColor: '#E3F0EA' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: BRAND, borderWidth: 2 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND },
  optionTitle: { fontFamily: INTER.semibold, color: BRAND, fontSize: TextSize.bodyLarge },
  optionMeta: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, marginTop: 3 },
  good: { color: Colors.secondary },
  optionFare: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.bodyLarge },
  empty: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.body, lineHeight: 19 },

  rules: { flexDirection: 'row', marginHorizontal: -6 },
  rule: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 2 },
  ruleIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  ruleLabel: { fontFamily: INTER.medium, color: BRAND, fontSize: 10.5, lineHeight: 14, textAlign: 'center', marginTop: 8 },
  ruleValue: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: 10.5, lineHeight: 14, textAlign: 'center', marginTop: 2 },

  stop: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 18 },
  node: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.white, borderWidth: 3, borderColor: BRAND, marginTop: 1 },
  link: { flex: 1, width: 2, backgroundColor: BRAND },
  stopName: { fontFamily: INTER.semibold, fontSize: TextSize.bodyLarge, color: BRAND },
  stopCode: { fontFamily: INTER.regular, color: Colors.textLight },
  stopMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },

  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 7 },
  lineLabel: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.body, flexShrink: 1 },
  lineValue: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body, textAlign: 'right' },
  lineBold: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.bodyLarge },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },

  notice: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: '#E8F2EE' },
  noticeInfo: { backgroundColor: Colors.surfaceMuted },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  noticeText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 2 },

  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flex: 1, minWidth: 0 },
  footerCaption: { fontFamily: INTER.medium, color: BRAND, fontSize: TextSize.caption },
  footerAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.heading, marginTop: 1 },
  continue: { minWidth: 168, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, borderRadius: 27, backgroundColor: '#103D30' },
  continueText: { fontFamily: INTER.bold, color: Colors.white, fontSize: TextSize.bodyLarge },
});