import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { FareSummary, JourneySummary } from '@/components/trains/TrainCards';
import { BRAND, INTER, EmptyState, Pill, PrimaryButton, TRAIN_ROUTES, TrainBanner, TrainCardBox, TrainFooter, TrainHeading, TrainNotice, TrainShell, TrainSteps, goBackOr, goTo, replaceTo } from '@/components/trains/TrainFlowUi';
import { Colors } from '@/constants/colors';
import { CLASS_INFO, describeSeat, formatLongDate, getAvailability, inr } from '@/data/trains';
import { currentFare, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function TrainReviewScreen() {
  useAppLanguage();
  const { selection, passengers, contact, options, seats } = useTrainBooking();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const derived = currentFare();
  if (!selection || !derived || passengers.some((p) => !p.name.trim())) {
    return <TrainShell onBack={() => goBackOr(TRAIN_ROUTES.seats)}><ScrollView><TrainBanner title="Review booking" text="Check every detail before you pay." /><EmptyState icon="document-text-outline" title="Nothing to review yet" text="Select a train and add passenger details first." action={<PrimaryButton label="Search trains" onPress={() => replaceTo(TRAIN_ROUTES.results)} />} /></ScrollView></TrainShell>;
  }
  const { fare, result } = derived;
  const availability = getAvailability(selection.trainId, selection.classCode, selection.date, selection.quota);
  const showSeats = availability.status === 'AVL' && seats.length > 0;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(TRAIN_ROUTES.payment); };

  return (
    <TrainShell onBack={() => goBackOr(TRAIN_ROUTES.seats)} footer={<TrainFooter caption="Total payable" amount={inr(fare.total)} label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <TrainBanner title="Review your booking" text="Check every detail before you pay." />
          <TrainSteps current={3} />
          <JourneySummary result={result} date={selection.date} className={CLASS_INFO[selection.classCode].name} quota={selection.quota} />

          <TrainCardBox>
            <TrainHeading eyebrow="JOURNEY" title="Trip details" right={<TouchableOpacity accessibilityRole="button" onPress={() => goTo(TRAIN_ROUTES.details)}><Text style={s.edit}>Change</Text></TouchableOpacity>} />
            <Line icon="calendar-outline" label="Date" value={formatLongDate(selection.date)} />
            <Line icon="log-in-outline" label="Boarding" value={`${result.from.code} · ${result.departure}`} />
            <Line icon="log-out-outline" label="Destination" value={`${result.to.code} · ${result.arrival}${result.arrivalDayOffset ? ` (+${result.arrivalDayOffset}d)` : ''}`} />
            <Line icon="bed-outline" label="Seats" value={showSeats ? seats.map((x) => describeSeat(selection.classCode, x)).join(', ') : 'Auto-allotted at chart'} />
            <View style={s.status}><Text style={s.statusLabel}>Current availability</Text><Pill label={availability.label} tone={availability.tone === 'good' ? 'good' : availability.tone === 'warn' ? 'warn' : 'bad'} /></View>
          </TrainCardBox>

          {availability.status !== 'AVL' ? <TrainNotice tone="warn" icon="alert-circle-outline" title={availability.status === 'WL' ? 'Waitlisted ticket' : 'RAC ticket'}>{options.confirmedOnly ? 'You asked to book only if confirmed. Because confirmed berths are not available, this booking may be skipped.' : availability.status === 'WL' ? 'Your seat will be confirmed only if earlier passengers cancel. Full refund is issued if it stays waitlisted after chart preparation.' : 'RAC passengers share a berth until the chart confirms a full berth.'}</TrainNotice> : null}

          <TrainCardBox>
            <TrainHeading eyebrow="TRAVELLERS" title={`${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`} right={<TouchableOpacity accessibilityRole="button" onPress={() => goTo(TRAIN_ROUTES.seats)}><Text style={s.edit}>Seats</Text></TouchableOpacity>} />
            {passengers.map((p, i) => (
              <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={s.avatar}><Text style={s.avatarText}>{p.name.trim().charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.paxName} numberOfLines={1}>{p.name.trim()}</Text>
                  <Text style={s.paxMeta}>{p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'} · {showSeats && seats[i] ? describeSeat(selection.classCode, seats[i]) : p.berth}</Text>
                </View>
              </View>
            ))}
          </TrainCardBox>

          <TrainCardBox>
            <TrainHeading eyebrow="CONTACT" title="E-ticket delivery" right={<TouchableOpacity accessibilityRole="button" onPress={() => goBackOr(TRAIN_ROUTES.passengers)}><Text style={s.edit}>Edit</Text></TouchableOpacity>} />
            <Line icon="mail-outline" label="Email" value={contact.email} />
            <Line icon="call-outline" label="Mobile" value={contact.phone} />
            <View style={s.opts}>
              {options.autoUpgrade ? <Pill icon="trending-up-outline" label="Auto-upgrade on" /> : null}
              {options.confirmedOnly ? <Pill icon="checkmark-done-outline" label="Confirmed only" /> : null}
            </View>
          </TrainCardBox>

          <TrainCardBox>
            <TrainHeading eyebrow="FARE" title="Price breakdown" />
            <FareSummary fare={fare} />
          </TrainCardBox>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="alert-circle-outline" size={18} color={Colors.primaryDark} /><Text style={s.infoTitle}>Important information</Text></View>
            {['Carry a valid photo ID in original. Passenger names must match it exactly.', 'Cancellation charges depend on the class and how close to departure you cancel.', 'Charts are prepared about 4 hours before departure; final berths are shown on your ticket.', 'Booking is confirmed only after successful payment.'].map((line) => (
              <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>
            ))}
          </View>

          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={showError ? Colors.error : Colors.primary} />
            <Text style={s.agreeText}>I have verified the passenger details and agree to the booking and cancellation terms.</Text>
          </TouchableOpacity>
          {showError ? <Text style={s.error}>Please accept the terms to continue.</Text> : null}
        </View>
      </ScrollView>
    </TrainShell>
  );
}

function Line({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return <View style={s.line}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue} numberOfLines={2}>{value}</Text></View>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  edit: { fontSize: TextSize.body, fontFamily: INTER.extrabold, color: BRAND },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  lineLabel: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight, width: 84 },
  lineValue: { flex: 1, fontSize: TextSize.body, fontFamily: INTER.bold, color: BRAND, textAlign: 'right' },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  statusLabel: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontSize: TextSize.bodyLarge, fontFamily: INTER.extrabold, color: BRAND },
  paxName: { fontSize: TextSize.bodyLarge, fontFamily: INTER.extrabold, color: BRAND },
  paxMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  info: { marginHorizontal: 20, marginBottom: 14, padding: 16, borderRadius: 20, backgroundColor: Colors.surfaceMuted },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle: { fontSize: TextSize.body, fontFamily: INTER.extrabold, color: BRAND },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 5 },
  dot: { color: Colors.primary, fontSize: TextSize.body, lineHeight: 19 },
  infoText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 19, color: BRAND },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 20, marginTop: 2 },
  agreeText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 19, color: BRAND },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginHorizontal: 20, marginTop: 8 },
});