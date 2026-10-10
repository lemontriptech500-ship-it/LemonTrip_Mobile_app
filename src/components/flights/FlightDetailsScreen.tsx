import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, EmptyState, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { formatShortDate } from '@/data/trains';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlightJourney, FlightProgress } from './FlightFlowUi';
import { airportLabel, getAirport } from './airports';
import { formatDuration, formatPrice } from './flightFormat';
import { getFlightSelection, selectFlightFare } from './flightSelectionStore';
import type { FlightFareOption } from './types';

const clean = (name: string) => name.replace(/\s*·\s*sample/i, '');
const BOOKING_ROUTE = '/flight-booking/traveller';

export default function FlightDetailsScreen() {
  const selection = getFlightSelection();
  const fares = selection?.offer.fareOptions ?? [];
  const [selectedFareId, setSelectedFareId] = useState(fares[0]?.id ?? null);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explore/flights'));

  if (!selection) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Flight details" eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <EmptyState icon="airplane-outline" title="No flight selected" text="Search for a flight and select an offer to view its itinerary and fares." action={<PrimaryButton label="Search flights" onPress={() => router.replace('/(tabs)/explore/flights')} />} />
        </ScrollView>
      </FlowScreen>
    );
  }

  const { offer, request } = selection;
  const fare: FlightFareOption | undefined = fares.find((f) => f.id === selectedFareId) ?? fares[0];
  const currency = fare?.price.currency ?? offer.price.currency;
  const total = fare?.price.total ?? offer.price.amount;
  const from = getAirport(offer.departure.airportCode);
  const to = getAirport(offer.arrival.airportCode);
  const canContinue = fares.length === 0 || !!fare;

  const handleContinue = () => {
    if (fare) selectFlightFare(fare);
    router.push(BOOKING_ROUTE as never);
  };

  const breakdown: { label: string; amount?: number }[] = fare ? [{ label: 'Base fare', amount: fare.price.baseFare }, { label: 'Taxes', amount: fare.price.taxes }, { label: 'Fees', amount: fare.price.fees }] : [];
  const showBreakdown = breakdown.some((b) => b.amount !== undefined);

  return (
    <FlowScreen footer={<FooterBar caption={`${fare ? clean(fare.name) : 'Fare'} · per traveller`} amount={formatPrice(total, currency)} action={<PrimaryButton label="Continue" icon="arrow-forward" disabled={!canContinue} onPress={handleContinue} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title={`${offer.airline.name} ${offer.flightNumber}`} subtitle={`${from?.city ?? offer.departure.airportCode} → ${to?.city ?? offer.arrival.airportCode} · ${formatShortDate(request.departureDate)}`} eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <FlightProgress current={0} />
          <FlightJourney offer={offer} fare={fare} date={formatShortDate(request.departureDate)} />

          <Card>
            <SectionTitle eyebrow="STEP 1" title="Choose your fare" />
            {fares.length ? fares.map((f) => {
              const on = f.id === fare?.id;
              return (
                <TouchableOpacity key={f.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setSelectedFareId(f.id)} style={[s.option, on && s.optionOn]}>
                  <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.optionTitle}>{clean(f.name)}</Text>
                    <Text style={[s.avail, f.refundable === undefined ? s.muted : f.refundable ? s.good : s.warn]}>
                      {f.refundable === undefined ? (f.baggage ?? 'Details not provided') : `${f.refundable ? 'Refundable' : 'Non-refundable'}${f.baggage ? ` · ${f.baggage.replace(/\s*·\s*sample allowance/i, '')}` : ''}`}
                    </Text>
                  </View>
                  <Text style={s.optionFare}>{formatPrice(f.price.total, f.price.currency)}</Text>
                </TouchableOpacity>
              );
            }) : <Notice icon="information-circle-outline">Fare options were not included in the flight response.</Notice>}
          </Card>

          {fare ? (
            <Card>
              <SectionTitle eyebrow="FARE RULES" title="What’s included" right={<Pill label={fare.cabin ?? request.cabinClass} />} />
              <Row label="Baggage" value={fare.baggage ?? 'Not provided'} />
              <Row label="Cancellation" value={fare.cancellation ?? 'Not provided'} />
              <Row label="Date change" value={fare.dateChange ?? 'Not provided'} />
              <Row label="Seat selection" value={fare.seatSelection ?? 'Not provided'} />
              <Row label="Refundability" value={fare.refundable === undefined ? 'Not provided' : fare.refundable ? 'Refundable' : 'Non-refundable'} tone={fare.refundable ? 'good' : undefined} />
            </Card>
          ) : null}

          <Card>
            <SectionTitle eyebrow="ROUTE" title="Journey timeline" right={<Pill icon="time-outline" label={formatDuration(offer.durationMinutes)} />} />
            {[{ code: offer.departure.airportCode, name: offer.departure.airportName, role: 'Departs' }, { code: offer.arrival.airportCode, name: offer.arrival.airportName, role: 'Arrives' }].map((p, i) => (
              <View key={p.role} style={s.stop}>
                <View style={s.rail}>
                  <View style={[s.node, s.nodeEnd]} />
                  {i === 0 ? <View style={[s.link, s.linkOn]} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i === 0 ? 18 : 0 }}>
                  <Text style={s.stopName}>{getAirport(p.code)?.name ?? p.name ?? p.code} <Text style={s.stopCode}>({p.code})</Text></Text>
                  <Text style={s.stopMeta}>{p.role}{i === 0 ? ` ${formatShortDate(request.departureDate)}` : ''}{getAirport(p.code) ? `  ·  ${airportLabel(p.code)}` : ''}</Text>
                </View>
              </View>
            ))}
            <View style={s.amenities}>
              <Pill icon="airplane-outline" label={offer.stops === 0 ? 'Nonstop' : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`} tone={offer.stops === 0 ? 'good' : 'neutral'} />
              {offer.aircraft?.name || offer.aircraft?.code ? <Pill icon="information-circle-outline" label={[offer.aircraft.name, offer.aircraft.code].filter(Boolean).join(' · ')} /> : null}
              {offer.baggage ? <Pill icon="briefcase-outline" label={offer.baggage.replace(/\s*·\s*sample allowance/i, '')} /> : null}
            </View>
          </Card>

          {showBreakdown && fare ? (
            <Card>
              <SectionTitle eyebrow="FARE" title="Price breakdown" />
              {breakdown.map((b) => (b.amount !== undefined ? <Row key={b.label} label={b.label} value={formatPrice(b.amount, currency)} /> : null))}
              <View style={s.divider} />
              <Row label="Total per traveller" value={formatPrice(fare.price.total, currency)} bold />
            </Card>
          ) : null}

          <Notice icon="shield-checkmark-outline" title={offer.isDemo ? 'Demo inventory' : 'Fare details'} tone={offer.isDemo ? 'warn' : 'info'}>
            {offer.isDemo ? 'Sample fare details only. This journey cannot be booked until the flight service is connected.' : 'Fare details are shown as supplied by the airline.'}
          </Notice>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  optionFare: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  avail: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, marginTop: 3 },
  good: { color: Colors.success }, warn: { color: '#8A6500' }, muted: { color: Colors.textLight },
  stop: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 16 },
  node: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.borderStrong, marginTop: 3 },
  nodeEnd: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.primary, marginTop: 1 },
  link: { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 2 },
  linkOn: { backgroundColor: Colors.secondary },
  stopName: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  stopCode: { color: Colors.textLight, fontWeight: FontWeight.bold },
  stopMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
});
