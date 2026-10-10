import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FareSummary, JourneySummary } from '@/components/buses/BusCards';
import { BUS_ROUTES, BusProgress, Card, EmptyState, FlowScreen, FooterBar, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { formatLongDate, inr } from '@/data/buses';
import { currentFare, currentPoints, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BusReviewScreen() {
  const { selection, passengers, contact, options } = useBusBooking();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const derived = currentFare();
  const points = currentPoints();
  if (!selection || !derived || !points || !selection.seats.length || passengers.length !== selection.seats.length || passengers.some((p) => !p.name.trim())) {
    return <FlowScreen><ScrollView><ScreenHeader title="Review booking" eyebrow="LEMONTRIP / BUS" onBack={() => goBackOr(BUS_ROUTES.passengers)} /><EmptyState icon="document-text-outline" title="Nothing to review yet" text="Select your seats and add passenger details first." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, bus } = derived;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(BUS_ROUTES.payment); };

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={inr(fare.total)} action={<PrimaryButton label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title="Review your booking" subtitle="Check every detail before you pay." eyebrow="LEMONTRIP / BUS" onBack={() => goBackOr(BUS_ROUTES.passengers)} />
          <BusProgress current={2} />
          <JourneySummary bus={bus} date={selection.date} seats={selection.seats} />

          <Card>
            <SectionTitle eyebrow="JOURNEY" title="Trip details" right={<TouchableOpacity accessibilityRole="button" onPress={() => goTo(BUS_ROUTES.details)}><Text style={s.edit}>Change</Text></TouchableOpacity>} />
            <Line icon="calendar-outline" label="Date" value={formatLongDate(selection.date)} />
            <Line icon="log-in-outline" label="Boarding" value={`${points.boarding.name} · ${points.boarding.time}`} />
            <Line icon="log-out-outline" label="Dropping" value={`${points.dropping.name} · ${points.dropping.time}${points.dropping.dayOffset ? ` (+${points.dropping.dayOffset}d)` : ''}`} />
            <Line icon="bed-outline" label="Seats" value={selection.seats.join(', ')} />
          </Card>

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title={`${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`} right={<TouchableOpacity accessibilityRole="button" onPress={() => goBackOr(BUS_ROUTES.passengers)}><Text style={s.edit}>Edit</Text></TouchableOpacity>} />
            {passengers.map((p, i) => (
              <View key={selection.seats[i]} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={s.avatar}><Text style={s.avatarText}>{p.name.trim().charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.paxName} numberOfLines={1}>{p.name.trim()}</Text>
                  <Text style={s.paxMeta}>{p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</Text>
                </View>
                <Pill label={`Seat ${selection.seats[i]}`} tone="brand" />
              </View>
            ))}
          </Card>

          <Card>
            <SectionTitle eyebrow="CONTACT" title="E-ticket delivery" right={<TouchableOpacity accessibilityRole="button" onPress={() => goBackOr(BUS_ROUTES.passengers)}><Text style={s.edit}>Edit</Text></TouchableOpacity>} />
            <Line icon="mail-outline" label="Email" value={contact.email} />
            <Line icon="call-outline" label="Mobile" value={`+91 ${contact.phone}`} />
            <View style={s.opts}>
              {options.insurance ? <Pill icon="shield-checkmark-outline" label="Travel insurance" /> : null}
              {options.delayAlerts ? <Pill icon="notifications-outline" label="Journey alerts on" /> : null}
            </View>
          </Card>

          <Card>
            <SectionTitle eyebrow="FARE" title="Price breakdown" />
            <FareSummary fare={fare} />
          </Card>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="alert-circle-outline" size={18} color={Colors.primaryDark} /><Text style={s.infoTitle}>Important information</Text></View>
            {['Carry a valid photo ID. Passenger names must match it exactly.', 'Reach your boarding point at least 15 minutes before the departure time.', 'Cancellation charges depend on how close to departure you cancel.', 'Booking is confirmed only after successful payment.'].map((line) => (
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
    </FlowScreen>
  );
}

function Line({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return <View style={s.line}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue} numberOfLines={2}>{value}</Text></View>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  edit: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  lineLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight, width: 72 },
  lineValue: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'right' },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  paxName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  paxMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
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
