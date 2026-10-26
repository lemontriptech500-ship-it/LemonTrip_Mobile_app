import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { BRAND, FLIGHT_ROUTES, FlightHeading, FlightShell, FlightSteps, INTER, formatPrice, formatTime, replaceTo } from '@/components/flights/FlightFlowUi';
import { getFlightBookingDraft, resetFlightBookingDraft } from '@/components/flights/flightBookingStore';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ImageBackground, Linking, ScrollView, Share, StyleSheet, View } from 'react-native';

// Banner artwork lives in assets/images (file name as saved in the project).
const BANNER = require('../../../../assets/images/Celebratory Green Payment Confirmation Banner.png');

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Decorative barcode derived from the PNR (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value + value).split('').map((ch, i) => ({
    w: 1 + ((ch.charCodeAt(0) + i) % 3),
    gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2),
  }));
  return (
    <View style={s.barcode} accessible={false}>
      {bars.map((b, i) => <View key={i} style={{ width: b.w, height: 44, marginRight: b.gap, backgroundColor: BRAND }} />)}
    </View>
  );
}

const longDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function FlightConfirmationScreen() {
  useAppLanguage();
  const { ticket } = getFlightBookingDraft();

  const done = (path: string) => {
    resetFlightBookingDraft();
    replaceTo(path);
  };

  if (!ticket) {
    return (
      <FlightShell onBack={() => replaceTo(FLIGHT_ROUTES.results)}>
        <ScrollView>
          <EmptyState
            icon="ticket-outline"
            title="No confirmed ticket yet"
            text="Complete a booking to see your e-ticket here."
            action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />}
          />
        </ScrollView>
      </FlightShell>
    );
  }

  const hours = Math.floor(ticket.durationMinutes / 60);
  const minutes = ticket.durationMinutes % 60;
  const summary = [
    'LemonTrip e-ticket',
    `PNR ${ticket.pnr}`,
    `${ticket.airline} ${ticket.flightNumber}`,
    `${ticket.fromCode} to ${ticket.toCode}`,
    `${longDate(ticket.date)} - ${formatTime(ticket.departureTime)} to ${formatTime(ticket.arrivalTime)}`,
    `${ticket.travellers.length} traveller(s)`,
  ].join('\n');

  // All-day calendar event on the travel date (Google Calendar treats the end date as exclusive).
  const calendar = () => {
    const day = new Date(`${ticket.date}T12:00:00`);
    if (Number.isNaN(day.getTime())) return;
    const next = new Date(day.getTime() + 86400000);
    const ymd = (v: Date) => `${v.getFullYear()}${String(v.getMonth() + 1).padStart(2, '0')}${String(v.getDate()).padStart(2, '0')}`;
    void Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${ticket.airline} ${ticket.flightNumber} ${ticket.fromCode} to ${ticket.toCode}`)}&dates=${ymd(day)}/${ymd(next)}&details=${encodeURIComponent(`PNR ${ticket.pnr}. Departs ${formatTime(ticket.departureTime)}.`)}`);
  };
  const share = () => void Share.share({ title: 'LemonTrip flight ticket', message: summary });
  const email = () => {
    if (!ticket.contactEmail) return;
    void Linking.openURL(`mailto:${ticket.contactEmail}?subject=${encodeURIComponent(`Flight ticket - PNR ${ticket.pnr}`)}&body=${encodeURIComponent(summary)}`);
  };

  const copy = (value: string) => void Clipboard.setStringAsync(value);
  const baggageAddOn = ticket.addOns.includes('Extra baggage');

  return (
    <FlightShell onBack={() => replaceTo(FLIGHT_ROUTES.results)}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <FlightSteps current={5} />

          <View style={s.bannerWrap}>
            <ImageBackground source={BANNER} style={s.banner} imageStyle={s.bannerImage} resizeMode="cover">
              <View style={s.bannerCopy}>
                <Text style={s.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Payment successful</Text>
                <Text style={s.bannerText} numberOfLines={2}>{formatPrice(ticket.total, ticket.currency)} paid via {ticket.payment.label}</Text>
                <View style={s.pnrBox}>
                  <View>
                    <Text style={s.pnrLabel}>BOOKING REFERENCE (PNR)</Text>
                    <Text style={s.pnr} selectable>{ticket.pnr}</Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy PNR" onPress={() => copy(ticket.pnr)} hitSlop={8}>
                    <Ionicons name="copy-outline" size={18} color={Colors.onDarkMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View style={s.ticket}>
            <View style={s.ticketTop}>
              <View style={s.logo}><Ionicons name="airplane-outline" size={22} color={BRAND} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.airline} numberOfLines={1}>{ticket.airline}</Text>
                <Text style={s.airlineMeta} numberOfLines={1}>{ticket.flightNumber} · {ticket.fareName}</Text>
              </View>
              <View style={s.confirmed}><Ionicons name="checkmark-circle" size={14} color={Colors.secondary} /><Text style={s.confirmedText}>CONFIRMED</Text></View>
            </View>
            <View style={s.times}>
              <View style={s.endpoint}>
                <Text style={s.time}>{formatTime(ticket.departureTime)}</Text>
                <Text style={s.code}>{ticket.fromCode}</Text>
                <Text style={s.date}>{longDate(ticket.date)}</Text>
              </View>
              <View style={s.mid}>
                <Text style={s.dur}>{hours}h {minutes}m</Text>
                <View style={s.midLine}>
                  <View style={s.dotEnd} /><View style={s.rule} />
                  <Ionicons name="airplane" size={15} color={BRAND} />
                  <View style={s.rule} /><View style={s.dotEnd} />
                </View>
                <Text style={s.dur}>{ticket.stops === 0 ? 'Nonstop' : `${ticket.stops} stop`}</Text>
              </View>
              <View style={[s.endpoint, { alignItems: 'flex-end' }]}>
                <Text style={s.time}>{formatTime(ticket.arrivalTime)}</Text>
                <Text style={s.code}>{ticket.toCode}</Text>
                <Text style={s.date}>{longDate(ticket.date)}</Text>
              </View>
            </View>
            <View style={s.perforation}>
              <View style={[s.notch, { left: -27 }]} />
              <View style={s.dash} />
              <View style={[s.notch, { right: -27 }]} />
            </View>
            <View style={s.ticketBottom}>
              <Barcode value={ticket.pnr} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy booking ID" onPress={() => copy(ticket.bookingId)} style={s.bookingRow} activeOpacity={0.8}>
                <Text style={s.bookingId} numberOfLines={1}>Booking ID {ticket.bookingId}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <FlightHeading eyebrow="TRAVELLERS" title="Passengers and seats" />
            {ticket.travellers.map((t, i) => {
              const name = `${t.firstName} ${t.lastName}`.trim();
              return (
                <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.paxName} numberOfLines={1}>{i + 1}. {name}</Text>
                    <Text style={s.paxMeta}>{t.gender || 'Traveller'}{t.dob ? ` · ${t.dob}` : ''}</Text>
                  </View>
                  <View style={s.paxCol}>
                    <Text style={s.paxColLabel}>Seat</Text>
                    <Text style={s.paxColValue}>{ticket.seats[i] ?? '--'}</Text>
                  </View>
                  {baggageAddOn ? (
                    <View style={s.paxCol}>
                      <Text style={s.paxColLabel}>Baggage</Text>
                      <Text style={s.paxColValue}>+ Extra</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
            {!ticket.seats.length ? <View style={s.seatNote}><Ionicons name="information-circle-outline" size={16} color={BRAND} /><Text style={s.seatNoteText}>Seat at check-in</Text></View> : null}
            {ticket.addOns.length ? <Text style={s.addOnText}>Add-ons: {ticket.addOns.join(', ')}</Text> : null}
          </View>

          <View style={s.card}>
            <FlightHeading eyebrow="PAYMENT" title="Receipt" />
            <Row label={`Fare (${ticket.fareName})`} value={formatPrice(ticket.fareTotal, ticket.currency)} />
            {ticket.seatTotal > 0 ? <Row label="Seats" value={formatPrice(ticket.seatTotal, ticket.currency)} /> : null}
            {ticket.addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(ticket.addOnTotal, ticket.currency)} /> : null}
            {ticket.discount > 0 ? <Row label={`Coupon ${ticket.couponCode ?? ''}`.trim()} value={`− ${formatPrice(ticket.discount, ticket.currency)}`} good /> : null}
            <View style={s.divider} />
            <Row label="Total paid" value={formatPrice(ticket.total, ticket.currency)} bold />
            <View style={s.txn}>
              <Text style={s.txnText} numberOfLines={1}>Txn {ticket.txnId}</Text>
              <Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString(getAppLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>

          <View style={s.notice}>
            <Ionicons name="mail-outline" size={22} color={Colors.textLight} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.noticeTitle}>E-ticket sent</Text>
              <Text style={s.noticeText}>A confirmation was sent to {ticket.contactEmail}. Carry a valid photo ID that matches the traveller names. This is a demo ticket and is not valid for travel.</Text>
            </View>
          </View>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Calendar" onPress={calendar} />
          </View>

          <View style={s.cta}>
            <TouchableOpacity accessibilityRole="button" onPress={() => done('/(tabs)/bookings')} activeOpacity={0.85} style={s.primary}>
              <Text style={s.primaryText}>View my trips</Text>
              <Ionicons name="ticket-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={s.secondaryRow}>
              <TouchableOpacity accessibilityRole="button" onPress={() => done('/home')} activeOpacity={0.85} style={s.secondary}>
                <Text style={s.secondaryText} numberOfLines={1}>Back to home</Text>
                <Ionicons name="home-outline" size={18} color={BRAND} />
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => done(FLIGHT_ROUTES.results)} activeOpacity={0.85} style={s.secondary}>
                <Text style={s.secondaryText} numberOfLines={1}>Book another flight</Text>
                <Ionicons name="airplane-outline" size={18} color={BRAND} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </FlightShell>
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

function Row({ label, value, bold, good }: { label: string; value: string; bold?: boolean; good?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && s.rowBold]} numberOfLines={2}>{label}</Text>
      <Text style={[s.rowValue, bold && s.rowBold, good && { color: Colors.secondary }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingTop: 14 },
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  bannerWrap: { paddingHorizontal: 16, marginBottom: 14 },
  banner: { width: '100%', aspectRatio: 2.55, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: BRAND },
  bannerImage: { borderRadius: 22 },
  bannerCopy: { marginLeft: '29%', width: '44%' },
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.bodyLarge },
  bannerText: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.micro, marginTop: 2 },
  pnrBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.onDarkSubtle },
  pnrLabel: { fontFamily: INTER.semibold, fontSize: 8, letterSpacing: 0.5, color: Colors.onDarkMuted },
  pnr: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: Colors.white, letterSpacing: 2, marginTop: 1 },
  ticket: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, overflow: 'visible' },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  airline: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  airlineMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  confirmed: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E3EFE9' },
  confirmedText: { fontFamily: INTER.bold, fontSize: TextSize.micro, color: Colors.secondary },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  endpoint: { minWidth: 84 },
  time: { fontFamily: INTER.extrabold, fontSize: TextSize.displaySmall, color: BRAND },
  code: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND, marginTop: 4 },
  date: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 2 },
  mid: { flex: 1, alignItems: 'center', gap: 5 },
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
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#103D30' },
  avatarText: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: Colors.white },
  paxName: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  paxMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  paxCol: { alignItems: 'flex-start', minWidth: 52 },
  paxColLabel: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight },
  paxColValue: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND, marginTop: 2 },
  seatNote: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#E3EFE9' },
  seatNoteText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND },
  addOnText: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 5 },
  rowLabel: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  rowValue: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND, textAlign: 'right' },
  rowBold: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  txn: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  txnText: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, flexShrink: 1 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  noticeText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 14 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  actionLabel: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  cta: { marginHorizontal: 16, gap: 10 },
  primary: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 27, backgroundColor: '#103D30' },
  primaryText: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  secondaryRow: { flexDirection: 'row', gap: 10 },
  secondary: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 24, backgroundColor: Colors.surfaceMuted },
  secondaryText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND, flexShrink: 1 },
});