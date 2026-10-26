import { useAppLanguage } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { HeroBox, PACKAGE_ROUTES, PackageProgress } from '@/components/packages/PackageUi';
import { EmptyState, FlowScreen, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { getPackageGallery } from '@/data/packageImages';
import type { TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { selectPackage } from '@/utils/packageBookingStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Image, Linking, ScrollView, Share, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const GREEN = '#103D30';
const RED = '#E5322D';
const TOP_EXPERIENCES = 4;

export default function PackageDetailScreen() {
  useAppLanguage();
  useWishlist();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items: travelPackages, loading } = useContentItems<TravelPackage>('package');
  const pkg = travelPackages.find((item) => item.id === id);
  const [showAllDays, setShowAllDays] = useState(false);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const back = () => goBackOr(PACKAGE_ROUTES.list);

  const topBar = (
    <View style={s.topBar}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={back} style={s.backBtn}>
        <Ionicons name="arrow-back" size={22} color={GREEN} />
      </TouchableOpacity>
      <Text accessibilityRole="header" style={s.topTitle}>Packages</Text>
    </View>
  );

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
        {topBar}
        <ScrollView>
          <EmptyState icon="umbrella-outline" title={loading ? 'Loading package…' : 'Package not found'} text={loading ? 'Fetching the latest details.' : 'This journey is no longer available.'} action={loading ? undefined : <PrimaryButton variant="dark" label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} />
        </ScrollView>
      </FlowScreen>
    );
  }

  const book = () => { selectPackage(pkg); goTo(PACKAGE_ROUTES.plan); };
  const share = () => { void Share.share({ message: `${pkg.title} · ${pkg.duration} · ${pkg.price} per person on LemonTrip` }).catch(() => undefined); };
  const gallery = getPackageGallery(pkg.id, pkg.title, pkg.destination, pkg.image, pkg.gallery);
  const saved = isInWishlist(pkg.id);
  const place = pkg.destination ?? pkg.location ?? 'Holiday package';
  const tripType = pkg.categories?.includes('International') ? 'International' : pkg.categories?.includes('Domestic') ? 'Domestic' : null;
  const days = pkg.itinerary ?? [];
  const highlights = pkg.highlights ?? [];
  const visibleHighlights = showAllHighlights ? highlights : highlights.slice(0, TOP_EXPERIENCES);
  const durationLines = pkg.duration.split(/,\s*/);

  const glance: { icon: IconName; lines: string[] }[] = [
    { icon: 'calendar-outline', lines: durationLines },
    ...(tripType ? [{ icon: 'airplane-outline' as IconName, lines: [tripType, 'Trip'] }] : []),
    { icon: 'people-outline', lines: ['Customisable', 'Package'] },
    ...(pkg.bestFor ? [{ icon: 'star-outline' as IconName, lines: [pkg.bestFor] }] : []),
  ];
  const stayGroups: { icon: IconName; title: string; values?: string[] }[] = [
    { icon: 'bed-outline', title: 'Stay', values: pkg.hotels },
    { icon: 'restaurant-outline', title: 'Meals', values: pkg.meals },
    { icon: 'car-outline', title: 'Transfers', values: pkg.transfers },
  ].filter((group) => group.values?.length);

  return (
    <FlowScreen footer={
      <View style={s.footer}>
        <View style={s.footerPrice}>
          <Text style={s.footerCaption}>From · per person</Text>
          <Text style={s.footerAmount} numberOfLines={1}>{pkg.price} / person</Text>
        </View>
        <View style={s.footerAction}><PrimaryButton variant="dark" label="Select your trip" icon="arrow-forward" onPress={book} /></View>
      </View>
    }>
      {topBar}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.page}>
        <View style={s.content}>
          {/* ---------- hero ---------- */}
          <HeroBox uri={gallery[0] ?? pkg.image} style={s.hero}>
            <LinearGradient pointerEvents="none" colors={['rgba(8,34,52,0.78)', 'rgba(8,34,52,0.45)', 'rgba(8,34,52,0.05)']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} style={StyleSheet.absoluteFill} />
            <View style={s.heroActions}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? 'Remove package from wishlist' : 'Save package to wishlist'} onPress={() => toggleWishlist({ id: pkg.id, name: pkg.title, image: pkg.image, price: pkg.price, category: 'Packages', location: pkg.destination })} style={s.roundBtn}>
                <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? '#D92D20' : GREEN} />
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share package" onPress={share} style={s.roundBtn}>
                <Ionicons name="share-social-outline" size={18} color={GREEN} />
              </TouchableOpacity>
            </View>
            <View style={s.heroCopy}>
              <View style={s.heroPlace}>
                <Ionicons name="location-outline" size={13} color={Colors.white} />
                <Text style={s.heroPlaceText} numberOfLines={1}>{place.toUpperCase()}</Text>
              </View>
              <Text style={s.heroTitle} numberOfLines={3}>{pkg.title}</Text>
              <View style={s.heroMeta}>
                <View style={s.heroMetaItem}><Ionicons name="time-outline" size={14} color={Colors.white} /><Text style={s.heroMetaText}>{pkg.duration}</Text></View>
                {tripType ? <View style={s.heroMetaItem}><Ionicons name="airplane-outline" size={14} color={Colors.white} /><Text style={s.heroMetaText}>{tripType}</Text></View> : null}
                {pkg.rating ? <View style={s.heroMetaItem}><Ionicons name="star" size={13} color={Colors.white} /><Text style={s.heroMetaText}>{pkg.rating.replace(/[^0-9.]/g, '')}</Text></View> : null}
              </View>
              <Text style={s.heroDesc} numberOfLines={3}>{pkg.description}</Text>
            </View>
          </HeroBox>

          <PackageProgress current={0} overlap />

          {/* ---------- at a glance ---------- */}
          <View style={s.card}>
            <CardHead title="At a glance" subtitle="Key details for your trip" right={<View style={s.locPill}><Ionicons name="location" size={12} color={GREEN} /><Text style={s.locPillText} numberOfLines={1}>{place}</Text></View>} />
            <View style={s.glanceGrid}>
              {glance.map((item) => (
                <View key={item.icon} style={s.glanceItem}>
                  <View style={s.glanceIcon}><Ionicons name={item.icon} size={17} color={GREEN} /></View>
                  <View style={s.flex}>{item.lines.map((line) => <Text key={line} style={s.glanceText} numberOfLines={1}>{line}</Text>)}</View>
                </View>
              ))}
            </View>
          </View>

          {/* ---------- your journey ---------- */}
          {days.length ? (
            <View style={s.card}>
              <CardHead title="Your journey" subtitle="Day-by-day itinerary overview" right={<LinkButton label={showAllDays ? 'Hide details' : 'View full itinerary'} icon={showAllDays ? 'arrow-up' : 'arrow-forward'} onPress={() => setShowAllDays((v) => !v)} />} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tiles}>
                {days.map((day, i) => (
                  <View key={`${day.day}-${i}`} style={s.dayTile}>
                    <Image source={{ uri: gallery[i % gallery.length] }} style={s.dayImg} />
                    <Text style={s.tileTitle} numberOfLines={1}>{day.day}</Text>
                    <Text style={s.tileSub} numberOfLines={2}>{day.title}</Text>
                  </View>
                ))}
              </ScrollView>
              {showAllDays ? (
                <View style={s.timeline}>
                  {days.map((day, i) => (
                    <View key={`${day.day}-full-${i}`} style={s.stop}>
                      <View style={s.rail}>
                        <View style={s.node} />
                        {i < days.length - 1 ? <View style={s.link} /> : null}
                      </View>
                      <View style={s.stopCopy}>
                        <Text style={s.stopTitle}>{day.title}</Text>
                        <Text style={s.stopMeta}>{day.day}</Text>
                        {day.description ? <Text style={s.body}>{day.description}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ---------- top experiences ---------- */}
          {highlights.length ? (
            <View style={s.card}>
              <CardHead title="Top experiences" subtitle="Highlights included in this package" right={highlights.length > TOP_EXPERIENCES ? <LinkButton label={showAllHighlights ? 'Show less' : 'See all'} icon={showAllHighlights ? 'arrow-up' : 'arrow-forward'} onPress={() => setShowAllHighlights((v) => !v)} /> : undefined} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tiles}>
                {visibleHighlights.map((text, i) => (
                  <View key={`${text}-${i}`} style={s.expTile}>
                    <Image source={{ uri: gallery[(i + 1) % gallery.length] }} style={s.expImg} />
                    <Text style={s.tileSub} numberOfLines={3}>{text}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* ---------- stay, meals, transfers ---------- */}
          {stayGroups.length ? (
            <View style={s.card}>
              <CardHead title="Stay, meals & transfers" subtitle="How your trip is arranged" />
              {stayGroups.map((group) => (
                <View key={group.title} style={s.stayGroup}>
                  <View style={s.stayHead}><Ionicons name={group.icon} size={15} color={GREEN} /><Text style={s.stayTitle}>{group.title}</Text></View>
                  {group.values!.map((value) => <Text key={value} style={s.stayText}>{value}</Text>)}
                </View>
              ))}
            </View>
          ) : null}

          {/* ---------- includes / excludes / terms ---------- */}
          <InfoCard title="Package includes" subtitle="What’s included in your trip" icon="checkmark" color={GREEN}>
            {pkg.inclusions?.map((value) => <Bullet key={value} icon="checkmark-circle" color={GREEN} text={value} />)}
          </InfoCard>
          <InfoCard title="Package excludes" subtitle="What’s not included" icon="close" color={RED}>
            {pkg.exclusions?.map((value) => <Bullet key={value} icon="close-circle" color={RED} text={value} />)}
          </InfoCard>
          <InfoCard title="Terms & cancellation" subtitle="Important information" icon="document-text" color={GREEN} dark>
            {pkg.terms ? <Text style={s.body}>{pkg.terms}</Text> : null}
            {pkg.cancellation ? <Text style={[s.body, pkg.terms ? s.bodyGap : null]}>{pkg.cancellation}</Text> : null}
          </InfoCard>

          <View style={s.notice}>
            <Ionicons name="information-circle-outline" size={20} color={GREEN} />
            <Text style={s.noticeText}>Prices are per person on twin sharing. Choose your date, travellers and rooms next; availability is confirmed at booking.</Text>
          </View>
          <View style={s.enquireWrap}><PrimaryButton variant="soft" icon="mail-outline" label="Enquire about this package" onPress={() => void enquire()} /></View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

/* ---------- small pieces ---------- */

function CardHead({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={s.head}>
      <View style={s.headBar} />
      <View style={s.flex}>
        <Text style={s.cardTitle}>{title}</Text>
        {subtitle ? <Text style={s.cardSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function LinkButton({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} hitSlop={8} style={s.link2}>
      <Text style={s.linkText}>{label}</Text>
      <Ionicons name={icon} size={14} color={GREEN} />
    </TouchableOpacity>
  );
}

function Bullet({ icon, color, text }: { icon: IconName; color: string; text: string }) {
  return (
    <View style={s.bullet}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

/** Collapsible card with a large round icon, open by default. Hidden when it has nothing to show. */
function InfoCard({ title, subtitle, icon, color, dark, children }: { title: string; subtitle: string; icon: IconName; color: string; dark?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const items = Array.isArray(children) ? children.flat().filter(Boolean) : children;
  if (!items || (Array.isArray(items) && !items.length)) return null;
  return (
    <View style={s.card}>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${open ? 'Collapse' : 'Expand'} ${title}`} onPress={() => setOpen((v) => !v)} style={s.infoHead}>
        <View style={[s.infoIcon, { backgroundColor: dark ? '#0F2F2A' : color }]}><Ionicons name={icon} size={20} color={Colors.white} /></View>
        <View style={s.flex}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardSub}>{subtitle}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={GREEN} />
      </TouchableOpacity>
      {open ? <View style={s.infoBody}>{children}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  page: { paddingBottom: 20 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },

  topBar: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  topTitle: { flex: 1, fontFamily: 'Inter-Bold', fontSize: 18, color: GREEN },

  hero: { alignSelf: 'stretch', width: '100%', overflow: 'hidden', minHeight: 250, paddingTop: 14, paddingBottom: 48, paddingHorizontal: 16, backgroundColor: '#0E3B52', justifyContent: 'flex-end' },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroActions: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', gap: 10 },
  roundBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  heroCopy: { width: '78%', paddingTop: 44 },
  heroPlace: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroPlaceText: { fontFamily: 'Inter-SemiBold', fontSize: 11, letterSpacing: 1.2, color: Colors.white, flexShrink: 1 },
  heroTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 24, lineHeight: 28, color: Colors.white, marginTop: 6 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 4, marginTop: 8 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.white },
  heroDesc: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16, color: Colors.white, marginTop: 10 },

  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headBar: { width: 3, alignSelf: 'stretch', minHeight: 32, borderRadius: 2, backgroundColor: GREEN },
  cardTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 17, color: Colors.textDark },
  cardSub: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, marginTop: 1 },
  locPill: { maxWidth: 130, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.successSoft },
  locPillText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: Colors.textDark, flexShrink: 1 },
  link2: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: GREEN },

  glanceGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, marginTop: 14 },
  glanceItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 8 },
  glanceIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  glanceText: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16, color: Colors.textDark },

  tiles: { gap: 10, paddingTop: 12 },
  dayTile: { width: 116 },
  dayImg: { width: 116, height: 72, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  expTile: { width: 128 },
  expImg: { width: 128, height: 76, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  tileTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 12, color: Colors.textDark, marginTop: 6 },
  tileSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: Colors.textLight, marginTop: 3 },

  timeline: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  stop: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 16 },
  node: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.white, borderWidth: 3, borderColor: GREEN, marginTop: 2 },
  link: { flex: 1, width: 2, backgroundColor: '#C8DCD3', marginTop: 2 },
  stopCopy: { flex: 1, minWidth: 0, paddingBottom: 16 },
  stopTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 13, color: Colors.textDark },
  stopMeta: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: Colors.secondary, marginTop: 2, marginBottom: 4 },
  body: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 18, color: Colors.textDark },
  bodyGap: { marginTop: 10 },

  stayGroup: { marginTop: 12 },
  stayHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  stayTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 13, color: Colors.textDark },
  stayText: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 18, color: Colors.textDark, paddingLeft: 22 },

  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoBody: { marginTop: 10, paddingLeft: 52 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  bulletText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 17, color: Colors.textDark },

  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 18, backgroundColor: '#E3F0EA' },
  noticeText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16, color: Colors.textDark },
  enquireWrap: { marginHorizontal: 10 },

  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flexShrink: 1, minWidth: 110, paddingRight: 14, borderRightWidth: 1, borderRightColor: Colors.border },
  footerCaption: { fontFamily: 'Inter-Regular', fontSize: 10, color: Colors.textLight },
  footerAmount: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  footerAction: { flex: 1 },
});