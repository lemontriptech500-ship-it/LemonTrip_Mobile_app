import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { DateField, todayISO } from '@/components/DatePickerField';
import { Colors } from '@/constants/colors';
import type { Offer } from '@/data/mock/offers';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { getUser, useAuth } from '@/utils/authStore';
import { useContentItems } from '@/utils/contentApi';
import { getOfferValidity, loadOffers } from '@/utils/offerApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { getPackageGallery } from '@/data/packageImages';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FlightSearchRequest } from '@/components/flights/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type ServiceItem = {
  label: string;
  icon: IconName;
  route: Parameters<typeof router.push>[0];
};
type QuickAction = { label: string; icon: IconName; tint?: 'lemon'; route: Parameters<typeof router.push>[0] };

// Copy "Lone Hiker Overlooking a Mountain Lake" from assets/images to this file name.
const HERO_IMAGE = require('../../../assets/images/Hiker Over a Golden Mountain Lake.png');
// How much to dim the hero photo: 0 = original, 0.3 = noticeably darker.
const HERO_DIM = 0;
// Script font from the design; the file lives in assets/fonts and is loaded in app/_layout.tsx.
const SCRIPT_FONT = 'Italianno';
// Inter (static weights, loaded in app/_layout.tsx) for all other text on this screen.
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;

// The six booking tabs shown inside the search card.
const services: ServiceItem[] = [
  { label: 'Flights', icon: 'airplane-outline', route: '/(tabs)/explore/flights' },
  { label: 'Hotels', icon: 'business-outline', route: '/(tabs)/explore/hotels' },
  { label: 'Packages', icon: 'sunny-outline', route: '/packages' },
  { label: 'Trains', icon: 'train-outline', route: '/(tabs)/explore/trains' },
  { label: 'Buses', icon: 'bus-outline', route: '/(tabs)/explore/buses' },
  { label: 'Visa', icon: 'id-card-outline', route: '/(tabs)/explore/visa' },
];
const quickActions: QuickAction[] = [
  { label: 'Offers', icon: 'pricetag', tint: 'lemon', route: '/offers' },
  { label: 'Saved Places', icon: 'heart-outline', route: '/(tabs)/wishlist' },
  { label: 'Travel Stories', icon: 'document-text-outline', route: '/blog' },
  { label: 'Trip Cart', icon: 'cart-outline', route: '/cart' },
  { label: 'AI Plan', icon: 'sparkles-outline', route: '/assistant' },
  { label: 'Help', icon: 'headset-outline', route: '/help' },
  { label: 'Explore All', icon: 'apps-outline', route: '/(tabs)/explore' },
];
const promises: { label: string; icon: IconName }[] = [
  { label: 'Best Price\nGuarantee', icon: 'ribbon-outline' },
  { label: 'Verified\nPartners', icon: 'shield-checkmark-outline' },
  { label: '24/7\nSupport', icon: 'headset-outline' },
  { label: 'Safe & Secure\nPayments', icon: 'card-outline' },
];
const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
const packageCategories = ['Honeymoon', 'Beach & Boating', 'Mountain Treks', 'City Tours', 'Luxury Resorts'];
const packageCategoryAliases: Record<string, string[]> = {
  Honeymoon: ['honeymoon'],
  'Beach & Boating': ['beach', 'boating', 'adventure', 'international'],
  'Mountain Treks': ['mountain', 'trek', 'adventure'],
  'City Tours': ['city', 'tour', 'domestic', 'spiritual'],
  'Luxury Resorts': ['luxury', 'resort'],
};

function SectionHeader({ eyebrow, title, action, onPress }: { eyebrow?: string; title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
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
  useAppLanguage();
  const insets = useSafeAreaInsets();
  const mainScrollRef = useRef<ScrollView>(null);
  const [activeService, setActiveService] = useState<ServiceItem>(services[0]);
  const [selectedPackageCategory, setSelectedPackageCategory] = useState<string | null>(null);
  useWishlist();
  const user = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: blogPosts } = useContentItems<BlogPost>('blog');
  const { items: destinations } = useContentItems<Destination>('destination');

  useEffect(() => {
    let mounted = true;
    loadOffers()
      .then(({ offers: loadedOffers, source }) => {
        if (!mounted) return;
        setOffers(source === 'demo' ? loadedOffers : loadedOffers.filter((offer) => getOfferValidity(offer.validUntil) === 'active'));
      })
      .catch(() => {
        if (mounted) setOffers([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleNotifications = () => router.push(getUser() ? '/manage/notifications' : '/login');

  const visibleDestinations = destinations.slice(0, 6);
  const filteredPackages = selectedPackageCategory
    ? travelPackages.filter((travelPackage) => travelPackage.categories?.some((category) => packageCategoryAliases[selectedPackageCategory].some((alias) => category.toLowerCase().includes(alias))))
    : travelPackages;
  const visiblePackages = filteredPackages.slice(0, 4);
  const dealOffers = offers.slice(0, 4);
  const forYouOffers = offers.length > 3 ? offers.slice(2, 4) : offers.slice(0, 2);
  const visibleStories = blogPosts.slice(0, 3);

  return (
    <AppScreen edges={[]}>
      <ScrollView ref={mainScrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        {/* Hero */}
        <ImageBackground source={HERO_IMAGE} style={[styles.hero, { paddingTop: insets.top + 10 }]} resizeMode="cover">
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(4,20,15,${HERO_DIM})` }]} />
          <LinearGradient colors={['rgba(8,30,24,0.62)', 'rgba(8,30,24,0.05)', 'rgba(8,30,24,0.28)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroTop}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change your departure city" style={styles.locationRow} onPress={() => router.push('/(tabs)/explore/flights')}>
              <Ionicons name="location-sharp" size={20} color="#FFFFFF" />
              <Text style={styles.locationText}>New Delhi, IN</Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroBrand}>
              <Image source={require('../../../assets/images/web_logo_news.png')} style={styles.heroLogo} resizeMode="contain" accessibilityLabel="LemonTrip — Travel smarter. Travel better." />
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" onPress={handleNotifications} style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroScript}>Your next story</Text>
            <Text style={[styles.heroScript, styles.heroScriptAccent]}>starts here.</Text>
            <Text style={styles.heroSub}>Discover amazing destinations{'\n'}at the best prices.</Text>
          </View>
          <View style={styles.heroDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </ImageBackground>

        {/* Search card */}
        <View style={styles.searchCard}>
          <View style={styles.serviceTabs}>
            {services.map((item) => {
              const selected = activeService.label === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.85}
                  style={[styles.serviceTab, selected && styles.serviceTabSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${item.label} options`}
                  accessibilityState={{ selected }}
                  onPress={() => setActiveService(item)}>
                  <Ionicons name={item.icon} size={24} color={selected ? '#FFFFFF' : Colors.textDark} />
                  <Text numberOfLines={1} style={[styles.serviceTabLabel, selected && styles.serviceTabLabelSelected]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <HomeServiceWidget service={activeService} offer={offers[0]} travelPackage={visiblePackages[0]} />

          {/* Quick actions live inside the white search card */}
          <View style={styles.quickGrid}>
            {quickActions.map((item) => (
              <TouchableOpacity key={item.label} accessibilityRole="button" accessibilityLabel={item.label} style={styles.quickItem} activeOpacity={0.8} onPress={() => router.push(item.route)}>
                <View style={[styles.quickIcon, item.tint === 'lemon' && styles.quickIconLemon]}>
                  <Ionicons name={item.icon} size={24} color={item.tint === 'lemon' ? '#B88900' : Colors.primary} />
                </View>
                <Text numberOfLines={2} style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Deals */}
        {dealOffers.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="EXCLUSIVE OFFERS" title="Deals for your next trip" action="See all" onPress={() => router.push('/offers')} />
            <OfferRow offers={dealOffers} />
          </View>
        ) : null}

        {/* Destinations */}
        <View style={styles.section}>
          <SectionHeader eyebrow="FIND YOUR SOMEWHERE" title="Popular destinations" action="View all" onPress={() => router.push('/(tabs)/explore')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visibleDestinations.map((destination) => {
              const saved = isInWishlist(destination.id);
              return (
                <TouchableOpacity key={destination.id} style={styles.destCard} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.92}>
                  <Image source={{ uri: destination.image }} style={styles.destImage} />
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? `Remove ${destination.name} from saved places` : `Save ${destination.name}`} style={styles.saveButton} onPress={() => toggleWishlist({ id: destination.id, name: destination.name, image: destination.image, price: destination.priceFrom })}>
                    <Ionicons name={saved ? 'heart' : 'heart-outline'} size={14} color={saved ? Colors.error : Colors.primaryDark} />
                  </TouchableOpacity>
                  <View style={styles.destMeta}>
                    <Text style={styles.destName} numberOfLines={1}>{destination.name}</Text>
                    <Text style={styles.destSub} numberOfLines={1}>{destination.priceFrom}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {!visibleDestinations.length ? <Text style={styles.emptyPackages}>Published destinations will appear here.</Text> : null}
        </View>

        {/* Packages */}
        <View style={styles.section}>
          <SectionHeader eyebrow="TRIPS, THOUGHTFULLY PLANNED" title="Featured packages" action="View all" onPress={() => router.push('/packages')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {packageCategories.map((category) => (
              <TouchableOpacity key={category} accessibilityRole="button" accessibilityState={{ selected: selectedPackageCategory === category }} onPress={() => setSelectedPackageCategory(selectedPackageCategory === category ? null : category)} style={[styles.categoryChip, selectedPackageCategory === category && styles.categoryChipSelected]}>
                <Text style={[styles.categoryText, selectedPackageCategory === category && styles.categoryTextSelected]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visiblePackages.map((travelPackage) => (
              <TouchableOpacity key={travelPackage.id} style={styles.pkgCard} onPress={() => router.push(`/packages/${travelPackage.id}`)} activeOpacity={0.92}>
                <View>
                  <Image source={{ uri: getPackageGallery(travelPackage.id, travelPackage.title, travelPackage.destination, travelPackage.image, travelPackage.gallery)[0] }} style={styles.pkgImage} />
                  <View style={styles.pkgBadgePill}><Text style={styles.pkgBadgeText}>{travelPackage.badge ?? 'Featured'}</Text></View>
                  <View style={styles.pkgHeart}><Ionicons name="heart-outline" size={15} color={Colors.error} /></View>
                </View>
                <View style={styles.pkgBody}>
                  <Text style={styles.pkgTitle} numberOfLines={1}>{travelPackage.title}</Text>
                  <View style={styles.pkgMetaRow}><Ionicons name="calendar-outline" size={13} color={Colors.textLight} /><Text style={styles.pkgMeta} numberOfLines={1}>{travelPackage.duration}</Text></View>
                  {travelPackage.rating ? <View style={styles.pkgMetaRow}><Ionicons name="star" size={13} color="#F5A400" /><Text style={styles.pkgRating}>{travelPackage.rating}</Text></View> : null}
                  <View style={styles.pkgPriceRow}>
                    <Text style={styles.pkgFrom}>From </Text>
                    <Text style={styles.pkgPrice} numberOfLines={1}>{travelPackage.price}</Text>
                    <Text style={styles.pkgFrom}> / person</Text>
                    <View style={styles.pkgArrow}><Ionicons name="arrow-forward" size={14} color={Colors.primary} /></View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!visiblePackages.length ? <Text style={styles.emptyPackages}>{selectedPackageCategory ? 'No published packages match this category.' : 'Published holiday packages will appear here.'}</Text> : null}
        </View>

        {/* Offers for you */}
        {forYouOffers.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Offers for You" action="See all" onPress={() => router.push('/offers')} />
            <OfferRow offers={forYouOffers} overlay />
          </View>
        ) : null}

        {/* Promises */}
        <View style={styles.section}>
          <SectionHeader eyebrow="TRAVEL WITH CONFIDENCE" title="LemonTrip Promises" action="Learn more" onPress={() => router.push('/help')} />
          <View style={styles.promiseGrid}>
            {promises.map((item) => (
              <View key={item.label} style={styles.promiseTile}>
                <View style={styles.promiseIcon}><Ionicons name={item.icon} size={24} color={Colors.primary} /></View>
                <Text style={styles.promiseTileLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/help')} style={styles.promiseCard}>
            <View style={styles.promiseCopy}>
              <Text style={styles.promiseEyebrow}>TRAVELER ASSIST</Text>
              <Text style={styles.promiseTitle}>A real travel expert,{'\n'}whenever you need one.</Text>
              <Text style={styles.promiseCaption}>Call • WhatsApp • In-app support</Text>
            </View>
            <View style={styles.promiseBadge}><Text style={styles.promiseBadgeText}>24/7</Text></View>
            <Ionicons name="briefcase" size={64} color="rgba(255,214,0,0.28)" style={styles.promiseDecoration} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bottomCta} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.9}>
          <Image source={require('../../../assets/images/header_logo.png')} style={styles.ctaLogo} resizeMode="contain" />
          <Text style={styles.ctaText}>Travel the world{'\n'}with LemonTrip</Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Exploring</Text>
            <View style={styles.ctaButtonArrow}><Ionicons name="arrow-forward" size={14} color="#FFFFFF" /></View>
          </View>
        </TouchableOpacity>

        {/* Stories */}
        {visibleStories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="IDEAS FOR THE ROAD AHEAD" title="Travel stories" action="Read all" onPress={() => router.push('/blog')} />
            <View style={styles.storyList}>
              {visibleStories.map((story) => (
                <TouchableOpacity key={story.id} style={styles.storyCard} onPress={() => router.push(`/blog/${story.id}`)} activeOpacity={0.92}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  <View style={styles.storyBody}>
                    <Text style={styles.storyCategory}>{story.category}</Text>
                    <Text style={styles.storyTitle} numberOfLines={3}>{story.title}</Text>
                    <Text style={styles.storyMeta}>{story.date} • {story.readingTime || '5 min read'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* AI Trip Planner */}
        <TouchableOpacity accessibilityRole="button" activeOpacity={0.9} style={styles.aiCard} onPress={() => router.push('/ai-planner' as never)}>
          <View style={styles.aiIcon}><Ionicons name="sparkles" size={26} color={Colors.primaryDark} /></View>
          <View style={styles.aiCopy}>
            <Text style={styles.aiEyebrow}>AI TRIP PLANNER</Text>
            <Text style={styles.aiTitle}>Plan personalized trips in seconds.</Text>
            <Text style={styles.aiSub}>Get AI-powered itineraries, budget suggestions and more.</Text>
          </View>
          <View style={styles.aiArrow}><Ionicons name="arrow-forward" size={18} color={Colors.primaryDark} /></View>
        </TouchableOpacity>
      </ScrollView>
    </AppScreen>
  );
}

function OfferRow({ offers, overlay = false }: { offers: Offer[]; overlay?: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
      {offers.map((offer) => (
        <TouchableOpacity key={offer.id} style={overlay ? styles.offerOverlayCard : styles.offerCard} onPress={() => router.push('/offers')} activeOpacity={0.92}>
          {overlay ? (
            <>
              <Image source={{ uri: offer.image }} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(8,30,24,0.78)', 'rgba(8,30,24,0.25)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
              <View style={styles.offerOverlayBody}>
                <Text style={styles.offerOverlayCategory}>{offer.category.toUpperCase()}</Text>
                <Text style={styles.offerOverlayTitle} numberOfLines={3}>{offer.title}</Text>
                {offer.code ? <View style={styles.offerCodePill}><Text style={styles.offerCodeText}>Use {offer.code}</Text><Ionicons name="arrow-forward" size={12} color={Colors.primaryDark} /></View> : null}
              </View>
            </>
          ) : (
            <>
              <Image source={{ uri: offer.image }} style={styles.offerImage} />
              <View style={styles.offerBody}>
                <Text style={styles.offerCategory}>{offer.category}</Text>
                <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>
                <View style={styles.offerBottom}>
                  {offer.code ? <View style={styles.offerCodePill}><Text style={styles.offerCodeText}>Use {offer.code}</Text></View> : <View />}
                  <View style={styles.offerArrow}><Ionicons name="arrow-forward" size={13} color={Colors.primary} /></View>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function HomeServiceWidget({ service, offer, travelPackage }: { service: ServiceItem; offer?: Offer; travelPackage?: TravelPackage }) {
  const name = service.label;

  if (name === 'Flights') return <FlightPanel />;
  if (name === 'Hotels') return <HotelPanel />;
  if (name === 'Trains' || name === 'Buses') return <GroundPanel mode={name} />;

  const description = name === 'Packages'
    ? 'Choose a thoughtfully planned escape, with the details of your journey together.'
    : 'Check destination guidance and prepare for the entry requirements on your itinerary.';
  const highlight = name === 'Packages'
    ? (travelPackage ? `${travelPackage.title} · From ${travelPackage.price}` : 'Handpicked stays and experiences')
    : (offer ? offer.title : 'Expert document support');
  return (
    <View style={styles.panel}>
      <Text style={styles.panelDescription}>{description}</Text>
      <Text style={styles.panelHighlight}>{highlight}</Text>
      <PrimaryButton label={name === 'Packages' ? 'Browse Packages' : 'Explore Visa Support'} icon={name === 'Packages' ? 'sunny-outline' : 'id-card-outline'} onPress={() => router.push(service.route)} />
    </View>
  );
}

function TileInput({ icon, label, value, onChangeText, placeholder }: { icon: IconName; label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={19} color={Colors.textLight} />
      <View style={styles.tileCopy}>
        <Text style={styles.tileLabel}>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textLight} style={styles.tileInput} />
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, icon = 'search-outline' }: { label: string; onPress: () => void; icon?: IconName }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.searchButton} activeOpacity={0.9}>
      <Ionicons name={icon} size={20} color="#FFFFFF" />
      <Text style={styles.searchButtonText}>{label}</Text>
      <View style={styles.searchButtonArrow}><Ionicons name="arrow-forward" size={18} color={Colors.primaryDark} /></View>
    </TouchableOpacity>
  );
}

function FlightPanel() {
  const [origin, setOrigin] = useState('New Delhi');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState('');

  const swap = () => { setOrigin(destination); setDestination(origin); };
  const search = () => {
    if (!origin.trim() || !destination.trim() || !departureDate) {
      setError('Enter your origin, destination and departure date.');
      return;
    }
    setError('');
    const request: FlightSearchRequest = {
      tripType: returnDate ? 'roundTrip' : 'oneWay',
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      ...(returnDate ? { returnDate } : {}),
      travellers,
      cabinClass,
      specialFare: 'regular',
    };
    router.push({ pathname: '/(tabs)/explore/flights', params: { search: JSON.stringify(request) } });
  };

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.flex}><TileInput icon="location" label="From" value={origin} onChangeText={setOrigin} placeholder="City / airport" /></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap origin and destination" onPress={swap} style={styles.swapButton}>
          <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.flex}><TileInput icon="location-outline" label="To" value={destination} onChangeText={setDestination} placeholder="Where to?" /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.dateCol}><DateField tile label="Departure" value={departureDate} placeholder="Add date" minDate={todayISO()} onChange={(date) => { setDepartureDate(date); if (returnDate && returnDate < date) setReturnDate(''); }} /></View>
        <View style={styles.dateCol}><DateField tile label="Return" value={returnDate} placeholder="Add date" minDate={departureDate || todayISO()} onChange={setReturnDate} /></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Travellers and class" onPress={() => setPickerOpen(true)} style={[styles.tile, styles.travellerTile]}>
          <Ionicons name="person-outline" size={19} color={Colors.textLight} />
          <View style={styles.tileCopy}>
            <Text style={styles.tileLabel} numberOfLines={1}>Travellers</Text>
            <Text style={styles.tileValue} numberOfLines={1}>{travellers} · {cabinClass.replace('Premium Economy', 'Prem. Eco')}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <PrimaryButton label="Search Flights" onPress={search} />

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPickerOpen(false)} accessibilityLabel="Close travellers and class" />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Travellers & Class</Text>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>Travellers</Text>
              <View style={styles.counter}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fewer travellers" onPress={() => setTravellers((n) => Math.max(1, n - 1))} style={styles.counterButton}><Ionicons name="remove" size={18} color={Colors.primaryDark} /></TouchableOpacity>
                <Text style={styles.counterValue}>{travellers}</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="More travellers" onPress={() => setTravellers((n) => Math.min(9, n + 1))} style={styles.counterButton}><Ionicons name="add" size={18} color={Colors.primaryDark} /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.classWrap}>
              {cabinClasses.map((item) => (
                <TouchableOpacity key={item} accessibilityRole="button" accessibilityState={{ selected: cabinClass === item }} onPress={() => setCabinClass(item)} style={[styles.categoryChip, cabinClass === item && styles.classChipSelected]}>
                  <Text style={[styles.categoryText, cabinClass === item && styles.classTextSelected]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={() => setPickerOpen(false)} style={styles.modalDone}><Text style={styles.modalDoneText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HotelPanel() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  return (
    <View style={styles.panel}>
      <TileInput icon="location-outline" label="Destination" value={destination} onChangeText={setDestination} placeholder="City, region or property" />
      <View style={styles.row}>
        <View style={styles.flex}><DateField tile label="Check in" value={checkIn} onChange={setCheckIn} placeholder="Add date" /></View>
        <View style={styles.flex}><DateField tile label="Check out" value={checkOut} onChange={setCheckOut} placeholder="Add date" minDate={checkIn || undefined} /></View>
      </View>
      <PrimaryButton label="Search Hotels" onPress={() => router.push({ pathname: '/(tabs)/explore/hotels', params: { query: JSON.stringify({ destination, checkIn, checkOut }) } })} />
    </View>
  );
}

function GroundPanel({ mode }: { mode: 'Trains' | 'Buses' }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const train = mode === 'Trains';
  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.flex}><TileInput icon="location" label="From" value={from} onChangeText={setFrom} placeholder={train ? 'Departure station' : 'Departure city'} /></View>
        <View style={styles.flex}><TileInput icon="location-outline" label="To" value={to} onChangeText={setTo} placeholder={train ? 'Arrival station' : 'Destination city'} /></View>
      </View>
      <DateField tile label="Travel date" value={travelDate} onChange={setTravelDate} placeholder="Add date" />
      <PrimaryButton label={`Search ${mode}`} onPress={() => router.push({ pathname: train ? '/(tabs)/explore/trains' : '/(tabs)/explore/buses', params: { query: JSON.stringify({ from, to, travelDate }) } })} />
    </View>
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
  scroll: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30, maxWidth: 784, width: '100%', alignSelf: 'center' },
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Hero
  hero: { height: 330, paddingHorizontal: 16, overflow: 'hidden', justifyContent: 'flex-start' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  locationText: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: TextSize.body },
  heroBrand: { flex: 1, alignItems: 'flex-end' },
  heroLogo: { width: 112, height: 38 },
  bellButton: { width: 40, height: 40, marginLeft: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(8,30,24,0.55)' },
  bellDot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  heroCopy: { marginTop: 22 },
  heroScript: { color: '#FFFFFF', fontFamily: SCRIPT_FONT, fontSize: 45, lineHeight: 42, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  heroScriptAccent: { color: Colors.accent },
  heroSub: { marginTop: 6, color: '#FFFFFF', fontFamily: INTER.regular, fontSize: TextSize.bodyLarge, lineHeight: 22, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  heroDots: { position: 'absolute', left: 16, bottom:67, flexDirection: 'row', gap: 6 },
  dot: { width: 14, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 32, backgroundColor: Colors.accent },

  // Search card
  searchCard: { zIndex: 2, marginHorizontal: 12, marginTop: -50, paddingHorizontal: 10, paddingTop: 12, paddingBottom: 12, borderRadius: 26, backgroundColor: Colors.surface, ...cardShadow, shadowOpacity: 0.14 },
  serviceTabs: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
  serviceTab: { flex: 1, minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 14, paddingHorizontal: 2 },
  serviceTabSelected: { backgroundColor: Colors.primary },
  serviceTabLabel: { color: Colors.textDark, fontFamily: INTER.semibold, fontSize: TextSize.micro },
  serviceTabLabelSelected: { color: '#FFFFFF', fontFamily: INTER.bold },
  panel: { marginTop: 10, gap: 8 },
  panelDescription: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 19 },
  panelHighlight: { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: Colors.surfaceMuted, color: Colors.primary, fontFamily: INTER.bold, fontSize: TextSize.caption },
  tile: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  travellerTile: { flex: 0.85, minWidth: 0, paddingHorizontal: 8, gap: 6 },
  dateCol: { flex: 0.4, minWidth: 0 },
  tileCopy: { flex: 1, minWidth: 0 },
  tileLabel: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.micro },
  tileValue: { color: Colors.textDark, fontFamily: INTER.bold, fontSize: TextSize.caption, marginTop: 1 },
  tileInput: { padding: 0, margin: 0, minHeight: 18, color: Colors.textDark, fontFamily: INTER.bold, fontSize: TextSize.body },
  swapButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  errorText: { color: Colors.error, fontFamily: INTER.regular, fontSize: TextSize.caption },
  searchButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2, paddingLeft: 18, paddingRight: 8, borderRadius: 27, backgroundColor: Colors.primary },
  searchButtonText: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge },
  searchButtonArrow: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#FFFFFF' },

  // Travellers modal
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(12,48,38,0.5)' },
  modalCard: { padding: 18, borderRadius: 22, backgroundColor: Colors.surface, gap: 14 },
  modalTitle: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.title },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counterLabel: { color: Colors.textDark, fontFamily: INTER.bold, fontSize: TextSize.bodyLarge },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  counterButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.surfaceMuted },
  counterValue: { minWidth: 18, textAlign: 'center', color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge },
  classWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classTextSelected: { color: '#FFFFFF', fontFamily: INTER.extrabold },
  modalDone: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: Colors.accent },
  modalDoneText: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },

  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: 10, marginTop: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 18 },
  quickItem: { width: '20%', alignItems: 'center', gap: 6 },
  quickIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: '#DCEBE2' },
  quickIconLemon: { backgroundColor: '#FFF1B8' },
  quickLabel: { color: Colors.textDark, fontFamily: INTER.medium, fontSize: TextSize.micro, textAlign: 'center' },

  // Sections
  section: { paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionEyebrow: { color: Colors.secondary, fontFamily: INTER.extrabold, fontSize: TextSize.micro, lineHeight: 13, letterSpacing: 1.05, textTransform: 'uppercase' },
  sectionTitle: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.heading, lineHeight: 25, marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { color: Colors.primaryDark, fontFamily: INTER.semibold, fontSize: TextSize.body },
  hRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  categoryRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { color: Colors.textDark, fontFamily: INTER.semibold, fontSize: TextSize.caption },
  categoryTextSelected: { color: '#FFFFFF', fontFamily: INTER.extrabold },
  emptyPackages: { paddingHorizontal: 16, paddingBottom: 8, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption },

  // Offers
  offerCard: { width: 204, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...cardShadow },
  offerImage: { width: '100%', height: 88, backgroundColor: Colors.surfaceMuted },
  offerBody: { padding: 10 },
  offerCategory: { color: Colors.textLight, fontFamily: INTER.bold, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  offerTitle: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body, marginTop: 3, lineHeight: 18, minHeight: 36 },
  offerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  offerCodePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 14, backgroundColor: Colors.accent },
  offerCodeText: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.micro },
  offerArrow: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.surfaceMuted },
  offerOverlayCard: { width: 232, height: 120, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.primaryDark, ...cardShadow },
  offerOverlayBody: { flex: 1, padding: 12, justifyContent: 'space-between', alignItems: 'flex-start' },
  offerOverlayCategory: { color: 'rgba(255,255,255,0.85)', fontFamily: INTER.bold, fontSize: 10, letterSpacing: 0.6 },
  offerOverlayTitle: { color: '#FFFFFF', fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, lineHeight: 20, maxWidth: 170 },

  // Destinations
  destCard: { width: 108, overflow: 'hidden', backgroundColor: Colors.surface, borderRadius: 14, ...cardShadow },
  destImage: { width: '100%', height: 130, backgroundColor: Colors.surfaceMuted },
  saveButton: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  destMeta: { paddingHorizontal: 9, paddingVertical: 8 },
  destName: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  destSub: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, marginTop: 1 },

  // Packages
  pkgCard: { width: 196, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, ...cardShadow },
  pkgImage: { width: '100%', height: 108, backgroundColor: Colors.surfaceMuted },
  pkgBadgePill: { position: 'absolute', top: 8, left: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, backgroundColor: Colors.primary },
  pkgBadgeText: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: TextSize.micro },
  pkgHeart: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  pkgBody: { padding: 11 },
  pkgTitle: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  pkgMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  pkgMeta: { flex: 1, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption },
  pkgRating: { color: '#C98A00', fontFamily: INTER.bold, fontSize: TextSize.caption },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 9, paddingRight: 30 },
  pkgFrom: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: 10 },
  pkgPrice: { flexShrink: 1, color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  pkgArrow: { position: 'absolute', right: 0, bottom: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },

  // Promises
  promiseGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  promiseTile: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 14, backgroundColor: Colors.surface, ...cardShadow },
  promiseIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.surfaceMuted },
  promiseTileLabel: { color: Colors.textDark, fontFamily: INTER.semibold, fontSize: 10.5, lineHeight: 14, textAlign: 'center' },
  promiseCard: { minHeight: 104, marginHorizontal: 16, marginTop: 12, overflow: 'hidden', borderRadius: 18, backgroundColor: Colors.primaryDark, flexDirection: 'row', alignItems: 'center', padding: 16 },
  promiseCopy: { flex: 1, zIndex: 1 },
  promiseEyebrow: { color: Colors.accent, fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1 },
  promiseTitle: { color: Colors.white, fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, lineHeight: 21, marginTop: 5 },
  promiseCaption: { color: Colors.onDarkMuted, fontFamily: INTER.regular, fontSize: TextSize.caption, marginTop: 6 },
  promiseBadge: { position: 'absolute', top: 12, right: 14, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: Colors.accent },
  promiseBadgeText: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.caption },
  promiseDecoration: { position: 'absolute', right: 18, bottom: 6 },

  // Bottom CTA
  bottomCta: { minHeight: 64, marginHorizontal: 16, marginTop: 14, borderRadius: 20, backgroundColor: '#EEF3D6', borderWidth: 1, borderColor: '#DDE7B8', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  ctaLogo: { width: 46, height: 46 },
  ctaText: { color: Colors.primaryDark, fontFamily: SCRIPT_FONT, fontSize: 28, lineHeight: 30, flex: 1 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primaryDark, borderRadius: 22, paddingLeft: 14, paddingRight: 5, paddingVertical: 6 },
  ctaButtonText: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: TextSize.caption },
  ctaButtonArrow: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },

  // Stories
  storyList: { paddingHorizontal: 16, gap: 10 },
  storyCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', ...cardShadow },
  storyImage: { width: 118, minHeight: 84, backgroundColor: Colors.surfaceMuted },
  storyBody: { flex: 1, padding: 11, justifyContent: 'center' },
  storyCategory: { color: Colors.textLight, fontFamily: INTER.bold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase' },
  storyTitle: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body, marginTop: 3, lineHeight: 18 },
  storyMeta: { marginTop: 5, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.micro },

  // AI planner
  aiCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 18, backgroundColor: Colors.primaryDark, ...cardShadow },
  aiIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25, backgroundColor: Colors.accent },
  aiCopy: { flex: 1, minWidth: 0 },
  aiEyebrow: { color: Colors.accent, fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.2 },
  aiTitle: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: TextSize.body, marginTop: 2 },
  aiSub: { color: 'rgba(255,255,255,0.75)', fontFamily: INTER.regular, fontSize: 10.5, marginTop: 3 },
  aiArrow: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#FFFFFF' },
});


