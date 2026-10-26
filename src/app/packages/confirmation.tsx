import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageHero, PackageProgress, PackageTopBar } from '@/components/packages/PackageUi';
import { EmptyState, FlowScreen, PrimaryButton, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { getPackageGallery } from '@/data/packageImages';
import { addDaysISO, countsLabel, formatLongDate, formatShortDate, inr } from '@/data/packages';
import { resetPackageBooking, usePackageBooking } from '@/utils/packageBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, ScrollView, Share, StyleSheet, View } from 'react-native';

/** Decorative barcode derived from the voucher number (demo only, not scannable). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value).split('').map((ch, i) => ({ w: 1 + ((ch.charCodeAt(0) + i) % 3), gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2) }));
  return <View style={s.barcode} accessible={false}>{bars.map((b, i) => <View key={i} style={{ width: b.w, height: 50, marginRight: b.gap, backgroundColor: Colors.primaryDark }} />)}</View>;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const GREEN = '#103D30';

export default function PackageConfirmationScreen() {
  useAppLanguage();
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

  const cover = getPackageGallery(ticket.packageId, ticket.title, ticket.destination, ticket.image)[0] ?? ticket.image;
  const day = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(getAppLocale(), { weekday: 'long' });
  const gender = (g: string) => (g === 'M' ? 'Male' : g === 'F' ? 'Female' : g === 'O' ? 'Other' : g);
  const copyId = () => void Share.share({ message: ticket.bookingId });
  const included: { icon: IconName; lines: [string, string] }[] = [
    { icon: 'bed-outline', lines: ['Hotel & room', 'as confirmed'] },
    { icon: 'restaurant-outline', lines: ['Breakfast', 'as stated'] },
    { icon: 'car-outline', lines: ['Selected transfers', 'and sightseeing'] },
    { icon: 'document-text-outline', lines: ['As per', 'final itinerary'] },
  ];

  return (
    <FlowScreen>
      <PackageTopBar onBack={() => replaceTo(PACKAGE_ROUTES.list)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <PackageHero title="Booking confirmed" subtitle="Your holiday is booked. Pack your bags!" image={cover} />
          <PackageProgress current={5} overlap />

          <View style={s.card}>
            <View style={s.row}>
              <View style={s.check}><Ionicons name="checkmark" size={34} color={Colors.white} /></View>
              <View style={s.flex}>
                <Text style={s.title}>Payment successful</Text>
                <Text style={s.text}>Your booking has been confirmed. A confirmation voucher has been sent to your email.</Text>
              </View>
            </View>
            <View style={s.refBox}>
              <View style={s.flex}><Text style={s.refLabel}>BOOKING ID</Text><Text style={s.ref} selectable numberOfLines={1} adjustsFontSizeToFit>{ticket.bookingId}</Text></View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy booking ID" onPress={copyId} hitSlop={10}><Ionicons name="copy-outline" size={22} color={GREEN} /></TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              {ticket.image ? <Image source={{ uri: ticket.image }} style={s.thumb} /> : null}
              <View style={s.flex}>
                <View style={s.row}>
                  <View style={[s.row, s.flex, { gap: 4 }]}><Ionicons name="location-outline" size={13} color={GREEN} /><Text style={s.place} numberOfLines={1}>{ticket.destination}</Text></View>
                  <View style={s.confirmed}><Ionicons name="checkmark-circle" size={14} color={GREEN} /><Text style={s.confirmedText}>CONFIRMED</Text></View>
                </View>
                <Text style={s.pkgTitle} numberOfLines={2}>{ticket.title}</Text>
                <View style={s.metaRow}><Ionicons name="calendar-outline" size={13} color={Colors.textLight} /><Text style={s.meta} numberOfLines={1}>{ticket.duration}</Text></View>
                <View style={s.metaRow}><Ionicons name="people-outline" size={13} color={Colors.textLight} /><Text style={s.meta} numberOfLines={1}>{countsLabel(ticket.counts).replace(/\b\w/g, (c) => c.toUpperCase())} · {ticket.rooms} Room{ticket.rooms > 1 ? 's' : ''}</Text></View>
              </View>
            </View>
            <View style={s.dates}>
              <View><Text style={s.dateLabel}>STARTS</Text><Text style={s.dateValue}>{formatShortDate(ticket.startDate)}</Text><Text style={s.dateSub}>{day(ticket.startDate)}</Text></View>
              <View style={s.mid}><View style={s.rule} /><Ionicons name="airplane-outline" size={20} color={GREEN} /><View style={s.rule} /></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.dateLabel}>ENDS</Text><Text style={s.dateValue}>{formatShortDate(ticket.endDate)}</Text><Text style={s.dateSub}>{day(ticket.endDate)}</Text></View>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              <Ionicons name="ticket-outline" size={26} color={GREEN} />
              <Text style={[s.cardTitle, s.flex]}>Your voucher</Text>
            </View>
            <View style={[s.row, { marginTop: 10, justifyContent: 'space-between' }]}>
              <View style={[s.flex, { alignItems: 'center', gap: 6 }]}>
                <Barcode value={ticket.voucher} />
                <Text style={s.voucher} selectable>Voucher {ticket.voucher}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Download voucher" onPress={share} style={s.download}>
                <Ionicons name="download-outline" size={20} color={GREEN} /><Text style={s.downloadText}>Download{'\n'}Voucher</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              <Ionicons name="person-outline" size={26} color={GREEN} />
              <Text style={[s.cardTitle, s.flex]}>Travellers ({ticket.travellers.length})</Text>
              <TouchableOpacity accessibilityRole="button" onPress={share} style={s.pill}><Text style={s.pillText}>View details</Text></TouchableOpacity>
            </View>
            <View style={s.paxList}>
              {ticket.travellers.map((tr, i) => (
                <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{tr.name.trim().charAt(0).toUpperCase()}</Text></View>
                  <View style={s.flex}><Text style={s.paxName} numberOfLines={1}>{tr.name}</Text><Text style={s.paxMeta}>{tr.age} yrs · {gender(tr.gender)}{i === 0 ? ' · Lead traveller' : ''}</Text></View>
                </View>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              <Ionicons name="list-outline" size={26} color={GREEN} />
              <Text style={[s.cardTitle, s.flex]}>What is included</Text>
              <TouchableOpacity accessibilityRole="button" onPress={share} style={s.pill}><Text style={s.pillText}>View itinerary</Text></TouchableOpacity>
            </View>
            <View style={s.included}>
              {included.map((x, i) => (
                <View key={x.icon} style={[s.inc, i > 0 && s.incBorder]}>
                  <Ionicons name={x.icon} size={22} color={Colors.textDark} />
                  <Text style={s.incText}>{x.lines[0]}{'\n'}{x.lines[1]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <View style={s.row}>
              <Ionicons name="receipt-outline" size={26} color={GREEN} />
              <Text style={[s.cardTitle, s.flex]}>Payment receipt</Text>
              <TouchableOpacity accessibilityRole="button" onPress={share} style={s.pill}><Text style={s.pillText}>View invoice</Text></TouchableOpacity>
            </View>
            <View style={{ marginTop: 8 }}><PackageFareSummary fare={ticket.fare} couponCode={ticket.couponCode} /></View>
            <View style={s.txn}>
              <View><Text style={s.txnLabel}>Transaction ID</Text><Text style={s.txnText}>Txn {ticket.txnId}</Text></View>
              <View><Text style={s.txnLabel}>Paid on</Text><Text style={s.txnText}>{new Date(ticket.bookedAt).toLocaleString(getAppLocale(), { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text></View>
            </View>
          </View>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action icon="mail-outline" label="Email" onPress={email} />
            <Action icon="calendar-outline" label="Add to calendar" onPress={calendar} />
            <Action icon="bookmarks-outline" label="My trips" onPress={() => done('/(tabs)/bookings')} />
          </View>

          <View style={s.cta}>
            <TouchableOpacity accessibilityRole="button" onPress={() => done('/home')} style={[s.ctaBtn, s.ctaOutline]}><Ionicons name="home-outline" size={20} color={GREEN} /><Text style={s.ctaOutlineText}>Back to home</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => { resetPackageBooking(); goTo(PACKAGE_ROUTES.list); }} style={[s.ctaBtn, s.ctaSolid, { flex: 1.25 }]}><Text style={s.ctaSolidText}>Explore more packages</Text><Ionicons name="umbrella-outline" size={20} color={Colors.white} /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Action({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action}><View style={s.actionIcon}><Ionicons name={icon} size={20} color={GREEN} /></View><Text style={s.actionLabel}>{label}</Text></TouchableOpacity>;
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
  refLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: GREEN },
  ref: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  thumb: { width: 88, height: 96, borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  place: { flexShrink: 1, fontFamily: 'Inter-Regular', fontSize: 12, color: GREEN },
  confirmed: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E3F0EA' },
  confirmedText: { fontFamily: 'Inter-ExtraBold', fontSize: 10, color: GREEN },
  pkgTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 17, lineHeight: 21, color: Colors.textDark, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight },
  dates: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: '#F1F6F3' },
  dateLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: GREEN },
  dateValue: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  dateSub: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight, marginTop: 1 },
  mid: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  rule: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  cardTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 50, overflow: 'hidden', maxWidth: '100%' },
  voucher: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark },
  download: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: '#E3F0EA' },
  downloadText: { fontFamily: 'Inter-ExtraBold', fontSize: 12, lineHeight: 16, color: GREEN },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#E3F0EA' },
  pillText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: GREEN },
  paxList: { marginTop: 8, marginLeft: 38 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4E8F78' },
  avatarText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
  paxName: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.textDark },
  paxMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  included: { flexDirection: 'row', marginTop: 12 },
  inc: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  incBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  incText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 10, lineHeight: 14, color: Colors.textDark },
  txn: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 },
  txnLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight },
  txnText: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textDark, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginHorizontal: 10, marginBottom: 14 },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 16, backgroundColor: '#E8F2EE' },
  actionIcon: { alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 11, color: Colors.textDark, textAlign: 'center' },
  cta: { flexDirection: 'row', gap: 10, marginHorizontal: 10 },
  ctaBtn: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 25 },
  ctaOutline: { borderWidth: 1.5, borderColor: GREEN, backgroundColor: Colors.surface },
  ctaOutlineText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: GREEN },
  ctaSolid: { backgroundColor: GREEN },
  ctaSolidText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
});