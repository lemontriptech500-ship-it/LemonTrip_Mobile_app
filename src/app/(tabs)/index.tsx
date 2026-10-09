import { AppScreen } from '@/components/AppScreen';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import { Colors } from '@/constants/colors';
import type { Offer } from '@/data/mock/offers';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { getUser, useAuth } from '@/utils/authStore';
import { useCart } from '@/utils/cartStore';
import { useContentItems } from '@/utils/contentApi';
import { getOfferValidity, loadOffers } from '@/utils/offerApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type ServiceItem = {
  label: string;
  icon: IconName;
  badge?: string;
  route: Parameters<typeof router.push>[0];
};

// Keep the main search focused on the five services shown in the dashboard design.
const services: ServiceItem[] = [
  { label: 'Flights', icon: 'airplane-outline', route: '/(tabs)/explore/flights' },
  { label: 'Hotels', icon: 'business-outline', route: '/(tabs)/explore/hotels' },
  { label: 'Packages', icon: 'sunny-outline', route: '/packages' },
  { label: 'Visa', icon: 'id-card-outline', route: '/(tabs)/explore/visa' },
  { label: 'AI Plan', icon: 'sparkles-outline', route: '/assistant' },
  { label: 'Trains', icon: 'train-outline', route: '/(tabs)/explore/trains' },
  { label: 'Buses', icon: 'bus-outline', route: '/(tabs)/explore/buses' },
  { label: 'Offers', icon: 'pricetag-outline', badge: 'NEW', route: '/offers' },
  { label: 'Saved Places', icon: 'heart-outline', route: '/(tabs)/wishlist' },
  { label: 'Travel Stories', icon: 'newspaper-outline', route: '/blog' },
  { label: 'Trip Cart', icon: 'cart-outline', route: '/cart' },
  { label: 'Help', icon: 'headset-outline', route: '/help' },
  { label: 'Explore All', icon: 'compass-outline', route: '/(tabs)/explore' },
];
const packageCategories = ['Honeymoon', 'Beach & Boating', 'Mountain Treks', 'City Tours', 'Luxury Resorts'];
const packageCategoryAliases: Record<string, string[]> = {
  Honeymoon: ['honeymoon'],
  'Beach & Boating': ['beach', 'boating', 'adventure', 'international'],
  'Mountain Treks': ['mountain', 'trek', 'adventure'],
  'City Tours': ['city', 'tour', 'domestic', 'spiritual'],
  'Luxury Resorts': ['luxury', 'resort'],
};

function SectionHeader({ eyebrow, title, action, onPress }: { eyebrow: string; title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.linkRow} hitSlop={8}>
        <Text style={styles.linkText}>{action}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const mainScrollRef = useRef<ScrollView>(null);
  const [activeService, setActiveService] = useState<ServiceItem>(services[0]);
  const [selectedPackageCategory, setSelectedPackageCategory] = useState<string | null>(null);
  useWishlist();
  const user = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersSource, setOffersSource] = useState<'backend' | 'demo' | null>(null);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: blogPosts } = useContentItems<BlogPost>('blog');
  const { items: destinations } = useContentItems<Destination>('destination');

  useEffect(() => {
    let mounted = true;
    loadOffers()
      .then(({ offers: loadedOffers, source }) => {
        if (!mounted) return;
        setOffersSource(source);
        setOffers(source === 'demo' ? loadedOffers : loadedOffers.filter((offer) => getOfferValidity(offer.validUntil) === 'active'));
      })
      .catch(() => {
        if (mounted) { setOffers([]); setOffersSource(null); }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleProfilePress = () => {
    router.push(getUser() ? '/(tabs)/profile' : '/login');
  };

  const visibleDestinations = destinations.slice(0, 4);
  const packageSource = travelPackages;
  const filteredPackages = selectedPackageCategory
    ? packageSource.filter((travelPackage) => travelPackage.categories?.some((category) => packageCategoryAliases[selectedPackageCategory].some((alias) => category.toLowerCase().includes(alias))))
    : packageSource;
  const visiblePackages = filteredPackages.slice(0, 3);
  const visibleOffers = offers.slice(0, 5);
  const visibleStories = blogPosts.slice(0, 3);

  return (
    <AppScreen edges={['top']}>
      <ScrollView
        ref={mainScrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}>
        {/* Brand header */}
        <View style={styles.hero}>
          <BrandGradientBar style={styles.homeNavBar}>
            <View style={styles.headerRow}>
              <LemonTripBrand size={50} />
              <View style={styles.headerSpacer} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Saved places" onPress={() => router.push('/(tabs)/wishlist')} style={styles.headerIconButton}>
                <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={handleProfilePress} style={styles.profileButton}>
                <Text style={styles.profileText}>{user ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'AS'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change your departure city" style={styles.locationRow} onPress={() => router.push('/(tabs)/explore/flights')}>
              <Ionicons name="location-outline" size={14} color={Colors.onDarkMuted} />
              <Text style={styles.locationText}>New Delhi, IN</Text>
              <Text style={styles.locationChange}>· Change</Text>
            </TouchableOpacity>
          </BrandGradientBar>

        </View>


        {/* All travel services use the same icon and label treatment. */}
        <View style={styles.searchCard}>
          <Text style={styles.servicesHeading}>TRAVEL SERVICES</Text>
          <View style={styles.servicesGrid}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              style={styles.serviceGridItem}
              accessibilityRole="button"
              accessibilityLabel={`Show ${item.label.replace('\n', ' ')} options`}
              accessibilityState={{ selected: activeService.label === item.label }}
              onPress={() => setActiveService(item)}>
              <Ionicons name={item.icon} size={22} color={activeService.label === item.label ? Colors.primaryDark : Colors.textLight} />
              <Text numberOfLines={2} style={[styles.serviceGridLabel, activeService.label === item.label && styles.serviceGridLabelSelected]}>{item.label}</Text>
              <View style={[styles.serviceGridIndicator, activeService.label === item.label && styles.serviceGridIndicatorSelected]} />
            </TouchableOpacity>
          ))}
        </View>
        <HomeServiceWidget service={activeService} story={visibleStories[0]} offer={visibleOffers[0]} travelPackage={visiblePackages[0]} />
        </View>

        {/* AI Trip Planner entry */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.9}
          style={styles.aiCard}
          onPress={() => router.push('/ai-planner' as never)}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={22} color={Colors.primaryDark} />
          </View>
          <View style={styles.aiCopy}>
            <Text style={styles.aiEyebrow}>AI TRIP PLANNER</Text>
            <Text style={styles.aiTitle}>Dream it. I'll design it.</Text>
            <Text style={styles.aiSub}>Plan flights, stays and moments in seconds.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Destinations */}
        <View style={styles.section}>
          <SectionHeader eyebrow="FIND YOUR SOMEWHERE" title="Popular destinations" action="View all" onPress={() => router.push('/(tabs)/explore')} />
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
          {!visibleDestinations.length ? <Text style={styles.emptyPackages}>Published destinations will appear here.</Text> : null}
        </View>

        {/* Packages */}
        <View style={styles.section}>
          <SectionHeader eyebrow="TRIPS, THOUGHTFULLY PLANNED" title="Featured packages" action="View all" onPress={() => router.push('/packages')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {packageCategories.map((category) => <TouchableOpacity key={category} accessibilityRole="button" accessibilityState={{ selected: selectedPackageCategory === category }} onPress={() => setSelectedPackageCategory(selectedPackageCategory === category ? null : category)} style={[styles.categoryChip, selectedPackageCategory === category && styles.categoryChipSelected]}>
              <Text style={[styles.categoryText, selectedPackageCategory === category && styles.categoryTextSelected]}>{category}</Text>
            </TouchableOpacity>)}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visiblePackages.map((travelPackage) => <TouchableOpacity key={travelPackage.id} style={styles.pkgCard} onPress={() => router.push(`/packages/${travelPackage.id}`)} activeOpacity={0.92}>
              <View><Image source={{ uri: travelPackage.image }} style={styles.pkgImage} /><View style={styles.pkgBadgePill}><Text style={styles.pkgBadgeText}>{travelPackage.badge ?? 'Featured'}</Text></View></View>
              <View style={styles.pkgBody}><Text style={styles.pkgTitle} numberOfLines={1}>{travelPackage.title}</Text><View style={styles.pkgMetaRow}><Ionicons name="calendar-outline" size={12} color={Colors.textLight}/><Text style={styles.pkgMeta}>{travelPackage.duration}</Text></View><View style={styles.pkgPriceRow}><Text style={styles.pkgFrom}>From </Text><Text style={styles.pkgPrice}>{travelPackage.price}</Text><View style={styles.pkgArrow}><Ionicons name="arrow-forward" size={14} color={Colors.primary}/></View></View></View>
            </TouchableOpacity>)}
          </ScrollView>
          {!visiblePackages.length ? <Text style={styles.emptyPackages}>{selectedPackageCategory ? 'No published packages match this category.' : 'Published holiday packages will appear here.'}</Text> : null}
        </View>

        {/* Offers */}
        {visibleOffers.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow={offersSource === 'demo' ? 'SAMPLE OFFERS · PREVIEW' : 'A LITTLE MORE TO EXPLORE'} title="Offers for you" action="See all" onPress={() => router.push('/offers')} />
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

        {/* Travel support promise */}
        <View style={styles.section}>
          <SectionHeader eyebrow="TRAVEL WITH CONFIDENCE" title="LemonTrip promises" action="Learn more" onPress={() => router.push('/help')} />
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/help')} style={styles.promiseCard}>
            <View style={styles.promiseCopy}>
              <Text style={styles.promiseEyebrow}>TRAVELER ASSIST</Text>
              <Text style={styles.promiseTitle}>A real travel expert,{"\n"}whenever you need one.</Text>
              <Text style={styles.promiseCaption}>Call · WhatsApp · In-trip support</Text>
            </View>
            <View style={styles.promiseBadge}><Text style={styles.promiseBadgeText}>24/7</Text></View>
            <Ionicons name="call-outline" size={68} color="rgba(255,255,255,0.18)" style={styles.promiseDecoration} />
          </TouchableOpacity>
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
            <SectionHeader eyebrow="IDEAS FOR THE ROAD AHEAD" title="Travel stories" action="Read all" onPress={() => router.push('/blog')} />
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
    </AppScreen>
  );
}

function HomeServiceWidget({ service, story, offer, travelPackage }: { service: ServiceItem; story?: BlogPost; offer?: Offer; travelPackage?: TravelPackage }) {
  const cart = useCart();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const name = service.label === 'Packages' ? 'Holiday Packages' : service.label === 'Trip Cart' ? 'Cart' : service.label.replace('\n', ' ');

  const searchHotels = () => router.push({ pathname: '/(tabs)/explore/hotels', params: { query: JSON.stringify({ destination, checkIn, checkOut }) } });
  const searchGroundTravel = () => {
    const pathname = name === 'Trains' ? '/(tabs)/explore/trains' : '/(tabs)/explore/buses';
    router.push({ pathname, params: { query: JSON.stringify({ from, to, travelDate }) } });
  };

  return (
    <View style={styles.serviceWidget}>
      {name !== 'Flights' ? <View style={styles.widgetHeading}>
        <View style={styles.widgetIcon}><Ionicons name={service.icon} size={20} color={Colors.primary} /></View>
        <View style={styles.widgetHeadingCopy}>
          <Text style={styles.widgetEyebrow}>{name.toUpperCase()}</Text>
          <Text style={styles.widgetTitle}>{getWidgetTitle(name, cart.length)}</Text>
        </View>
      </View> : null}
      {name === 'Flights' ? (
        <FlightSearchForm compact hideTripTypeSelector initialOrigin="New Delhi" initialTravellers={2} searchButtonLabel="Search Trips" loading={false} onSearch={(request) => router.push({ pathname: '/(tabs)/explore/flights', params: { search: JSON.stringify(request) } })} />
      ) : name === 'Hotels' ? (
        <View>
          <WidgetField label="DESTINATION" value={destination} onChangeText={setDestination} placeholder="City, region or property" />
          <View style={styles.widgetFieldRow}>
            <WidgetField label="CHECK IN" value={checkIn} onChangeText={setCheckIn} placeholder="YYYY-MM-DD" />
            <WidgetField label="CHECK OUT" value={checkOut} onChangeText={setCheckOut} placeholder="YYYY-MM-DD" />
          </View>
          <WidgetButton label="Search hotels" onPress={searchHotels} />
        </View>
      ) : name === 'Trains' || name === 'Buses' ? (
        <View>
          <View style={styles.widgetFieldRow}>
            <WidgetField label="FROM" value={from} onChangeText={setFrom} placeholder={name === 'Trains' ? 'Departure station' : 'Departure city'} />
            <WidgetField label="TO" value={to} onChangeText={setTo} placeholder={name === 'Trains' ? 'Arrival station' : 'Destination city'} />
          </View>
          <WidgetField label="TRAVEL DATE" value={travelDate} onChangeText={setTravelDate} placeholder="YYYY-MM-DD" />
          <WidgetButton label={`Search ${name.toLowerCase()}`} onPress={searchGroundTravel} />
        </View>
      ) : (
        <View style={styles.widgetContent}>
          <Text style={styles.widgetDescription}>{getWidgetDescription(name, cart.length, story)}</Text>
          {name === 'Holiday Packages' ? (
            <View style={styles.widgetHighlights}>
              {travelPackage ? <Text style={styles.widgetHighlight}>{travelPackage.title} · From {travelPackage.price}</Text> : <Text style={styles.widgetHighlight}>Handpicked stays and experiences</Text>}
              <Text style={styles.widgetHighlight}>Clear trip pricing</Text>
            </View>
          ) : null}
          {name === 'Offers' && offer ? <Text style={styles.widgetFeatured}>{offer.title}{offer.code ? ` · Code ${offer.code}` : ''}</Text> : null}
          <WidgetButton label={getWidgetAction(name)} onPress={() => router.push(service.route)} />
        </View>
      )}
    </View>
  );
}

function getWidgetTitle(service: string, cartCount: number) {
  if (service === 'Flights') return 'Plan a flight';
  if (service === 'Hotels') return 'Find your stay';
  if (service === 'Trains') return 'Plan a rail journey';
  if (service === 'Buses') return 'Plan your bus trip';
  if (service === 'Holiday Packages') return 'Find a holiday';
  if (service === 'AI Plan') return 'Plan a trip with AI';
  if (service === 'Visa') return 'Visa help for your trip';
  if (service === 'Offers') return 'Travel deals for you';
  if (service === 'Saved Places') return 'Your saved places';
  if (service === 'Travel Stories') return 'Ideas for your next trip';
  if (service === 'Cart') return `Your trip cart · ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`;
  if (service === 'Help') return 'Travel support';
  return 'Explore LemonTrip services';
}

function getWidgetDescription(service: string, cartCount: number, story?: BlogPost) {
  if (service === 'Holiday Packages') return 'Choose a thoughtfully planned escape, with the details of your journey together.';
  if (service === 'AI Plan') return 'Build an itinerary around your destination, dates, interests and budget.';
  if (service === 'Visa') return 'Check destination guidance and prepare for the entry requirements on your itinerary.';
  if (service === 'Offers') return 'Browse current savings across flights, stays and handpicked holidays.';
  if (service === 'Saved Places') return "Keep the stays and destinations you like together for when you're ready.";
  if (service === 'Travel Stories') return story?.title ?? 'Read destination guides and ideas from the LemonTrip journal.';
  if (service === 'Cart') return cartCount ? 'Review the travel items you have collected before checkout.' : 'Your trip cart is empty. Browse travel options and add a journey to keep planning.';
  if (service === 'Help') return 'Get practical help from a LemonTrip travel expert before or during your journey.';
  return 'Open the full service directory to find the right way to plan your trip.';
}

function getWidgetAction(service: string) {
  if (service === 'Holiday Packages') return 'Browse holidays';
  if (service === 'AI Plan') return 'Plan a trip';
  if (service === 'Visa') return 'Explore visa support';
  if (service === 'Offers') return 'View offers';
  if (service === 'Saved Places') return 'View saved places';
  if (service === 'Travel Stories') return 'Read travel stories';
  if (service === 'Cart') return 'Open trip cart';
  if (service === 'Help') return 'Get travel help';
  return 'Browse all services';
}

function WidgetField({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.widgetField}>
      <Text style={styles.widgetFieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textLight} style={styles.widgetInput} />
    </View>
  );
}

function WidgetButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.widgetButton}>
      <Ionicons name="search-outline" size={17} color={Colors.primaryDark} />
      <Text style={styles.widgetButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} />
    </TouchableOpacity>
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
  scroll: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30, maxWidth: 784, width: '100%', alignSelf: 'center' },

  // Hero
  hero: { backgroundColor: Colors.background, paddingBottom: 2 },
  homeNavBar: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  headerIconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  locationText: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 11 },
  locationChange: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 11 },
  headerSpacer: { flex: 1 },
  profileButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#E8F1EC' },
  profileText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },

  // Services grid
  searchCard: { zIndex: 2, marginHorizontal: 16, marginTop: -18, paddingHorizontal: 13, paddingTop: 7, paddingBottom: 14, borderRadius: 23, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  servicesHeading: { marginTop: 5, marginBottom: 7, color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 5 },
  serviceGridItem: { width: '24%', minHeight: 67, alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 2, paddingVertical: 6, position: 'relative' },
  serviceGridLabel: { minHeight: 23, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  serviceGridLabelSelected: { color: Colors.primaryDark, fontWeight: '800' },
  serviceGridIndicator: { position: 'absolute', bottom: 0, width: 24, height: 3, borderRadius: 2 },
  serviceGridIndicatorSelected: { backgroundColor: Colors.accent },
  serviceWidget: { marginTop: 13 },
  widgetHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 13 },
  widgetIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.surfaceMuted, borderWidth: 1, borderColor: Colors.border },
  widgetHeadingCopy: { flex: 1 },
  widgetEyebrow: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  widgetTitle: { marginTop: 2, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800' },
  widgetContent: { gap: 13 },
  widgetDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 },
  widgetFeatured: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, fontWeight: '800' },
  widgetHighlights: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  widgetHighlight: { overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: Colors.surfaceMuted, color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  widgetField: { flex: 1, minWidth: 0, marginBottom: 10 },
  widgetFieldRow: { flexDirection: 'row', gap: 9 },
  widgetFieldLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginBottom: 5 },
  widgetInput: { minHeight: 44, paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, backgroundColor: Colors.background, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12 },
  widgetButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 2, paddingHorizontal: 14, borderRadius: 14, backgroundColor: Colors.accent },
  widgetButtonText: { flex: 1, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },

  aiCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 20, backgroundColor: Colors.primaryDark, ...cardShadow },
  aiIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.accent },
  aiCopy: { flex: 1, minWidth: 0 },
  aiEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  aiTitle: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 2 },
  aiSub: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Manrope', fontSize: 11, marginTop: 2 },

  // Sections
  section: { paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, lineHeight: 13, fontWeight: '800', letterSpacing: 1.05, textTransform: 'uppercase' },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 19, lineHeight: 25, fontWeight: '800', marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  hRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 12 },
  categoryRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 7 },
  categoryChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipSelected: { backgroundColor: '#E5EFEA', borderColor: '#A9CBB9' },
  categoryText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  categoryTextSelected: { color: Colors.primaryDark, fontWeight: '800' },
  emptyPackages: { paddingHorizontal: 16, paddingBottom: 8, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },

  // Offers
  offerCard: { width: 270, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  offerImage: { width: '100%', height: 124, backgroundColor: Colors.surfaceMuted },
  offerBody: { padding: 14 },
  offerCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  offerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 5, lineHeight: 20 },
  offerCodeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 10, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  offerCode: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },

  // Destinations (image card with name over a dark band)
  destCard: { width: 178, height: 172, overflow: 'hidden', backgroundColor: Colors.surfaceMuted, borderRadius: 19, ...cardShadow },
  destImage: { width: '100%', height: '100%' },
  saveButton: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  destMeta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: 'rgba(0,0,0,0.54)' },
  destName: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  destPrice: { color: 'rgba(255,255,255,0.95)', fontFamily: 'Manrope', fontSize: 10, marginTop: 2 },
  destArrow: { position: 'absolute', right: 9, bottom: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  // Packages
  pkgCard: { width: 254, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 19, ...cardShadow },
  pkgImage: { width: '100%', height: 112, backgroundColor: Colors.surfaceMuted },
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

  promiseCard: { minHeight: 112, marginHorizontal: 16, overflow: 'hidden', borderRadius: 18, backgroundColor: Colors.primaryDark, flexDirection: 'row', alignItems: 'center', padding: 16 },
  promiseCopy: { flex: 1, zIndex: 1 },
  promiseEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  promiseTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 15, lineHeight: 18, fontWeight: '800', marginTop: 5 },
  promiseCaption: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 9, marginTop: 5 },
  promiseBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.accent },
  promiseBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  promiseDecoration: { position: 'absolute', right: 25, bottom: -14, transform: [{ rotate: '-20deg' }] },
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
