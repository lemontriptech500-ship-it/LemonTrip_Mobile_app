import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FLIGHT_ROUTES, FlightJourney, FlightProgress, formatDuration, formatPrice, formatTime, goBackOr, goTo, replaceTo } from '@/components/flights/FlightFlowUi';
import { computeFlightTotals, getFlightBookingDraft } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { getAirport } from '@/components/flights/airports';
import { Card, EmptyState, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { formatLongDate, formatShortDate } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const clean = (v: string) => v.replace(/\s*·\s*sample( allowance)?/i, '');

export default function FlightReviewScreen() {
  useAppLanguage();
  const selection = getFlightSelection();
  const draft = getFlightBookingDraft();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const totals = computeFlightTotals();

  if (!selection || !totals || draft.travellers.length === 0) {
    return <FlowScreen><ScrollView><ScreenHeader title="Review booking" eyebrow="LEMONTRIP / FLIGHTS" onBack={() => goBackOr(FLIGHT_ROUTES.seats)} /><EmptyState icon="document-text-outline" title="Nothing to review yet" text="Select a flight and add traveller details first." action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }

  const { offer, fare, request, currency, fareTotal, seatTotal, addOnTotal, discount, total } = totals;
  const from = getAirport(offer.departure.airportCode);
  const to = getAirport(offer.arrival.airportCode);
  const addOns = [draft.addOns.baggage && 'Extra baggage', draft.addOns.meal && 'In-flight meal', draft.addOns.insurance && 'Travel insurance'].filter(Boolean) as string[];
  const refundable = fare?.refundable;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(FLIGHT_ROUTES.payment); };
  const edit = (path: string) => <TouchableOpacity accessibilityRole="button" onPress={() => goTo(path)}><Text style={s.edit}>Edit</Text></TouchableOpacity>;

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={formatPrice(total, currency)} action={<PrimaryButton label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title="Review your booking" subtitle="Check every detail before you pay." eyebrow="LEMONTRIP / FLIGHTS" onBack={() => goBackOr(FLIGHT_ROUTES.seats)} />
          <FlightProgress current={3} />
          <FlightJourney offer={offer} fare={fare} date={formatShortDate(request.departureDate)} />

          <Card>
            <SectionTitle eyebrow="FLIGHT" title="Itinerary" right={edit(FLIGHT_ROUTES.details)} />
            <Line icon="airplane-outline" label="Flight" value={`${offer.airline.name} ${offer.flightNumber}`} />
            <Line icon="calendar-outline" label="Date" value={formatLongDate(request.departureDate)} />
            <Line icon="log-out-outline" label="Departs" value={`${formatTime(offer.departure.time)} · ${from?.city ?? offer.departure.airportCode} (${offer.departure.airportCode})`} />
            <Line icon="log-in-outline" label="Arrives" value={`${formatTime(offer.arrival.time)} · ${to?.city ?? offer.arrival.airportCode} (${offer.arrival.airportCode})`} />
            <Line icon="time-outline" label="Duration" value={`${formatDuration(offer.durationMinutes)} · ${offer.stops === 0 ? 'Nonstop' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}`} />
            <View style={s.status}>
              <Text style={s.statusLabel}>{clean(fare?.name ?? 'Standard')} fare</Text>
              {refundable === undefined ? <Pill label={fare?.cabin ?? request.cabinClass} /> : <Pill icon={refundable ? 'shield-checkmark-outline' : 'alert-circle-outline'} tone={refundable ? 'good' : 'warn'} label={refundable ? 'Refundable' : 'Non-refundable'} />}
            </View>
            <View style={s.opts}>
              {(fare?.baggage ?? offer.baggage) ? <Pill icon="briefcase-outline" label={clean(fare?.baggage ?? offer.baggage ?? '')} /> : null}
              <Pill icon="people-outline" label={`${draft.travellers.length} traveller${draft.travellers.length > 1 ? 's' : ''}`} />
            </View>
          </Card>

          {fare?.cancellation || fare?.dateChange ? (
            <Notice tone={refundable ? 'good' : 'warn'} icon={refundable ? 'shield-checkmark-outline' : 'alert-circle-outline'} title="Fare rules">
              {[fare.cancellation && `Cancellation: ${fare.cancellation}`, fare.dateChange && `Date change: ${fare.dateChange}`].filter(Boolean).join('  ·  ')}
            </Notice>
          ) : null}

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title={`${draft.travellers.length} traveller${draft.travellers.length > 1 ? 's' : ''}`} right={edit(FLIGHT_ROUTES.travellers)} />
            {draft.travellers.map((t, i) => {
              const name = `${t.firstName} ${t.lastName}`.trim();
              return (
                <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.paxName} numberOfLines={1}>{name}</Text>
                    <Text style={s.paxMeta}>{t.gender || 'Traveller'}{t.dob ? ` · ${t.dob}` : ''}</Text>
                  </View>
                  <Pill label={draft.seats[i] ? `Seat ${draft.seats[i]}` : 'Seat at check-in'} tone="neutral" />
                </View>
              );
            })}
          </Card>

          <Card>
            <SectionTitle eyebrow="CONTACT & EXTRAS" title="Ticket delivery" right={edit(FLIGHT_ROUTES.seats)} />
            <Line icon="mail-outline" label="Email" value={draft.contactEmail} />
            <Line icon="call-outline" label="Mobile" value={draft.contactPhone} />
            <View style={s.opts}>{addOns.length ? addOns.map((a) => <Pill key={a} icon="add-circle-outline" label={a} />) : <Pill label="No add-ons" />}</View>
          </Card>

          <Card>
            <SectionTitle eyebrow="FARE" title="Price breakdown" />
            <Row label={`Fare (${clean(fare?.name ?? 'Standard')})`} value={formatPrice(fareTotal, currency)} />
            {fare?.price.baseFare !== undefined || fare?.price.taxes !== undefined ? <Text style={s.sub}>Includes {[fare?.price.baseFare !== undefined && `base ${formatPrice(fare.price.baseFare, currency)}`, fare?.price.taxes !== undefined && `taxes ${formatPrice(fare.price.taxes, currency)}`, fare?.price.fees !== undefined && `fees ${formatPrice(fare.price.fees, currency)}`].filter(Boolean).join(', ')}</Text> : null}
            {seatTotal > 0 ? <Row label={`Seats (${draft.seats.join(', ')})`} value={formatPrice(seatTotal, currency)} /> : null}
            {addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(addOnTotal, currency)} /> : null}
            {discount > 0 ? <Row label="Coupon" value={`− ${formatPrice(discount, currency)}`} tone="good" /> : null}
            <View style={s.divider} />
            <Row label="Total payable" value={formatPrice(total, currency)} bold />
          </Card>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="alert-circle-outline" size={18} color={Colors.primaryDark} /><Text style={s.infoTitle}>Important information</Text></View>
            {[
              'Carry a valid original government photo ID for every traveller. Names must match the ID.',
              'Web check-in and airport check-in timings are set by the airline. Reach the airport well before departure.',
              'Cancellation, date-change and baggage rules follow the selected fare.',
              'Booking is confirmed only after successful payment.',
            ].map((line) => <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>)}
          </View>

          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={showError ? Colors.error : Colors.primary} />
            <Text style={s.agreeText}>I have verified the traveller details and agree to the fare rules and booking terms.</Text>
          </TouchableOpacity>
          {showError ? <Text style={s.error}>Please accept the terms to continue.</Text> : null}
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Line({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return <View style={s.line}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue} numberOfLines={3}>{value}</Text></View>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  edit: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  lineLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight, width: 72 },
  lineValue: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'right' },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  statusLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  paxName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  paxMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  sub: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  info: { marginHorizontal: 20, marginBottom: 14, padding: 16, borderRadius: 20, backgroundColor: Colors.surfaceMuted },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 5 },
  dot: { color: Colors.primary, fontSize: TextSize.body, lineHeight: 19 },
  infoText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 19, color: Colors.textDark },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 20, marginTop: 2 },
  agreeText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, color: Colors.textDark },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginHorizontal: 20, marginTop: 8 },
});
