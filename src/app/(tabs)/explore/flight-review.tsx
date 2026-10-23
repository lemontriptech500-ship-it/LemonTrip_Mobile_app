import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { BRAND, FLIGHT_ROUTES, FlightBanner, FlightHeading, FlightShell, FlightSteps, FlightSummaryCard, FlightTag, INTER, formatDuration, formatPrice, formatTime, goBackOr, goTo, replaceTo } from '@/components/flights/FlightFlowUi';
import { computeFlightTotals, getFlightBookingDraft } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { getAirport } from '@/components/flights/airports';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatLongDate, formatShortDate } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const clean = (v: string) => v.replace(/\s*·\s*sample( allowance)?/i, '');

export default function FlightReviewScreen() {
  useAppLanguage();
  const selection = getFlightSelection();
  const draft = getFlightBookingDraft();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const totals = computeFlightTotals();

  if (!selection || !totals || draft.travellers.length === 0) {
    return (
      <FlightShell onBack={() => goBackOr(FLIGHT_ROUTES.seats)}>
        <ScrollView>
          <FlightBanner title="Review your booking" text="Check every detail before you pay." />
          <EmptyState icon="document-text-outline" title="Nothing to review yet" text="Select a flight and add traveller details first." action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />} />
        </ScrollView>
      </FlightShell>
    );
  }

  const { offer, fare, request, currency, fareTotal, seatTotal, addOnTotal, discount, total } = totals;
  const from = getAirport(offer.departure.airportCode);
  const to = getAirport(offer.arrival.airportCode);
  const addOns = [draft.addOns.baggage && 'Extra baggage', draft.addOns.meal && 'In-flight meal', draft.addOns.insurance && 'Travel insurance'].filter(Boolean) as string[];
  const refundable = fare?.refundable;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(FLIGHT_ROUTES.payment); };
  const edit = (path: string) => <TouchableOpacity accessibilityRole="button" onPress={() => goTo(path)}><Text style={s.edit}>Edit</Text></TouchableOpacity>;
  const stopsText = offer.stops === 0 ? 'Nonstop' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`;
  const footer = (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption}>Total payable</Text>
        <Text style={s.footerAmount} numberOfLines={1}>{formatPrice(total, currency)}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={proceed} activeOpacity={0.85} style={s.continue}>
        <Text style={s.continueText}>Proceed to payment</Text>
        <Ionicons name="lock-closed-outline" size={19} color={BRAND} />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlightShell onBack={() => goBackOr(FLIGHT_ROUTES.seats)} footer={footer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <FlightBanner title="Review your booking" text="Check every detail before you pay." />
          <FlightSteps current={3} />
          <FlightSummaryCard offer={offer} fare={fare} date={formatShortDate(request.departureDate)} />

          <View style={s.card}>
            <FlightHeading eyebrow="FLIGHT" title="Itinerary" right={edit(FLIGHT_ROUTES.details)} />
            <Line icon="airplane-outline" label="Flight" value={`${offer.airline.name} ${offer.flightNumber}`} />
            <Line icon="calendar-outline" label="Date" value={formatLongDate(request.departureDate)} />
            <Line icon="log-out-outline" label="Departs" value={`${formatTime(offer.departure.time)} · ${from?.city ?? offer.departure.airportCode} (${offer.departure.airportCode})`} />
            <Line icon="log-in-outline" label="Arrives" value={`${formatTime(offer.arrival.time)} · ${to?.city ?? offer.arrival.airportCode} (${offer.arrival.airportCode})`} />
            <Line icon="time-outline" label="Duration" value={`${formatDuration(offer.durationMinutes)} · ${stopsText}`} />
            <View style={s.status}>
              <Text style={s.statusLabel}>{clean(fare?.name ?? 'Standard')} fare</Text>
              {refundable === undefined
                ? <FlightTag label={fare?.cabin ?? request.cabinClass} />
                : <View style={[s.badge, refundable ? s.badgeGood : s.badgeWarn]}><Ionicons name={refundable ? 'shield-checkmark-outline' : 'alert-circle-outline'} size={14} color={refundable ? Colors.secondary : '#8A6500'} /><Text style={[s.badgeText, { color: refundable ? Colors.secondary : '#8A6500' }]}>{refundable ? 'Refundable' : 'Non-refundable'}</Text></View>}
            </View>
            <View style={s.opts}>
              {(fare?.baggage ?? offer.baggage) ? <FlightTag icon="briefcase-outline" label={clean(fare?.baggage ?? offer.baggage ?? '')} /> : null}
              <FlightTag icon="people-outline" label={`${draft.travellers.length} traveller${draft.travellers.length > 1 ? 's' : ''}`} />
            </View>
          </View>

          {fare?.cancellation || fare?.dateChange ? (
            <View style={[s.notice, refundable ? s.noticeGood : s.noticeWarn]}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.textLight} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.noticeTitle}>Fare rules</Text>
                <Text style={s.noticeText}>{[fare.cancellation && `Cancellation: ${fare.cancellation}`, fare.dateChange && `Date change: ${fare.dateChange}`].filter(Boolean).join('  ·  ')}</Text>
              </View>
            </View>
          ) : null}

          <View style={s.card}>
            <FlightHeading eyebrow="TRAVELLERS" title={`${draft.travellers.length} traveller${draft.travellers.length > 1 ? 's' : ''}`} right={edit(FLIGHT_ROUTES.travellers)} />
            {draft.travellers.map((t, i) => {
              const name = `${t.firstName} ${t.lastName}`.trim();
              return (
                <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.paxName} numberOfLines={1}>{name}</Text>
                    <Text style={s.paxMeta}>{t.gender || 'Traveller'}{t.dob ? ` · ${t.dob}` : ''}</Text>
                  </View>
                  <FlightTag label={draft.seats[i] ? `Seat ${draft.seats[i]}` : 'Seat at check-in'} />
                </View>
              );
            })}
          </View>

          <View style={s.card}>
            <FlightHeading eyebrow="CONTACT & EXTRAS" title="Ticket delivery" right={edit(FLIGHT_ROUTES.travellers)} />
            <Line icon="mail-outline" label="Email" value={draft.contactEmail} />
            <Line icon="call-outline" label="Mobile" value={draft.contactPhone} />
            <View style={s.opts}>{addOns.length ? addOns.map((a) => <FlightTag key={a} icon="add-circle-outline" label={a} />) : <FlightTag label="No add-ons" />}</View>
          </View>

          <View style={s.card}>
            <FlightHeading eyebrow="FARE" title="Price breakdown" />
            <Row label={`Fare (${clean(fare?.name ?? 'Standard')})`} value={formatPrice(fareTotal, currency)} />
            {fare?.price.baseFare !== undefined || fare?.price.taxes !== undefined ? <Text style={s.sub}>Includes {[fare?.price.baseFare !== undefined && `base ${formatPrice(fare.price.baseFare, currency)}`, fare?.price.taxes !== undefined && `taxes ${formatPrice(fare.price.taxes, currency)}`, fare?.price.fees !== undefined && `fees ${formatPrice(fare.price.fees, currency)}`].filter(Boolean).join(', ')}</Text> : null}
            {seatTotal > 0 ? <Row label={`Seats (${draft.seats.join(', ')})`} value={formatPrice(seatTotal, currency)} /> : null}
            {addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(addOnTotal, currency)} /> : null}
            {discount > 0 ? <Row label="Coupon" value={`− ${formatPrice(discount, currency)}`} good /> : null}
            <View style={s.divider} />
            <Row label="Total payable" value={formatPrice(total, currency)} bold />
          </View>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="information-circle-outline" size={20} color={Colors.textLight} /><Text style={s.infoTitle}>Important information</Text></View>
            {[
              'Carry a valid original government photo ID for every traveller. Names must match the ID.',
              'Web check-in and airport check-in timings are set by the airline. Reach the airport well before departure.',
              'Cancellation, date-change and baggage rules follow the selected fare.',
              'Booking is confirmed only after successful payment.',
            ].map((line) => <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>)}
          </View>

          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree} activeOpacity={0.85}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={showError ? Colors.error : BRAND} />
            <Text style={s.agreeText}>I have verified the traveller details and agree to the fare rules and booking terms.</Text>
          </TouchableOpacity>
          {showError ? <Text style={s.error}>Please accept the terms to continue.</Text> : null}
        </View>
      </ScrollView>
    </FlightShell>
  );
}

function Line({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={s.line}>
      <View style={s.lineLeft}><Ionicons name={icon} size={18} color={BRAND} /><Text style={s.lineLabel}>{label}</Text></View>
      <Text style={s.lineValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

function Row({ label, value, bold, good }: { label: string; value: string; bold?: boolean; good?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && s.rowBold]}>{label}</Text>
      <Text style={[s.rowValue, bold && s.rowBold, good && { color: Colors.secondary }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  edit: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  lineLeft: { width: '42%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  lineLabel: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  lineValue: { flex: 1, fontFamily: INTER.semibold, fontSize: TextSize.body, color: BRAND },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  statusLabel: { fontFamily: INTER.regular, fontSize: TextSize.bodyLarge, color: Colors.textLight },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  badgeGood: { backgroundColor: '#E3EFE9' },
  badgeWarn: { backgroundColor: '#FDF3C4' },
  badgeText: { fontFamily: INTER.bold, fontSize: TextSize.caption },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: BRAND },
  paxName: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  paxMeta: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 5 },
  rowLabel: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight, flexShrink: 1 },
  rowValue: { fontFamily: INTER.semibold, fontSize: TextSize.body, color: BRAND, textAlign: 'right' },
  rowBold: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  sub: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18 },
  noticeGood: { backgroundColor: '#E3EFE9' },
  noticeWarn: { backgroundColor: '#FBF1C7' },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  noticeText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 2 },
  info: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoTitle: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 5 },
  dot: { color: Colors.textLight, fontSize: TextSize.body, lineHeight: 18 },
  infoText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 20, marginTop: 2 },
  agreeText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: Colors.textLight },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginHorizontal: 20, marginTop: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flex: 1, minWidth: 0 },
  footerCaption: { fontFamily: INTER.medium, color: BRAND, fontSize: TextSize.caption },
  footerAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.heading, marginTop: 1 },
  continue: { minWidth: 168, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, borderRadius: 27, backgroundColor: Colors.accent },
  continueText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.bodyLarge },
});