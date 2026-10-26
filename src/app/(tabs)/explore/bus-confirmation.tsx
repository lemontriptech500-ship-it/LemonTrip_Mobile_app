import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { FareSummary } from '@/components/buses/BusCards';
import { BRAND, BUS_ROUTES, BusBanner, BusNotice, BusShell, BusSteps, EmptyState, INTER, PrimaryButton, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatLongDate, formatShortDate, inr } from '@/data/buses';
import { resetBusBooking, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Linking, ScrollView, Share, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Decorative barcode derived from the ticket number (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value).split('').map((ch, i) => ({ w: 1 + ((ch.charCodeAt(0) + i) % 3), gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2) }));
  return <View style={s.barcode} accessible={false}>{bars.map((b, i) => <View key={i} style={{ width: b.w, height: 44, marginRight: b.gap, backgroundColor: BRAND }} />)}</View>;
}

export default function BusConfirmationScreen() {
  useAppLanguage();
  const { ticket } = useBusBooking();
  const done = (path: string) => { resetBusBooking(); replaceTo(path); };

  if (!ticket) {
    return (
      <BusShell onBack={() => replaceTo(BUS_ROUTES.results)}>
        <ScrollView>
          <EmptyState icon="ticket-outline" title="No confirmed ticket yet" text="Complete a booking to see your e-ticket here." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} />
        </ScrollView>
      </BusShell>
    );
  }

  const seats = ticket.passengers.map((p) => p.seat).join(', ');
  const summary = `LemonTrip e-ticket\nTicket ${ticket.ticketNo}\n${ticket.operator} · ${ticket.busType}\n${ticket.fromName} → ${ticket.toName}\n${formatLongDate(ticket.date)} · ${ticket.departure} → ${ticket.arrival}\nBoarding: ${ticket.boarding.name} at ${ticket.boarding.time}\nSeats ${seats} · ${ticket.passengers.length} passenger(s)`;
  const share = () => void Share.share({ title: 'LemonTrip bus ticket', message: summary });
  const email = () => void Linking.openURL(`mailto:${ticket.contact.email}?subject=${encodeURIComponent(`Bus ticket · ${ticket.ticketNo}`)}&body=${encodeURIComponent(summary)}`);
  const stamp = (iso: string, time: string) => `${iso.replace(/-/g, '')}T${time.replace(':', '')}00`;
  const calendar = () => void Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${ticket.operator} · ${ticket.fromName} → ${ticket.toName}`)}&dates=${stamp(ticket.date, ticket.departure)}/${stamp(ticket.arrivalDate, ticket.arrival)}&details=${encodeURIComponent(`Ticket ${ticket.ticketNo} · Seats ${seats} · Boarding ${ticket.boarding.name}`)}`);

  const copy = (value: string) => void Clipboard.setStringAsync(value);

  const gender = (g: string) => (g === 'M' ? 'Male' : g === 'F' ? 'Female' : g === 'O' ? 'Other' : g);

  return (
    <BusShell onBack={() => replaceTo(BUS_ROUTES.results)}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <BusBanner title="Booking confirmed" text="Your bus ticket is booked. Have a safe journey!" />
          <BusSteps current={4} />

          <View style={s.card}>
            <View style={s.row}>
              <View style={s.check}><Ionicons name="checkmark" size={34} color={Colors.white} /></View>
              <View style={s.flex}>
                <Text style={s.title}>Payment successful</Text>
                <Text style={s.text}>{inr(ticket.fare.total)} paid via {ticket.payment.label}. Your e-ticket has been sent to your email.</Text>
              </View>
            </View>
            <View style={s.refBox}>
              <View style={s.flex}><Text style={s.refLabel}>TICKET NUMBER</Text><Text style={s.ref} selectable numberOfLines={1} adjustsFontSizeToFit>{ticket.ticketNo}</Text></View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy ticket number" onPress={() => copy(ticket.ticketNo)} hitSlop={10}><Ionicons name="copy-outline" size={22} color={BRAND} /></TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              <View style={s.logo}><Ionicons name="bus-outline" size={24} color={BRAND} /></View>
              <View style={s.flex}><Text style={s.opName} numberOfLines={1}>{ticket.operator}</Text><Text style={s.opMeta} numberOfLines={1}>{ticket.busType}</Text></View>
              <View style={s.confirmed}><Ionicons name="checkmark-circle" size={14} color={BRAND} /><Text style={s.confirmedText}>CONFIRMED</Text></View>
            </View>
            <View style={s.times}>
              <View style={s.endpoint}><Text style={s.dateLabel}>{ticket.fromCode}</Text><Text style={s.time}>{ticket.departure}</Text><Text style={s.station} numberOfLines={2}>{ticket.fromName}</Text><Text style={s.dateSub}>{formatShortDate(ticket.date)}</Text></View>
              <View style={s.mid}><Text style={s.dur}>{ticket.duration}</Text><View style={s.midLine}><View style={s.rule} /><Ionicons name="bus-outline" size={20} color={BRAND} /><View style={s.rule} /></View></View>
              <View style={[s.endpoint, { alignItems: 'flex-end' }]}><Text style={s.dateLabel}>{ticket.toCode}</Text><Text style={s.time}>{ticket.arrival}</Text><Text style={[s.station, { textAlign: 'right' }]} numberOfLines={2}>{ticket.toName}</Text><Text style={s.dateSub}>{formatShortDate(ticket.arrivalDate)}</Text></View>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}><Ionicons name="ticket-outline" size={26} color={BRAND} /><Text style={[s.cardTitle, s.flex]}>Your e-ticket</Text></View>
            <View style={[s.row, { marginTop: 10, justifyContent: 'space-between' }]}>
              <View style={[s.flex, { alignItems: 'center', gap: 6 }]}>
                <Barcode value={ticket.ticketNo} />
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy booking ID" onPress={() => copy(ticket.bookingId)} activeOpacity={0.8}><Text style={s.bookingId} numberOfLines={1}>Booking ID {ticket.bookingId}</Text></TouchableOpacity>
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Download ticket" onPress={share} style={s.download}>
                <Ionicons name="download-outline" size={20} color={BRAND} /><Text style={s.downloadText}>Download{'\n'}Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}><Ionicons name="location-outline" size={26} color={BRAND} /><Text style={[s.cardTitle, s.flex]}>Boarding and dropping</Text></View>
            <View style={s.list}>
              <View style={s.point}><View style={s.pointIcon}><Ionicons name="log-in-outline" size={20} color={BRAND} /></View><View style={s.flex}><Text style={s.paxName}>{ticket.boarding.name}</Text><Text style={s.paxMeta}>{ticket.boarding.landmark} · {ticket.boarding.time}</Text></View></View>
              <View style={[s.point, s.paxBorder]}><View style={s.pointIcon}><Ionicons name="log-out-outline" size={20} color={BRAND} /></View><View style={s.flex}><Text style={s.paxName}>{ticket.dropping.name}</Text><Text style={s.paxMeta}>{ticket.dropping.landmark} · {ticket.dropping.time}</Text></View></View>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}><Ionicons name="person-outline" size={26} color={BRAND} /><Text style={[s.cardTitle, s.flex]}>Passengers ({ticket.passengers.length})</Text></View>
            <View style={s.list}>
              {ticket.passengers.map((p, i) => (
                <View key={p.seat} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{p.name.trim().charAt(0).toUpperCase()}</Text></View>
                  <View style={s.flex}><Text style={s.paxName} numberOfLines={1}>{p.name}</Text><Text style={s.paxMeta}>{p.age} yrs · {gender(p.gender)}</Text></View>
                  <View style={s.seatPill}><Text style={s.seatText}>Seat {p.seat}</Text></View>
                </View>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}><Ionicons name="receipt-outline" size={26} color={BRAND} /><Text style={[s.cardTitle, s.flex]}>Payment receipt</Text></View>
            <View style={{ marginTop: 8 }}><FareSummary fare={ticket.fare} couponCode={ticket.couponCode} /></View>
            <View style={s.txn}>
              <View style={s.flex}><Text style={s.txnLabel}>Transaction ID</Text><Text style={s.txnText} numberOfLines={1}>Txn {ticket.txnId}</Text></View>
              <View><Text style={s.txnLabel}>Paid on</Text><Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text></View>
            </View>
          </View>

          <BusNotice icon="mail-outline" title="E-ticket sent">A confirmation was sent to {ticket.contact.email}. Carry a valid photo ID that matches the passenger names and reach your boarding point 15 minutes early. This is a demo ticket and is not valid for travel.</BusNotice>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Add to calendar" onPress={calendar} />
            <Action icon="bookmarks-outline" label="My trips" onPress={() => done('/(tabs)/bookings')} />
          </View>

          <View style={s.cta}>
            <TouchableOpacity accessibilityRole="button" onPress={() => done('/home')} style={[s.ctaBtn, s.ctaOutline]}><Ionicons name="home-outline" size={20} color={BRAND} /><Text style={s.ctaOutlineText} numberOfLines={1}>Back to home</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => { resetBusBooking(); goTo(BUS_ROUTES.results); }} style={[s.ctaBtn, s.ctaSolid, { flex: 1.25 }]}><Text style={s.ctaSolidText} numberOfLines={1}>Book another bus</Text><Ionicons name="bus-outline" size={20} color={Colors.white} /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BusShell>
  );
}

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action} activeOpacity={0.85}>
      <View style={s.actionIcon}><Ionicons name={icon} size={20} color={BRAND} /></View>
      <Text style={s.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1FA463' },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 18, color: Colors.textDark },
  text: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 17, color: Colors.textLight, marginTop: 4 },
  refBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: '#E8F2EE' },
  refLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: BRAND },
  ref: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  logo: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  opName: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark },
  opMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  confirmed: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E3F0EA' },
  confirmedText: { fontFamily: 'Inter-ExtraBold', fontSize: 10, color: BRAND },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: '#F1F6F3' },
  endpoint: { maxWidth: '36%' },
  dateLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: BRAND },
  time: { fontFamily: 'Inter-ExtraBold', fontSize: 18, color: Colors.textDark, marginTop: 2 },
  station: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark, marginTop: 2 },
  dateSub: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight, marginTop: 1 },
  mid: { flex: 1, alignItems: 'center', gap: 4 },
  dur: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight },
  midLine: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'stretch' },
  rule: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  cardTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 50, overflow: 'hidden', maxWidth: '100%' },
  bookingId: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: Colors.textDark },
  download: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: '#E3F0EA' },
  downloadText: { fontFamily: 'Inter-ExtraBold', fontSize: 12, lineHeight: 16, color: BRAND },
  list: { marginTop: 8, marginLeft: 38 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pointIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4E8F78' },
  avatarText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
  paxName: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.textDark },
  paxMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  seatPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E3F0EA' },
  seatText: { fontFamily: 'Inter-ExtraBold', fontSize: 11, color: BRAND },
  txn: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 },
  txnLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight },
  txnText: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textDark, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginHorizontal: 10, marginBottom: 14 },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 16, backgroundColor: '#E8F2EE' },
  actionIcon: { alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 11, color: Colors.textDark, textAlign: 'center' },
  cta: { flexDirection: 'row', gap: 10, marginHorizontal: 10 },
  ctaBtn: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 25 },
  ctaOutline: { borderWidth: 1.5, borderColor: BRAND, backgroundColor: Colors.surface },
  ctaOutlineText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: BRAND },
  ctaSolid: { backgroundColor: BRAND },
  ctaSolidText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
});