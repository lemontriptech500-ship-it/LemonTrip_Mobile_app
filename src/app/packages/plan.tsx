import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageProgress, PackageSummary, Stepper, packageDetailsRoute } from '@/components/packages/PackageUi';
import { Card, EmptyState, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { MAX_GUESTS, departureDates, formatLongDate, inr, minRooms, seatsLeft, totalTravellers } from '@/data/packages';
import { currentPackageFare, setCounts, setDepartureDate, setRooms, usePackageBooking } from '@/utils/packageBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const MONTH = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'short' });
const DAY = (iso: string) => new Date(`${iso}T00:00:00`).getDate();
const WEEKDAY = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' });

export default function PackagePlanScreen() {
  const { pkg, date, counts, rooms } = usePackageBooking();
  const derived = currentPackageFare();

  if (!pkg) {
    return <FlowScreen><ScrollView><ScreenHeader title="Plan your trip" eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => goBackOr(PACKAGE_ROUTES.list)} /><EmptyState icon="umbrella-outline" title="No package selected" text="Choose a holiday package to pick dates and travellers." action={<PrimaryButton label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} /></ScrollView></FlowScreen>;
  }
  const back = () => goBackOr(packageDetailsRoute(pkg.id));
  const enquire = () => void Linking.openURL(`mailto:lemontripindia@gmail.com?subject=${encodeURIComponent(`Enquiry: ${pkg.title}`)}`);

  if (!derived) {
    return <FlowScreen><ScrollView><ScreenHeader title="Plan your trip" eyebrow="LEMONTRIP / HOLIDAYS" onBack={back} /><EmptyState icon="pricetag-outline" title="Price on request" text="This package has no fixed online price yet. Send us an enquiry and we will share a quote." action={<PrimaryButton label="Enquire now" icon="mail-outline" onPress={enquire} />} /></ScrollView></FlowScreen>;
  }
  const { fare, endDate } = derived;
  const guests = counts.adults + counts.children;
  const dates = departureDates();

  return (
    <FlowScreen footer={<FooterBar caption={`Total · ${totalTravellers(counts)} traveller${totalTravellers(counts) > 1 ? 's' : ''}`} amount={inr(fare.total)} action={<PrimaryButton label="Add traveller details" icon="arrow-forward" onPress={() => goTo(PACKAGE_ROUTES.travellers)} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title="Plan your trip" subtitle="Pick a departure and who is travelling." eyebrow="LEMONTRIP / HOLIDAYS" onBack={back} />
          <PackageProgress current={0} />
          <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} />

          <Card>
            <SectionTitle eyebrow="DEPARTURE" title="Choose your start date" right={<Pill label={`${inr(pkg.unitPrice)} / adult`} tone="brand" />} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dates}>
              {dates.map((d) => {
                const on = d === date; const left = seatsLeft(pkg.id, d);
                return (
                  <TouchableOpacity key={d} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${formatLongDate(d)}, ${left} seats left`} onPress={() => setDepartureDate(d)} style={[s.date, on && s.dateOn]}>
                    <Text style={[s.dateWeek, on && s.dateTextOn]}>{WEEKDAY(d).toUpperCase()}</Text>
                    <Text style={[s.dateDay, on && s.dateTextOn]}>{DAY(d)}</Text>
                    <Text style={[s.dateWeek, on && s.dateTextOn]}>{MONTH(d).toUpperCase()}</Text>
                    <Text style={[s.dateLeft, left <= 4 && s.dateLeftLow, on && s.dateTextOn]}>{left <= 4 ? `${left} left` : 'Open'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={s.range}><Ionicons name="calendar-outline" size={15} color={Colors.primary} /><Text style={s.rangeText}>{formatLongDate(date)} → {formatLongDate(endDate)}</Text></View>
          </Card>

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title="Who is going?" />
            <Stepper label="Adults" hint="12 years and above" value={counts.adults} min={1} max={MAX_GUESTS - counts.children} onChange={(v) => setCounts({ adults: v })} />
            <View style={s.sep} />
            <Stepper label="Children" hint="2–11 years · 75% of adult price" value={counts.children} min={0} max={MAX_GUESTS - counts.adults} onChange={(v) => setCounts({ children: v })} />
            <View style={s.sep} />
            <Stepper label="Infants" hint="Under 2 years · free, no separate bed" value={counts.infants} min={0} max={Math.min(counts.adults, 4)} onChange={(v) => setCounts({ infants: v })} />
            <View style={s.sep} />
            <Stepper label="Rooms" hint="Twin / double sharing" value={rooms} min={minRooms(counts)} max={Math.max(counts.adults, minRooms(counts))} onChange={setRooms} />
            {guests >= MAX_GUESTS ? <Text style={s.limit}>For groups larger than {MAX_GUESTS}, please send an enquiry.</Text> : null}
          </Card>

          {pkg.inclusions.length ? (
            <Card>
              <SectionTitle eyebrow="INCLUDED" title="What you get" />
              {pkg.inclusions.slice(0, 5).map((item) => <View key={item} style={s.bullet}><Ionicons name="checkmark-circle" size={16} color={Colors.success} /><Text style={s.bulletText}>{item}</Text></View>)}
              {pkg.hotels.length ? <View style={s.bullet}><Ionicons name="bed-outline" size={16} color={Colors.primary} /><Text style={s.bulletText}>Stay: {pkg.hotels.slice(0, 2).join(' · ')}</Text></View> : null}
            </Card>
          ) : null}

          <Card>
            <SectionTitle eyebrow="FARE" title="Price summary" />
            <PackageFareSummary fare={fare} />
          </Card>
          <Notice icon="information-circle-outline">Prices are per person on twin sharing. Final itinerary and hotel details are shared in your booking voucher.</Notice>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  dates: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  date: { width: 66, alignItems: 'center', paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  dateOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateWeek: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.6, color: Colors.textLight },
  dateDay: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginVertical: 1 },
  dateLeft: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.success, marginTop: 4 },
  dateLeftLow: { color: Colors.error },
  dateTextOn: { color: Colors.white },
  range: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  rangeText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark },
  sep: { height: 1, backgroundColor: Colors.border },
  limit: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 8 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  bulletText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, color: Colors.textDark },
});
