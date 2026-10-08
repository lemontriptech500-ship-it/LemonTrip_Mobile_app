import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { Colors } from '@/constants/colors';
import type { Destination, TravelPackage } from '@/types/content';
import { useAuth } from '@/utils/authStore';
import { useContentItems } from '@/utils/contentApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
const filterOptions = {
  duration: ['Any', '1-5 nights', '6+ nights'],
  budget: ['Any', 'Under ₹30k', '₹30k+'],
  destination: ['Any', 'Dubai', 'Bali', 'Kashmir'],
  category: ['Any', 'Luxury', 'Popular', 'Best seller'],
};
type FilterKey = keyof typeof filterOptions;
const defaultFilters: Record<FilterKey, string> = { duration: 'Any', budget: 'Any', destination: 'Any', category: 'Any' };

export default function ExploreScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.pageWidth}>

          {/* Header — same structure as Home */}
          <BrandGradientBar style={styles.header}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="LemonTrip home" onPress={() => router.push('/(tabs)')} style={styles.brandLockup}>
              <LemonTripBrand size={50} />
            </TouchableOpacity>
            {isWide ? (
              <View style={styles.headerNav}>
                <TouchableOpacity style={[styles.navLink, styles.navLinkActive]} onPress={() => router.push('/(tabs)/explore')}><Text style={[styles.navText, styles.navTextActive]}>Explore</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navLink} onPress={() => router.push('/packages')}><Text style={styles.navText}>Packages</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navLink} onPress={() => router.push('/offers')}><Text style={styles.navText}>Offers</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navLink} onPress={() => router.push('/(tabs)/explore/visa')}><Text style={styles.navText}>Visa Services</Text></TouchableOpacity>
              </View>
            ) : <View style={styles.headerSpacer} />}
            <View style={styles.headerActions}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Saved places" onPress={() => router.push('/(tabs)/wishlist')} style={styles.headerAction}>
                <Ionicons name="heart-outline" size={24} color={Colors.white} />
              </TouchableOpacity>
              {user ? (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Log in" onPress={() => router.push('/login')} style={styles.loginPill}>
                  <Ionicons name="person-outline" size={18} color={Colors.primaryDark} />
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>
          </BrandGradientBar>

          {/* Search strip — same pill as Home, filter button replaces the arrow */}
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

          {/* Travel style — white rounded icon grid, matching Home's service card */}
          <View style={styles.gridCard}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridTitle}>Travel style</Text>
              {selectedExperience ? <TouchableOpacity onPress={() => setSelectedExperience(null)}><Text style={styles.linkText}>Clear</Text></TouchableOpacity> : null}
            </View>
            <View style={styles.gridRow}>
              {experienceTypes.map((experience) => {
                const selected = selectedExperience === experience.filter;
                return (
                  <TouchableOpacity key={experience.name} accessibilityRole="button" accessibilityState={{ selected }} style={styles.gridItem} activeOpacity={0.85} onPress={() => setSelectedExperience((current) => current === experience.filter ? null : experience.filter)}>
                    <View style={[styles.gridCircle, selected && styles.gridCircleSelected]}>
                      <Ionicons name={experience.icon} size={30} color={selected ? Colors.white : Colors.primary} />
                    </View>
                    <Text style={[styles.gridLabel, selected && styles.gridLabelSelected]}>{experience.name}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity accessibilityRole="button" style={styles.gridItem} activeOpacity={0.85} onPress={() => router.push('/packages')}>
                <View style={styles.gridCircle}><Ionicons name="grid-outline" size={28} color={Colors.primary} /></View>
                <Text style={styles.gridLabel}>All journeys</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Promo banner — same treatment as Home carousel */}
          <View style={styles.bannerWrap}>
            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=92' }} style={[styles.banner, isWide && styles.bannerWide]} imageStyle={styles.bannerImage}>
              <View style={styles.bannerShade} />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerKicker}>Find your kind of</Text>
                <Text style={styles.bannerTitle}>Escape</Text>
                <Text style={styles.bannerSubtitle}>Discover destinations, handpicked stays and unforgettable experiences.</Text>
                <TouchableOpacity accessibilityRole="button" style={styles.bannerCta} onPress={() => router.push('/packages')}>
                  <Text style={styles.bannerCtaText}>View Packages</Text>
                  <View style={styles.bannerCtaArrow}><Ionicons name="arrow-forward" size={18} color={Colors.white} /></View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {/* Trending destinations */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Trending destinations</Text>
              <TouchableOpacity onPress={() => { setQuery(''); setShowSuggestions(false); }}><Text style={styles.linkText}>Discover all</Text></TouchableOpacity>
            </View>
            {filteredDestinations.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationRow}>
                {filteredDestinations.map((item) => {
                  const saved = isInWishlist(item.id);
                  return (
                    <TouchableOpacity key={item.id} style={styles.destinationCard} activeOpacity={0.9} onPress={() => selectSearch(item.name)}>
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
              <TouchableOpacity onPress={() => router.push('/packages')}><Text style={styles.linkText}>All journeys</Text></TouchableOpacity>
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
                    <ImageBackground source={{ uri: item.image }} style={styles.packageImage} imageStyle={styles.packageImageStyle}>
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
            <Image source={require('../../../../assets/images/App Logo.png')} style={styles.personalLogo} resizeMode="contain" />
            <View style={styles.personalCopy}>
              <Text style={styles.personalTitle}>{user ? 'Trips picked for you' : 'Not sure where to go?'}</Text>
              <Text style={styles.personalSubtitle}>{user ? `Welcome back, ${user.name.split(' ')[0]}. Your next story is waiting.` : 'Choose a travel mood and we’ll help you find a place to start.'}</Text>
              <View style={styles.preferenceRow}>
                {(user ? ['Surprise me', 'Save a place'] : ['Relax', 'Explore', 'Reconnect']).map((preference) => (
                  <TouchableOpacity key={preference} style={[styles.preferenceChip, tripPreference === preference && styles.preferenceChipActive]} onPress={() => {
                    setTripPreference(preference);
                    if (preference === 'Save a place') router.push('/(tabs)/wishlist');
                    if (preference === 'Surprise me') router.push('/packages');
                  }}>
                    <Text style={[styles.preferenceText, tripPreference === preference && styles.preferenceTextActive]}>{preference}</Text>
                  </TouchableOpacity>
                ))}
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
            <View style={styles.trustItem}><Ionicons name="shield-checkmark" size={26} color={Colors.primary} /><View style={styles.trustCopy}><Text style={styles.trustTitle}>Secure bookings</Text><Text style={styles.trustSubtitle}>Your trip, our priority</Text></View></View>
            <View style={styles.trustItem}><TravelArtworkIcon name="offer" size={36} /><View style={styles.trustCopy}><Text style={styles.trustTitle}>Transparent pricing</Text><Text style={styles.trustSubtitle}>No hidden charges</Text></View></View>
            <View style={styles.trustItem}><TravelArtworkIcon name="help" size={36} /><View style={styles.trustCopy}><Text style={styles.trustTitle}>Travel support</Text><Text style={styles.trustSubtitle}>We’re here, 24/7</Text></View></View>
          </View>

          <View style={styles.footer}>
            <Image source={require('../../../../assets/images/App Logo.png')} style={styles.footerLogoImage} resizeMode="cover" />
            <Text style={styles.footerTagline}>Travel, thoughtfully planned.</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}><Text style={styles.footerLink}>Explore</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/packages')}><Text style={styles.footerLink}>Packages</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/offers')}><Text style={styles.footerLink}>Offers</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}><Text style={styles.footerLink}>Support</Text></TouchableOpacity>
            </View>
            <Text style={styles.footerCopyright}>© LemonTrip. Made for the journey.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SOFT_GREEN = '#f1f7ee';
const SHADOW = { shadowColor: '#15372e', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as const;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f8f4' },
  container: { flex: 1 },
  pageContent: { paddingBottom: 28 },
  pageWidth: { width: '100%', maxWidth: 1380, alignSelf: 'center' },

  // Header
  header: { minHeight: 72, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLockup: { minWidth: 150, height: 56, alignItems: 'flex-start', justifyContent: 'center' },
  headerSpacer: { flex: 1 },
  headerNav: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 26 },
  navLink: { minHeight: 54, justifyContent: 'center', paddingHorizontal: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navLinkActive: { borderBottomColor: Colors.accent },
  navText: { color: 'rgba(255,255,255,0.86)', fontFamily: 'Manrope', fontSize: 14, fontWeight: '700' },
  navTextActive: { color: Colors.accent, fontWeight: '900' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAction: { width: 38, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.accent },
  avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  loginPill: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, borderRadius: 21, backgroundColor: Colors.white },
  loginText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },

  // Search
  searchStrip: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, zIndex: 5 },
  searchPill: { minHeight: 56, paddingLeft: 16, paddingRight: 7, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 28, backgroundColor: '#eef0f1', borderWidth: 1, borderColor: Colors.border },
  searchText: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, paddingVertical: 10 },
  clearSearch: { padding: 4 },
  filterCircle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.primary },
  filterCircleActive: { backgroundColor: Colors.primaryDark },
  filterBadge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.surface },
  filterBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  dropPanel: { marginTop: 10, padding: 14, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  dropHeading: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  suggestionRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionRowLast: { borderBottomWidth: 0 },
  suggestionText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '700' },
  noSuggestions: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14, paddingVertical: 10 },
  filterGroup: { gap: 8, marginBottom: 12 },
  filterLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', textTransform: 'capitalize' },
  filterOptions: { gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, backgroundColor: Colors.background },
  filterChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  filterChipTextSelected: { color: Colors.white },
  filterActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  resetText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', padding: 6 },
  applyButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 22, backgroundColor: Colors.primary },
  applyText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },

  // Travel style grid card
  gridCard: { marginTop: 16, marginHorizontal: 16, paddingTop: 16, paddingBottom: 6, paddingHorizontal: 8, borderRadius: 26, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, ...SHADOW },
  gridHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  gridTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '25%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 },
  gridCircle: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: 33, backgroundColor: SOFT_GREEN, borderWidth: 1, borderColor: Colors.border },
  gridCircleSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  gridLabel: { marginTop: 7, textAlign: 'center', color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 17, fontWeight: '800' },
  gridLabelSelected: { color: Colors.primary },

  // Banner
  bannerWrap: { marginTop: 16, marginHorizontal: 16 },
  banner: { minHeight: 230, justifyContent: 'flex-end', borderRadius: 24, overflow: 'hidden', backgroundColor: Colors.primaryDark },
  bannerWide: { minHeight: 260 },
  bannerImage: { borderRadius: 24 },
  bannerShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(3, 39, 30, 0.36)' },
  bannerContent: { padding: 20, maxWidth: 560 },
  bannerKicker: { color: Colors.white, fontFamily: 'Manrope', fontSize: 22, fontWeight: '500' },
  bannerTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 36, lineHeight: 42, fontWeight: '900' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.94)', fontFamily: 'Manrope', fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 380 },
  bannerCta: { alignSelf: 'flex-start', minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14, paddingLeft: 20, paddingRight: 6, borderRadius: 25, backgroundColor: Colors.white },
  bannerCtaText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  bannerCtaArrow: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.primary },

  // Sections
  section: { paddingTop: 24 },
  sectionHeading: { paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 20, fontWeight: '900' },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },

  // Destinations
  destinationRow: { paddingHorizontal: 16, gap: 12 },
  destinationCard: { width: 290, height: 170, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.surfaceMuted },
  destinationImage: { flex: 1, justifyContent: 'space-between', padding: 14 },
  destinationImageStyle: { borderRadius: 20 },
  destinationShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 30, 25, 0.42)' },
  saveButton: { alignSelf: 'flex-end', width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
  destinationCountry: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  destinationName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 22, fontWeight: '900', marginTop: 1 },
  destinationPrice: { color: Colors.white, fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', marginTop: 2 },

  // Active filters
  activeFilters: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 },
  activeFilter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary, borderRadius: 18, backgroundColor: SOFT_GREEN },
  activeFilterText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', textTransform: 'capitalize' },
  clearAll: { paddingHorizontal: 6, paddingVertical: 6 },

  // Packages
  packageRow: { paddingHorizontal: 16, gap: 12 },
  packageCard: { width: 264, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, overflow: 'hidden', ...SHADOW },
  packageImage: { height: 130, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', padding: 10 },
  packageImageStyle: { borderTopLeftRadius: 19, borderTopRightRadius: 19 },
  packageBadge: { overflow: 'hidden', color: Colors.primaryDark, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  packageRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(20, 31, 25, 0.72)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13 },
  packageRatingText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  packageBody: { padding: 14 },
  packageTitle: { minHeight: 42, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, lineHeight: 21, fontWeight: '900' },
  packageMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  packageDuration: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  packageBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  priceLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  packagePrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', marginTop: 1 },
  packageArrow: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.primary },

  emptyState: { marginHorizontal: 16, padding: 20, alignItems: 'flex-start', gap: 12, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyStateText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 14, lineHeight: 20 },
  emptyButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.primary },

  // Personal panel
  personalPanel: { marginTop: 24, marginHorizontal: 16, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'flex-start', borderRadius: 22, backgroundColor: '#fff4bf' },
  personalLogo: { width: 52, height: 52, borderRadius: 12 },
  personalCopy: { flex: 1, minWidth: 0 },
  personalTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 19, lineHeight: 24, fontWeight: '900' },
  personalSubtitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, lineHeight: 20, marginTop: 4 },
  preferenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 },
  preferenceChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(6,59,36,0.14)', backgroundColor: 'rgba(255,255,255,0.8)' },
  preferenceChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  preferenceText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  preferenceTextActive: { color: Colors.white },
  signInLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 6, paddingVertical: 8 },
  signInText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },

  // Trust + footer
  trustStrip: { marginTop: 18, marginHorizontal: 16, padding: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 12, backgroundColor: '#edf5eb', borderRadius: 18 },
  trustItem: { flexGrow: 1, flexBasis: 150, flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustCopy: { flexShrink: 1 },
  trustTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  trustSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  footer: { marginTop: 18, paddingTop: 16, paddingHorizontal: 18, paddingBottom: 6, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  footerLogoImage: { width: 118, height: 38 },
  footerTagline: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  footerLink: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  footerCopyright: { width: '100%', color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
});