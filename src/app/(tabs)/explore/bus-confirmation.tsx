import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { FareSummary } from '@/components/buses/BusCards';
import { BRAND, BUS_DONE_BANNER, BUS_ROUTES, BusCardBox, BusHeading, BusNotice, BusShell, BusSteps, EmptyState, INTER, PrimaryButton, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatLongDate, formatShortDate, inr } from '@/data/buses';
import { resetBusBooking, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ImageBackground, Linking, ScrollView, Share, StyleSheet, View } from 'react-native';

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

  return (
    <BusShell onBack={() => replaceTo(BUS_ROUTES.results)}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <BusSteps current={4} />

          <View style={s.bannerWrap}>
            <ImageBackground source={BUS_DONE_BANNER} style={s.banner} imageStyle={s.bannerImage} resizeMode="cover">
              <View style={s.bannerCopy}>
                <Text style={s.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Payment successful</Text>
                <Text style={s.bannerText} numberOfLines={2}>{inr(ticket.fare.total)} paid via {ticket.payment.label}</Text>
                <View style={s.pnrBox}>
                  <View>
                    <Text style={s.pnrLabel}>TICKET NUMBER</Text>
                    <Text style={s.pnr} selectable>{ticket.ticketNo}</Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy ticket number" onPress={() => copy(ticket.ticketNo)} hitSlop={8}>
                    <Ionicons name="copy-outline" size={18} color={Colors.onDarkMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View style={s.ticket}>
            <View style={s.ticketTop}>
              <View style={s.logo}><Ionicons name="bus-outline" size={24} color={BRAND} /></View>
              <View style={{ flex: 1, minWidth: 0 }}><Text style={s.opName} numberOfLines={1}>{ticket.operator}</Text><Text style={s.opMeta} numberOfLines={1}>{ticket.busType}</Text></View>
              <View style={s.confirmed}><Ionicons name="checkmark-circle" size={14} color={Colors.secondary} /><Text style={s.confirmedText}>CONFIRMED</Text></View>
            </View>
            <View style={s.times}>
              <View style={s.endpoint}><Text style={s.time}>{ticket.departure}</Text><Text style={s.code}>{ticket.fromCode}</Text><Text style={s.station} numberOfLines={2}>{ticket.fromName}</Text><Text style={s.date}>{formatShortDate(ticket.date)}</Text></View>
              <View style={s.mid}><Text style={s.dur}>{ticket.duration}</Text><View style={s.midLine}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="bus" size={15} color={BRAND} /><View style={s.rule} /><View style={s.dotEnd} /></View></View>
              <View style={[s.endpoint, { alignItems: 'flex-end' }]}><Text style={s.time}>{ticket.arrival}</Text><Text style={s.code}>{ticket.toCode}</Text><Text style={[s.station, { textAlign: 'right' }]} numberOfLines={2}>{ticket.toName}</Text><Text style={s.date}>{formatShortDate(ticket.arrivalDate)}</Text></View>
            </View>
            <View style={s.perforation}><View style={[s.notch, { left: -27 }]} /><View style={s.dash} /><View style={[s.notch, { right: -27 }]} /></View>
            <View style={s.ticketBottom}>
              <Barcode value={ticket.ticketNo} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy booking ID" onPress={() => copy(ticket.bookingId)} style={s.bookingRow} activeOpacity={0.8}>
                <Text style={s.bookingId} numberOfLines={1}>Booking ID {ticket.bookingId}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <BusCardBox>
            <BusHeading eyebrow="PICK-UP & DROP" title="Boarding and dropping" />
            <View style={s.point}><View style={s.pointIcon}><Ionicons name="log-in-outline" size={20} color={BRAND} /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={s.paxName}>{ticket.boarding.name}</Text><Text style={s.paxMeta}>{ticket.boarding.landmark}</Text></View><Text style={s.pointTime}>{ticket.boarding.time}</Text></View>
            <View style={[s.point, s.paxBorder]}><View style={s.pointIcon}><Ionicons name="log-out-outline" size={20} color={BRAND} /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={s.paxName}>{ticket.dropping.name}</Text><Text style={s.paxMeta}>{ticket.dropping.landmark}</Text></View><Text style={s.pointTime}>{ticket.dropping.time}</Text></View>
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="TRAVELLERS" title="Passengers and seats" />
            {ticket.passengers.map((p, i) => (
              <View key={p.seat} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={s.avatar}><Text style={s.avatarText}>{p.name.trim().charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}><Text style={s.paxName} numberOfLines={1}>{i + 1}. {p.name}</Text><Text style={s.paxMeta}>{p.age} yrs · {p.gender}</Text></View>
                <View style={s.paxCol}><Text style={s.paxColLabel}>Seat</Text><Text style={s.paxColValue}>{p.seat}</Text></View>
              </View>
            ))}
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="PAYMENT" title="Receipt" />
            <FareSummary fare={ticket.fare} couponCode={ticket.couponCode} />
            <View style={s.txn}><Text style={s.txnText} numberOfLines={1}>Txn {ticket.txnId}</Text><Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString(getAppLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text></View>
          </BusCardBox>

          <BusNotice icon="mail-outline" title="E-ticket sent">A confirmation was sent to {ticket.contact.email}. Carry a valid photo ID that matches the passenger names and reach your boarding point 15 minutes early. This is a demo ticket and is not valid for travel.</BusNotice>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Calendar" onPress={calendar} />
          </View>

          <View style={s.cta}>
            <TouchableOpacity accessibilityRole="button" onPress={() => done('/(tabs)/bookings')} activeOpacity={0.85} style={s.primary}>
              <Text style={s.primaryText}>View my trips</Text>
              <Ionicons name="ticket-outline" size={20} color={BRAND} />
            </TouchableOpacity>
            <View style={s.secondaryRow}>
              <TouchableOpacity accessibilityRole="button" onPress={() => done('/home')} activeOpacity={0.85} style={s.secondary}>
                <Text style={s.secondaryText} numberOfLines={1}>Back to home</Text>
                <Ionicons name="home-outline" size={18} color={BRAND} />
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => { resetBusBooking(); goTo(BUS_ROUTES.results); }} activeOpacity={0.85} style={s.secondary}>
                <Text style={s.secondaryText} numberOfLines={1}>Book another bus</Text>
                <Ionicons name="bus-outline" size={18} color={BRAND} />
              </TouchableOpacity>
            </View>
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
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingTop: 14 },
  bannerWrap: { paddingHorizontal: 16, marginBottom: 14 },
  banner: { width: '100%', aspectRatio: 2.55, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: BRAND },
  bannerImage: { borderRadius: 22 },
  bannerCopy: { marginLeft: '29%', width: '44%' },
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.bodyLarge },
  bannerText: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.micro, marginTop: 2 },
  pnrBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.onDarkSubtle },
  pnrLabel: { fontFamily: INTER.semibold, fontSize: 8, letterSpacing: 0.5, color: Colors.onDarkMuted },
  pnr: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: Colors.white, letterSpacing: 1.5, marginTop: 1 },
  ticket: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, overflow: 'visible' },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  opName: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  opMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  confirmed: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E3EFE9' },
  confirmedText: { fontFamily: INTER.bold, fontSize: TextSize.micro, color: Colors.secondary },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  endpoint: { flex: 1, minWidth: 0 },
  time: { fontFamily: INTER.extrabold, fontSize: TextSize.displaySmall, color: BRAND },
  code: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND, marginTop: 4 },
  station: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 2 },
  date: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 2 },
  mid: { width: 84, alignItems: 'center', gap: 5 },
  dur: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  midLine: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1.5, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND },
  perforation: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, height: 20 },
  dash: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  notch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  ticketBottom: { alignItems: 'center', gap: 8 },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 44, overflow: 'hidden', maxWidth: '100%' },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  bookingId: { fontFamily: INTER.semibold, fontSize: TextSize.micro, color: Colors.textLight, flexShrink: 1 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  pointIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  pointTime: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: BRAND },
  paxName: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  paxMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  paxCol: { alignItems: 'flex-start', minWidth: 48 },
  paxColLabel: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight },
  paxColValue: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND, marginTop: 2 },
  txn: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  txnText: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 14 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDF3C4' },
  actionLabel: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  cta: { marginHorizontal: 16, gap: 10 },
  primary: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 27, backgroundColor: Colors.accent },
  primaryText: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  secondaryRow: { flexDirection: 'row', gap: 10 },
  secondary: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 24, backgroundColor: Colors.surfaceMuted },
  secondaryText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND, flexShrink: 1 },
});