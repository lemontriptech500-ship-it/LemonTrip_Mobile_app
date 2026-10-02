import { Colors } from '@/constants/colors';
import type { Offer } from '@/data/offers';
import { loadOffers, getOfferValidity } from '@/utils/offerApi';
import type { BlogPost, Destination, TravelPackage, TravelService } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import TripSearchPanel, { SearchType } from '@/components/TripSearchPanel';
import { getUser, useAuth } from '@/utils/authStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const navItems = ['Flights', 'Hotels', 'Buses', 'Trains', 'Packages', 'Visa', 'Offers'];

const trustPoints = [
  { icon: 'shield-checkmark-outline', title: 'Secure bookings', subtitle: 'Protected payments and verified stays.' },
  { icon: 'cash-outline', title: 'Transparent pricing', subtitle: 'No surprises, just clear value.' },
  { icon: 'headset-outline', title: 'Travel support', subtitle: 'Real help, before and during your trip.' },
  { icon: 'sparkles-outline', title: 'Personalized travel', subtitle: 'Trips designed around your preferences.' },
];

export default function HomeScreen() {
  useWishlist();
  const user = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [verifiedOffers, setVerifiedOffers] = useState<Offer[]>([]);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: blogPosts } = useContentItems<BlogPost>('blog');
  const { items: destinations } = useContentItems<Destination>('destination');
  const { items: services } = useContentItems<TravelService>('service');

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

  const handleServicePress = (serviceId: string) => {
    if (serviceId === 'visa') {
      router.push('/(tabs)/explore/visa');
      return;
    }

    if (serviceId === 'hotels') {
      router.push('/(tabs)/explore/hotels');
      return;
    }

    if (serviceId === 'packages') {
      router.push('/packages');
      return;
    }

    router.push(`/(tabs)/explore/${serviceId}`);
  };

  const handleSearch = (type: SearchType) => {
    setSearchError(null);
    setIsSearchLoading(true);

    const routeMap: Record<SearchType, Parameters<typeof router.push>[0]> = {
      flights: '/(tabs)/explore/flights',
      hotels: '/(tabs)/explore/hotels',
      buses: '/(tabs)/explore/buses',
      trains: '/(tabs)/explore/trains',
      packages: '/packages',
    };

    const route = routeMap[type] ?? '/(tabs)/explore';

    setTimeout(() => {
      setIsSearchLoading(false);
      router.push(route);
    }, 250);
  };

  const handleProfilePress = () => {
    if (getUser()) {
      router.push('/(tabs)/profile');
      return;
    }

    router.push('/login');
  };

  const visibleDestinations = destinations.slice(0, 6);
  const visiblePackages = travelPackages.slice(0, 3);
  const visibleOffers = verifiedOffers.slice(0, 4);
  const visibleStories = blogPosts.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.headerShell}>
          <View style={styles.headerRow}>
            <View style={styles.brandWrap}>
              <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>L</Text></View>
              <Text style={styles.brand}>LemonTrip</Text>
            </View>

            {isDesktop ? (
              <View style={styles.navRow}>
                {navItems.map((item) => (
                  <TouchableOpacity key={item} activeOpacity={0.8} onPress={() => router.push('/(tabs)/explore')}>
                    <Text style={styles.navItem}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={styles.headerActions}>
              {isDesktop ? (
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.iconButton}>
                  <Ionicons name="search-outline" size={18} color={Colors.primaryDark} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity accessibilityRole="button" onPress={handleProfilePress} style={styles.profileButton}>
                <Ionicons name="person-outline" size={18} color={Colors.primaryDark} />
                <Text style={styles.profileText}>{user ? user.name.split(' ')[0] : 'Login'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.heroWrap}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=90' }}
            style={styles.heroImage}
            resizeMode="cover">
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>Premium travel booking</Text>
              <Text style={styles.heroTitle}>Your journey starts here.</Text>
              <Text style={styles.heroCopy}>Flights, stays, experiences and more — planned around you.</Text>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/explore')}>
                  <Text style={styles.primaryButtonText}>Explore journeys</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(tabs)/explore/flights')}>
                  <Text style={styles.secondaryButtonText}>Search trips</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <TripSearchPanel loading={isSearchLoading} error={searchError} onSearch={handleSearch} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Travel services</Text>
              <Text style={styles.sectionTitle}>Plan your next move</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {services.length > 0 ? (
            <View style={styles.serviceGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service.id)}
                  activeOpacity={0.9}>
                  <View style={styles.serviceIconWrap}>
                    <Ionicons name={service.icon} size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textLight} style={styles.serviceArrow} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateCard}><Text style={styles.emptyStateText}>No travel services available right now.</Text></View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Popular destinations</Text>
              <Text style={styles.sectionTitle}>Places travellers keep returning to</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {visibleDestinations.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationRow}>
              {visibleDestinations.map((destination) => {
                const saved = isInWishlist(destination.id);
                return (
                  <TouchableOpacity key={destination.id} style={styles.destinationCard} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.9}>
                    <Image source={{ uri: destination.image }} style={styles.destinationImage} />
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
                          category: 'Destinations',
                          location: destination.name,
                        })
                      }>
                      <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? Colors.error : Colors.primaryDark} />
                    </TouchableOpacity>
                    <View style={styles.destinationMeta}>
                      <Text style={styles.destinationName}>{destination.name}</Text>
                      <Text style={styles.destinationPrice}>From {destination.priceFrom}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyStateCard}><Text style={styles.emptyStateText}>No destinations to show right now.</Text></View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Featured journeys</Text>
              <Text style={styles.sectionTitle}>Holiday packages made easy</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/packages')}>
              <Text style={styles.linkText}>View all</Text>
            </TouchableOpacity>
          </View>

          {visiblePackages.length > 0 ? (
            <View style={styles.packageList}>
              {visiblePackages.map((travelPackage) => (
                <TouchableOpacity
                  key={travelPackage.id}
                  style={styles.packageCard}
                  onPress={() => router.push(`/packages/${travelPackage.id}`)}
                  activeOpacity={0.9}>
                  <Image source={{ uri: travelPackage.image }} style={styles.packageImage} />
                  <View style={styles.packageBody}>
                    <View style={styles.packageTopRow}>
                      {travelPackage.badge ? <Text style={styles.packageBadge}>{travelPackage.badge}</Text> : null}
                      {travelPackage.rating ? <Text style={styles.packageRating}>{travelPackage.rating}</Text> : null}
                    </View>
                    <Text style={styles.packageTitle}>{travelPackage.title}</Text>
                    <Text style={styles.packageMeta}>{travelPackage.duration}</Text>
                    <View style={styles.packageBottomRow}>
                      <Text style={styles.packagePrice}>From {travelPackage.price}</Text>
                      <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateCard}><Text style={styles.emptyStateText}>No featured journeys available right now.</Text></View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Special offers</Text>
              <Text style={styles.sectionTitle}>Smart savings for every trip</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/offers')}>
              <Text style={styles.linkText}>See offers</Text>
            </TouchableOpacity>
          </View>

          {visibleOffers.length > 0 ? (
            <View style={styles.offerList}>
              {visibleOffers.map((offer) => (
                <TouchableOpacity key={offer.id} style={styles.offerCard} onPress={() => router.push('/offers')} activeOpacity={0.9}>
                  <Image source={{ uri: offer.image }} style={styles.offerImage} />
                  <View style={styles.offerBody}>
                    <Text style={styles.offerCategory}>{offer.category}</Text>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerDescription} numberOfLines={2}>{offer.description}</Text>
                    <Text style={styles.offerCode}>{offer.code}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateCard}><Text style={styles.emptyStateText}>No verified offers available right now.</Text></View>
          )}
        </View>

        <View style={styles.trustPanel}>
          <Text style={styles.eyebrow}>Why LemonTrip</Text>
          <Text style={styles.sectionTitle}>Travel with confidence.</Text>
          <View style={styles.trustGrid}>
            {trustPoints.map((point) => (
              <View key={point.title} style={styles.trustCard}>
                <View style={styles.trustIconWrap}>
                  <Ionicons name={point.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.trustTitle}>{point.title}</Text>
                <Text style={styles.trustText}>{point.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Travel stories</Text>
              <Text style={styles.sectionTitle}>Ideas and inspiration for your next escape</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/blog')}>
              <Text style={styles.linkText}>Read all</Text>
            </TouchableOpacity>
          </View>

          {visibleStories.length > 0 ? (
            <View style={styles.storyList}>
              {visibleStories.map((story) => (
                <TouchableOpacity key={story.id} style={styles.storyCard} onPress={() => router.push(`/blog/${story.id}`)} activeOpacity={0.9}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  <View style={styles.storyBody}>
                    <Text style={styles.storyCategory}>{story.category}</Text>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    <View style={styles.storyMeta}>
                      <Text style={styles.storyMetaText}>{story.date}</Text>
                      <Text style={styles.storyMetaText}>•</Text>
                      <Text style={styles.storyMetaText}>5 min read</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateCard}><Text style={styles.emptyStateText}>No stories available right now.</Text></View>
          )}
        </View>

        <View style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Ready for your next journey?</Text>
          <View style={styles.finalCtaActions}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.primaryButtonText}>Explore journeys</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButtonAlt} onPress={() => router.push('/(tabs)/explore/flights')}>
              <Text style={styles.secondaryButtonAltText}>Search flights</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerGrid}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Company</Text>
              <Text style={styles.footerLink}>About</Text>
              <Text style={styles.footerLink}>Careers</Text>
              <Text style={styles.footerLink}>Media</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Travel</Text>
              <Text style={styles.footerLink}>Flights</Text>
              <Text style={styles.footerLink}>Hotels</Text>
              <Text style={styles.footerLink}>Packages</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Support</Text>
              <Text style={styles.footerLink}>Customer care</Text>
              <Text style={styles.footerLink}>FAQs</Text>
              <Text style={styles.footerLink}>Visa help</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Legal</Text>
              <Text style={styles.footerLink}>Privacy</Text>
              <Text style={styles.footerLink}>Terms</Text>
              <Text style={styles.footerLink}>Security</Text>
            </View>
          </View>
          <Text style={styles.footerNote}>hello@lemontrip.in • +91 22 1234 5678</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 36 },
  headerShell: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: { width: 28, height: 28, borderRadius: 10, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  brand: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  navItem: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  profileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: Colors.accentSoft, borderWidth: 1, borderColor: Colors.border },
  profileText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  heroWrap: { paddingHorizontal: 16, marginTop: 12 },
  heroImage: { minHeight: 390, justifyContent: 'flex-end', borderRadius: 24, overflow: 'hidden' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 35, 26, 0.42)' },
  heroContent: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 28 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 38, fontWeight: '800', lineHeight: 42, marginTop: 8 },
  heroCopy: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Manrope', fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 300 },
  heroActions: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryButton: { minHeight: 46, paddingHorizontal: 18, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  secondaryButton: { minHeight: 46, paddingHorizontal: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  section: { paddingTop: 26, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 22, fontWeight: '800', marginTop: 4 },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    minHeight: 140,
  },
  serviceIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  serviceTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', marginBottom: 5 },
  serviceSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15 },
  serviceArrow: { marginTop: 12, alignSelf: 'flex-end' },
  destinationRow: { paddingRight: 16, gap: 12 },
  destinationCard: { width: 210, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18 },
  destinationImage: { width: 210, height: 170, backgroundColor: Colors.surfaceMuted },
  saveButton: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  destinationMeta: { paddingHorizontal: 12, paddingVertical: 12 },
  destinationName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  destinationPrice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, marginTop: 4 },
  packageList: { gap: 14 },
  packageCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, overflow: 'hidden' },
  packageImage: { width: '100%', height: 180, backgroundColor: Colors.surfaceMuted },
  packageBody: { padding: 14 },
  packageTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  packageBadge: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  packageRating: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  packageTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  packageMeta: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginBottom: 8 },
  packageBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  packagePrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  offerList: { gap: 12 },
  offerCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, overflow: 'hidden' },
  offerImage: { width: 120, height: 118, backgroundColor: Colors.surfaceMuted },
  offerBody: { flex: 1, padding: 14 },
  offerCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  offerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 6 },
  offerDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 16, marginTop: 5 },
  offerCode: { marginTop: 10, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  trustPanel: { marginTop: 28, marginHorizontal: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, padding: 18 },
  trustGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trustCard: { width: '48%', backgroundColor: Colors.background, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  trustIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  trustTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', marginBottom: 5 },
  trustText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 16 },
  storyList: { gap: 12 },
  storyCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, overflow: 'hidden' },
  storyImage: { width: '100%', height: 180, backgroundColor: Colors.surfaceMuted },
  storyBody: { padding: 14 },
  storyCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  storyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 7 },
  storyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  storyMetaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  finalCta: { marginTop: 28, marginHorizontal: 16, padding: 18, borderRadius: 20, backgroundColor: Colors.primaryDark },
  finalCtaTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 24, fontWeight: '800' },
  finalCtaActions: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  secondaryButtonAlt: { minHeight: 46, paddingHorizontal: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  secondaryButtonAltText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  footer: { marginTop: 28, paddingHorizontal: 16 },
  footerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  footerColumn: { width: '45%', gap: 6 },
  footerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  footerLink: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  footerNote: { marginTop: 18, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
  emptyStateCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 18, alignItems: 'center' },
  emptyStateText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
});
