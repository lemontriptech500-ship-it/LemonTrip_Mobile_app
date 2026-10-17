import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { HotelFareSummary, StaySummary } from '@/components/hotels/HotelBookingCards';
import { Card, EmptyState, FlowScreen, FooterBar, HOTEL_ROUTES, HotelProgress, Notice, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/hotels/HotelUi';
import { Colors } from '@/constants/colors';
import { CHECK_IN_TIME, CHECK_OUT_TIME, cancellationInfo, formatLongDate, inr } from '@/data/hotelBooking';
import { currentFare, useHotelBooking } from '@/utils/hotelBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HotelReviewScreen() {
  useAppLanguage();
  const { selection, guestNames, leadTitle, contact, requests, coupon } = useHotelBooking();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const derived = currentFare();
  if (!selection || !derived || !derived.nights || !guestNames[0]?.trim()) {
    return <FlowScreen><ScrollView><ScreenHeader title="Review booking" eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.guests)} /><EmptyState icon="document-text-outline" title="Nothing to review yet" text="Select a room and add guest details first." action={<PrimaryButton label="Search hotels" onPress={() => replaceTo(HOTEL_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, room, nights } = derived;
  const { hotel } = selection;
  const policy = cancellationInfo(room, hotel);
  const breakfast = room.breakfast ?? hotel.breakfast;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(HOTEL_ROUTES.payment); };
  const edit = (path: string) => <TouchableOpacity accessibilityRole="button" onPress={() => goTo(path)}><Text style={s.edit}>{path === HOTEL_ROUTES.details ? 'Change' : 'Edit'}</Text></TouchableOpacity>;

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title="Review your booking" subtitle="Check every detail before you pay." eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.guests)} />
          <HotelProgress current={2} />
          <StaySummary hotel={hotel} roomName={room.name} checkIn={selection.checkIn} checkOut={selection.checkOut} nights={nights} guests={selection.guests} rooms={selection.rooms} />

          <Card>
            <SectionTitle eyebrow="STAY" title="Room & dates" right={edit(HOTEL_ROUTES.details)} />
            <Line icon="bed-outline" label="Room" value={`${room.name} × ${selection.rooms}`} />
            <Line icon="log-in-outline" label="Check-in" value={`${formatLongDate(selection.checkIn)} · from ${CHECK_IN_TIME}`} />
            <Line icon="log-out-outline" label="Check-out" value={`${formatLongDate(selection.checkOut)} · until ${CHECK_OUT_TIME}`} />
            <Line icon="location-outline" label="Address" value={hotel.address ?? hotel.location} />
            <View style={s.status}>
              <Text style={s.statusLabel}>Cancellation</Text>
              <Pill icon={policy.free ? 'shield-checkmark-outline' : 'alert-circle-outline'} tone={policy.free ? 'good' : 'warn'} label={policy.free ? 'Free cancellation' : 'Limited refund'} />
            </View>
            <View style={s.opts}>
              {breakfast !== undefined ? <Pill icon={breakfast ? 'cafe-outline' : 'close-circle-outline'} tone={breakfast ? 'good' : 'neutral'} label={breakfast ? 'Breakfast included' : 'Room only'} /> : null}
            </View>
          </Card>

          <Notice tone={policy.free ? 'good' : 'warn'} icon={policy.free ? 'shield-checkmark-outline' : 'alert-circle-outline'} title="Cancellation policy">{policy.text}</Notice>

          <Card>
            <SectionTitle eyebrow="GUESTS" title={`${selection.guests} guest${selection.guests > 1 ? 's' : ''}`} right={edit(HOTEL_ROUTES.guests)} />
            {guestNames.map((n, i) => {
              const name = i === 0 ? `${leadTitle} ${n.trim()}`.trim() : n.trim() || `Guest ${i + 1}`;
              return (
                <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{name.replace(/^(Mr|Ms|Mrs)\s+/, '').charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.paxName} numberOfLines={1}>{name}</Text>
                    <Text style={s.paxMeta}>{i === 0 ? 'Lead guest' : n.trim() ? 'Guest' : 'Name to be shared at check-in'}</Text>
                  </View>
                </View>
              );
            })}
          </Card>

          <Card>
            <SectionTitle eyebrow="CONTACT" title="Voucher delivery" right={edit(HOTEL_ROUTES.guests)} />
            <Line icon="mail-outline" label="Email" value={contact.email} />
            <Line icon="call-outline" label="Mobile" value={contact.phone} />
            <View style={s.opts}>
              {requests.arrival ? <Pill icon="time-outline" label={`Arriving ${requests.arrival}`} /> : null}
              {requests.bed !== 'No preference' ? <Pill icon="bed-outline" label={requests.bed} /> : null}
              {requests.earlyCheckIn ? <Pill icon="sunny-outline" label="Early check-in" /> : null}
              {requests.lateCheckOut ? <Pill icon="moon-outline" label="Late check-out" /> : null}
            </View>
            {requests.note.trim() ? <Text style={s.note}>“{requests.note.trim()}”</Text> : null}
          </Card>

          <Card>
            <SectionTitle eyebrow="FARE" title="Price breakdown" />
            <HotelFareSummary fare={fare} couponCode={coupon?.code} />
          </Card>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="alert-circle-outline" size={18} color={Colors.primaryDark} /><Text style={s.infoTitle}>Important information</Text></View>
            {[
              'Carry a valid original photo ID for every adult guest. The lead guest name must match it.',
              `Standard check-in is from ${CHECK_IN_TIME} and check-out is until ${CHECK_OUT_TIME}. Early or late requests depend on availability.`,
              'Meals, taxes or deposits not shown here may be charged by the property at the time of your stay.',
              'Booking is confirmed only after successful payment.',
            ].map((line) => (
              <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>
            ))}
          </View>

          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={showError ? Colors.error : Colors.primary} />
            <Text style={s.agreeText}>I have verified the guest details and agree to the booking and cancellation terms.</Text>
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
  lineLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight, width: 84 },
  lineValue: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'right' },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  statusLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  paxName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  paxMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  opts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  note: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textDark, marginTop: 10 },
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