import { Colors } from '@/constants/colors';
import type { Offer } from '@/data/offers';
import { loadOffers, getOfferValidity } from '@/utils/offerApi';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { getUser, useAuth } from '@/utils/authStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type ServiceItem = {
  label: string;
  icon: IconName;
  badge?: string;
  route: Parameters<typeof router.push>[0];
};

// One unified services grid (4 columns), thin outline icons
const services: ServiceItem[] = [
  { label: 'Flights', icon: 'airplane-outline', route: '/(tabs)/explore/flights' },
  { label: 'Hotels', icon: 'bed-outline', route: '/(tabs)/explore/hotels' },
  { label: 'Holiday\nPackages', icon: 'umbrella-outline', route: '/packages' },
  { label: 'Trains', icon: 'train-outline', route: '/(tabs)/explore/trains' },
  { label: 'Buses', icon: 'bus-outline', route: '/(tabs)/explore/buses' },
  { label: 'Visa', icon: 'id-card-outline', route: '/(tabs)/explore/visa' },
  { label: 'Offers', icon: 'pricetag-outline', badge: 'NEW', route: '/offers' },
  { label: 'Saved\nPlaces', icon: 'heart-outline', route: '/(tabs)/wishlist' },
  { label: 'Travel\nStories', icon: 'newspaper-outline', route: '/blog' },
  { label: 'Cart', icon: 'cart-outline', route: '/cart' },
  { label: 'Help', icon: 'headset-outline', route: '/help' },
  { label: 'Explore\nAll', icon: 'compass-outline', route: '/(tabs)/explore' },
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
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}>
        {/* Brand hero header */}
        <ImageBackground
          source={require('../../../assets/images/herosection_bgimage2.png')}
          style={styles.hero}
          resizeMode="cover">
          <View style={styles.heroOverlay} />
          <View style={styles.headerRow}>
            <View style={styles.brandWrap}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Settings"
                onPress={() => router.push('/settings')}
                style={styles.menuButton}>
                <Ionicons name="menu" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Image
                source={require('../../../assets/images/header_logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <Text style={styles.brand}>Lemon Trip</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={handleProfilePress} style={styles.profileButton}>
              <Ionicons name="person-outline" size={16} color="#FFFFFF" />
              <Text style={styles.profileText}>{user ? user.name.split(' ')[0] : 'Login'}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Search card overlapping the hero */}
        <TouchableOpacity activeOpacity={0.92} style={styles.searchBar} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="search-outline" size={20} color={Colors.primary} />
          <Text style={styles.searchText} numberOfLines={1}>Search 'Goa hotels' or 'Delhi to Mumbai'</Text>
          <View style={styles.searchGo}>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

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
              <View style={styles.serviceIconWrap}>
                <Ionicons name={item.icon} size={26} color={Colors.primary} />
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

        {/* Inspiration banner */}
        <TouchableOpacity activeOpacity={0.92} style={styles.promo} onPress={() => router.push('/packages')}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400' }} style={styles.promoImage} />
          <View style={styles.promoShade} />
          <View style={styles.promoCopy}>
            <Text style={styles.promoEyebrow}>Your Next</Text>
            <Text style={styles.promoTitle}>Adventure Awaits!</Text>
            <Text style={styles.promoDescription}>Discover amazing destinations,{ '\n' }exclusive deals and unforgettable{ '\n' }experiences with LemonTrip.</Text>
            <View style={styles.promoButton}><Text style={styles.promoButtonText}>Explore Now</Text><Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} /></View>
          </View>
          <View style={styles.promoDots}><View style={styles.promoDotActive}/><View style={styles.promoDot}/><View style={styles.promoDot}/></View>
        </TouchableOpacity>

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
              <Ionicons name={item.icon} size={27} color={Colors.primary}/><Text style={styles.travelServiceText}>{item.title}</Text>
            </TouchableOpacity>)}
          </View>
        </View>

        <TouchableOpacity style={styles.bottomCta} onPress={() => router.push('/(tabs)/explore')}>
          <Image source={require('../../../assets/images/header_logo.png')} style={styles.ctaLogo} resizeMode="contain" />
          <Text style={styles.ctaText}>Travel the world with LemonTrip</Text>
          <Text style={styles.ctaButton}>Start Exploring  →</Text>
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
  safeArea: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30, maxWidth: 784, width: '100%', alignSelf: 'center' },

  // Hero
  hero: { backgroundColor: Colors.primaryDark, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 54, minHeight: 108, overflow: 'hidden' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  brandLogo: { width: 64, height: 46 },
  brand: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 20, fontWeight: '900' },
  profileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  profileText: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },

  // Search (overlaps hero)
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: -34, paddingLeft: 16, paddingRight: 8, height: 54, borderRadius: 29, backgroundColor: Colors.surface, ...cardShadow },
  searchText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14 },
  searchGo: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Services grid
  servicesCard: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 14, paddingVertical: 2, paddingHorizontal: 4, borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  serviceCell: { width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 },
  serviceIconWrap: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#e6f4e8', alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { marginTop: 6, fontSize: 12, lineHeight: 15, fontFamily: 'Manrope', fontWeight: '700', textAlign: 'center', color: Colors.textDark },
  badge: { position: 'absolute', top: -5, right: -9, backgroundColor: Colors.error, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1.5 },
  badgeText: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },

  // Sections
  promo: { height: 212, marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.primaryDark },
  promoImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  promoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,45,43,0.30)' },
  promoCopy: { position: 'absolute', left: 20, top: 19 },
  promoEyebrow: { color: '#fff', fontFamily: 'Caveat', fontSize: 26, lineHeight: 29 },
  promoTitle: { color: '#fff', fontFamily: 'Caveat', fontSize: 30, fontWeight: '700', lineHeight: 34 },
  promoDescription: { color: '#fff', fontFamily: 'Manrope', fontSize: 12, lineHeight: 16, marginTop: 4 },
  promoButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-start', marginTop: 13 },
  promoButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  promoDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  promoDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  promoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.65)' },
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
  pkgBadgePill: { position: 'absolute', top: 10, left: 10, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors.accent },
  pkgBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
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
  travelService: { width: '31.7%', minHeight: 72, borderRadius: 13, backgroundColor: '#fff9d9', borderWidth: 1, borderColor: '#f3edc7', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 4, ...cardShadow },
  travelServiceText: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', color: Colors.primaryDark, textAlign: 'center' },
  bottomCta: { minHeight: 58, marginHorizontal: 16, marginTop: 16, borderRadius: 28, backgroundColor: Colors.primaryDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 7 },
  ctaLogo: { width: 46, height: 42 },
  ctaText: { color: '#fff', fontFamily: 'Caveat', fontSize: 19, flex: 1 },
  ctaButton: { backgroundColor: Colors.accent, color: Colors.primaryDark, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 18, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', overflow: 'hidden' },

  // Stories
  storyList: { paddingHorizontal: 16, gap: 14 },
  storyCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, overflow: 'hidden', ...cardShadow },
  storyImage: { width: 112, backgroundColor: Colors.surfaceMuted },
  storyBody: { flex: 1, padding: 14 },
  storyCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  storyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 5, lineHeight: 20 },
  storyMeta: { marginTop: 8, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
});
