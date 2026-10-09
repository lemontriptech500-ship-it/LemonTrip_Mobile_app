import { FareSummary } from '@/components/trains/TrainCards';
import { Card, EmptyState, FlowScreen, Notice, Pill, PrimaryButton, SectionTitle, TRAIN_ROUTES, TrainProgress, goTo, replaceTo } from '@/components/trains/TrainUi';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatLongDate, formatShortDate, inr } from '@/data/trains';
import { resetTrainBooking, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/** Decorative barcode derived from the PNR (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value).split('').map((ch, i) => ({ w: 1 + ((ch.charCodeAt(0) + i) % 3), gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2) }));
  return <View style={s.barcode} accessible={false}>{bars.map((b, i) => <View key={i} style={{ width: b.w, height: 44, marginRight: b.gap, backgroundColor: Colors.primaryDark }} />)}</View>;
}

const statusTone = (status: string) => status === 'CNF' ? 'good' : status.startsWith('RAC') ? 'warn' : 'bad';

export default function TrainConfirmationScreen() {
  const { ticket } = useTrainBooking();
  const done = (path: string) => { resetTrainBooking(); replaceTo(path); };

  if (!ticket) {
    return <FlowScreen><ScrollView><ScreenHeader title="Confirmation" eyebrow="LEMONTRIP / RAIL" onBack={() => replaceTo(TRAIN_ROUTES.results)} /><EmptyState icon="ticket-outline" title="No confirmed ticket yet" text="Complete a booking to see your e-ticket here." action={<PrimaryButton label="Search trains" onPress={() => replaceTo(TRAIN_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }

  const waitlisted = ticket.passengers.some((p) => p.status.startsWith('WL'));
  const summary = `LemonTrip e-ticket\nPNR ${ticket.pnr}\n${ticket.trainName} (${ticket.trainNumber})\n${ticket.fromName} → ${ticket.toName}\n${formatLongDate(ticket.date)} · ${ticket.departure} → ${ticket.arrival}\nClass ${ticket.classCode} · ${ticket.passengers.length} passenger(s)`;
  const share = () => void Share.share({ title: 'LemonTrip train ticket', message: summary });
  const email = () => void Linking.openURL(`mailto:${ticket.contact.email}?subject=${encodeURIComponent(`Train ticket · PNR ${ticket.pnr}`)}&body=${encodeURIComponent(summary)}`);
  const stamp = (iso: string, time: string) => `${iso.replace(/-/g, '')}T${time.replace(':', '')}00`;
  const calendar = () => void Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${ticket.trainName} · ${ticket.fromCode} → ${ticket.toCode}`)}&dates=${stamp(ticket.date, ticket.departure)}/${stamp(ticket.arrivalDate, ticket.arrival)}&details=${encodeURIComponent(`PNR ${ticket.pnr}`)}`);

  return (
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ScreenHeader title={waitlisted ? 'Booking received' : 'Booking confirmed'} subtitle={waitlisted ? 'Your seats are waitlisted. We will notify you if they confirm.' : 'Your e-ticket is ready. Have a safe journey!'} eyebrow="LEMONTRIP / RAIL" />
          <TrainProgress current={4} />

          <View style={s.hero}>
            <View style={s.check}><Ionicons name={waitlisted ? 'time' : 'checkmark'} size={32} color={Colors.primaryDark} /></View>
            <Text style={s.heroTitle}>{waitlisted ? 'Payment successful' : 'Payment successful'}</Text>
            <Text style={s.heroText}>{inr(ticket.fare.total)} paid via {ticket.payment.label}</Text>
            <View style={s.pnrBox}><Text style={s.pnrLabel}>PNR NUMBER</Text><Text style={s.pnr} selectable>{ticket.pnr}</Text></View>
          </View>

          <View style={s.ticket}>
            <View style={s.ticketTop}>
              <View style={{ flex: 1, minWidth: 0 }}><Text style={s.trainName} numberOfLines={1}>{ticket.trainName}</Text><Text style={s.trainMeta}>#{ticket.trainNumber} · {ticket.className} · {ticket.quota === 'TQ' ? 'Tatkal' : 'General'}</Text></View>
              <Pill label={waitlisted ? 'WAITLISTED' : 'CONFIRMED'} tone={waitlisted ? 'warn' : 'good'} icon={waitlisted ? 'time-outline' : 'checkmark-circle'} />
            </View>
            <View style={s.times}>
              <View><Text style={s.time}>{ticket.departure}</Text><Text style={s.code}>{ticket.fromCode}</Text><Text style={s.station} numberOfLines={2}>{ticket.fromName}</Text><Text style={s.date}>{formatShortDate(ticket.date)}</Text></View>
              <View style={s.mid}><Text style={s.dur}>{ticket.duration}</Text><View style={s.midLine}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="train" size={15} color={Colors.primary} /><View style={s.rule} /><View style={s.dotEnd} /></View></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.time}>{ticket.arrival}</Text><Text style={s.code}>{ticket.toCode}</Text><Text style={[s.station, { textAlign: 'right' }]} numberOfLines={2}>{ticket.toName}</Text><Text style={s.date}>{formatShortDate(ticket.arrivalDate)}</Text></View>
            </View>
            <View style={s.perforation}><View style={[s.notch, { left: -10 }]} /><View style={s.dash} /><View style={[s.notch, { right: -10 }]} /></View>
            <View style={s.ticketBottom}>
              <Barcode value={ticket.pnr} />
              <Text style={s.bookingId}>Booking ID {ticket.bookingId}</Text>
            </View>
          </View>

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title="Passengers & berths" />
            {ticket.passengers.map((p, i) => (
              <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={{ flex: 1, minWidth: 0 }}><Text style={s.paxName} numberOfLines={1}>{i + 1}. {p.name}</Text><Text style={s.paxMeta}>{p.age} yrs · {p.gender} · {p.seat}</Text></View>
                <Pill label={p.status} tone={statusTone(p.status)} />
              </View>
            ))}
          </Card>

          <Card>
            <SectionTitle eyebrow="PAYMENT" title="Receipt" />
            <FareSummary fare={ticket.fare} couponCode={ticket.couponCode} />
            <View style={s.txn}><Text style={s.txnText}>Txn {ticket.txnId}</Text><Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text></View>
          </Card>

          <Notice icon="mail-outline" title="E-ticket sent">A confirmation was sent to {ticket.contact.email}. Carry a valid photo ID that matches the passenger names. This is a demo ticket and is not valid for travel.</Notice>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Calendar" onPress={calendar} />
            <Action icon="ticket-outline" label="My trips" onPress={() => done('/(tabs)/bookings')} />
          </View>

          <View style={s.cta}>
            <PrimaryButton label="Back to home" icon="home-outline" onPress={() => done('/(tabs)')} />
            <View style={{ height: 10 }} />
            <PrimaryButton variant="soft" label="Book another train" icon="train-outline" onPress={() => { resetTrainBooking(); goTo(TRAIN_ROUTES.results); }} />
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
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  heroTitle: { fontFamily: 'Manrope', fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 12 },
  heroText: { fontFamily: 'Manrope', fontSize: 13, color: Colors.onDarkMuted, marginTop: 4, textAlign: 'center' },
  pnrBox: { alignItems: 'center', marginTop: 16, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.onDarkSubtle },
  pnrLabel: { ...Ui.eyebrow, color: Colors.onDarkMuted },
  pnr: { fontFamily: 'Manrope', fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: 3, marginTop: 3 },
  ticket: { ...Ui.card, marginHorizontal: 20, marginBottom: 14, padding: 18, overflow: 'visible' },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trainName: { fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', color: Colors.textDark },
  trainMeta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  time: { fontFamily: 'Manrope', fontSize: 26, fontWeight: '800', color: Colors.textDark },
  code: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.secondary, marginTop: 1 },
  station: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textDark, marginTop: 2, maxWidth: 110 },
  date: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 2 },
  mid: { flex: 1, alignItems: 'center', gap: 5 },
  dur: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textLight },
  midLine: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  perforation: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, height: 20 },
  dash: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  notch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  ticketBottom: { alignItems: 'center', gap: 8 },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 44, overflow: 'hidden', maxWidth: '100%' },
  bookingId: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.5 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  paxName: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark },
  paxMeta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  txn: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  txnText: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  actionLabel: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.textDark },
  cta: { marginHorizontal: 20 },
});
