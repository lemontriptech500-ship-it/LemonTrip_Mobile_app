import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
﻿import { ScreenHeader } from '@/components/ScreenHeader';
import { FlightProgress, formatPrice, formatTime } from '@/components/flights/FlightFlowUi';
import { getFlightBookingDraft, resetFlightBookingDraft } from '@/components/flights/flightBookingStore';
import { Card, EmptyState, FlowScreen, Notice, Pill, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Linking, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';

/** Decorative barcode derived from the PNR (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value + value).split('').map((ch, i) => ({
    w: 1 + ((ch.charCodeAt(0) + i) % 3),
    gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2),
  }));
  return (
    <View style={s.barcode} accessible={false}>
      {bars.map((b, i) => <View key={i} style={{ width: b.w, height: 44, marginRight: b.gap, backgroundColor: Colors.primaryDark }} />)}
    </View>
  );
}

const longDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function FlightConfirmationScreen() {
  const { ticket } = getFlightBookingDraft();

  const done = (path: string) => {
    resetFlightBookingDraft();
    router.replace(path as never);
  };

  if (!ticket) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Confirmation" eyebrow="LEMONTRIP / FLIGHTS" onBack={() => router.replace('/(tabs)/explore/flights' as never)} />
          <EmptyState
            icon="ticket-outline"
            title="No confirmed ticket yet"
            text="Complete a booking to see your e-ticket here."
            action={<PrimaryButton label="Search flights" onPress={() => router.replace('/(tabs)/explore/flights' as never)} />}
          />
        </ScrollView>
      </FlowScreen>
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

  const share = () => void Share.share({ title: 'LemonTrip flight ticket', message: summary });
  const email = () => {
    if (!ticket.contactEmail) return;
    void Linking.openURL(`mailto:${ticket.contactEmail}?subject=${encodeURIComponent(`Flight ticket - PNR ${ticket.pnr}`)}&body=${encodeURIComponent(summary)}`);
  };

  return (
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ScreenHeader title="Booking confirmed" subtitle="Your e-ticket is ready. Have a safe flight!" eyebrow="LEMONTRIP / FLIGHTS" />
          <FlightProgress current={4} />

          <View style={s.hero}>
            <View style={s.check}><Ionicons name="checkmark" size={32} color={Colors.primaryDark} /></View>
            <Text style={s.heroTitle}>Payment successful</Text>
            <Text style={s.heroText}>{formatPrice(ticket.total, ticket.currency)} paid via {ticket.payment.label}</Text>
            <View style={s.pnrBox}>
              <Text style={s.pnrLabel}>BOOKING REFERENCE (PNR)</Text>
              <Text style={s.pnr} selectable>{ticket.pnr}</Text>
            </View>
          </View>

          <View style={s.ticket}>
            <View style={s.ticketTop}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.airline} numberOfLines={1}>{ticket.airline}</Text>
                <Text style={s.airlineMeta}>{ticket.flightNumber} - {ticket.fareName}</Text>
              </View>
              <Pill label="CONFIRMED" tone="good" icon="checkmark-circle" />
            </View>
            <View style={s.times}>
              <View>
                <Text style={s.time}>{formatTime(ticket.departureTime)}</Text>
                <Text style={s.code}>{ticket.fromCode}</Text>
                <Text style={s.date}>{longDate(ticket.date)}</Text>
              </View>
              <View style={s.mid}>
                <Text style={s.dur}>{hours}h {minutes}m - {ticket.stops === 0 ? 'Nonstop' : `${ticket.stops} stop`}</Text>
                <View style={s.midLine}>
                  <View style={s.dotEnd} /><View style={s.rule} />
                  <Ionicons name="airplane" size={15} color={Colors.primary} />
                  <View style={s.rule} /><View style={s.dotEnd} />
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.time}>{formatTime(ticket.arrivalTime)}</Text>
                <Text style={s.code}>{ticket.toCode}</Text>
                <Text style={s.date}>{longDate(ticket.date)}</Text>
              </View>
            </View>
            <View style={s.perforation}>
              <View style={[s.notch, { left: -10 }]} />
              <View style={s.dash} />
              <View style={[s.notch, { right: -10 }]} />
            </View>
            <View style={s.ticketBottom}>
              <Barcode value={ticket.pnr} />
              <Text style={s.bookingId}>Booking ID {ticket.bookingId}</Text>
            </View>
          </View>

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title="Passengers and seats" />
            {ticket.travellers.map((t, i) => (
              <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.paxName} numberOfLines={1}>{i + 1}. {`${t.firstName} ${t.lastName}`.trim()}</Text>
                  <Text style={s.paxMeta}>{t.gender || 'Traveller'}{t.dob ? ` - ${t.dob}` : ''}</Text>
                </View>
                <Pill label={ticket.seats[i] ? `Seat ${ticket.seats[i]}` : 'Seat at check-in'} tone="neutral" />
              </View>
            ))}
            {ticket.addOns.length ? <Text style={s.addOnText}>Add-ons: {ticket.addOns.join(', ')}</Text> : null}
          </Card>

          <Card>
            <SectionTitle eyebrow="PAYMENT" title="Receipt" />
            <Row label={`Fare (${ticket.fareName})`} value={formatPrice(ticket.fareTotal, ticket.currency)} />
            {ticket.seatTotal > 0 ? <Row label="Seats" value={formatPrice(ticket.seatTotal, ticket.currency)} /> : null}
            {ticket.addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(ticket.addOnTotal, ticket.currency)} /> : null}
            <Row label="Total paid" value={formatPrice(ticket.total, ticket.currency)} bold />
            <View style={s.txn}>
              <Text style={s.txnText}>Txn {ticket.txnId}</Text>
              <Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </Card>

          <Notice icon="mail-outline" title="E-ticket sent">
            A confirmation was sent to {ticket.contactEmail}. Carry a valid photo ID that matches the traveller names. This is a demo ticket and is not valid for travel.
          </Notice>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="ticket-outline" label="My trips" onPress={() => done('/(tabs)/bookings')} />
          </View>

          <View style={s.cta}>
            <PrimaryButton label="Back to home" icon="home-outline" onPress={() => done('/(tabs)')} />
            <View style={{ height: 10 }} />
            <PrimaryButton variant="soft" label="Book another flight" icon="airplane-outline" onPress={() => done('/(tabs)/explore/flights')} />
          </View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Action({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action}>
      <View style={s.actionIcon}><Ionicons name={icon} size={19} color={Colors.primary} /></View>
      <Text style={s.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { alignItems: 'center', marginHorizontal: 20, marginBottom: 14, padding: 22, borderRadius: 24, backgroundColor: Colors.primaryDark },
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  heroTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.white, marginTop: 12 },
  heroText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.onDarkMuted, marginTop: 4, textAlign: 'center' },
  pnrBox: { alignItems: 'center', marginTop: 16, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.onDarkSubtle },
  pnrLabel: { ...Ui.eyebrow, color: Colors.onDarkMuted },
  pnr: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.white, letterSpacing: 3, marginTop: 3 },
  ticket: { ...Ui.card, marginHorizontal: 20, marginBottom: 14, padding: 18, overflow: 'visible' },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  airline: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  airlineMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  time: { fontFamily: FontFamily.sans, fontSize: TextSize.display, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  code: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary, marginTop: 1 },
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
  addOnText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 8 },
  txn: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  txnText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  actionLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  cta: { marginHorizontal: 20 },
});
