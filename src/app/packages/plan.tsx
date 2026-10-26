import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { PACKAGE_ROUTES, PackageFareSummary, PackageFooter, PackageHero, PackageProgress, PackageSummary, PackageTopBar, packageDetailsRoute } from '@/components/packages/PackageUi';
import { EmptyState, FlowScreen, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { getPackageGallery } from '@/data/packageImages';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { MAX_GUESTS, departureDates, formatLongDate, inr, minRooms, seatsLeft, totalTravellers } from '@/data/packages';
import { formatLocalizedDate } from '@/utils/intl';
import { currentPackageFare, setCounts, setDepartureDate, setRooms, usePackageBooking } from '@/utils/packageBookingStore';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const GREEN = '#103D30';
const MONTH = (iso: string) => formatLocalizedDate(iso, { month: 'short' });
const DAY = (iso: string) => formatLocalizedDate(iso, { day: 'numeric' });
const WEEKDAY = (iso: string) => formatLocalizedDate(iso, { weekday: 'short' });
const MONTH_YEAR = (iso: string) => formatLocalizedDate(iso, { month: 'long', year: 'numeric' });

/** Picks a fitting icon for an inclusion line. */
const inclusionIcon = (text: string): IconName => {
  const t = text.toLowerCase();
  if (/night|accommodation|hotel|stay|resort/.test(t)) return 'bed-outline';
  if (/breakfast|meal|dinner|lunch|food/.test(t)) return 'restaurant-outline';
  if (/transfer|sightseeing|vehicle|coach|car\b|transport|cab/.test(t)) return 'bus-outline';
  if (/flight|airfare|air\b/.test(t)) return 'airplane-outline';
  if (/tax|gst|charge|fee/.test(t)) return 'document-text-outline';
  return 'checkmark-circle-outline';
};

export default function PackagePlanScreen() {
  useAppLanguage();
  const { pkg, date, counts, rooms } = usePackageBooking();
  const derived = currentPackageFare();

  if (!pkg) {
    return (
      <FlowScreen>
        <PackageTopBar onBack={() => goBackOr(PACKAGE_ROUTES.list)} />
        <ScrollView><EmptyState icon="umbrella-outline" title="No package selected" text="Choose a holiday package to pick dates and travellers." action={<PrimaryButton variant="dark" label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} /></ScrollView>
      </FlowScreen>
    );
  }
  const back = () => goBackOr(packageDetailsRoute(pkg.id));
  const enquire = () => void Linking.openURL(`mailto:lemontripindia@gmail.com?subject=${encodeURIComponent(`Enquiry: ${pkg.title}`)}`);

  if (!derived) {
    return (
      <FlowScreen>
        <PackageTopBar onBack={back} />
        <ScrollView><EmptyState icon="pricetag-outline" title="Price on request" text="This package has no fixed online price yet. Send us an enquiry and we will share a quote." action={<PrimaryButton variant="dark" label="Enquire now" icon="mail-outline" onPress={enquire} />} /></ScrollView>
      </FlowScreen>
    );
  }
  const { fare, endDate } = derived;
  const guests = counts.adults + counts.children;
  const dates = departureDates();
  const travellers = totalTravellers(counts);
  const included = pkg.inclusions.slice(0, 4);

  return (
    <FlowScreen footer={<PackageFooter caption={`Total · ${travellers} traveller${travellers > 1 ? 's' : ''}`} amount={inr(fare.total)} estimateAmount={fare.total} label="Add traveller details" onPress={() => goTo(PACKAGE_ROUTES.travellers)} />}>
      <PackageTopBar onBack={back} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.page}>
        <View style={s.content}>
          <PackageHero title="Plan your trip" subtitle="Pick a departure date and travellers for your journey." image={getPackageGallery(pkg.id, pkg.title, pkg.destination, pkg.image)[0] ?? pkg.image} />
          <PackageProgress current={1} overlap />
          <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} rooms={rooms} compact onChange={() => replaceTo(PACKAGE_ROUTES.list)} />

          {/* ---------- departure ---------- */}
          <View style={s.card}>
            <Head icon="calendar-outline" eyebrow="DEPARTURE" title="Choose your start date" right={<Text style={s.month}>{MONTH_YEAR(date)}</Text>} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dates}>
              {dates.map((d) => {
                const on = d === date; const left = seatsLeft(pkg.id, d); const low = left <= 4;
                return (
                  <TouchableOpacity key={d} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${formatLongDate(d)}, ${left} seats left`} onPress={() => setDepartureDate(d)} style={[s.date, on && s.dateOn]}>
                    <Text style={[s.dateSmall, on && s.dateTextOn]}>{WEEKDAY(d).toUpperCase()}</Text>
                    <Text style={[s.dateDay, on && s.dateTextOn]}>{DAY(d)}</Text>
                    <Text style={[s.dateSmall, on && s.dateTextOn]}>{MONTH(d).toUpperCase()}</Text>
                    <Text style={[s.dateLeft, low && s.dateLeftLow, on && s.dateTextOn]}>{low ? `${left} left` : 'Open'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={s.range}>
              <Ionicons name="calendar-outline" size={16} color={GREEN} />
              <Text style={s.rangeText}>{formatLongDate(date)} → {formatLongDate(endDate)}<Text style={s.rangeMeta}> ({pkg.duration})</Text></Text>
            </View>
          </View>

          {/* ---------- travellers ---------- */}
          <View style={s.card}>
            <Head icon="people-outline" eyebrow="TRAVELLERS" title="Who is going?" />
            <View style={s.cols}>
              <Counter first label="Adults" hint={'12 years\nand above'} value={counts.adults} min={1} max={MAX_GUESTS - counts.children} onChange={(v) => setCounts({ adults: v })} />
              <Counter label="Children" hint={'2–11 years\n75% of adult price'} value={counts.children} min={0} max={MAX_GUESTS - counts.adults} onChange={(v) => setCounts({ children: v })} />
              <Counter label="Infants" hint={'Under 2 years\nFree, no separate bed'} value={counts.infants} min={0} max={Math.min(counts.adults, 4)} onChange={(v) => setCounts({ infants: v })} />
              <Counter label="Rooms" hint={'Twin / double\nsharing'} value={rooms} min={minRooms(counts)} max={Math.max(counts.adults, minRooms(counts))} onChange={setRooms} />
            </View>
            {guests >= MAX_GUESTS ? <Text style={s.limit}>For groups larger than {MAX_GUESTS}, please send an enquiry.</Text> : null}
          </View>

          {/* ---------- included ---------- */}
          {included.length ? (
            <View style={s.card}>
              <View style={s.head}>
                <View style={s.checkBadge}><Ionicons name="checkmark" size={20} color={Colors.white} /></View>
                <View style={s.flex}><Text style={s.eyebrow}>INCLUDED</Text><Text style={s.title}>What you get</Text></View>
              </View>
              <View style={s.grid}>
                {included.map((item) => (
                  <View key={item} style={s.gridItem}>
                    <Ionicons name={inclusionIcon(item)} size={20} color={GREEN} />
                    <Text style={s.gridText}>{item}</Text>
                  </View>
                ))}
              </View>
              {pkg.hotels.length ? <View style={s.stay}><Ionicons name="bed-outline" size={15} color={GREEN} /><Text style={s.stayText}>Stay: {pkg.hotels.slice(0, 2).join(' · ')}</Text></View> : null}
            </View>
          ) : null}

          {/* ---------- fare ---------- */}
          <View style={s.card}>
            <Head icon="document-text-outline" eyebrow="FARE" title="Price summary" />
            <View style={s.fare}><PackageFareSummary fare={fare} /></View>
          </View>

          <View style={s.notice}>
            <Ionicons name="information-circle-outline" size={20} color={GREEN} />
            <Text style={s.noticeText}>Prices are per person on twin sharing. Final itinerary and hotel details are shared in your booking voucher.</Text>
          </View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

/* ---------- pieces ---------- */

function Head({ icon, eyebrow, title, right }: { icon: IconName; eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <View style={s.head}>
      <Ionicons name={icon} size={28} color={GREEN} />
      <View style={s.flex}><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.title}>{title}</Text></View>
      {right}
    </View>
  );
}

function Counter({ label, hint, value, min, max, onChange, first }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void; first?: boolean }) {
  const atMin = value <= min; const atMax = value >= max;
  return (
    <View style={[s.col, !first && s.colBorder]}>
      <Text style={s.colLabel}>{label}</Text>
      <Text style={s.colHint}>{hint}</Text>
      <View style={s.counter}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Decrease ${label}`} disabled={atMin} onPress={() => onChange(value - 1)} style={[s.countBtn, atMin && s.countBtnOff]}><Ionicons name="remove" size={15} color={GREEN} /></TouchableOpacity>
        <Text style={s.countValue} accessibilityLabel={`${label}: ${value}`}>{value}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Increase ${label}`} disabled={atMax} onPress={() => onChange(value + 1)} style={[s.countBtn, atMax && s.countBtnOff]}><Ionicons name="add" size={15} color={GREEN} /></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  page: { paddingBottom: 20 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { fontFamily: 'Inter-SemiBold', fontSize: 10, letterSpacing: 1.6, color: GREEN },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 17, color: Colors.textDark, marginTop: 1 },
  month: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark },

  dates: { flexDirection: 'row', gap: 8, paddingTop: 14, paddingBottom: 2 },
  date: { width: 58, alignItems: 'center', paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#F4F8F6' },
  dateOn: { backgroundColor: GREEN, borderColor: GREEN },
  dateSmall: { fontFamily: 'Inter-SemiBold', fontSize: 10, letterSpacing: 0.6, color: Colors.textLight },
  dateDay: { fontFamily: 'Inter-ExtraBold', fontSize: 24, color: Colors.textDark, marginVertical: 2 },
  dateLeft: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#4A5A54', marginTop: 4 },
  dateLeftLow: { fontFamily: 'Inter-SemiBold', color: Colors.error },
  dateTextOn: { color: Colors.white },
  range: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#EEF4F1' },
  rangeText: { flex: 1, fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark },
  rangeMeta: { fontFamily: 'Inter-Regular', color: Colors.textLight },

  cols: { flexDirection: 'row', marginTop: 14 },
  col: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 3 },
  colBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  colLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 13, color: Colors.textDark },
  colHint: { fontFamily: 'Inter-Regular', fontSize: 10, lineHeight: 14, color: Colors.textLight, textAlign: 'center', marginTop: 4, minHeight: 28 },
  counter: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: 2, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderStrong },
  countBtn: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  countBtnOff: { opacity: 0.35 },
  countValue: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.textDark },
  limit: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight, marginTop: 10 },

  checkBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  gridItem: { width: '50%', flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, paddingRight: 10 },
  gridText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: Colors.textDark },
  stay: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  stayText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: Colors.textDark },

  fare: { marginTop: 10 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 18, backgroundColor: '#E3F0EA' },
  noticeText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16, color: Colors.textDark },
});