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
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const visibleDestinations = destinations.slice(0, 6);
  const visiblePackages = travelPackages.slice(0, 4);
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
              onPress={() => router.push(item.route)}>
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

        {/* Destinations */}
        {visibleDestinations.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Popular destinations" action="See all" onPress={() => router.push('/(tabs)/explore')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visibleDestinations.map((destination) => {
                const saved = isInWishlist(destination.id);
                return (
                  <TouchableOpacity
                    key={destination.id}
                    style={styles.destCard}
                    onPress={() => router.push('/(tabs)/explore')}
                    activeOpacity={0.92}>
                    <Image source={{ uri: destination.image }} style={styles.destImage} />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={saved ? `Remove ${destination.name} from saved places` : `Save ${destination.name}`}
                      style={styles.saveButton}
                      onPress={() =>
                        toggleWishlist({
                          id: destination.id,
                          name: destination.name,
                          image: destination.image,
                          price: destination.priceFrom,
                        })
                      }>
                      <Ionicons
                        name={saved ? 'heart' : 'heart-outline'}
                        size={16}
                        color={saved ? Colors.error : Colors.primaryDark}
                      />
                    </TouchableOpacity>
                    <View style={styles.destMeta}>
                      <Text style={styles.destName} numberOfLines={1}>{destination.name}</Text>
                      <Text style={styles.destPrice}>From {destination.priceFrom}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Packages */}
        {visiblePackages.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Holiday packages" action="See all" onPress={() => router.push('/packages')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visiblePackages.map((travelPackage) => (
                <TouchableOpacity
                  key={travelPackage.id}
                  style={styles.pkgCard}
                  onPress={() => router.push(`/packages/${travelPackage.id}`)}
                  activeOpacity={0.92}>
                  <View>
                    <Image source={{ uri: travelPackage.image }} style={styles.pkgImage} />
                    {travelPackage.badge ? (
                      <View style={styles.pkgBadgePill}>
                        <Text style={styles.pkgBadgeText}>{travelPackage.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.pkgBody}>
                    <Text style={styles.pkgTitle} numberOfLines={1}>{travelPackage.title}</Text>
                    <View style={styles.pkgMetaRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textLight} />
                      <Text style={styles.pkgMeta}>{travelPackage.duration}</Text>
                      {travelPackage.rating ? (
                        <View style={styles.pkgRatingChip}>
                          <Ionicons name="star" size={11} color="#F5A524" />
                          <Text style={styles.pkgRating}>{travelPackage.rating}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.pkgPriceRow}>
                      <Text style={styles.pkgFrom}>From</Text>
                      <Text style={styles.pkgPrice}>{travelPackage.price}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Trust strip */}
        <View style={styles.trustPanel}>
          {trustPoints.map((point) => (
            <View
              key={point.title}
              style={styles.trustItem}
              accessible
              accessibilityLabel={`${point.title}. ${point.subtitle}`}>
              <View style={styles.trustIconWrap}>
                <Ionicons name={point.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.trustTitle}>{point.title}</Text>
            </View>
          ))}
        </View>

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
  page: { paddingBottom: 40 },

  // Hero
  hero: { backgroundColor: Colors.primaryDark, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 72, minHeight: 210, overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  brandLogo: { width: 64, height: 46 },
  brand: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 20, fontWeight: '900' },
  profileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  profileText: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },

  // Search (overlaps hero)
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: -30, paddingLeft: 16, paddingRight: 8, height: 54, borderRadius: 29, backgroundColor: Colors.surface, ...cardShadow },
  searchText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14 },
  searchGo: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },

  // Services grid
  servicesCard: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 16, paddingVertical: 6, paddingHorizontal: 4, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  serviceCell: { width: '25%', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 2 },
  serviceIconWrap: { width: 52, height: 52, borderRadius: 18, backgroundColor: Colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { marginTop: 6, fontSize: 12, lineHeight: 15, fontFamily: 'Manrope', fontWeight: '700', textAlign: 'center', color: Colors.textDark },
  badge: { position: 'absolute', top: -5, right: -9, backgroundColor: Colors.error, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1.5 },
  badgeText: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },

  // Sections
  section: { paddingTop: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 19, fontWeight: '800' },
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
  destCard: { width: 168, height: 214, overflow: 'hidden', backgroundColor: Colors.surfaceMuted, borderRadius: 20, ...cardShadow },
  destImage: { width: '100%', height: '100%' },
  saveButton: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  destMeta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: 'rgba(0,0,0,0.45)' },
  destName: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  destPrice: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Manrope', fontSize: 11, marginTop: 2 },

  // Packages
  pkgCard: { width: 250, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, ...cardShadow },
  pkgImage: { width: '100%', height: 142, backgroundColor: Colors.surfaceMuted },
  pkgBadgePill: { position: 'absolute', top: 10, left: 10, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors.accent },
  pkgBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  pkgBody: { padding: 14 },
  pkgTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  pkgMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  pkgMeta: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  pkgRatingChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8, backgroundColor: Colors.surfaceMuted },
  pkgRating: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 10 },
  pkgFrom: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
  pkgPrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' },

  // Trust strip
  trustPanel: { flexDirection: 'row', marginTop: 28, marginHorizontal: 16, paddingVertical: 16, paddingHorizontal: 6, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20 },
  trustItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  trustIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  trustTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, lineHeight: 14, fontWeight: '700', textAlign: 'center' },

  // Stories
  storyList: { paddingHorizontal: 16, gap: 14 },
  storyCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, overflow: 'hidden', ...cardShadow },
  storyImage: { width: 112, backgroundColor: Colors.surfaceMuted },
  storyBody: { flex: 1, padding: 14 },
  storyCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  storyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 5, lineHeight: 20 },
  storyMeta: { marginTop: 8, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
});