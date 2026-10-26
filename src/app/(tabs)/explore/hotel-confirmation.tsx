import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { HotelFareSummary } from '@/components/hotels/HotelBookingCards';
import { HotelHeader, Card, EmptyState, FlowScreen, HOTEL_ROUTES, HotelProgress, Notice, Pill, PrimaryButton, SectionTitle, goTo, replaceTo } from '@/components/hotels/HotelUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatLongDate, formatShortDate, inr } from '@/data/hotelBooking';
import { resetHotelBooking, useHotelBooking } from '@/utils/hotelBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, ScrollView, Share, StyleSheet, View } from 'react-native';

/** Decorative barcode derived from the confirmation number (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value).split('').map((ch, i) => ({ w: 1 + ((ch.charCodeAt(0) + i) % 3), gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2) }));
  return <View style={s.barcode} accessible={false}>{bars.map((b, i) => <View key={i} style={{ width: b.w, height: 44, marginRight: b.gap, backgroundColor: Colors.primaryDark }} />)}</View>;
}

export default function HotelConfirmationScreen() {
  useAppLanguage();
  const { voucher } = useHotelBooking();
  const done = (path: string) => { resetHotelBooking(); replaceTo(path); };

  if (!voucher) {
    return <FlowScreen><ScrollView><HotelHeader title="Confirmation" eyebrow="LEMONTRIP / HOTELS" onBack={() => replaceTo(HOTEL_ROUTES.results)} /><EmptyState icon="ticket-outline" title="No confirmed stay yet" text="Complete a booking to see your hotel voucher here." action={<PrimaryButton label="Search hotels" onPress={() => replaceTo(HOTEL_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }

  const summary = `LemonTrip hotel voucher\nConfirmation ${voucher.confirmationNo}\n${voucher.hotelName} · ${voucher.roomName}\n${voucher.address}\n${formatLongDate(voucher.checkIn)} → ${formatLongDate(voucher.checkOut)} (${voucher.nights} night${voucher.nights > 1 ? 's' : ''})\n${voucher.guests.length} guest(s) · ${voucher.rooms} room(s)`;
  const share = () => void Share.share({ title: 'LemonTrip hotel voucher', message: summary });
  const email = () => void Linking.openURL(`mailto:${voucher.contact.email}?subject=${encodeURIComponent(`Hotel voucher · ${voucher.confirmationNo}`)}&body=${encodeURIComponent(summary)}`);
  // All-day event: Google Calendar treats the end date as exclusive, which is exactly the check-out day.
  const calendar = () => void Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${voucher.hotelName} stay`)}&dates=${voucher.checkIn.replace(/-/g, '')}/${voucher.checkOut.replace(/-/g, '')}&location=${encodeURIComponent(voucher.address)}&details=${encodeURIComponent(`Confirmation ${voucher.confirmationNo}`)}`);
  const maps = () => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${voucher.hotelName}, ${voucher.address}`)}`);

  return (
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <HotelHeader title="Booking confirmed" subtitle="Your stay is booked. Enjoy your trip!" eyebrow="LEMONTRIP / HOTELS" />
          <HotelProgress current={4} />

          <View style={s.hero}>
            <View style={s.check}><Ionicons name="checkmark" size={32} color={Colors.white} /></View>
            <Text style={s.heroTitle}>Payment successful</Text>
            <Text style={s.heroText}>{inr(voucher.fare.total)} paid via {voucher.payment.label}</Text>
            <View style={s.pnrBox}><Text style={s.pnrLabel}>CONFIRMATION NO.</Text><Text style={s.pnr} selectable>{voucher.confirmationNo}</Text></View>
          </View>

          <View style={s.ticket}>
            <Image source={{ uri: voucher.image }} style={s.cover} />
            <View style={s.ticketTop}>
              <View style={{ flex: 1, minWidth: 0 }}><Text style={s.hotelName} numberOfLines={2}>{voucher.hotelName}</Text><Text style={s.hotelMeta} numberOfLines={2}>{voucher.roomName} × {voucher.rooms}  ·  {voucher.address}</Text></View>
              <Pill label="CONFIRMED" tone="good" icon="checkmark-circle" />
            </View>
            <View style={s.times}>
              <View><Text style={s.code}>CHECK-IN</Text><Text style={s.time}>{formatShortDate(voucher.checkIn)}</Text><Text style={s.date}>from {voucher.checkInTime}</Text></View>
              <View style={s.mid}><Text style={s.dur}>{voucher.nights} night{voucher.nights > 1 ? 's' : ''}</Text><View style={s.midLine}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="bed" size={15} color={Colors.primary} /><View style={s.rule} /><View style={s.dotEnd} /></View></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.code}>CHECK-OUT</Text><Text style={s.time}>{formatShortDate(voucher.checkOut)}</Text><Text style={s.date}>until {voucher.checkOutTime}</Text></View>
            </View>
            <View style={s.perforation}><View style={[s.notch, { left: -10 }]} /><View style={s.dash} /><View style={[s.notch, { right: -10 }]} /></View>
            <View style={s.ticketBottom}>
              <Barcode value={voucher.confirmationNo} />
              <Text style={s.bookingId}>Booking ID {voucher.bookingId}</Text>
            </View>
          </View>

          <Card>
            <SectionTitle eyebrow="GUESTS" title="Who's staying" />
            {voucher.guests.map((g, i) => (
              <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={{ flex: 1, minWidth: 0 }}><Text style={s.paxName} numberOfLines={1}>{i + 1}. {g.name}</Text><Text style={s.paxMeta}>{g.lead ? 'Lead guest · photo ID required at check-in' : 'Guest'}</Text></View>
                {g.lead ? <Pill label="LEAD" tone="brand" /> : null}
              </View>
            ))}
            <View style={s.perks}>
              <Pill icon={voucher.breakfast ? 'cafe-outline' : 'close-circle-outline'} tone={voucher.breakfast ? 'good' : 'neutral'} label={voucher.breakfast ? 'Breakfast included' : 'Room only'} />
              <Pill icon={voucher.cancellation.free ? 'shield-checkmark-outline' : 'alert-circle-outline'} tone={voucher.cancellation.free ? 'good' : 'warn'} label={voucher.cancellation.free ? 'Free cancellation' : 'Limited refund'} />
              {voucher.requests.arrival ? <Pill icon="time-outline" label={`Arriving ${voucher.requests.arrival}`} /> : null}
              {voucher.requests.bed !== 'No preference' ? <Pill icon="bed-outline" label={voucher.requests.bed} /> : null}
              {voucher.requests.earlyCheckIn ? <Pill icon="sunny-outline" label="Early check-in requested" /> : null}
              {voucher.requests.lateCheckOut ? <Pill icon="moon-outline" label="Late check-out requested" /> : null}
            </View>
            <Text style={s.policy}>{voucher.cancellation.text}</Text>
          </Card>

          <Card>
            <SectionTitle eyebrow="PAYMENT" title="Receipt" />
            <HotelFareSummary fare={voucher.fare} couponCode={voucher.couponCode} />
            <View style={s.txn}><Text style={s.txnText}>Txn {voucher.txnId}</Text><Text style={s.txnText}>{new Date(voucher.bookedAt).toLocaleString(getAppLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text></View>
          </Card>

          <Notice icon="mail-outline" title="Voucher sent">A confirmation was sent to {voucher.contact.email}. Show it with a valid photo ID at check-in. This is a demo voucher and is not valid for a real stay.</Notice>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Calendar" onPress={calendar} />
            <Action icon="navigate-outline" label="Directions" onPress={maps} />
          </View>

          <View style={s.cta}>
            <PrimaryButton label="View my trips" icon="ticket-outline" onPress={() => done('/(tabs)/bookings')} />
            <View style={{ height: 10 }} />
            <PrimaryButton variant="soft" label="Back to home" icon="home-outline" onPress={() => done('/home')} />
            <View style={{ height: 10 }} />
            <PrimaryButton variant="soft" label="Book another stay" icon="bed-outline" onPress={() => { resetHotelBooking(); goTo(HOTEL_ROUTES.results); }} />
          </View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Action({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action}><View style={s.actionIcon}><Ionicons name={icon} size={19} color={Colors.primary} /></View><Text style={s.actionLabel}>{label}</Text></TouchableOpacity>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { alignItems: 'center', marginHorizontal: 20, marginBottom: 14, padding: 22, borderRadius: 24, backgroundColor: Colors.primaryDark },
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1FA463' },
  heroTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.white, marginTop: 12 },
  heroText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.onDarkMuted, marginTop: 4, textAlign: 'center' },
  pnrBox: { alignItems: 'center', marginTop: 16, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.onDarkSubtle },
  pnrLabel: { ...Ui.eyebrow, color: Colors.onDarkMuted },
  pnr: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.white, letterSpacing: 3, marginTop: 3 },
  ticket: { ...Ui.card, marginHorizontal: 20, marginBottom: 14, padding: 18, overflow: 'visible' },
  cover: { width: '100%', height: 130, borderRadius: 14, backgroundColor: Colors.surfaceMuted, marginBottom: 14 },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hotelName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  hotelMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  time: { fontFamily: FontFamily.sans, fontSize: TextSize.display, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 2 },
  code: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.secondary, letterSpacing: 0.8 },
  date: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 2 },
  mid: { flex: 1, alignItems: 'center', gap: 5 },
  dur: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight },
  midLine: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  perforation: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, height: 20 },
  dash: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  notch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  ticketBottom: { alignItems: 'center', gap: 8 },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 44, overflow: 'hidden', maxWidth: '100%' },
  bookingId: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight, letterSpacing: 0.5 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  paxName: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  paxMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  perks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  policy: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 10 },
  txn: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  txnText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  actionLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  cta: { marginHorizontal: 20 },
});