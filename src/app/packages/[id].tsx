import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { addBooking } from '@/utils/bookingStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PackageDetailScreen() {
  useWishlist();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items: travelPackages, loading } = useContentItems<TravelPackage>('package');
  const pkg = travelPackages.find((item) => item.id === id);
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [booked, setBooked] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/packages');
  };

  const handleBook = (bookingTime: number) => {
    if (!pkg || booked) return;
    const bookingId = `package-${pkg.id}-${bookingTime}`;
    addBooking({
      id: bookingId,
      serviceName: 'Holiday Package',
      itemName: pkg.title,
      price: pkg.price,
      bookedAt: new Date(bookingTime).toLocaleDateString(),
    });
    setBooked(true);
    Alert.alert('Booking confirmed', `${pkg.title} has been added to your bookings.`, [{ text: 'View confirmation', onPress: () => router.push({ pathname: '/confirmation', params: { bookingId } }) }]);
  };

  const handleEnquire = async () => {
    if (!pkg) return;
    const subject = encodeURIComponent(`Enquiry: ${pkg.title}`);
    const body = encodeURIComponent(`Hello LemonTrip, I would like to know more about ${pkg.title}.`);
    try {
      await Linking.openURL(`mailto:hello@lemontrip.in?subject=${subject}&body=${body}`);
    } catch {
      Alert.alert('Enquire about this journey', 'Contact hello@lemontrip.in to ask about this package.');
    }
  };

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundText}>Loading package…</Text></View></SafeAreaView>;
  if (!pkg) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundText}>Package not found.</Text><TouchableOpacity onPress={() => router.replace('/packages')} style={styles.backToPackages}><Text style={styles.backToPackagesText}>Browse journeys</Text></TouchableOpacity></View></SafeAreaView>;
  }

  const gallery = pkg.gallery?.length ? pkg.gallery : [pkg.image];
  const galleryImageWidth = gallery.length === 1 ? Math.min(width - 30, 1130) : 265;
  const included = pkg.inclusions ?? [];
  const excluded = pkg.exclusions ?? [];
  const itinerary = pkg.itinerary?.map((day) => `${day.day}: ${day.title}${day.description ? ` — ${day.description}` : ''}`) ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.navRow}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={styles.backButton}><Ionicons name="arrow-back" size={18} color={Colors.primaryDark} /></TouchableOpacity>
            <Text style={styles.breadcrumb}>JOURNEYS / {pkg.destination?.toUpperCase() ?? 'DETAILS'}</Text>
            <View style={styles.navSpacer} />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open wishlist" onPress={() => router.push('/(tabs)/wishlist')} style={styles.iconButton}><Ionicons name="heart-outline" size={18} color={Colors.primaryDark} /></TouchableOpacity>
          </View>

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
              <DetailSection title="Day-by-day itinerary" icon="calendar-outline" values={itinerary} />
              <DetailSection title="Hotels" icon="bed-outline" values={pkg.hotels} />
              <DetailSection title="Meals" icon="restaurant-outline" values={pkg.meals} />
              <DetailSection title="Transfers" icon="car-outline" values={pkg.transfers} />
              <DetailSection title="Sightseeing" icon="camera-outline" values={pkg.highlights} defaultExpanded />
              <DetailSection title="Inclusions" icon="checkmark-circle-outline" values={included} />
              <DetailSection title="Exclusions" icon="close-circle-outline" values={excluded} />
              <DetailSection title="Terms" icon="document-text-outline" text={pkg.terms} />
              <DetailSection title="Cancellation" icon="calendar-clear-outline" text={pkg.cancellation} />
            </View>

            {desktop ? <View style={styles.bookingColumn}><BookingPanel title={pkg.title} duration={pkg.duration} price={pkg.price} booked={booked} onEnquire={handleEnquire} onBook={() => handleBook(Date.now())} /></View> : null}
          </View>
        </View>
      </ScrollView>

      {!desktop ? (
        <View style={styles.mobileBar}>
          <View style={styles.mobilePrice}><Text style={styles.mobilePriceLabel}>STARTING FROM</Text><Text style={styles.mobilePriceValue}>{pkg.price}</Text></View>
          <TouchableOpacity onPress={handleEnquire} style={styles.enquireButton}><Text style={styles.enquireText}>Enquire</Text></TouchableOpacity>
          <TouchableOpacity disabled={booked} onPress={() => handleBook(Date.now())} style={[styles.bookButton, booked && styles.bookedButton]}><Text style={styles.bookText}>{booked ? 'Added' : 'Book'}</Text></TouchableOpacity>
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
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children?: React.ReactNode;
  values?: string[];
  text?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasData = Boolean(children || text || values?.length);
  return (
    <View style={styles.section}>
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

function BookingPanel({ title, duration, price, booked, onEnquire, onBook }: {
  title: string;
  duration: string;
  price: string;
  booked: boolean;
  onEnquire: () => void;
  onBook: () => void;
}) {
  return (
    <View style={styles.bookingPanel}>
      <Text style={styles.bookingEyebrow}>YOUR JOURNEY</Text>
      <Text style={styles.bookingTitle}>{title}</Text>
      <View style={styles.bookingMeta}><Ionicons name="time-outline" size={14} color={Colors.textLight} /><Text style={styles.bookingMetaText}>{duration}</Text></View>
      <View style={styles.bookingPriceArea}><Text style={styles.bookingPriceLabel}>STARTING FROM</Text><Text style={styles.bookingPrice}>{price}</Text></View>
      <Text style={styles.priceNote}>Final price depends on selected dates and availability.</Text>
      <TouchableOpacity onPress={onEnquire} style={styles.enquireButtonWide}><Ionicons name="mail-outline" size={15} color={Colors.primary} /><Text style={styles.enquireWideText}>Enquire now</Text></TouchableOpacity>
      <TouchableOpacity disabled={booked} onPress={onBook} style={[styles.bookButtonWide, booked && styles.bookedButton]}><Text style={styles.bookWideText}>{booked ? 'Added to bookings' : 'Book package'}</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  navRow: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15 },
  backButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surface },
  breadcrumb: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  navSpacer: { flex: 1 },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surface },
  gallery: { paddingHorizontal: 15, gap: 8 },
  galleryImage: { height: 210, borderRadius: 15, backgroundColor: Colors.surfaceMuted },
  singleGalleryImage: { height: 250 },
  detailLayout: { marginTop: 3 },
  detailLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 22 },
  mainColumn: { flex: 1, minWidth: 0 },
  titleArea: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  destination: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9, backgroundColor: Colors.primaryDark },
  ratingText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  tripMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  categoryTag: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.accentSoft },
  categoryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  section: { marginHorizontal: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  sectionHeader: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  sectionContent: { paddingBottom: 12 },
  overview: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 15 },
  detailBullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  detailText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 14 },
  unavailable: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 14 },
  bookingColumn: { width: 295, marginRight: 16, marginTop: 20, position: 'sticky' as 'relative', top: 14 },
  bookingPanel: { padding: 15, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, backgroundColor: Colors.surface },
  bookingEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  bookingTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 5 },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  bookingMetaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  bookingPriceArea: { marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.border },
  bookingPriceLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800', letterSpacing: 0.8 },
  bookingPrice: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', marginTop: 3 },
  priceNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12, marginTop: 5 },
  enquireButtonWide: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 13, borderWidth: 1, borderColor: Colors.border, borderRadius: 10 },
  enquireWideText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  bookButtonWide: { minHeight: 41, alignItems: 'center', justifyContent: 'center', marginTop: 7, borderRadius: 10, backgroundColor: Colors.accent },
  bookedButton: { backgroundColor: Colors.success },
  bookWideText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  mobileBar: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobilePrice: { flex: 1, minWidth: 70 },
  mobilePriceLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800' },
  mobilePriceValue: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900', marginTop: 2 },
  enquireButton: { minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 9 },
  enquireText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  bookButton: { minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, borderRadius: 9, backgroundColor: Colors.accent },
  bookText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  notFoundText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  backToPackages: { marginTop: 12, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 9, backgroundColor: Colors.accent },
  backToPackagesText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
});
