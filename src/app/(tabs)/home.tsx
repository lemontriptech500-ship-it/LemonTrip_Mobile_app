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
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FlightSearchRequest } from '@/components/flights/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type ServiceItem = {
  label: string;
  icon: IconName;
  route: Parameters<typeof router.push>[0];
};
type QuickAction = { label: string; icon: IconName; route: Parameters<typeof router.push>[0]; tint: string; color: string };

// Copy "Lone Hiker Overlooking a Mountain Lake" from assets/images to this file name.
const HERO_IMAGE = require('../../../assets/images/Hiker Overlooking Alpine Lake Valley.png');
// Background photo for the AI Trip Planner banner (panoramic, hiker on the right).
const AI_IMAGE = require('../../../assets/images/Hiker Overlooking Alpine Lake Valley.png');


// const AI_ASSET = Image.resolveAssetSource(AI_IMAGE);
// const AI_ASPECT = AI_ASSET?.width && AI_ASSET?.height ? AI_ASSET.width / AI_ASSET.height : 3;


const AI_CARD_HEIGHT = 128;
// How much to dim the hero photo: 0 = original, 0.3 = noticeably darker.
const HERO_DIM = 0.3;
// The photo is drawn at its natural proportions at the height of the visible hero area (no heavy zoom),
// anchored to the right so the hiker stays in view. The search card overlaps the bottom HERO_OVERLAP px.
// Smaller HERO_HEIGHT = more zoomed out (more of the panorama visible). Larger HERO_OVERLAP = search card sits higher.
const HERO_HEIGHT = 190;
const HERO_OVERLAP = 70;
// const HERO_ASSET = Image.resolveAssetSource(HERO_IMAGE);
// const HERO_ASPECT = HERO_ASSET?.width && HERO_ASSET?.height ? HERO_ASSET.width / HERO_ASSET.height : 16 / 9;
const HERO_IMAGE_HEIGHT = HERO_HEIGHT; // photo runs the full hero height so nothing shows beside the search card
// App logo shown at the top-left of the hero, before the location.
const APP_LOGO = require('../../../assets/images/Glossy Lemon Trip Logo.png');
// Script font from the design; the file lives in assets/fonts and is loaded in app/_layout.tsx.
const SCRIPT_FONT = 'Italianno';
// Inter (static weights, loaded in app/_layout.tsx) for all other text on this screen.
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;


function getImageSize(source: any): { width?: number; height?: number } {
  try {
    const resolve = (Image as any).resolveAssetSource;
    if (typeof resolve === 'function') {
      const asset = resolve(source);
      return { width: asset?.width, height: asset?.height };
    }
  } catch {}
  return {};
}

const AI_ASSET = getImageSize(AI_IMAGE);
const AI_ASPECT = AI_ASSET.width && AI_ASSET.height ? AI_ASSET.width / AI_ASSET.height : 3;

const HERO_ASSET = getImageSize(HERO_IMAGE);
const HERO_ASPECT = HERO_ASSET.width && HERO_ASSET.height ? HERO_ASSET.width / HERO_ASSET.height : 16 / 9;


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
  { label: 'Offers', icon: 'pricetag', route: '/offers', tint: '#DCF2E6', color: '#0F5A3C' },
  { label: 'Saved Places', icon: 'heart', route: '/(tabs)/wishlist', tint: '#FCE4EC', color: '#E91E63' },
  { label: 'Travel Stories', icon: 'document-text-outline', route: '/blog', tint: '#E3EEFC', color: '#2F6FD6' },
  { label: 'Trip Cart', icon: 'cart-outline', route: '/cart', tint: '#FDEBDD', color: '#E07B1F' },
  { label: 'Help', icon: 'headset', route: '/help', tint: '#ECE4FA', color: '#6B3FD1' },
];
const packageInclusions: { label: string; icon: IconName }[] = [
  { label: 'Flights', icon: 'airplane-outline' },
  { label: 'Hotels', icon: 'business-outline' },
  { label: 'Transfers', icon: 'car-outline' },
];
const tripTypes = ['One Way', 'Round Trip', 'Multi City'] as const;
const promises: { label: string; icon: IconName }[] = [
  { label: 'Best Price\nGuarantee', icon: 'ribbon-outline' },
  { label: 'Verified\nPartners', icon: 'shield-checkmark-outline' },
  { label: '24/7\nSupport', icon: 'headset-outline' },
  { label: 'Safe & Secure\nPayments', icon: 'card-outline' },
];
const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
// Same destination data the Explore screen uses (country labels + built-in fallback list).
const destinationCountries: Record<string, string> = {
  dubai: 'UAE',
  maldives: 'Maldives',
  thailand: 'Thailand',
  singapore: 'Singapore',
  europe: 'France & Europe',
  kashmir: 'India',
  kerala: 'India',
  jaipur: 'India',
};
const featuredDestinations: Destination[] = [
  { id: 'kashmir', name: 'Kashmir', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=900&q=88', priceFrom: 'Snowy mountains & serene lakes' },
  { id: 'kerala', name: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=88', priceFrom: 'God’s own country' },
  { id: 'dubai', name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=88', priceFrom: 'Modern city, endless experiences' },
  { id: 'jaipur', name: 'Jaipur', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&q=88', priceFrom: 'Royal heritage & culture' },
  { id: 'singapore', name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=88', priceFrom: 'Modern & vibrant' },
];
// Same "Top experiences" tiles as Explore (fixed photos, so they always show).
const TOP_EXPERIENCES = [
  { name: 'Beaches', filter: 'Beach', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=88' },
  { name: 'Adventure', filter: 'Adventure', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=900&q=88' },
  { name: 'Luxury', filter: 'Luxury', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=88' },
];

function badgeColor(badge?: string) {
  const key = (badge ?? '').toLowerCase();
  if (key.includes('trend')) return '#F2765A';
  if (key.includes('new')) return '#2F6FD6';
  return Colors.primaryDark;
}

// "5 Days 4 Nights" -> { days: '5 Days', nights: '4 Nights' }; anything else is shown as-is.
function parseDuration(duration?: string) {
  const match = duration?.match(/(\d+\s*days?)\D*(\d+\s*nights?)/i);
  return match ? { days: match[1], nights: match[2] } : { days: duration ?? '', nights: '' };
}

function SectionHeader({ title, subtitle, action, onPress }: { title: string; subtitle?: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.linkRow} hitSlop={8}>
        <Text style={styles.linkText}>{action}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  useAppLanguage();
  const insets = useSafeAreaInsets();
  const mainScrollRef = useRef<ScrollView>(null);
  const [activeService, setActiveService] = useState<ServiceItem>(services[0]);
  const [moreOpen, setMoreOpen] = useState(false);
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

  const { width: windowWidth } = useWindowDimensions();
  const promiseContentWidth = Math.min(windowWidth, 784) - 32;
  // Phones show the four promises as a 2x2 grid; wider screens show them in one row.
  const promiseTileWidth = Math.floor(windowWidth >= 600 ? (promiseContentWidth - 30) / 4 : (promiseContentWidth - 10) / 2);

  const handleNotifications = () => router.push(getUser() ? '/manage/notifications' : '/login');

  const visibleDestinations = (destinations.length ? destinations : featuredDestinations).slice(0, 6);
  const visiblePackages = travelPackages.slice(0, 4);
  const forYouOffers = offers.slice(0, 4);
  const visibleStories = blogPosts.slice(0, 3);
  return (
    <AppScreen edges={[]}>
      <ScrollView ref={mainScrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 5 }]}>
          <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(4,20,15,${HERO_DIM})` }]} />
          <LinearGradient colors={['rgba(8,30,24,0.62)', 'rgba(8,30,24,0.05)', 'rgba(8,30,24,0.28)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroTop}>
            <Image source={APP_LOGO} style={styles.heroLogoMark} resizeMode="contain" accessibilityLabel="LemonTrip" />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change your departure city" style={styles.locationRow} onPress={() => router.push('/(tabs)/explore/flights')}>
              <Ionicons name="location-sharp" size={20} color="#FFFFFF" />
              <Text style={styles.locationText}>New Delhi, IN</Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroBrand}>
              {/* <Image source={require('../../../assets/images/web_logo_news.png')} style={styles.heroLogo} resizeMode="contain" accessibilityLabel="LemonTrip — Travel smarter. Travel better." /> */}
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" onPress={handleNotifications} style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroCopy}>
            {/* <Text style={styles.heroTitle}>Your next{'\n'}adventure{'\n'}starts here</Text> */}
            {/* <Text style={styles.heroSub}>Discover amazing destinations{'\n'}at the best prices.</Text> */}
          </View>
          <View style={styles.heroDots}>
            {/* <View style={[styles.dot, styles.dotActive]} /> */}
            {/* <View style={styles.dot} /> */}
            {/* <View style={styles.dot} /> */}
          </View>
        </View>

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

          {/* Expander sits right after the search button; opening it extends the card downward */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={moreOpen ? 'Hide offers, saved places and shortcuts' : 'Show offers, saved places and shortcuts'}
            accessibilityState={{ expanded: moreOpen }}
            activeOpacity={0.8}
            onPress={() => setMoreOpen((open) => !open)}
            style={styles.expander}>
            <Ionicons name={moreOpen ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primaryDark} />
          </TouchableOpacity>

          {moreOpen ? (
            <View style={styles.quickGrid}>
              {quickActions.map((item) => (
                <TouchableOpacity key={item.label} accessibilityRole="button" accessibilityLabel={item.label} style={styles.quickItem} activeOpacity={0.8} onPress={() => router.push(item.route)}>
                  <View style={[styles.quickIcon, { backgroundColor: item.tint }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text numberOfLines={2} style={styles.quickLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {/* Trending destinations */}
        <View style={styles.section}>
          <SectionHeader title="Trending destinations" action="See all" onPress={() => router.push('/destinations')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visibleDestinations.map((item) => {
              const saved = isInWishlist(item.id);
              return (
                <TouchableOpacity key={item.id} style={styles.destCard} activeOpacity={0.9} onPress={() => router.push({ pathname: '/destinations/[id]', params: { id: item.id } })}>
                  <ImageBackground source={{ uri: item.image }} style={styles.destImage} imageStyle={styles.destImageStyle}>
                    <View style={styles.destShade} />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={saved ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
                      style={styles.saveButton}
                      onPress={() => toggleWishlist({ id: item.id, name: item.name, image: item.image, price: item.priceFrom, category: 'Destinations', location: item.name })}>
                      <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? Colors.error : Colors.primaryDark} />
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.destCountry}>{destinationCountries[item.id] ?? 'Explore'}</Text>
                      <Text style={styles.destName}>{item.name}</Text>
                      <Text style={styles.destSub} numberOfLines={2}>{item.priceFrom}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Top experiences */}
        <View style={styles.section}>
          <SectionHeader title="Top experiences" action="See all" onPress={() => router.navigate('/(tabs)/explore/packages')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {TOP_EXPERIENCES.map((e) => (
              <TouchableOpacity key={e.name} accessibilityRole="button" accessibilityLabel={`${e.name} experiences`} activeOpacity={0.9} onPress={() => router.navigate('/(tabs)/explore')} style={styles.expCard}>
                <ImageBackground source={{ uri: e.image }} style={styles.expImg}>
                  <View style={styles.expPill}>
                    <Text style={styles.expLabel}>{e.name}</Text>
                    <Ionicons name="arrow-forward-circle-outline" size={20} color="#103D30" />
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Handpicked journeys */}
        <View style={styles.section}>
          <SectionHeader title="Handpicked journeys" action="All journeys" onPress={() => router.push('/packages')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {visiblePackages.map((travelPackage) => {
              const { days, nights } = parseDuration(travelPackage.duration);
              return (
                <TouchableOpacity key={travelPackage.id} style={styles.pkgCard} onPress={() => router.push(`/packages/${travelPackage.id}`)} activeOpacity={0.92}>
                  <View>
                    <Image source={{ uri: getPackageGallery(travelPackage.id, travelPackage.title, travelPackage.destination, travelPackage.image, travelPackage.gallery)[0] }} style={styles.pkgImage} />
                    <View style={[styles.pkgBadgePill, { backgroundColor: badgeColor(travelPackage.badge) }]}><Text style={styles.pkgBadgeText}>{travelPackage.badge ?? 'Featured'}</Text></View>
                    <View style={styles.pkgHeart}><Ionicons name="heart-outline" size={17} color={Colors.textDark} /></View>
                  </View>
                  <View style={styles.pkgBody}>
                    <Text style={styles.pkgTitle} numberOfLines={1}>{travelPackage.title}</Text>
                    <View style={styles.pkgDuration}>
                      <Ionicons name="time-outline" size={13} color={Colors.textLight} />
                      <Text style={styles.pkgMeta} numberOfLines={1}>{nights ? `${days}, ${nights}` : days}</Text>
                    </View>
                    <View style={styles.pkgInclusions}>
                      {packageInclusions.map((item) => (
                        <View key={item.label} style={styles.pkgInclusion}>
                          <Ionicons name={item.icon} size={12} color={Colors.textLight} />
                          <Text style={styles.pkgInclusionText} numberOfLines={1}>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.pkgPriceRow}>
                      <Text style={styles.pkgFrom}>From <Text style={styles.pkgPrice}>{travelPackage.price}</Text> / person</Text>
                      <View style={styles.pkgArrow}><Ionicons name="arrow-forward" size={16} color="#FFFFFF" /></View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {!visiblePackages.length ? <Text style={styles.emptyPackages}>Published holiday packages will appear here.</Text> : null}
        </View>

        {/* Offers for you */}
        {forYouOffers.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Offers for You" action="See all" onPress={() => router.push('/offers')} />
            <OfferRow offers={forYouOffers} height={150} />
          </View>
        ) : null}

        {/* Promises */}
        <View style={styles.section}>
          <SectionHeader title="LemonTrip Promises" action="Learn more" onPress={() => router.push('/help')} />
          <View style={styles.promiseGrid}>
            {promises.map((item) => (
              <View key={item.label} style={[styles.promiseTile, { width: promiseTileWidth }]}>
                <View style={styles.promiseIcon}><Ionicons name={item.icon} size={22} color={Colors.primary} /></View>
                <Text style={styles.promiseTileLabel} numberOfLines={2}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stories */}
        {visibleStories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Travel stories" action="Read all" onPress={() => router.push('/blog')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {visibleStories.map((story) => (
                <TouchableOpacity key={story.id} style={styles.storyCard} onPress={() => router.push(`/blog/${story.id}`)} activeOpacity={0.92}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  <View style={styles.storyBody}>
                    <Text style={styles.storyCategory} numberOfLines={1}>{story.category}</Text>
                    <Text style={styles.storyTitle} numberOfLines={3}>{story.title}</Text>
                    <Text style={styles.storyMeta} numberOfLines={1}>{story.date} • {story.readingTime || '3 min read'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* AI Trip Planner */}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="AI Trip Planner. Start planning" activeOpacity={0.92} style={styles.aiShadow} onPress={() => router.push('/ai-planner' as never)}>
          <View style={styles.aiCard}>
            <View style={styles.aiContent}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIcon}><Ionicons name="compass-outline" size={19} color="#103D30" /></View>
                <Text style={styles.aiEyebrow} numberOfLines={1}>AI Trip Planner</Text>
                <View style={styles.aiBadge}><Ionicons name="sparkles" size={10} color="#103D30" /><Text style={styles.aiBadgeText}>AI Powered</Text></View>
              </View>
              <Text style={styles.aiTitle}>Plan personalized trips in seconds.</Text>
              <Text style={styles.aiSub} numberOfLines={2}>Get AI-powered itineraries, budget suggestions and more.</Text>
            </View>
            <View style={styles.aiGo}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </AppScreen>
  );
}

function OfferRow({ offers, height = 156 }: { offers: Offer[]; height?: number }) {
  const { width } = useWindowDimensions();
  // Two cards fit across the screen; further offers scroll sideways.
  const cardWidth = Math.floor((Math.min(width, 784) - 32 - 10) / 2);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow} snapToInterval={cardWidth + 10} decelerationRate="fast">
      {offers.map((offer) => (
        <TouchableOpacity key={offer.id} style={[styles.offerCard, { width: cardWidth, height }]} onPress={() => router.push('/offers')} activeOpacity={0.92}>
          <Image source={{ uri: offer.image }} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(8,24,40,0.72)', 'rgba(8,24,40,0.06)']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
          <View style={styles.offerBody}>
            <View style={styles.offerPill}>
              <Text style={styles.offerPillText} numberOfLines={1}>{offer.category}</Text>
            </View>
            <View style={styles.offerFooter}>
              <Text style={styles.offerTitle} numberOfLines={3}>{offer.title}</Text>
              <View style={styles.offerArrow}><Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} /></View>
            </View>
          </View>
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
  const [tripType, setTripType] = useState<(typeof tripTypes)[number]>('One Way');

  const selectTripType = (type: (typeof tripTypes)[number]) => {
    if (type === 'Multi City') {
      router.push('/(tabs)/explore/flights');
      return;
    }
    setTripType(type);
    if (type === 'One Way') setReturnDate('');
  };
  const swap = () => { setOrigin(destination); setDestination(origin); };
  const search = () => {
    if (!origin.trim() || !destination.trim() || !departureDate) {
      setError('Enter your origin, destination and departure date.');
      return;
    }
    setError('');
    const request: FlightSearchRequest = {
      tripType: tripType === 'Round Trip' && returnDate ? 'roundTrip' : 'oneWay',
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      ...(tripType === 'Round Trip' && returnDate ? { returnDate } : {}),
      travellers,
      cabinClass,
      specialFare: 'regular',
    };
    router.push({ pathname: '/(tabs)/explore/flights', params: { search: JSON.stringify(request) } });
  };

  return (
    <View style={styles.panel}>
      <View style={styles.tripTabs}>
        {tripTypes.map((type) => {
          const selected = tripType === type;
          return (
            <TouchableOpacity key={type} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => selectTripType(type)} style={[styles.tripTab, selected && styles.tripTabSelected]}>
              <Text style={[styles.tripTabText, selected && styles.tripTabTextSelected]}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.row}>
        <View style={styles.flex}><TileInput icon="location" label="From" value={origin} onChangeText={setOrigin} placeholder="City / airport" /></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap origin and destination" onPress={swap} style={styles.swapButton}>
          <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.flex}><TileInput icon="location-outline" label="To" value={destination} onChangeText={setDestination} placeholder="Where to?" /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.dateCol}><DateField tile label="Departure" value={departureDate} placeholder="Add date" minDate={todayISO()} onChange={(date) => { setDepartureDate(date); if (returnDate && returnDate < date) setReturnDate(''); }} /></View>
        <View style={styles.dateCol}><DateField tile label="Return" value={returnDate} placeholder="Add Return" minDate={departureDate || todayISO()} onChange={(date) => { setReturnDate(date); if (date) setTripType('Round Trip'); }} /></View>
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
  hero: { height: HERO_HEIGHT, paddingHorizontal: 16, overflow: 'hidden', justifyContent: 'flex-start' },
  heroImage: { position: 'absolute', top: 0, right: -79, height: HERO_IMAGE_HEIGHT, width: HERO_IMAGE_HEIGHT * HERO_ASPECT, minWidth: '100%' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  locationText: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: TextSize.body },
  heroBrand: { flex: 1, alignItems: 'flex-end' },
  heroLogo: { width: 102, height: 38 },
  heroLogoMark: { width: 66, height: 36, marginRight: 10 },
  bellButton: { width: 40, height: 40, marginLeft: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(8,30,24,0.55)' },
  bellDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  heroCopy: { marginTop: 18, maxWidth: '80%' },
  heroTitle: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: 30, lineHeight: 35, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  heroScript: { color: '#FFFFFF', fontFamily: SCRIPT_FONT, fontSize: 45, lineHeight: 42, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  heroScriptAccent: { color: '#FFFFFF' },
  heroSub: { marginTop: 8, color: '#FFFFFF', fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  heroDots: { position: 'absolute', left: 16, bottom: 66, flexDirection: 'row', gap: 6 },
  dot: { width: 14, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 32, backgroundColor: '#FFFFFF' },

  // Search card
  searchCard: { zIndex: 2, marginHorizontal: 12, marginTop: -HERO_OVERLAP, paddingHorizontal: 10, paddingTop: 12, paddingBottom: 12, borderRadius: 26, backgroundColor: Colors.surface, ...cardShadow, shadowOpacity: 0.14 },
  serviceTabs: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
  serviceTab: { flex: 1, minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 14, paddingHorizontal: 2 },
  serviceTabSelected: { backgroundColor: Colors.primary },
  serviceTabLabel: { color: Colors.textDark, fontFamily: INTER.semibold, fontSize: TextSize.micro },
  serviceTabLabelSelected: { color: '#FFFFFF', fontFamily: INTER.bold },
  panel: { marginTop: 10, gap: 8 },
  tripTabs: { flexDirection: 'row', gap: 22, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tripTab: { paddingVertical: 8, marginBottom: -1, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tripTabSelected: { borderBottomColor: Colors.primary },
  tripTabText: { color: Colors.textLight, fontFamily: INTER.medium, fontSize: TextSize.body },
  tripTabTextSelected: { color: Colors.primary, fontFamily: INTER.bold },
  panelDescription: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 19 },
  panelHighlight: { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: Colors.surfaceMuted, color: Colors.primary, fontFamily: INTER.bold, fontSize: TextSize.caption },
  tile: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  travellerTile: { flex: 0.5, minWidth: 0, paddingHorizontal: 9, gap: 6 },
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
  modalDone: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: Colors.primary },
  modalDoneText: { color: '#FFFFFF', fontFamily: INTER.extrabold, fontSize: TextSize.body },

  expander: { alignSelf: 'center', width: 44, height: 28, marginTop: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },

  // Quick actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: 10, marginTop: 6, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 18 },
  quickItem: { width: '20%', alignItems: 'center', gap: 6 },
  quickIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28 },
  quickLabel: { color: Colors.textDark, fontFamily: INTER.medium, fontSize: TextSize.micro, textAlign: 'center' },

  // Sections
  section: { paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  sectionHeaderCopy: { flex: 1, minWidth: 0 },
  sectionSubtitle: { marginTop: 2, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption },
  sectionEyebrow: { color: Colors.secondary, fontFamily: INTER.extrabold, fontSize: TextSize.micro, lineHeight: 13, letterSpacing: 1.05, textTransform: 'uppercase' },
  sectionTitle: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.heading, lineHeight: 25, marginTop: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 4 },
  linkText: { color: Colors.primaryDark, fontFamily: INTER.semibold, fontSize: TextSize.body },
  hRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  categoryRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { color: Colors.textDark, fontFamily: INTER.semibold, fontSize: TextSize.caption },
  categoryTextSelected: { color: '#FFFFFF', fontFamily: INTER.extrabold },
  emptyPackages: { paddingHorizontal: 16, paddingBottom: 8, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption },

  // Offers
  offerCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.primaryDark, ...cardShadow },
  offerBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  offerPill: { alignSelf: 'flex-start', maxWidth: '100%', paddingVertical: 5, paddingHorizontal: 11, borderRadius: 12, backgroundColor: 'rgba(228,240,255,0.94)' },
  offerPillText: { color: '#1D3557', fontFamily: INTER.bold, fontSize: 9.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  offerFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  offerTitle: { flex: 1, color: '#FFFFFF', fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, lineHeight: 20, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  offerArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF' },

  // Destinations (same as Explore)
  destCard: { width: 132, height: 138, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.surfaceMuted, ...cardShadow },
  destImage: { flex: 1, justifyContent: 'space-between', padding: 8 },
  destImageStyle: { borderRadius: 14 },
  destShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12,48,38,0.22)' },
  saveButton: { alignSelf: 'flex-end', width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  destCountry: { color: '#FFFFFF', fontFamily: INTER.semibold, fontSize: 10 },
  destName: { color: '#FFFFFF', fontFamily: INTER.extrabold, fontSize: 16 },
  destSub: { color: '#FFFFFF', fontFamily: INTER.semibold, fontSize: 10, lineHeight: 13, marginTop: 1 },

  // Top experiences (same as Explore)
  expCard: { width: 120, height: 100, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.surfaceMuted },
  expImg: { flex: 1, justifyContent: 'flex-end', padding: 6 },
  expPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 11, backgroundColor: '#FFFFFF' },
  expLabel: { fontFamily: INTER.semibold, fontSize: 11, color: Colors.textDark },

  // Packages
  pkgCard: { width: 204, overflow: 'hidden', backgroundColor: Colors.surface, borderRadius: 18, ...cardShadow },
  pkgImage: { width: '100%', height: 104, backgroundColor: Colors.surfaceMuted },
  pkgBadgePill: { position: 'absolute', top: 8, left: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  pkgBadgeText: { color: '#FFFFFF', fontFamily: INTER.bold, fontSize: TextSize.micro },
  pkgHeart: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  pkgBody: { padding: 12 },
  pkgTitle: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  pkgDuration: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  pkgMeta: { flex: 1, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption },
  pkgInclusions: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginTop: 8 },
  pkgInclusion: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  pkgInclusionText: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: 10 },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10 },
  pkgFrom: { flex: 1, color: Colors.textLight, fontFamily: INTER.regular, fontSize: 10 },
  pkgPrice: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  pkgArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryDark, alignItems: 'center', justifyContent: 'center' },

  // Promises
  promiseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  promiseTile: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 16, backgroundColor: Colors.surface, ...cardShadow },
  promiseIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#DDF1E2' },
  promiseTileLabel: { flex: 1, color: Colors.textDark, fontFamily: INTER.medium, fontSize: 12, lineHeight: 16 },

  // Stories
  storyCard: { width: 292, height: 112, flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, overflow: 'hidden', ...cardShadow },
  storyImage: { width: 98, alignSelf: 'stretch', backgroundColor: Colors.surfaceMuted },
  storyBody: { flex: 1, minWidth: 0, padding: 10, justifyContent: 'center' },
  storyCategory: { color: Colors.textLight, fontFamily: INTER.bold, fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase' },
  storyTitle: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.caption, marginTop: 3, lineHeight: 17 },
  storyMeta: { marginTop: 5, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.micro },

  // AI planner
  aiShadow: { marginHorizontal: 16, marginTop: 24, borderRadius: 18, ...cardShadow, shadowOpacity: 0.14 },
  // The photo keeps its natural proportions at the card height and is anchored right, so nothing is stretched or shifted.
  aiImage: { position: 'absolute', top: 0, right: 0, height: AI_CARD_HEIGHT, width: AI_CARD_HEIGHT * AI_ASPECT, minWidth: '100%' },
  aiCard: { overflow: 'hidden', height: AI_CARD_HEIGHT, justifyContent: 'center', borderRadius: 18, backgroundColor: '#DCEFE5' },
  aiContent: { padding: 12, maxWidth: '68%' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#FFFFFF' },
  aiEyebrow: { flexShrink: 1, color: '#0F2A24', fontFamily: INTER.extrabold, fontSize: TextSize.caption },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 9, backgroundColor: '#DCEFE5' },
  aiBadgeText: { color: '#103D30', fontFamily: INTER.bold, fontSize: 9 },
  aiTitle: { marginTop: 7, color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: 15, lineHeight: 19 },
  aiSub: { marginTop: 3, color: '#2F403A', fontFamily: INTER.regular, fontSize: 10.5, lineHeight: 14 },
  aiGo: { position: 'absolute', right: 12, top: 12, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.primaryDark, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
});