import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { ServiceBanner } from '@/components/ui/ServiceHeader';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import type { Destination, TravelPackage } from '@/types/content';
import { useAuth } from '@/utils/authStore';
import { useContentItems } from '@/utils/contentApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { getPackageGallery } from '@/data/packageImages';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const destinationCountries: Record<string, string> = {
  dubai: 'United Arab Emirates',
  maldives: 'Maldives',
  thailand: 'Thailand',
  singapore: 'Singapore',
  europe: 'France & Europe',
  kashmir: 'India',
  kerala: 'India',
  jaipur: 'India',
};

const featuredDestinations: Destination[] = [
  { id: 'kashmir', name: 'Kashmir', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=900&q=88', priceFrom: 'Snowy mountains & serene valleys' },
  { id: 'kerala', name: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=88', priceFrom: 'God’s own country' },
  { id: 'jaipur', name: 'Jaipur', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900&q=88', priceFrom: 'Royal heritage & culture' },
  { id: 'singapore', name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=88', priceFrom: 'Modern & vibrant' },
];

// Travel styles are shown as icon tiles (same pattern as the Home service grid).
const experienceTypes: { name: string; filter: string; icon: IconName }[] = [
  { name: 'Adventure', filter: 'Adventure', icon: 'compass-outline' },
  { name: 'Beach', filter: 'Beach', icon: 'sunny-outline' },
  { name: 'Mountains', filter: 'Mountains', icon: 'trail-sign-outline' },
  { name: 'Family', filter: 'Family', icon: 'people-outline' },
  { name: 'Honeymoon', filter: 'Honeymoon', icon: 'heart-outline' },
  { name: 'Weekend', filter: 'Weekend', icon: 'calendar-outline' },
  { name: 'Luxury', filter: 'Luxury', icon: 'diamond-outline' },
];

const popularSearches = ['Dubai', 'Maldives', 'Bali', 'Kashmir', 'Weekend getaways'];
const POPULAR_CHIPS = ['Dubai', 'Maldives', 'Bali', 'Kashmir', 'Goa'];
const EXPLORE_TABS = [
  { title: 'Explore', route: '/(tabs)/explore', active: true },
  { title: 'Packages', route: '/(tabs)/explore/packages', active: false },
  { title: 'Offers', route: '/(tabs)/explore/offers', active: false },
  { title: 'Visa Services', route: '/(tabs)/explore/visa', active: false },
];
const filterOptions = {
  duration: ['Any', '1-5 nights', '6+ nights'],
  budget: ['Any', 'Under ₹30k', '₹30k+'],
  destination: ['Any', 'Dubai', 'Bali', 'Kashmir'],
  category: ['Any', 'Luxury', 'Popular', 'Best seller'],
};
type FilterKey = keyof typeof filterOptions;
const defaultFilters: Record<FilterKey, string> = { duration: 'Any', budget: 'Any', destination: 'Any', category: 'Any' };

export default function ExploreScreen() {
  useAppLanguage();
  useWishlist();
  const user = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<FilterKey, string>>(defaultFilters);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [tripPreference, setTripPreference] = useState<string | null>(null);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: destinations } = useContentItems<Destination>('destination');

  const destinationList = destinations.length ? destinations : featuredDestinations;

  const selectSearch = (value: string) => {
    setQuery(value);
    setRecentSearches((current) => [value, ...current.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 4));
    setShowSuggestions(false);
  };

  const filteredDestinations = useMemo(() => {
    const search = query.trim().toLowerCase();
    return destinationList.filter((destination) => {
      const country = destinationCountries[destination.id] ?? '';
      return !search || `${destination.name} ${country}`.toLowerCase().includes(search);
    });
  }, [destinationList, query]);

  const filteredPackages = useMemo(() => {
    return travelPackages.filter((item) => {
      const nights = Number(item.duration.match(/\d+/)?.[0] ?? 0);
      const price = Number(item.price.replace(/[^\d]/g, ''));
      const destinationFilter = filters.destination.toLowerCase();
      const matchesDestination = filters.destination === 'Any' || item.title.toLowerCase().includes(destinationFilter);
      const text = `${item.title} ${item.badge ?? ''} ${item.highlights.join(' ')}`.toLowerCase();
      const matchesCategory = filters.category === 'Any' || text.includes(filters.category.toLowerCase());
      const matchesDuration = filters.duration === 'Any'
        || (filters.duration === '1-5 nights' && nights <= 5)
        || (filters.duration === '6+ nights' && nights >= 6);
      const matchesBudget = filters.budget === 'Any'
        || (filters.budget === 'Under ₹30k' && price < 30000)
        || (filters.budget === '₹30k+' && price >= 30000);
      const experienceText = selectedExperience?.toLowerCase();
      const matchesExperience = !experienceText || text.includes(experienceText)
        || (experienceText === 'beach' && /bali|maldives|dubai/i.test(item.title))
        || (experienceText === 'mountains' && /kashmir/i.test(item.title))
        || (experienceText === 'honeymoon' && /bali|maldives/i.test(item.title))
        || (experienceText === 'adventure' && /safari|explorer|scenic/i.test(`${item.title} ${item.highlights.join(' ')}`))
        || (experienceText === 'weekend' && nights <= 5)
        || (experienceText === 'family' && /popular|best seller/i.test(item.badge ?? ''))
        || (experienceText === 'luxury' && /luxury/i.test(`${item.title} ${item.badge ?? ''}`));

      return matchesDestination && matchesCategory && matchesDuration && matchesBudget && matchesExperience;
    });
  }, [filters, selectedExperience, travelPackages]);

  const suggestions = query.trim()
    ? destinationList
      .filter((destination) => `${destination.name} ${destinationCountries[destination.id] ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
      .map((destination) => destination.name)
      .slice(0, 5)
    : [];

  const suggestionItems = query.trim() ? suggestions : recentSearches.length ? recentSearches : popularSearches;
  const activeFilterEntries = (Object.keys(filters) as FilterKey[]).filter((key) => filters[key] !== 'Any');
  const activeFilterCount = activeFilterEntries.length + (selectedExperience ? 1 : 0);
  const clearAll = () => { setFilters(defaultFilters); setSelectedExperience(null); setQuery(''); };

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.pageWidth}>

          <ServiceBanner eyebrow="LEMONTRIP / EXPLORE" title="Discover somewhere new." subtitle="Search by place, then narrow your journey by travel style." image={require('../../../../assets/images/Tropical Travel Adventure Banner.png')} aspectRatio={2170 / 725} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {EXPLORE_TABS.map((tab) => (
              <TouchableOpacity key={tab.title} accessibilityRole="button" accessibilityState={{ selected: tab.active }} onPress={() => { if (!tab.active) router.navigate(tab.route as never); }} style={[styles.tabItem, tab.active && styles.tabItemActive]}>
                <Text style={[styles.tabText, tab.active && styles.tabTextActive]}>{tab.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Destination discovery search and filters */}
          <View style={styles.searchStrip}>
            <View style={styles.searchPill}>
              <Ionicons name="search-outline" size={22} color={Colors.textLight} />
              <TextInput
                value={query}
                onChangeText={(value) => { setQuery(value); setShowSuggestions(true); }}
                onFocus={() => { setShowSuggestions(true); setShowFilters(false); }}
                onSubmitEditing={() => query.trim() && selectSearch(query.trim())}
                placeholder="Search 'Dubai' or 'Kashmir'"
                placeholderTextColor={Colors.textLight}
                style={styles.searchText}
                returnKeyType="search"
                accessibilityLabel="Search destinations"
              />
              {query ? (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clearSearch}>
                  <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Toggle filters"
                onPress={() => { setShowFilters((visible) => !visible); setShowSuggestions(false); }}
                style={[styles.filterCircle, showFilters && styles.filterCircleActive]}>
                <Ionicons name="options-outline" size={22} color={Colors.white} />
                {activeFilterCount > 0 ? <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFilterCount}</Text></View> : null}
              </TouchableOpacity>
            </View>

            {showSuggestions ? (
              <View style={styles.dropPanel}>
                <Text style={styles.dropHeading}>{query.trim() ? 'Destinations' : recentSearches.length ? 'Recent searches' : 'Popular searches'}</Text>
                {suggestionItems.length ? suggestionItems.map((item, index) => (
                  <TouchableOpacity key={`${item}-${index}`} style={[styles.suggestionRow, index === suggestionItems.length - 1 && styles.suggestionRowLast]} onPress={() => selectSearch(item)}>
                    <Ionicons name={query.trim() ? 'location-outline' : recentSearches.length ? 'time-outline' : 'trending-up-outline'} size={19} color={Colors.primary} />
                    <Text style={styles.suggestionText}>{item}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                )) : <Text style={styles.noSuggestions}>No matching destinations yet.</Text>}
              </View>
            ) : null}

            {showFilters ? (
              <View style={styles.dropPanel}>
                {(Object.keys(filterOptions) as FilterKey[]).map((filterName) => (
                  <View key={filterName} style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>{filterName}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterOptions}>
                      {filterOptions[filterName].map((option) => {
                        const selected = filters[filterName] === option;
                        return (
                          <TouchableOpacity key={option} onPress={() => setFilters((current) => ({ ...current, [filterName]: option }))} style={[styles.filterChip, selected && styles.filterChipSelected]}>
                            <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ))}
                <View style={styles.filterActions}>
                  <TouchableOpacity onPress={() => setFilters(defaultFilters)}><Text style={styles.resetText}>Reset</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.applyButton}><Text style={styles.applyText}>Show journeys</Text></TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          {/* Popular destinations */}
          <View style={styles.popularHead}>
            <Text style={styles.popularTitle}>Popular</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/destinations')} style={styles.popularViewAll}>
              <Text style={styles.linkText}>View all</Text>
              <Ionicons name="arrow-forward" size={16} color="#103D30" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
            {POPULAR_CHIPS.map((place) => {
              const on = query.trim() ? query.trim().toLowerCase() === place.toLowerCase() : place === 'Dubai';
              return (
                <TouchableOpacity key={place} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => selectSearch(place)} style={[styles.popChip, on && styles.popChipOn]}>
                  <Text style={[styles.popChipText, on && styles.popChipTextOn]}>{place}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/destinations')} style={styles.popChip}>
              <Text style={styles.popChipText}>More</Text>
              <Ionicons name="chevron-down" size={14} color="#103D30" />
            </TouchableOpacity>
          </ScrollView>

          {/* Explore-specific filters */}
          <View style={styles.gridCard}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridTitle}>Travel style</Text>
              <View style={styles.gridHeadRight}>
                {selectedExperience ? <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedExperience(null)}><Text style={styles.linkText}>Clear</Text></TouchableOpacity> : null}
                <TouchableOpacity accessibilityRole="button" onPress={() => router.navigate('/(tabs)/explore/packages')} style={styles.popularViewAll}>
                  <Text style={styles.linkText}>Explore all</Text>
                  <Ionicons name="arrow-forward" size={16} color="#103D30" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleRow}>
              {experienceTypes.map((experience, index) => {
                const selected = selectedExperience === experience.filter;
                return (
                  <TouchableOpacity key={experience.name} accessibilityRole="button" accessibilityState={{ selected }} style={styles.styleItem} activeOpacity={0.85} onPress={() => setSelectedExperience((current) => current === experience.filter ? null : experience.filter)}>
                    <View style={[styles.styleCircle, index % 2 === 0 ? styles.styleCircleWarm : styles.styleCircleMint, selected && styles.styleCircleOn]}>
                      <Ionicons name={experience.icon} size={24} color="#103D30" />
                    </View>
                    <Text style={[styles.styleLabel, selected && styles.styleLabelOn]} numberOfLines={1}>{experience.name}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity accessibilityRole="button" style={styles.styleItem} activeOpacity={0.85} onPress={() => router.navigate('/(tabs)/explore/packages')}>
                <View style={[styles.styleCircle, styles.styleCircleMint]}>
                  <Ionicons name="grid-outline" size={24} color="#103D30" />
                </View>
                <Text style={styles.styleLabel} numberOfLines={1}>All journeys</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          {/* Trending destinations */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Trending destinations</Text>
              <TouchableOpacity onPress={() => router.push('/destinations')}><Text style={styles.linkText}>Discover all</Text></TouchableOpacity>
            </View>
            {filteredDestinations.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationRow}>
                {filteredDestinations.map((item) => {
                  const saved = isInWishlist(item.id);
                  return (
                    <TouchableOpacity key={item.id} style={styles.destinationCard} activeOpacity={0.9} onPress={() => router.push({ pathname: "/destinations/[id]", params: { id: item.id } })}>
                      <ImageBackground source={{ uri: item.image }} style={styles.destinationImage} imageStyle={styles.destinationImageStyle}>
                        <View style={styles.destinationShade} />
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={saved ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
                          style={styles.saveButton}
                          onPress={() => toggleWishlist({ id: item.id, name: item.name, image: item.image, price: item.priceFrom, category: 'Destinations', location: item.name })}>
                          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? Colors.error : Colors.primaryDark} />
                        </TouchableOpacity>
                        <View>
                          <Text style={styles.destinationCountry}>{destinationCountries[item.id] ?? 'Explore'}</Text>
                          <Text style={styles.destinationName}>{item.name}</Text>
                          <Text style={styles.destinationPrice} numberOfLines={1}>{destinations.length ? `From ${item.priceFrom}` : item.priceFrom}</Text>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}><Text style={styles.emptyStateText}>No places match “{query}”. Try another destination.</Text></View>
            )}
          </View>

          {/* Handpicked journeys */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Handpicked journeys</Text>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/explore/packages')}><Text style={styles.linkText}>All journeys</Text></TouchableOpacity>
            </View>

            {activeFilterCount > 0 ? (
              <View style={styles.activeFilters}>
                {selectedExperience ? (
                  <TouchableOpacity style={styles.activeFilter} onPress={() => setSelectedExperience(null)}>
                    <Text style={styles.activeFilterText}>{selectedExperience}</Text>
                    <Ionicons name="close" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                ) : null}
                {activeFilterEntries.map((name) => (
                  <TouchableOpacity key={name} style={styles.activeFilter} onPress={() => setFilters((current) => ({ ...current, [name]: 'Any' }))}>
                    <Text style={styles.activeFilterText}>{filters[name]}</Text>
                    <Ionicons name="close" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={clearAll} style={styles.clearAll}><Text style={styles.linkText}>Clear all</Text></TouchableOpacity>
              </View>
            ) : null}

            {filteredPackages.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packageRow}>
                {filteredPackages.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.packageCard} activeOpacity={0.9} onPress={() => router.push(`/packages/${item.id}`)}>
                    <ImageBackground source={{ uri: getPackageGallery(item.id, item.title, item.destination, item.image, item.gallery)[0] }} style={styles.packageImage} imageStyle={styles.packageImageStyle}>
                      {item.badge ? <Text style={styles.packageBadge}>{item.badge}</Text> : <View />}
                      {item.rating ? <View style={styles.packageRating}><Ionicons name="star" size={13} color={Colors.accent} /><Text style={styles.packageRatingText}>{item.rating.replace(/[^0-9.]/g, '')}</Text></View> : null}
                    </ImageBackground>
                    <View style={styles.packageBody}>
                      <Text style={styles.packageTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.packageMeta}><Ionicons name="time-outline" size={15} color={Colors.textLight} /><Text style={styles.packageDuration}>{item.duration}</Text></View>
                      <View style={styles.packageBottom}>
                        <View><Text style={styles.priceLabel}>Starting from</Text><Text style={styles.packagePrice}>{item.price}</Text></View>
                        <View style={styles.packageArrow}><Ionicons name="arrow-forward" size={16} color={Colors.white} /></View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No journeys match those filters. Try a broader search.</Text>
                <TouchableOpacity onPress={clearAll} style={styles.emptyButton}><Text style={styles.applyText}>Clear filters</Text></TouchableOpacity>
              </View>
            )}
          </View>

          {/* Personalised panel */}
          <View style={styles.personalPanel}>
            <Image source={require('../../../../assets/images/Trips Picked Background.jpeg')} resizeMode="cover" style={styles.personalBg} />
            <Image source={require('../../../../assets/images/App Logo.png')} style={styles.personalLogo} resizeMode="contain" />
            <View style={styles.personalCopy}>
              <Text style={styles.personalTitle}>{user ? 'Trips picked for you' : 'Not sure where to go?'}</Text>
              <Text style={styles.personalSubtitle}>{user ? `Welcome back, ${user.name.split(' ')[0]}. Your next story is waiting.` : 'Choose a travel mood and we\u2019ll help you find a place to start.'}</Text>
              <View style={styles.preferenceRow}>
                {(user ? ['Surprise me', 'Save a place'] : ['Relax', 'Explore', 'Reconnect']).map((preference, index) => {
                  const dark = index === 0 || tripPreference === preference;
                  return (
                    <TouchableOpacity key={preference} style={[styles.preferenceChip, dark && styles.preferenceChipActive]} onPress={() => {
                      setTripPreference(preference);
                      if (preference === 'Save a place') router.push('/(tabs)/wishlist');
                      if (preference === 'Surprise me') router.navigate('/(tabs)/explore/packages');
                    }}>
                      {preference === 'Save a place' ? <Ionicons name="heart-outline" size={18} color="#103D30" /> : null}
                      <Text style={[styles.preferenceText, dark && styles.preferenceTextActive]}>{preference}</Text>
                      {preference === 'Surprise me' ? <Ionicons name="arrow-forward" size={16} color={Colors.white} /> : null}
                    </TouchableOpacity>
                  );
                })}
                {!user ? (
                  <TouchableOpacity onPress={() => router.push('/login')} style={styles.signInLink}>
                    <Text style={styles.signInText}>Sign in for picks</Text>
                    <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {/* Trust strip */}
          <View style={styles.trustStrip}>
            <View style={styles.trustItem}><View style={styles.trustIcon}><Ionicons name="shield-checkmark" size={20} color={Colors.primary} /></View><View style={styles.trustCopy}><Text style={styles.trustTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Secure bookings</Text><Text style={styles.trustSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Your trip, our priority</Text></View></View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}><View style={styles.trustIcon}><Ionicons name="pricetag-outline" size={20} color={Colors.primary} /></View><View style={styles.trustCopy}><Text style={styles.trustTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Transparent pricing</Text><Text style={styles.trustSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>No hidden charges</Text></View></View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}><View style={styles.trustIcon}><Ionicons name="headset-outline" size={20} color={Colors.primary} /></View><View style={styles.trustCopy}><Text style={styles.trustTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Travel support</Text><Text style={styles.trustSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>We’re here, 24/7</Text></View></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const SOFT_GREEN = Colors.surfaceMuted;
const SHADOW = Ui.shadow;

const styles = StyleSheet.create({
  quickSearchRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  quickSearchLabel: { color: Colors.onDarkMuted, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  quickSearchChip: { minHeight: 30, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 16, backgroundColor: Colors.onDarkSurface, borderWidth: 1, borderColor: Colors.onDarkBorder },
  quickSearchText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  pageContent: { paddingBottom: 28 },
  pageWidth: { width: '100%', maxWidth: 1380, alignSelf: 'center' },

  // Search
  popularHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Ui.space.page, marginTop: 18, marginBottom: 10 },
  popularTitle: { fontFamily: 'Inter-Bold', fontSize: TextSize.title, color: Colors.textDark },
  popularViewAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  popularRow: { gap: 8, paddingHorizontal: Ui.space.page, alignItems: 'center', paddingBottom: 4 },
  popChip: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  popChipOn: { backgroundColor: '#103D30', borderColor: '#103D30' },
  popChipText: { fontFamily: 'Inter-SemiBold', fontSize: TextSize.body, color: Colors.textDark },
  popChipTextOn: { color: Colors.white },
  tabsRow: { gap: 26, paddingHorizontal: Ui.space.page, marginTop: 0 },
  tabItem: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: Colors.accent },
  tabText: { fontFamily: 'Inter-Medium', fontSize: TextSize.bodyLarge, color: Colors.textLight },
  tabTextActive: { fontFamily: 'Inter-SemiBold', color: '#103D30' },
  searchStrip: { ...Ui.card, marginHorizontal: Ui.space.page, marginTop: 8, padding: 12, zIndex: 5 },
  searchPill: { minHeight: 56, paddingLeft: 16, paddingRight: 7, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 28, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  searchText: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, paddingVertical: 10 },
  clearSearch: { padding: 4 },
  filterCircle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.primary },
  filterCircleActive: { backgroundColor: Colors.primaryDark },
  filterBadge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.surface },
  filterBadgeText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  dropPanel: { ...Ui.card, marginTop: 10, padding: Ui.space.card, borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  dropHeading: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginBottom: 4 },
  suggestionRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionRowLast: { borderBottomWidth: 0 },
  suggestionText: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.bold },
  noSuggestions: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, paddingVertical: 10 },
  filterGroup: { gap: 8, marginBottom: 12 },
  filterLabel: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, textTransform: 'capitalize' },
  filterOptions: { gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, backgroundColor: Colors.background },
  filterChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  filterChipTextSelected: { color: Colors.white },
  filterActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  resetText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, padding: 6 },
  applyButton: { minHeight: 44,  paddingHorizontal: 18, paddingVertical: 11, borderRadius: Ui.radius.control, backgroundColor: Colors.primary },
  applyText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },

  // Travel style grid card
  gridCard: { ...Ui.card, marginTop: 16, marginHorizontal: Ui.space.page, paddingTop: 13, paddingBottom: 7, paddingHorizontal: 8, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  gridHeadRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  styleRow: { gap: 14, paddingHorizontal: 10, paddingBottom: 8 },
  styleItem: { width: 68, alignItems: 'center', gap: 6 },
  styleCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  styleCircleWarm: { backgroundColor: Colors.accentSoft },
  styleCircleMint: { backgroundColor: Colors.successSoft },
  styleCircleOn: { borderColor: Colors.accent },
  styleLabel: { fontFamily: 'Inter-Medium', fontSize: TextSize.micro, color: Colors.textDark, textAlign: 'center' },
  styleLabelOn: { fontFamily: 'Inter-Bold', color: '#103D30' },
  gridHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  gridTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '25%', minHeight: 66, alignItems: 'center', justifyContent: 'center', paddingVertical: 7, paddingHorizontal: 2, position: 'relative' },
  gridLabel: { minHeight: 22, marginTop: 5, textAlign: 'center', color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, lineHeight: 12, fontWeight: FontWeight.bold },
  gridLabelSelected: { color: Colors.primaryDark, fontWeight: FontWeight.extraBold },
  experienceIndicator: { position: 'absolute', bottom: 0, width: 24, height: 3, borderRadius: 2 },
  experienceIndicatorSelected: { backgroundColor: Colors.accent },

  // Sections
  section: { paddingTop: 24 },
  sectionHeading: { paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold },
  linkText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },

  // Destinations
  destinationRow: { paddingHorizontal: 16, gap: 12 },
  destinationCard: { width: 220, height: 172, borderRadius: 19, overflow: 'hidden', backgroundColor: Colors.surfaceMuted, ...SHADOW },
  destinationImage: { flex: 1, justifyContent: 'space-between', padding: 14 },
  destinationImageStyle: { borderRadius: 20 },
  destinationShade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.heroOverlay },
  saveButton: { alignSelf: 'flex-end', width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  destinationCountry: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  destinationName: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, marginTop: 1 },
  destinationPrice: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.semibold, marginTop: 2 },

  // Active filters
  activeFilters: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 },
  activeFilter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary, borderRadius: 18, backgroundColor: SOFT_GREEN },
  activeFilterText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, textTransform: 'capitalize' },
  clearAll: { paddingHorizontal: 6, paddingVertical: 6 },

  // Packages
  packageRow: { paddingHorizontal: 16, gap: 12 },
  packageCard: { ...Ui.card, width: 264, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, overflow: 'hidden', ...SHADOW },
  packageImage: { height: 130, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', padding: 10 },
  packageImageStyle: { borderTopLeftRadius: 19, borderTopRightRadius: 19 },
  packageBadge: { overflow: 'hidden', color: Colors.primaryDark, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  packageRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.strongOverlay, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13 },
  packageRatingText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  packageBody: { padding: 14 },
  packageTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 21, fontWeight: FontWeight.extraBold },
  packageMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  packageDuration: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  packageBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  priceLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  packagePrice: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 1 },
  packageArrow: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.primary },

  emptyState: { marginHorizontal: Ui.space.page, padding: 20, alignItems: 'flex-start', gap: 12, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyStateText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 20 },
  emptyButton: { minHeight: 44,  paddingHorizontal: 16, paddingVertical: 10, borderRadius: Ui.radius.control, backgroundColor: Colors.primary },

  // Personal panel
  personalPanel: { marginTop: 24, marginHorizontal: Ui.space.page, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: 22, overflow: 'hidden', backgroundColor: Colors.accentSoft },
  personalBg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  personalLogo: { width: 48, height: 48, borderRadius: 12 },
  personalCopy: { flex: 1, minWidth: 0, paddingRight: 70 },
  personalTitle: { color: Colors.primaryDark, fontFamily: 'Inter-Bold', fontSize: 15, lineHeight: 19 },
  personalSubtitle: { color: Colors.primaryDark, fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, marginTop: 2 },
  preferenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 },
  preferenceChip: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: Colors.white },
  trustIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  trustDivider: { width: 1, alignSelf: 'stretch', backgroundColor: Colors.border },
  preferenceChipActive: { backgroundColor: '#103D30' },
  preferenceText: { color: Colors.primaryDark, fontFamily: 'Inter-SemiBold', fontSize: 12 },
  preferenceTextActive: { color: Colors.white },
  signInLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 6, paddingVertical: 8 },
  signInText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },

  // Trust + footer
  trustStrip: { marginTop: 12, marginHorizontal: Ui.space.page, paddingVertical: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 18 },
  trustItem: { flex: 1, minWidth: 0, flexDirection: 'column', alignItems: 'center', gap: 4 },
  trustCopy: { alignSelf: 'stretch', minWidth: 0, alignItems: 'center' },
  trustTitle: { color: Colors.primaryDark, fontFamily: 'Inter-Bold', fontSize: 11, textAlign: 'center', lineHeight: 15 },
  trustSubtitle: { color: Colors.textLight, fontFamily: 'Inter-Regular', fontSize: 9, textAlign: 'center', lineHeight: 13, marginTop: 1 },
  footer: { marginTop: 18, paddingTop: 16, paddingHorizontal: 18, paddingBottom: 6, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  footerLogoImage: { width: 118, height: 38 },
  footerTagline: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  footerLink: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  footerCopyright: { width: '100%', color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
});
