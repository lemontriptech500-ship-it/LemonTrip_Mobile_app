import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageProgress, TypePill } from '@/components/packages/PackageUi';
import { Card, EmptyState, FlowScreen, Notice, Pill, PrimaryButton, SectionTitle, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { addDaysISO, countsLabel, formatLongDate, formatShortDate, inr } from '@/data/packages';
import { resetPackageBooking, usePackageBooking } from '@/utils/packageBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/** Decorative barcode derived from the voucher number (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value).split('').map((ch, i) => ({ w: 1 + ((ch.charCodeAt(0) + i) % 3), gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2) }));
  return <View style={s.barcode} accessible={false}>{bars.map((b, i) => <View key={i} style={{ width: b.w, height: 44, marginRight: b.gap, backgroundColor: Colors.primaryDark }} />)}</View>;
}

export default function PackageConfirmationScreen() {
  const { ticket } = usePackageBooking();
  const done = (path: string) => { resetPackageBooking(); replaceTo(path); };

  if (!ticket) {
    return <FlowScreen><ScrollView><ScreenHeader title="Confirmation" eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => replaceTo(PACKAGE_ROUTES.list)} /><EmptyState icon="ticket-outline" title="No confirmed booking yet" text="Complete a booking to see your voucher here." action={<PrimaryButton label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} /></ScrollView></FlowScreen>;
  }

  const summary = `LemonTrip holiday voucher\nBooking ${ticket.bookingId} · Voucher ${ticket.voucher}\n${ticket.title}\n${ticket.destination} · ${ticket.duration}\n${formatLongDate(ticket.startDate)} → ${formatLongDate(ticket.endDate)}\n${countsLabel(ticket.counts)}`;
  const share = () => void Share.share({ title: 'LemonTrip holiday booking', message: summary });
  const email = () => void Linking.openURL(`mailto:${ticket.contact.email}?subject=${encodeURIComponent(`Holiday voucher · ${ticket.bookingId}`)}&body=${encodeURIComponent(summary)}`);
  const compact = (iso: string) => iso.replace(/-/g, '');
  const calendar = () => void Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ticket.title)}&dates=${compact(ticket.startDate)}/${compact(addDaysISO(ticket.endDate, 1))}&details=${encodeURIComponent(`Booking ${ticket.bookingId} · Voucher ${ticket.voucher}`)}&location=${encodeURIComponent(ticket.destination)}`);

  return (
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ScreenHeader title="Booking confirmed" subtitle="Your holiday is booked. Pack your bags!" eyebrow="LEMONTRIP / HOLIDAYS" />
          <PackageProgress current={4} />

          <View style={s.hero}>
            <View style={s.check}><Ionicons name="checkmark" size={32} color={Colors.primaryDark} /></View>
            <Text style={s.heroTitle}>Payment successful</Text>
            <Text style={s.heroText}>{inr(ticket.fare.total)} paid via {ticket.payment.label}</Text>
            <View style={s.refBox}><Text style={s.refLabel}>BOOKING ID</Text><Text style={s.ref} selectable>{ticket.bookingId}</Text></View>
          </View>

          <View style={s.ticket}>
            {ticket.image ? <Image source={{ uri: ticket.image }} style={s.cover} /> : null}
            <View style={s.ticketTop}>
              <View style={{ flex: 1, minWidth: 0 }}><Text style={s.title} numberOfLines={2}>{ticket.title}</Text><Text style={s.meta}>{ticket.destination} · {ticket.duration}</Text></View>
              <Pill label="CONFIRMED" tone="good" icon="checkmark-circle" />
            </View>
            <View style={s.dates}>
              <View><Text style={s.dateLabel}>STARTS</Text><Text style={s.dateValue}>{formatShortDate(ticket.startDate)}</Text><Text style={s.dateSub}>{new Date(`${ticket.startDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long' })}</Text></View>
              <View style={s.mid}><Ionicons name="umbrella-outline" size={18} color={Colors.primary} /><View style={s.rule} /></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.dateLabel}>ENDS</Text><Text style={s.dateValue}>{formatShortDate(ticket.endDate)}</Text><Text style={s.dateSub}>{new Date(`${ticket.endDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long' })}</Text></View>
            </View>
            <Text style={s.who}>{countsLabel(ticket.counts)} · {ticket.rooms} room{ticket.rooms > 1 ? 's' : ''}</Text>
            <View style={s.perforation}><View style={[s.notch, { left: -10 }]} /><View style={s.dash} /><View style={[s.notch, { right: -10 }]} /></View>
            <View style={s.ticketBottom}>
              <Barcode value={ticket.voucher} />
              <Text style={s.voucher} selectable>Voucher {ticket.voucher}</Text>
            </View>
          </View>

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title="Who is travelling" />
            {ticket.travellers.map((t, i) => (
              <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={{ flex: 1, minWidth: 0 }}><Text style={s.paxName} numberOfLines={1}>{i + 1}. {t.name}</Text><Text style={s.paxMeta}>{t.age} yrs · {t.gender}{i === 0 ? ' · Lead traveller' : ''}</Text></View>
                <TypePill type={t.type} />
              </View>
            ))}
          </Card>

          {ticket.inclusions.length || ticket.hotels.length ? (
            <Card>
              <SectionTitle eyebrow="YOUR TRIP" title="What is included" />
              {ticket.hotels.map((h) => <View key={h} style={s.bullet}><Ionicons name="bed-outline" size={16} color={Colors.primary} /><Text style={s.bulletText}>{h}</Text></View>)}
              {ticket.inclusions.map((x) => <View key={x} style={s.bullet}><Ionicons name="checkmark-circle" size={16} color={Colors.success} /><Text style={s.bulletText}>{x}</Text></View>)}
            </Card>
          ) : null}

          <Card>
            <SectionTitle eyebrow="PAYMENT" title="Receipt" />
            <PackageFareSummary fare={ticket.fare} couponCode={ticket.couponCode} />
            <View style={s.txn}><Text style={s.txnText}>Txn {ticket.txnId}</Text><Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text></View>
          </Card>

          <Notice icon="mail-outline" title="Voucher sent">A confirmation was sent to {ticket.contact.email}. Our team will share final hotel and pick-up details before departure. This is a demo voucher and is not valid for travel.</Notice>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Calendar" onPress={calendar} />
            <Action icon="ticket-outline" label="My trips" onPress={() => done('/(tabs)/bookings')} />
          </View>

          <View style={s.cta}>
            <PrimaryButton label="Back to home" icon="home-outline" onPress={() => done('/(tabs)')} />
            <View style={{ height: 10 }} />
            <PrimaryButton variant="soft" label="Explore more packages" icon="umbrella-outline" onPress={() => { resetPackageBooking(); goTo(PACKAGE_ROUTES.list); }} />
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
  refBox: { alignItems: 'center', marginTop: 16, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.onDarkSubtle },
  refLabel: { ...Ui.eyebrow, color: Colors.onDarkMuted },
  ref: { fontFamily: 'Manrope', fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: 2, marginTop: 3 },
  ticket: { ...Ui.card, marginHorizontal: 20, marginBottom: 14, padding: 18, overflow: 'visible' },
  cover: { width: '100%', height: 130, borderRadius: 14, marginBottom: 14, backgroundColor: Colors.surfaceMuted },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: 'Manrope', fontSize: 16, lineHeight: 22, fontWeight: '800', color: Colors.textDark },
  meta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  dates: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 18 },
  dateLabel: { ...Ui.eyebrow, color: Colors.secondary },
  dateValue: { fontFamily: 'Manrope', fontSize: 24, fontWeight: '800', color: Colors.textDark, marginTop: 2 },
  dateSub: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 1 },
  mid: { flex: 1, alignItems: 'center', gap: 4 },
  rule: { alignSelf: 'stretch', height: 1, backgroundColor: Colors.borderStrong },
  who: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textDark, marginTop: 14 },
  perforation: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, height: 20 },
  dash: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  notch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  ticketBottom: { alignItems: 'center', gap: 8 },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 44, overflow: 'hidden', maxWidth: '100%' },
  voucher: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.5 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  paxName: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark },
  paxMeta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  bulletText: { flex: 1, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, color: Colors.textDark },
  txn: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  txnText: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  actionLabel: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.textDark },
  cta: { marginHorizontal: 20 },
});
