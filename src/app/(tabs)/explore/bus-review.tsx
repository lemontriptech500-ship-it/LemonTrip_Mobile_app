import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { FareSummary, JourneySummary } from '@/components/buses/BusCards';
import { BRAND, BUS_ROUTES, BusBanner, BusCardBox, BusFooter, BusHeading, BusShell, BusSteps, BusTag, EmptyState, INTER, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { formatLongDate, inr } from '@/data/buses';
import { currentFare, currentPoints, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function BusReviewScreen() {
  useAppLanguage();
  const { selection, passengers, contact, options } = useBusBooking();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const derived = currentFare();
  const points = currentPoints();
  if (!selection || !derived || !points || !selection.seats.length || passengers.length !== selection.seats.length || passengers.some((p) => !p.name.trim())) {
    return (
      <BusShell onBack={() => goBackOr(BUS_ROUTES.passengers)}>
        <ScrollView>
          <BusBanner title="Review your booking" text="Check every detail before you pay." />
          <EmptyState icon="document-text-outline" title="Nothing to review yet" text="Select your seats and add passenger details first." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} />
        </ScrollView>
      </BusShell>
    );
  }
  const { fare, bus } = derived;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(BUS_ROUTES.payment); };

  const edit = (path: string, label = 'Edit') => <TouchableOpacity accessibilityRole="button" onPress={() => goTo(path)}><Text style={s.edit}>{label}</Text></TouchableOpacity>;

  return (
    <BusShell onBack={() => goBackOr(BUS_ROUTES.passengers)} footer={<BusFooter caption="Total payable" amount={inr(fare.total)} label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <BusBanner title="Review your booking" text="Check every detail before you pay." />
          <BusSteps current={2} />
          <JourneySummary bus={bus} date={selection.date} seats={selection.seats} />

          <BusCardBox>
            <BusHeading eyebrow="JOURNEY" title="Trip details" right={edit(BUS_ROUTES.details, 'Change')} />
            <Line icon="calendar-outline" label="Date" value={formatLongDate(selection.date)} />
            <Line icon="log-in-outline" label="Boarding" value={`${points.boarding.name} · ${points.boarding.time}`} />
            <Line icon="log-out-outline" label="Dropping" value={`${points.dropping.name} · ${points.dropping.time}${points.dropping.dayOffset ? ` (+${points.dropping.dayOffset}d)` : ''}`} />
            <Line icon="bed-outline" label="Seats" value={selection.seats.join(', ')} />
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="TRAVELLERS" title={`${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`} right={edit(BUS_ROUTES.passengers)} />
            {passengers.map((p, i) => (
              <View key={selection.seats[i]} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={s.avatar}><Text style={s.avatarText}>{p.name.trim().charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.paxName} numberOfLines={1}>{p.name.trim()}</Text>
                  <Text style={s.paxMeta}>{p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</Text>
                </View>
                <BusTag label={`Seat ${selection.seats[i]}`} />
              </View>
            ))}
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="CONTACT" title="E-ticket delivery" right={edit(BUS_ROUTES.passengers)} />
            <Line icon="mail-outline" label="Email" value={contact.email} />
            <Line icon="call-outline" label="Mobile" value={`+91 ${contact.phone}`} />
            <View style={s.opts}>
              {options.insurance ? <BusTag icon="shield-checkmark-outline" label="Travel insurance" /> : null}
              {options.delayAlerts ? <BusTag icon="notifications-outline" label="Journey alerts on" /> : null}
            </View>
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="FARE" title="Price breakdown" />
            <FareSummary fare={fare} />
          </BusCardBox>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="information-circle-outline" size={20} color={Colors.textLight} /><Text style={s.infoTitle}>Important information</Text></View>
            {['Carry a valid photo ID. Passenger names must match it exactly.', 'Reach your boarding point at least 15 minutes before the departure time.', 'Cancellation charges depend on how close to departure you cancel.', 'Booking is confirmed only after successful payment.'].map((line) => (
              <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>
            ))}
          </View>

          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree} activeOpacity={0.85}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={showError ? Colors.error : BRAND} />
            <Text style={s.agreeText}>I have verified the passenger details and agree to the booking and cancellation terms.</Text>
          </TouchableOpacity>
          {showError ? <Text style={s.error}>Please accept the terms to continue.</Text> : null}
        </View>
      </ScrollView>
    </BusShell>
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

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  edit: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  lineLeft: { width: '36%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  lineLabel: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  lineValue: { flex: 1, fontFamily: INTER.semibold, fontSize: TextSize.body, color: BRAND },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: '#103D30' },
  avatarText: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: Colors.white },
  paxName: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  paxMeta: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight, marginTop: 2 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  info: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoTitle: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 5 },
  dot: { color: Colors.textLight, fontSize: TextSize.body, lineHeight: 18 },
  infoText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 20, marginTop: 2 },
  agreeText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: Colors.textLight },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginHorizontal: 20, marginTop: 8 },
});