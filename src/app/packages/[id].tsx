import { useAppLanguage } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageProgress } from '@/components/packages/PackageUi';
import { Card, EmptyState, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { getPackageGallery } from '@/data/packageImages';
import type { TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { selectPackage } from '@/utils/packageBookingStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function PackageDetailScreen() {
  useAppLanguage();
  useWishlist();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items: travelPackages, loading } = useContentItems<TravelPackage>('package');
  const pkg = travelPackages.find((item) => item.id === id);
  const back = () => goBackOr(PACKAGE_ROUTES.list);

  const enquire = async () => {
    if (!pkg) return;
    const subject = encodeURIComponent(`Enquiry: ${pkg.title}`);
    const body = encodeURIComponent(`Hello LemonTrip, I would like to know more about ${pkg.title}.`);
    try { await Linking.openURL(`mailto:lemontripindia@gmail.com?subject=${subject}&body=${body}`); }
    catch { Alert.alert('Enquire about this journey', 'Contact lemontripindia@gmail.com to ask about this package.'); }
  };

  if (loading || !pkg) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Package details" eyebrow="LEMONTRIP / HOLIDAYS" onBack={back} />
          <EmptyState icon="umbrella-outline" title={loading ? 'Loading package…' : 'Package not found'} text={loading ? 'Fetching the latest details.' : 'This journey is no longer available.'} action={loading ? undefined : <PrimaryButton label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} />
        </ScrollView>
      </FlowScreen>
    );
  }

  const book = () => { selectPackage(pkg); goTo(PACKAGE_ROUTES.plan); };
  const gallery = getPackageGallery(pkg.id, pkg.title, pkg.destination, pkg.image, pkg.gallery);
  const saved = isInWishlist(pkg.id);
  const heroWidth = Math.min(width, 760) - Ui.space.page * 2;
  const summary: { icon: IconName; label: string; value: string }[] = [
    { icon: 'bed-outline', label: 'Stay', value: pkg.hotels?.[0] ?? 'Hotel, subject to availability' },
    { icon: 'restaurant-outline', label: 'Meals', value: pkg.meals?.[0] ?? 'As specified' },
    { icon: 'car-outline', label: 'Transfers', value: pkg.transfers?.[0] ?? 'Selected transfers' },
  ];

  return (
    <FlowScreen footer={<FooterBar caption="From · per person" amount={pkg.price} action={<PrimaryButton label="Select your trip" icon="arrow-forward" onPress={book} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader
            title={pkg.title}
            subtitle={`${pkg.destination ?? 'Holiday package'} · ${pkg.duration}`}
            eyebrow="LEMONTRIP / HOLIDAYS"
            onBack={back}
            rightAction={{ label: saved ? 'Remove package from wishlist' : 'Save package to wishlist', icon: saved ? 'heart' : 'heart-outline', onPress: () => toggleWishlist({ id: pkg.id, name: pkg.title, image: pkg.image, price: pkg.price, category: 'Packages', location: pkg.destination }) }}
          />
          <PackageProgress current={0} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gallery} style={s.galleryWrap}>
            {gallery.map((uri, i) => <Image key={`${pkg.id}-${i}`} source={{ uri }} style={[s.image, { width: gallery.length === 1 ? heroWidth : Math.min(heroWidth * 0.8, 300) }]} />)}
          </ScrollView>

          <Card>
            <SectionTitle eyebrow="OVERVIEW" title="About this package" right={pkg.rating ? <Pill icon="star" label={pkg.rating.replace(/[^0-9.]/g, '')} tone="brand" /> : undefined} />
            <Text style={s.body}>{pkg.description}</Text>
            <View style={s.pills}>
              <Pill icon="time-outline" label={pkg.duration} />
              {pkg.badge ? <Pill icon="pricetag-outline" label={pkg.badge} tone="brand" /> : null}
              {pkg.categories?.map((c) => <Pill key={c} label={c} />)}
            </View>
          </Card>

          <Card>
            <SectionTitle eyebrow="AT A GLANCE" title="What to expect" />
            {summary.map((item, i) => (
              <View key={item.label} style={[s.line, i > 0 && s.lineBorder]}>
                <Ionicons name={item.icon} size={16} color={Colors.primary} />
                <Text style={s.lineLabel}>{item.label}</Text>
                <Text style={s.lineValue} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </Card>

          {pkg.itinerary?.length ? (
            <Card>
              <SectionTitle eyebrow="YOUR JOURNEY" title="Day-by-day itinerary" right={<Pill icon="calendar-outline" label={`${pkg.itinerary.length} days`} />} />
              {pkg.itinerary.map((day, i) => (
                <View key={`${day.day}-${i}`} style={s.stop}>
                  <View style={s.rail}>
                    <View style={s.node} />
                    {i < pkg.itinerary!.length - 1 ? <View style={s.link} /> : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0, paddingBottom: 18 }}>
                    <Text style={s.stopTitle}>{day.title}</Text>
                    <Text style={s.stopMeta}>{day.day}</Text>
                    {day.description ? <Text style={s.body}>{day.description}</Text> : null}
                  </View>
                </View>
              ))}
            </Card>
          ) : null}

          <ListCard eyebrow="HIGHLIGHTS" title="Top experiences" icon="camera-outline" values={pkg.highlights} />
          <ListCard eyebrow="STAY" title="Hotels" icon="bed-outline" values={pkg.hotels} />
          <ListCard eyebrow="FOOD" title="Meals" icon="restaurant-outline" values={pkg.meals} />
          <ListCard eyebrow="GETTING AROUND" title="Transfers" icon="car-outline" values={pkg.transfers} />
          <ListCard eyebrow="INCLUDED" title="Package includes" icon="checkmark-circle" values={pkg.inclusions} color={Colors.success} />
          <ListCard eyebrow="NOT INCLUDED" title="Package excludes" icon="close-circle" values={pkg.exclusions} color={Colors.error} />

          {pkg.terms || pkg.cancellation ? (
            <Card>
              <SectionTitle eyebrow="POLICIES" title="Terms & cancellation" />
              {pkg.terms ? <Text style={s.body}>{pkg.terms}</Text> : null}
              {pkg.cancellation ? <Text style={[s.body, pkg.terms ? { marginTop: 10 } : null]}>{pkg.cancellation}</Text> : null}
            </Card>
          ) : null}

          <Notice icon="information-circle-outline">Prices are per person on twin sharing. Choose your date, travellers and rooms next; availability is confirmed at booking.</Notice>
          <View style={s.enquireWrap}><PrimaryButton variant="soft" icon="mail-outline" label="Enquire about this package" onPress={() => void enquire()} /></View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

/** Collapsible list card, expanded by default, hidden when the package has no data. */
function ListCard({ eyebrow, title, icon, values, color = Colors.primary }: { eyebrow: string; title: string; icon: IconName; values?: string[]; color?: string }) {
  const [open, setOpen] = useState(true);
  if (!values?.length) return null;
  return (
    <Card>
      <SectionTitle eyebrow={eyebrow} title={title} right={<TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${open ? 'Collapse' : 'Expand'} ${title}`} onPress={() => setOpen((v) => !v)} hitSlop={8}><Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textLight} /></TouchableOpacity>} />
      {open ? values.map((v) => <View key={v} style={s.bullet}><Ionicons name={icon} size={16} color={color} /><Text style={s.bulletText}>{v}</Text></View>) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  galleryWrap: { marginBottom: 14 },
  gallery: { gap: 10, paddingHorizontal: Ui.space.page },
  image: { height: 200, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  body: { fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 20, color: Colors.textDark },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  lineBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  lineLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight, width: 72 },
  lineValue: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'right' },
  stop: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 16 },
  node: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.primary, marginTop: 1 },
  link: { flex: 1, width: 2, backgroundColor: Colors.secondary, marginTop: 2 },
  stopTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  stopMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.secondary, fontWeight: FontWeight.bold, marginTop: 2, marginBottom: 4 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5 },
  bulletText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, color: Colors.textDark },
  enquireWrap: { marginHorizontal: Ui.space.page },
});