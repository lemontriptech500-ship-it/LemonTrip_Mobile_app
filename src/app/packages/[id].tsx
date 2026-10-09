import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import { Ionicons } from '@expo/vector-icons';
import type { TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { selectPackage } from '@/utils/packageBookingStore';
import { PACKAGE_ROUTES } from '@/components/packages/PackageUi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PackageDetailScreen() {
  useWishlist();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items: travelPackages, loading } = useContentItems<TravelPackage>('package');
  const pkg = travelPackages.find((item) => item.id === id);
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/packages');
  };

  const handleBook = () => {
    if (!pkg) return;
    selectPackage(pkg);
    router.push(PACKAGE_ROUTES.plan);
  };

  const handleEnquire = async () => {
    if (!pkg) return;
    const subject = encodeURIComponent(`Enquiry: ${pkg.title}`);
    const body = encodeURIComponent(`Hello LemonTrip, I would like to know more about ${pkg.title}.`);
    try {
      await Linking.openURL(`mailto:lemontripindia@gmail.com?subject=${subject}&body=${body}`);
    } catch {
      Alert.alert('Enquire about this journey', 'Contact lemontripindia@gmail.com to ask about this package.');
    }
  };

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundText}>Loading package…</Text></View></SafeAreaView>;
  if (!pkg) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundText}>Package not found.</Text><TouchableOpacity onPress={() => router.replace('/packages')} style={styles.backToPackages}><Text style={styles.backToPackagesText}>Browse journeys</Text></TouchableOpacity></View></SafeAreaView>;
  }

  const gallery = pkg.gallery?.length ? pkg.gallery : [pkg.image];
  const galleryImageWidth = gallery.length === 1 ? Math.min(width, 1160) : 265;
  const included = pkg.inclusions ?? [];
  const excluded = pkg.exclusions ?? [];
  const itinerary = pkg.itinerary?.map((day) => `${day.day}: ${day.title}${day.description ? ` — ${day.description}` : ''}`) ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <BrandGradientBar style={styles.navRow}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={styles.backButton}><Ionicons name="arrow-back" size={18} color={Colors.white} /></TouchableOpacity>
            <LemonTripBrand size={38} />
            <Text style={styles.breadcrumb}>{pkg.destination?.toUpperCase() ?? 'JOURNEYS'}</Text>
            <View style={styles.navSpacer} />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open wishlist" onPress={() => router.push('/(tabs)/wishlist')} style={styles.iconButton}><Ionicons name="heart-outline" size={18} color={Colors.primaryDark} /></TouchableOpacity>
          </BrandGradientBar>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {gallery.map((image, index) => <Image key={`${pkg.id}-gallery-${index}`} source={{ uri: image }} style={[styles.galleryImage, { width: galleryImageWidth }, gallery.length === 1 && styles.singleGalleryImage]} />)}
          </ScrollView>

          <View style={[styles.detailLayout, desktop && styles.detailLayoutDesktop]}>
            <View style={styles.mainColumn}>
              <View style={styles.titleArea}>
                <View style={styles.metaRow}>
                  <Text style={styles.destination}>{pkg.destination ?? 'Destination details unavailable'}</Text>
                  {pkg.rating ? <View style={styles.rating}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.ratingText}>{pkg.rating.replace(/[^0-9.]/g, '')}</Text></View> : null}
                </View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{pkg.title}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={isInWishlist(pkg.id) ? 'Remove package from wishlist' : 'Save package to wishlist'}
                    onPress={() => toggleWishlist({ id: pkg.id, name: pkg.title, image: pkg.image, price: pkg.price, category: 'Packages', location: pkg.destination })}
                    style={styles.saveButton}>
                    <Ionicons name={isInWishlist(pkg.id) ? 'heart' : 'heart-outline'} size={17} color={isInWishlist(pkg.id) ? Colors.error : Colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.tripMeta}>
                  <View style={styles.metaItem}><Ionicons name="time-outline" size={14} color={Colors.textLight} /><Text style={styles.metaText}>{pkg.duration}</Text></View>
                  {pkg.badge ? <View style={styles.metaItem}><Ionicons name="pricetag-outline" size={14} color={Colors.textLight} /><Text style={styles.metaText}>{pkg.badge}</Text></View> : null}
                </View>
                {pkg.categories?.length ? <View style={styles.categoryList}>{pkg.categories.map((category) => <View key={category} style={styles.categoryTag}><Text style={styles.categoryText}>{category}</Text></View>)}</View> : null}
              </View>

              <DetailSection title="Overview" icon="book-outline" defaultExpanded>
                <Text style={styles.overview}>{pkg.description}</Text>
              </DetailSection>
              <View style={styles.journeyHeading}><Text style={styles.bookingEyebrow}>YOUR JOURNEY</Text><Text style={styles.journeyTitle}>Day-by-day itinerary</Text></View>
              {pkg.itinerary?.length ? pkg.itinerary.map((day, index) => <View key={`${day.day}-${index}`} style={styles.dayRow}><View style={styles.dayNumber}><Text style={styles.dayNumberText}>{String(index + 1).padStart(2, '0')}</Text></View><View style={styles.dayCard}><DetailSection embedded title={day.title} icon="location-outline" text={day.description} defaultExpanded={index === 0} /></View></View>) : <DetailSection title="Itinerary details" icon="calendar-outline" values={itinerary} /> }
              <DetailSection title="Hotels" icon="bed-outline" values={pkg.hotels} />
              <DetailSection title="Meals" icon="restaurant-outline" values={pkg.meals} />
              <DetailSection title="Transfers" icon="car-outline" values={pkg.transfers} />
              <DetailSection title="Sightseeing" icon="camera-outline" values={pkg.highlights} defaultExpanded />
              <DetailSection title="Inclusions" icon="checkmark-circle-outline" values={included} />
              <DetailSection title="Exclusions" icon="close-circle-outline" values={excluded} />
              <DetailSection title="Terms" icon="document-text-outline" text={pkg.terms} />
              <DetailSection title="Cancellation" icon="calendar-clear-outline" text={pkg.cancellation} />
            </View>

            {desktop ? <View style={styles.bookingColumn}><BookingPanel title={pkg.title} duration={pkg.duration} price={pkg.price} onEnquire={handleEnquire} onBook={handleBook} /></View> : null}
          </View>
        </View>
      </ScrollView>

      {!desktop ? (
        <View style={[styles.mobileBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.mobilePrice}><Text style={styles.mobilePriceLabel}>FROM · PER PERSON</Text><Text style={styles.mobilePriceValue}>{pkg.price}</Text></View>
          <TouchableOpacity onPress={handleEnquire} style={styles.enquireButton}><Text style={styles.enquireText}>Enquire</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleBook} style={styles.bookButton}><Text style={styles.bookText}>Book now  →</Text></TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function DetailSection({
  title,
  icon,
  children,
  values,
  text,
  defaultExpanded = false,
  embedded = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children?: React.ReactNode;
  values?: string[];
  text?: string;
  defaultExpanded?: boolean;
  embedded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasData = Boolean(children || text || values?.length);
  return (
    <View style={[styles.section, embedded && styles.embeddedSection]}>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((current) => !current)} style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={styles.sectionTitle}>{title}</Text></View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={Colors.textLight} />
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.sectionContent}>
          {children}
          {values?.length ? values.map((value) => <View key={value} style={styles.detailBullet}><Ionicons name="ellipse" size={5} color={Colors.secondary} /><Text style={styles.detailText}>{value}</Text></View>) : null}
          {text ? <Text style={styles.detailText}>{text}</Text> : null}
          {!hasData ? <Text style={styles.unavailable}>Details not supplied for this package.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function BookingPanel({ title, duration, price, onEnquire, onBook }: {
  title: string;
  duration: string;
  price: string;
  onEnquire: () => void;
  onBook: () => void;
}) {
  return (
    <View style={styles.bookingPanel}>
      <Text style={styles.bookingEyebrow}>YOUR JOURNEY</Text>
      <Text style={styles.bookingTitle}>{title}</Text>
      <View style={styles.bookingMeta}><Ionicons name="time-outline" size={14} color={Colors.textLight} /><Text style={styles.bookingMetaText}>{duration}</Text></View>
      <View style={styles.bookingPriceArea}><Text style={styles.bookingPriceLabel}>STARTING FROM</Text><Text style={styles.bookingPrice}>{price}</Text></View>
      <Text style={styles.priceNote}>Per person, twin sharing. Choose dates and travellers on the next step to see your total.</Text>
      <TouchableOpacity onPress={onEnquire} style={styles.enquireButtonWide}><Ionicons name="mail-outline" size={15} color={Colors.primary} /><Text style={styles.enquireWideText}>Enquire now</Text></TouchableOpacity>
      <TouchableOpacity onPress={onBook} style={styles.bookButtonWide}><Text style={styles.bookWideText}>Book now</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  journeyHeading: { marginHorizontal: Ui.space.page, marginTop: 20, marginBottom: 8 }, journeyTitle: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.primary, marginTop: 5 }, dayRow: { flexDirection: 'row', marginHorizontal: Ui.space.page, gap: 10, marginBottom: 8, alignItems: 'flex-start' }, dayNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, dayNumberText: { fontFamily: 'Manrope', fontSize: 10, color: Colors.white, fontWeight: '800' }, dayCard: { ...Ui.card, flex: 1, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  navRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.onDarkSurface },
  breadcrumb: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  navSpacer: { flex: 1 },
  iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.accent },
  gallery: { paddingHorizontal: 0, gap: 8 },
  galleryImage: { height: 210, borderRadius: 15, backgroundColor: Colors.surfaceMuted },
  singleGalleryImage: { height: 290, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  detailLayout: { marginTop: 3 },
  detailLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 22 },
  mainColumn: { flex: 1, minWidth: 0 },
  titleArea: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  destination: { backgroundColor: Colors.accentSoft, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9, backgroundColor: Colors.primaryDark },
  ratingText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  title: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 22, lineHeight: 28, fontWeight: '800', marginTop: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  tripMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  categoryTag: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: Ui.radius.pill, backgroundColor: Colors.accentSoft },
  categoryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  embeddedSection: { marginHorizontal: 0, marginVertical: 0, borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  section: { ...Ui.card, marginHorizontal: Ui.space.page, marginVertical: 4, paddingHorizontal: 14, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  sectionHeader: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { flexShrink: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  sectionContent: { paddingBottom: 12 },
  overview: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 21 },
  detailBullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  detailText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 20 },
  unavailable: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 20 },
  bookingColumn: { width: 295, marginRight: 16, marginTop: 20, position: 'sticky' as 'relative', top: 14 },
  bookingPanel: { ...Ui.card, padding: Ui.space.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  bookingEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bookingTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, lineHeight: 24, fontWeight: '800', marginTop: 5 },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  bookingMetaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  bookingPriceArea: { marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.border },
  bookingPriceLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  bookingPrice: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', marginTop: 3 },
  priceNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 5 },
  enquireButtonWide: { minHeight: Ui.button.minHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 13, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.button },
  enquireWideText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  bookButtonWide: { minHeight: Ui.button.minHeight, alignItems: 'center', justifyContent: 'center', marginTop: 7, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  bookedButton: { backgroundColor: Colors.success },
  bookWideText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  mobileBar: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobilePrice: { flex: 1, minWidth: 70 },
  mobilePriceLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  mobilePriceValue: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', marginTop: 2 },
  enquireButton: { minHeight: Ui.button.minHeight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.button },
  enquireText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  bookButton: { minHeight: Ui.button.minHeight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  bookText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  notFoundText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  backToPackages: { marginTop: 12, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9, backgroundColor: Colors.accent },
  backToPackagesText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
});
