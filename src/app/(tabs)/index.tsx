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
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type ServiceItem = { label: string; icon: IconName; route: Parameters<typeof router.push>[0] };

// Top row: the four big tiles
const mainServices: ServiceItem[] = [
  { label: 'Flights', icon: 'airplane', route: '/(tabs)/explore/flights' },
  { label: 'Hotels', icon: 'business', route: '/(tabs)/explore/hotels' },
  { label: 'Holiday\nPackages', icon: 'umbrella', route: '/packages' },
  { label: 'Trains', icon: 'train', route: '/(tabs)/explore/trains' },
];

// Second card: 4-column grid. Change routes here if you add more screens.
const moreServices: ServiceItem[] = [
  { label: 'Buses', icon: 'bus', route: '/(tabs)/explore/buses' },
  { label: 'Visa', icon: 'document-text', route: '/(tabs)/explore/visa' },
  { label: 'Offers', icon: 'pricetag', route: '/offers' },
  { label: 'Saved\nPlaces', icon: 'heart', route: '/(tabs)/wishlist' },
  { label: 'Travel\nStories', icon: 'newspaper', route: '/blog' },
  { label: 'Cart', icon: 'cart', route: '/cart' },
  { label: 'Help', icon: 'headset', route: '/help' },
  { label: 'Explore\nAll', icon: 'compass', route: '/(tabs)/explore' },
];

const trustPoints: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: 'shield-checkmark-outline', title: 'Secure bookings', subtitle: 'Protected payments and verified stays.' },
  { icon: 'cash-outline', title: 'Transparent pricing', subtitle: 'No surprises, just clear value.' },
  { icon: 'headset-outline', title: 'Travel support', subtitle: 'Real help, before and during your trip.' },
  { icon: 'sparkles-outline', title: 'Personalized travel', subtitle: 'Trips designed around your preferences.' },
];

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
    return () => { mounted = false; };
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandWrap}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} style={styles.menuButton}>
              <Ionicons name="menu" size={26} color={Colors.primaryDark} />
            </TouchableOpacity>
            <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>L</Text></View>
            <Text style={styles.brand}>LemonTrip</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={handleProfilePress} style={styles.profileButton}>
            <Ionicons name="person-outline" size={16} color={Colors.primaryDark} />
            <Text style={styles.profileText}>{user ? user.name.split(' ')[0] : 'Login'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity activeOpacity={0.85} style={styles.searchBar} onPress={() => router.push('/(tabs)/explore')}>
          <Ionicons name="search" size={20} color={Colors.primary} />
          <Text style={styles.searchText}>Search 'Goa hotels' or 'Delhi to Mumbai'</Text>
        </TouchableOpacity>

        {/* Main service tiles */}
        <View style={styles.mainRow}>
          {mainServices.map((item) => (
            <TouchableOpacity key={item.label} activeOpacity={0.85} style={styles.mainTile} onPress={() => router.push(item.route)}>
              <Ionicons name={item.icon} size={30} color={Colors.primary} />
              <Text style={styles.mainLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* More services grid */}
        <View style={styles.moreCard}>
          {moreServices.map((item) => (
            <TouchableOpacity key={item.label} activeOpacity={0.8} style={styles.moreCell} onPress={() => router.push(item.route)}>
              <View style={styles.moreIconWrap}>
                <Ionicons name={item.icon} size={22} color={Colors.secondary} />
              </View>
              <Text style={styles.moreLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers */}
        {visibleOffers.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Offers for you</Text>
              <TouchableOpacity onPress={() => router.push('/offers')}>
                <Text style={styles.linkText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visibleOffers.map((offer) => (
                <TouchableOpacity key={offer.id} style={styles.offerCard} onPress={() => router.push('/offers')} activeOpacity={0.9}>
                  <Image source={{ uri: offer.image }} style={styles.offerImage} />
                  <View style={styles.offerBody}>
                    <Text style={styles.offerCategory}>{offer.category}</Text>
                    <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>
                    <Text style={styles.offerCode}>Use {offer.code}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Destinations */}
        {visibleDestinations.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular destinations</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.linkText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visibleDestinations.map((destination) => {
                const saved = isInWishlist(destination.id);
                return (
                  <TouchableOpacity key={destination.id} style={styles.destCard} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.9}>
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
                      <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? Colors.error : Colors.primaryDark} />
                    </TouchableOpacity>
                    <View style={styles.destMeta}>
                      <Text style={styles.destName}>{destination.name}</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Holiday packages</Text>
              <TouchableOpacity onPress={() => router.push('/packages')}>
                <Text style={styles.linkText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visiblePackages.map((travelPackage) => (
                <TouchableOpacity
                  key={travelPackage.id}
                  style={styles.pkgCard}
                  onPress={() => router.push(`/packages/${travelPackage.id}`)}
                  activeOpacity={0.9}>
                  <Image source={{ uri: travelPackage.image }} style={styles.pkgImage} />
                  <View style={styles.pkgBody}>
                    <View style={styles.pkgTopRow}>
                      {travelPackage.badge ? <Text style={styles.pkgBadge}>{travelPackage.badge}</Text> : <View />}
                      {travelPackage.rating ? <Text style={styles.pkgRating}>{travelPackage.rating}</Text> : null}
                    </View>
                    <Text style={styles.pkgTitle} numberOfLines={1}>{travelPackage.title}</Text>
                    <Text style={styles.pkgMeta}>{travelPackage.duration}</Text>
                    <Text style={styles.pkgPrice}>From {travelPackage.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Trust */}
        <View style={styles.trustPanel}>
          <Text style={styles.sectionTitle}>Why LemonTrip</Text>
          <View style={styles.trustGrid}>
            {trustPoints.map((point) => (
              <View key={point.title} style={styles.trustCard}>
                <View style={styles.trustIconWrap}>
                  <Ionicons name={point.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.trustTitle}>{point.title}</Text>
                <Text style={styles.trustText}>{point.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stories */}
        {visibleStories.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Travel stories</Text>
              <TouchableOpacity onPress={() => router.push('/blog')}>
                <Text style={styles.linkText}>Read all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.storyList}>
              {visibleStories.map((story) => (
                <TouchableOpacity key={story.id} style={styles.storyCard} onPress={() => router.push(`/blog/${story.id}`)} activeOpacity={0.9}>
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
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: -6 },
  brandBadge: { width: 28, height: 28, borderRadius: 10, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  brand: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  profileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: Colors.accentSoft, borderWidth: 1, borderColor: Colors.border },
  profileText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, paddingHorizontal: 16, height: 50, borderRadius: 25, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.primary },
  searchText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14 },

  mainRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  mainTile: { flex: 1, minHeight: 84, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 2, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  mainLabel: { marginTop: 6, fontSize: 12, fontFamily: 'Manrope', fontWeight: '800', textAlign: 'center', color: Colors.textDark },

  moreCard: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  moreCell: { width: '25%', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2 },
  moreIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  moreLabel: { marginTop: 6, fontSize: 11.5, lineHeight: 15, fontFamily: 'Manrope', fontWeight: '600', textAlign: 'center', color: Colors.textDark },

  section: { paddingTop: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 20, fontWeight: '800' },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  hRow: { paddingHorizontal: 16, gap: 12 },

  offerCard: { width: 260, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  offerImage: { width: '100%', height: 120, backgroundColor: Colors.surfaceMuted },
  offerBody: { padding: 12 },
  offerCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  offerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginTop: 4 },
  offerCode: { marginTop: 8, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },

  destCard: { width: 190, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18 },
  destImage: { width: 190, height: 150, backgroundColor: Colors.surfaceMuted },
  saveButton: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  destMeta: { paddingHorizontal: 12, paddingVertical: 10 },
  destName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  destPrice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, marginTop: 3 },

  pkgCard: { width: 240, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18 },
  pkgImage: { width: '100%', height: 140, backgroundColor: Colors.surfaceMuted },
  pkgBody: { padding: 12 },
  pkgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pkgBadge: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  pkgRating: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  pkgTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  pkgMeta: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  pkgPrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginTop: 8 },

  trustPanel: { marginTop: 28, marginHorizontal: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, padding: 18 },
  trustGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trustCard: { width: '48%', backgroundColor: Colors.surfaceMuted, borderRadius: 14, padding: 14 },
  trustIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  trustTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  trustText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 16 },

  storyList: { paddingHorizontal: 16, gap: 12 },
  storyCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, overflow: 'hidden' },
  storyImage: { width: 110, backgroundColor: Colors.surfaceMuted },
  storyBody: { flex: 1, padding: 12 },
  storyCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  storyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginTop: 4 },
  storyMeta: { marginTop: 8, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
});