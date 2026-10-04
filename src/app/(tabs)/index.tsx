import { Colors } from '@/constants/colors';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import type { Offer } from '@/data/offers';
import { loadOffers, getOfferValidity } from '@/utils/offerApi';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { getUser, useAuth } from '@/utils/authStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Animated, Easing, Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type ServiceItem = {
  label: string;
  icon: IconName;
  // Optional custom image. When set, it is shown instead of the Ionicons icon.
  image?: ImageSourcePropType;
  badge?: string;
  route: Parameters<typeof router.push>[0];
};

// One unified services grid (4 columns), thin outline icons
const services: ServiceItem[] = [
  {
    label: 'Flights',
    icon: 'airplane-outline',
    image: require('../../../assets/images/flight.png'),
    route: '/(tabs)/explore/flights',
  },
  { label: 'Hotels', icon: 'bed-outline', image: require('../../../assets/images/hotels_new.png'), route: '/(tabs)/explore/hotels' },
  { label: 'Holiday\nPackages', icon: 'umbrella-outline', image: require('../../../assets/images/holiday.png'), route: '/packages' },
  { label: 'Trains', icon: 'train-outline', image: require('../../../assets/images/trains.png'), route: '/(tabs)/explore/trains' },
  { label: 'Buses', icon: 'bus-outline', image: require('../../../assets/images/buses.png'), route: '/(tabs)/explore/buses' },
  { label: 'Visa', icon: 'id-card-outline', image: require('../../../assets/images/visa.png'), route: '/(tabs)/explore/visa' },
  { label: 'Offers', icon: 'pricetag-outline', image: require('../../../assets/images/offers.png'), badge: 'NEW', route: '/offers' },
  { label: 'Saved\nPlaces', icon: 'heart-outline', image: require('../../../assets/images/saved.png'), route: '/(tabs)/wishlist' },
  { label: 'Travel\nStories', icon: 'newspaper-outline', image: require('../../../assets/images/travel_stories.png'), route: '/blog' },
  { label: 'Cart', icon: 'cart-outline', image: require('../../../assets/images/cart.png'), route: '/cart' },
  { label: 'Help', icon: 'headset-outline', image: require('../../../assets/images/help.png'), route: '/help' },
  { label: 'Explore\nAll', icon: 'compass-outline', image: require('../../../assets/images/exploreall.png'), route: '/(tabs)/explore' },
];

const trustPoints: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: 'shield-checkmark-outline', title: 'Secure bookings', subtitle: 'Protected payments and verified stays.' },
  { icon: 'cash-outline', title: 'Transparent pricing', subtitle: 'No surprises, just clear value.' },
  { icon: 'headset-outline', title: 'Travel support', subtitle: 'Real help, before and during your trip.' },
  { icon: 'sparkles-outline', title: 'Personalized travel', subtitle: 'Trips designed around your preferences.' },
];

const sampleDestinations: Destination[] = [
  { id: 'bali', name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700', priceFrom: 'Indonesia' },
  { id: 'dubai', name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700', priceFrom: 'UAE' },
  { id: 'switzerland', name: 'Switzerland', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700', priceFrom: 'Europe' },
  { id: 'maldives', name: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700', priceFrom: 'Indian Ocean' },
];

const samplePackages: TravelPackage[] = [
  { id: 'rajasthan-royal', title: 'Rajasthan Royal Escape', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900', duration: '7 Days 6 Nights', price: '₹34,999', badge: 'Hot Deal', description: '', highlights: [] },
  { id: 'kashmir-paradise', title: 'Kashmir Paradise', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=900', duration: '5 Days 4 Nights', price: '₹18,999', badge: 'Best Seller', description: '', highlights: [] },
  { id: 'andaman-getaway', title: 'Andaman Getaway', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900', duration: '6 Days 5 Nights', price: '₹29,999', badge: 'Trending', description: '', highlights: [] },
];

// Opacity steps for a left-to-right dark green fade behind the promo text
// (built from plain Views so no extra gradient package is needed).
const PROMO_FADE_STEPS = [0.62, 0.58, 0.52, 0.44, 0.35, 0.26, 0.17, 0.09, 0.03, 0];

type PromoSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  route: Parameters<typeof router.push>[0];
};

// Swap the image URLs / copy here to change the banner slides.
const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'adventure',
    image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400',
    eyebrow: 'Your Next',
    title: 'Adventure Awaits!',
    description: 'Discover amazing destinations, exclusive deals and unforgettable experiences.',
    cta: 'Explore Now',
    route: '/packages',
  },
  {
    id: 'beaches',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400',
    eyebrow: 'Escape To',
    title: 'Tropical Beaches',
    description: 'Handpicked island getaways with stays, flights and transfers sorted.',
    cta: 'View Packages',
    route: '/packages',
  },
  {
    id: 'offers',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400',
    eyebrow: 'Save More On',
    title: 'Exclusive Offers',
    description: 'Grab limited-time deals on flights, hotels and holiday packages.',
    cta: 'See Offers',
    route: '/offers',
  },
];

const PROMO_AUTOPLAY_MS = 4500;

// Rotating search suggestions shown inside the search bar. Edit freely.
const SEARCH_HINTS = [
  'Goa hotels',
  'Delhi to Mumbai flights',
  'Bali holiday packages',
  'Chennai to Bengaluru trains',
  'Dubai visa',
  'Chennai to Madurai buses',
];
const SEARCH_HINT_INTERVAL_MS = 2800;

function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.linkRow} hitSlop={8}>
        <Text style={styles.linkText}>{action}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { width: viewportWidth } = useWindowDimensions();
  const promoScrollRef = useRef<ScrollView>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  // Banner width = page width (max 784) minus the 16px side margins
  const promoWidth = Math.min(viewportWidth, 784) - 32;

  const goToPromo = (index: number) => {
    promoScrollRef.current?.scrollTo({ x: index * promoWidth, animated: true });
    setPromoIndex(index);
  };

  // Auto-slide. The timer restarts whenever the slide changes (including manual swipes).
  useEffect(() => {
    const timer = setTimeout(() => {
      goToPromo((promoIndex + 1) % PROMO_SLIDES.length);
    }, PROMO_AUTOPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoIndex, promoWidth]);
  // Search bar hint: slides up and fades out, then the next suggestion slides in from below.
  const [hintIndex, setHintIndex] = useState(0);
  const hintAnim = useRef(new Animated.Value(0)).current; // 0 = visible, -1 = leaving, 1 = entering
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(hintAnim, { toValue: -1, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
        if (!finished) return;
        setHintIndex((current) => (current + 1) % SEARCH_HINTS.length);
        hintAnim.setValue(1);
        Animated.timing(hintAnim, { toValue: 0, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      });
    }, SEARCH_HINT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hintAnim]);
  const hintStyle = {
    opacity: hintAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
    transform: [{ translateY: hintAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-10, 0, 10] }) }],
  };

  useWishlist();
  const user = useAuth();
  const [verifiedOffers, setVerifiedOffers] = useState<Offer[]>([]);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: blogPosts } = useContentItems<BlogPost>('blog');
  const { items: destinations } = useContentItems<Destination>('destination');

  useEffect(() => {
    let mounted = true;
    loadOffers()
      .then(({ offers: loadedOffers, source }) => {
        if (!mounted || source !== 'backend') return;
        setVerifiedOffers(loadedOffers.filter((offer) => getOfferValidity(offer.validUntil) === 'active'));
      })
      .catch(() => {
        if (mounted) setVerifiedOffers([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleProfilePress = () => {
    router.push(getUser() ? '/(tabs)/profile' : '/login');
  };

  const visibleDestinations = (destinations.length ? destinations : sampleDestinations).slice(0, 4);
  const visiblePackages = (travelPackages.length ? travelPackages : samplePackages).slice(0, 3);
  const visibleOffers = verifiedOffers.slice(0, 5);
  const visibleStories = blogPosts.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}>
        {/* Brand header: plain white, no background image */}
        <View style={styles.hero}>
          <BrandGradientBar style={styles.homeNavBar}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Settings"
                onPress={() => router.push('/settings')}
                style={styles.menuButton}>
                <Ionicons name="menu" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <LemonTripBrand size={50} />
              <View style={styles.headerSpacer} />
              <TouchableOpacity accessibilityRole="button" onPress={handleProfilePress} style={styles.profileButton}>
                <Ionicons name="person-outline" size={16} color={Colors.primaryDark} />
                <Text style={styles.profileText}>{user ? user.name.split(' ')[0] : 'Login'}</Text>
              </TouchableOpacity>
            </View>
          </BrandGradientBar>

          {/* Search bar */}
          <TouchableOpacity
            accessibilityRole="search"
            accessibilityLabel="Search flights, hotels, packages and more"
            activeOpacity={0.92}
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/explore')}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <View style={styles.searchTextWrap}>
              <Text style={styles.searchPrefix}>Search </Text>
              <Animated.Text style={[styles.searchHint, hintStyle]} numberOfLines={1}>'{SEARCH_HINTS[hintIndex]}'</Animated.Text>
            </View>
            <View style={styles.searchGo}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>


        {/* Services grid */}
        <View style={styles.servicesCard}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              style={styles.serviceCell}
              onPress={() => {
                if (item.label === 'Visa') blurWebNavigationFocus();
                router.push(item.route);
              }}>
              <View style={[styles.serviceIconWrap, item.image ? styles.serviceIconWrapImage : null]}>
                {item.image ? (
                  <Image source={item.image} style={styles.serviceImage} resizeMode="contain" />
                ) : (
                  <Ionicons name={item.icon} size={26} color={Colors.primary} />
                )}
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.serviceLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Inspiration banner: 3 auto-sliding, swipeable slides */}
        <View style={styles.promo}>
          <ScrollView
            ref={promoScrollRef}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const next = Math.round(event.nativeEvent.contentOffset.x / promoWidth);
              if (next !== promoIndex && next >= 0 && next < PROMO_SLIDES.length) setPromoIndex(next);
            }}>
            {PROMO_SLIDES.map((slide) => (
              <TouchableOpacity
                key={slide.id}
                activeOpacity={0.95}
                style={[styles.promoSlide, { width: promoWidth }]}
                onPress={() => router.push(slide.route)}>
                <Image source={{ uri: slide.image }} style={styles.promoImage} resizeMode="cover" />
                {/* Light overall tint + dark green fade on the left so the text is always readable */}
                <View style={styles.promoShade} />
                <View style={styles.promoFade} pointerEvents="none">
                  {PROMO_FADE_STEPS.map((opacity, index) => (
                    <View key={index} style={{ flex: 1, backgroundColor: `rgba(0,45,43,${opacity})` }} />
                  ))}
                </View>
                <View style={styles.promoCopy}>
                  <Text style={styles.promoEyebrow}>{slide.eyebrow}</Text>
                  <Text style={styles.promoTitle}>{slide.title}</Text>
                  <Text style={styles.promoDescription} numberOfLines={3}>{slide.description}</Text>
                  <View style={styles.promoButton}>
                    <Text style={styles.promoButtonText}>{slide.cta}</Text>
                    <View style={styles.promoButtonArrow}>
                      <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.promoDots} pointerEvents="box-none">
            {PROMO_SLIDES.map((slide, index) => (
              <TouchableOpacity
                key={slide.id}
                accessibilityRole="button"
                accessibilityLabel={`Show slide ${index + 1}`}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                onPress={() => goToPromo(index)}
                style={index === promoIndex ? styles.promoDotActive : styles.promoDot}
              />
            ))}
          </View>
        </View>

        {/* Destinations */}
        <View style={styles.section}>
          <SectionHeader title="Popular Destinations" action="View all" onPress={() => router.push('/(tabs)/explore')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visibleDestinations.map((destination) => {
              const saved = isInWishlist(destination.id);
              return <TouchableOpacity key={destination.id} style={styles.destCard} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.92}>
                <Image source={{ uri: destination.image }} style={styles.destImage} />
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? `Remove ${destination.name} from saved places` : `Save ${destination.name}`} style={styles.saveButton} onPress={() => toggleWishlist({ id: destination.id, name: destination.name, image: destination.image, price: destination.priceFrom })}>
                  <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? Colors.error : Colors.primaryDark} />
                </TouchableOpacity>
                <View style={styles.destMeta}><Text style={styles.destName}>{destination.name}</Text><Text style={styles.destPrice}><Ionicons name="location" size={11} color="#fff" /> {destination.priceFrom}</Text></View>
                <View style={styles.destArrow}><Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} /></View>
              </TouchableOpacity>;
            })}
          </ScrollView>
        </View>

        {/* Packages */}
        <View style={styles.section}>
          <SectionHeader title="Featured Packages" action="View all" onPress={() => router.push('/packages')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visiblePackages.map((travelPackage) => <TouchableOpacity key={travelPackage.id} style={styles.pkgCard} onPress={() => router.push(`/packages/${travelPackage.id}`)} activeOpacity={0.92}>
              <View><Image source={{ uri: travelPackage.image }} style={styles.pkgImage} /><View style={styles.pkgBadgePill}><Text style={styles.pkgBadgeText}>{travelPackage.badge ?? 'Featured'}</Text></View></View>
              <View style={styles.pkgBody}><Text style={styles.pkgTitle} numberOfLines={1}>{travelPackage.title}</Text><View style={styles.pkgMetaRow}><Ionicons name="calendar-outline" size={12} color={Colors.textLight}/><Text style={styles.pkgMeta}>{travelPackage.duration}</Text></View><View style={styles.pkgPriceRow}><Text style={styles.pkgFrom}>From </Text><Text style={styles.pkgPrice}>{travelPackage.price}</Text><View style={styles.pkgArrow}><Ionicons name="arrow-forward" size={14} color={Colors.primary}/></View></View></View>
            </TouchableOpacity>)}
          </ScrollView>
        </View>

        {/* Offers */}
        {visibleOffers.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Offers for you" action="See all" onPress={() => router.push('/offers')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visibleOffers.map((offer) => (
                <TouchableOpacity
                  key={offer.id}
                  style={styles.offerCard}
                  onPress={() => router.push('/offers')}
                  activeOpacity={0.92}>
                  <Image source={{ uri: offer.image }} style={styles.offerImage} />
                  <View style={styles.offerBody}>
                    <Text style={styles.offerCategory}>{offer.category}</Text>
                    <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>
                    <View style={styles.offerCodeChip}>
                      <Ionicons name="pricetag-outline" size={12} color={Colors.primaryDark} />
                      <Text style={styles.offerCode}>Use {offer.code}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Trust strip */}
        <View style={[styles.trustPanel, viewportWidth >= 700 && styles.trustPanelWide]}>
          {trustPoints.map((point) => (
            <View
              key={point.title}
              style={[styles.trustItem, viewportWidth >= 700 && styles.trustItemWide]}
              accessible
              accessibilityLabel={`${point.title}. ${point.subtitle}`}>
              <View style={styles.trustIconWrap}>
                <Ionicons name={point.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.trustCopy}>
                <Text style={styles.trustTitle}>{point.title}</Text>
                <Text style={styles.trustSubtitle}>{point.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Travel Services" action="View all" onPress={() => router.push('/(tabs)/explore')} />
          <View style={styles.travelServices}>
            {[
              { title: 'Bus Tickets', icon: 'bus-outline' as IconName, route: '/(tabs)/explore/buses' },
              { title: 'Hotel Bookings', icon: 'bed-outline' as IconName, route: '/(tabs)/explore/hotels' },
              { title: 'Visa Services', icon: 'id-card-outline' as IconName, route: '/(tabs)/explore/visa' },
              { title: 'Travel Insurance', icon: 'shield-checkmark-outline' as IconName, route: '/(tabs)/explore' },
              { title: 'Car Rentals', icon: 'car-outline' as IconName, route: '/(tabs)/explore' },
              { title: 'Custom Packages', icon: 'gift-outline' as IconName, route: '/packages' },
            ].map((item) => <TouchableOpacity key={item.title} style={styles.travelService} onPress={() => router.push(item.route)}>
              <View style={styles.travelServiceIcon}><Ionicons name={item.icon} size={24} color={Colors.primary}/></View><Text style={styles.travelServiceText}>{item.title}</Text>
            </TouchableOpacity>)}
          </View>
        </View>

        <TouchableOpacity style={styles.bottomCta} onPress={() => router.push('/(tabs)/explore')}>
          <Image source={require('../../../assets/images/header_logo.png')} style={styles.ctaLogo} resizeMode="contain" />
          <Text style={styles.ctaText}>Travel the world with LemonTrip</Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Exploring</Text>
            <View style={styles.ctaButtonArrow}>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Stories */}
        {visibleStories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Travel stories" action="Read all" onPress={() => router.push('/blog')} />
            <View style={styles.storyList}>
              {visibleStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyCard}
                  onPress={() => router.push(`/blog/${story.id}`)}
                  activeOpacity={0.92}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  <View style={styles.storyBody}>
                    <Text style={styles.storyCategory}>{story.category}</Text>
                    <Text style={styles.storyTitle} numberOfLines={3}>{story.title}</Text>
                    <Text style={styles.storyMeta}>{story.date} • 5 min read</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = {
  shadowColor: '#0B1B12',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  // Dark brand colour behind the status bar; the scroll area paints the light page background
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30, maxWidth: 784, width: '100%', alignSelf: 'center' },

  // Hero
  hero: { backgroundColor: '#FFFFFF', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#EEF0EF' },
  homeNavBar: { minHeight: 62, justifyContent: 'center', paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  headerSpacer: { flex: 1 },
  profileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' },
  profileText: { color: '#4B5563', fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },

  // Search (overlaps hero)
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, paddingLeft: 16, paddingRight: 6, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  searchTextWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  searchPrefix: { color: '#9CA3AF', fontFamily: 'Manrope', fontSize: 14 },
  searchHint: { flexShrink: 1, color: '#374151', fontFamily: 'Manrope', fontSize: 14, fontWeight: '600' },
  searchGo: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Services grid
  servicesCard: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 14, paddingVertical: 2, paddingHorizontal: 4, borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  serviceCell: { width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 },
  serviceIconWrap: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#e6f4e8', alignItems: 'center', justifyContent: 'center' },
  // Used when a service shows a custom image (e.g. flight.png). White background so a non-transparent PNG blends in.
  serviceIconWrapImage: { backgroundColor: '#FFFFFF', overflow: 'hidden', borderWidth: 1, borderColor: '#e6f4e8' },
  serviceImage: { width: 44, height: 44 },
  serviceLabel: { marginTop: 6, fontSize: 12, lineHeight: 15, fontFamily: 'Manrope', fontWeight: '700', textAlign: 'center', color: Colors.textDark },
  badge: { position: 'absolute', top: -5, right: -9, backgroundColor: Colors.error, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1.5 },
  badgeText: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },

  // Promo banner
  promo: { height: 212, marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.primaryDark, ...cardShadow },
  promoSlide: { height: 212, overflow: 'hidden' },
  promoImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  promoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,25,23,0.32)' },
  promoFade: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', flexDirection: 'row' },
  promoCopy: { position: 'absolute', left: 20, top: 20, width: '66%' },
  promoEyebrow: { color: '#FFFFFF', fontFamily: 'Caveat', fontSize: 24, lineHeight: 26, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  promoTitle: { color: '#FFFFFF', fontFamily: 'Caveat', fontSize: 32, fontWeight: '700', lineHeight: 36, textShadowColor: 'rgba(0,0,0,0.65)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
  promoDescription: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', lineHeight: 17, marginTop: 6, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },
  // White pill + green arrow: matches the search bar button and the rest of the green theme
  promoButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 22, paddingLeft: 16, paddingRight: 5, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 14 },
  promoButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  promoButtonArrow: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  promoDots: { position: 'absolute', bottom: 12, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  promoDotActive: { width: 20, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  promoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },

  // Sections
  section: { paddingTop: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'serif', fontSize: 20, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  hRow: { paddingHorizontal: 16, paddingBottom: 6, gap: 14 },

  // Offers
  offerCard: { width: 270, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  offerImage: { width: '100%', height: 124, backgroundColor: Colors.surfaceMuted },
  offerBody: { padding: 14 },
  offerCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  offerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 5, lineHeight: 20 },
  offerCodeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 10, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  offerCode: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },

  // Destinations (image card with name over a dark band)
  destCard: { width: 168, height: 155, overflow: 'hidden', backgroundColor: Colors.surfaceMuted, borderRadius: 13, ...cardShadow },
  destImage: { width: '100%', height: '100%' },
  saveButton: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  destMeta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: 'rgba(0,0,0,0.54)' },
  destName: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  destPrice: { color: 'rgba(255,255,255,0.95)', fontFamily: 'Manrope', fontSize: 10, marginTop: 2 },
  destArrow: { position: 'absolute', right: 9, bottom: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  // Packages
  pkgCard: { width: 246, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, ...cardShadow },
  pkgImage: { width: '100%', height: 86, backgroundColor: Colors.surfaceMuted },
  pkgBadgePill: { position: 'absolute', top: 10, left: 10, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors.primary },
  pkgBadgeText: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  pkgBody: { padding: 11 },
  pkgTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  pkgMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  pkgMeta: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  pkgRatingChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8, backgroundColor: Colors.surfaceMuted },
  pkgRating: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 10 },
  pkgFrom: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
  pkgPrice: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900' },
  pkgArrow: { marginLeft: 'auto', width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },

  // Trust strip
  trustPanel: { flexDirection: 'row', marginTop: 18, marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 6, backgroundColor: '#edf7ec', borderWidth: 0, borderRadius: 14 },
  trustPanelWide: { paddingVertical: 14, paddingHorizontal: 10 },
  trustItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  trustItemWide: { flexDirection: 'row', justifyContent: 'center', gap: 8, borderRightWidth: 1, borderRightColor: '#c8dfcb' },
  trustIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  trustCopy: { alignItems: 'center' },
  trustTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, lineHeight: 13, fontWeight: '800', textAlign: 'center' },
  trustSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 12, textAlign: 'center', marginTop: 2 },
  travelServices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16 },
  travelService: { width: '31.7%', minHeight: 88, borderRadius: 16, backgroundColor: '#edf7ec', borderWidth: 1, borderColor: '#d3e8d6', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 4, gap: 7, ...cardShadow },
  travelServiceIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#d3e8d6', alignItems: 'center', justifyContent: 'center' },
  travelServiceText: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', color: Colors.primaryDark, textAlign: 'center' },
  bottomCta: { minHeight: 58, marginHorizontal: 16, marginTop: 16, borderRadius: 28, backgroundColor: Colors.primaryDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 7 },
  ctaLogo: { width: 46, height: 42 },
  ctaText: { color: '#fff', fontFamily: 'Caveat', fontSize: 19, flex: 1 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 20, paddingLeft: 14, paddingRight: 5, paddingVertical: 5 },
  ctaButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  ctaButtonArrow: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Stories
  storyList: { paddingHorizontal: 16, gap: 14 },
  storyCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, overflow: 'hidden', ...cardShadow },
  storyImage: { width: 112, backgroundColor: Colors.surfaceMuted },
  storyBody: { flex: 1, padding: 14 },
  storyCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  storyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 5, lineHeight: 20 },
  storyMeta: { marginTop: 8, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
});