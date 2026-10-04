import { Colors } from '@/constants/colors';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import type { Destination, TravelPackage } from '@/types/content';
import { useAuth } from '@/utils/authStore';
import { useContentItems } from '@/utils/contentApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const experienceTypes = [
  { name: 'Adventure', subtitle: 'Thrill & explore', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=85' },
  { name: 'Beach escapes', filter: 'Beach', subtitle: 'Sun, sand & sea', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=85' },
  { name: 'Mountains', subtitle: 'Higher & calmer', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=85' },
  { name: 'Family trips', filter: 'Family', subtitle: 'Together always', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=85' },
  { name: 'Honeymoon', subtitle: 'Love & explore', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=85' },
  { name: 'Weekend breaks', filter: 'Weekend', subtitle: 'Short trips, big joy', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=85' },
  { name: 'Luxury stays', filter: 'Luxury', subtitle: 'Stay in style', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=85' },
];

const popularSearches = ['Dubai', 'Maldives', 'Bali', 'Kashmir', 'Weekend getaways'];
const filterOptions = {
  duration: ['Any', '1-5 nights', '6+ nights'],
  budget: ['Any', 'Under ₹30k', '₹30k+'],
  destination: ['Any', 'Dubai', 'Bali', 'Kashmir'],
  category: ['Any', 'Luxury', 'Popular', 'Best seller'],
};

export default function ExploreScreen() {
  useWishlist();
  const user = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ duration: 'Any', budget: 'Any', destination: 'Any', category: 'Any' });
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [tripPreference, setTripPreference] = useState<string | null>(null);
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: destinations } = useContentItems<Destination>('destination');
  const selectSearch = (value: string) => {
    setQuery(value);
    setRecentSearches((current) => [value, ...current.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 4));
    setShowSuggestions(false);
  };

  const filteredDestinations = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (destinations.length ? destinations : featuredDestinations).filter((destination) => {
      const country = destinationCountries[destination.id] ?? '';
      return !search || `${destination.name} ${country}`.toLowerCase().includes(search);
    });
  }, [destinations, query]);

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
        || (experienceText === 'business' && /dubai/i.test(item.title))
        || (experienceText === 'luxury' && /luxury/i.test(`${item.title} ${item.badge ?? ''}`));

      return matchesDestination && matchesCategory && matchesDuration && matchesBudget && matchesExperience;
    });
  }, [filters, selectedExperience, travelPackages]);

  const suggestions = query.trim()
    ? (destinations.length ? destinations : featuredDestinations)
      .filter((destination) => `${destination.name} ${destinationCountries[destination.id] ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
      .map((destination) => destination.name)
      .slice(0, 5)
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.pageWidth}>
          <BrandGradientBar style={styles.header}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="LemonTrip home" onPress={() => router.push('/(tabs)')} style={styles.brandLockup}>
              <LemonTripBrand size={50} />
            </TouchableOpacity>
            {isWide ? <View style={styles.headerNav}>
              <TouchableOpacity style={[styles.navLink, styles.navLinkActive]} onPress={() => router.push('/(tabs)/explore')}><Text style={[styles.navText, styles.navTextActive]}>Explore</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/packages')}><Text style={styles.navText}>Packages</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/offers')}><Text style={styles.navText}>Offers</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/(tabs)/explore/visa')}><Text style={styles.navText}>Visa Services</Text></TouchableOpacity>
            </View> : null}
            <View style={styles.headerActions}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Search destinations" onPress={() => setShowSuggestions(true)} style={styles.headerAction}><Ionicons name="search-outline" size={20} color={Colors.primaryDark}/></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Saved places" onPress={() => router.push('/(tabs)/wishlist')} style={styles.headerAction}><Ionicons name="heart-outline" size={20} color={Colors.primaryDark}/></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}><Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase() ?? 'G'}</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => router.push('/cart')} style={styles.mobileCart}><Ionicons name="bag-outline" size={18} color={Colors.primaryDark}/></TouchableOpacity>
            </View>
          </BrandGradientBar>

          <View style={styles.heroWrap}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=92' }}
              style={[styles.hero, isWide && styles.heroWide]}
              imageStyle={styles.heroImage}>
              <View style={styles.heroShade} />
              <View style={styles.heroContent}>
                <Text style={styles.heroEyebrow}>YOUR NEXT ADVENTURE</Text>
                <Text style={styles.heroTitle}>Find your kind of escape</Text>
                <Text style={styles.heroSubtitle}>Discover destinations, handpicked stays and unforgettable experiences.</Text>
                <TouchableOpacity style={styles.heroCta} onPress={() => setShowSuggestions(true)}><Text style={styles.heroCtaText}>Explore destinations</Text><Ionicons name="arrow-forward" size={15} color={Colors.primaryDark}/></TouchableOpacity>
              </View>
            </ImageBackground>

          <View style={[styles.searchSection, isWide && styles.searchSectionWide]}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={21} color={Colors.primary} />
              <TextInput
                value={query}
                onChangeText={(value) => { setQuery(value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onSubmitEditing={() => query.trim() && selectSearch(query.trim())}
                placeholder="Where do you want to go?"
                placeholderTextColor={Colors.textLight}
                style={styles.searchText}
                returnKeyType="search"
                accessibilityLabel="Search destinations"
              />
              {query ? (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => { setQuery(''); setShowSuggestions(true); }} style={styles.clearSearch}>
                  <Ionicons name="close-circle" size={19} color={Colors.textLight} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Toggle journey filters" onPress={() => { setShowFilters((visible) => !visible); setShowSuggestions(false); }} style={[styles.filterButton, showFilters && styles.filterButtonActive]}>
                <Ionicons name="options-outline" size={19} color={Colors.white} />
                <Text style={styles.filterButtonText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {showSuggestions ? (
              <View style={styles.suggestionPanel}>
                <Text style={styles.suggestionHeading}>{query.trim() ? 'DESTINATIONS' : recentSearches.length ? 'RECENT SEARCHES' : 'POPULAR SEARCHES'}</Text>
                {(query.trim() ? suggestions : recentSearches.length ? recentSearches : popularSearches).length ? (
                  (query.trim() ? suggestions : recentSearches.length ? recentSearches : popularSearches).map((item, index) => (
                    <TouchableOpacity key={`${item}-${index}`} style={styles.suggestionRow} onPress={() => selectSearch(item)}>
                      <Ionicons name={query.trim() ? 'location-outline' : recentSearches.length && !query.trim() ? 'time-outline' : 'trending-up-outline'} size={17} color={Colors.textLight} />
                      <Text style={styles.suggestionText}>{item}</Text>
                      <Ionicons name="arrow-forward" size={15} color={Colors.textLight} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noSuggestions}>No matching destinations yet.</Text>
                )}
              </View>
            ) : null}

            {showFilters ? (
              <View style={styles.filterPanel}>
                {(Object.keys(filterOptions) as (keyof typeof filterOptions)[]).map((filterName) => (
                  <View key={filterName} style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>{filterName}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterOptions}>
                      {filterOptions[filterName].map((option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => setFilters((current) => ({ ...current, [filterName]: option }))}
                          style={[styles.filterChip, filters[filterName] === option && styles.filterChipSelected]}>
                          <Text style={[styles.filterChipText, filters[filterName] === option && styles.filterChipTextSelected]}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.eyebrow}>PLACES TO PUT ON YOUR MAP</Text><Text style={styles.sectionTitle}>Trending destinations</Text></View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}><Text style={styles.linkText}>Discover all</Text></TouchableOpacity>
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
                          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={19} color={saved ? Colors.error : Colors.primaryDark} />
                        </TouchableOpacity>
                        <View style={styles.destinationCopy}>
                          <Text style={styles.destinationCountry}>{destinationCountries[item.id] ?? 'Explore'}</Text>
                          <Text style={styles.destinationName}>{item.name}</Text>
                          <Text style={styles.destinationPrice}>{destinations.length ? `From ${item.priceFrom}` : item.priceFrom}</Text>
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

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionTitle}>Explore by travel style</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.experienceRow}>
              {experienceTypes.map((experience) => {
                const filterName = (('filter' in experience ? experience.filter : undefined) ?? experience.name);
                return <TouchableOpacity key={experience.name} onPress={() => setSelectedExperience((current) => current === filterName ? null : filterName)} activeOpacity={0.9}>
                  <View style={[styles.experienceCard, selectedExperience === filterName && styles.experienceCardSelected]}>
                    <Image source={{ uri: experience.image }} style={styles.experienceImage} />
                    <View style={styles.experienceCopy}><Text style={styles.experienceName}>{experience.name}</Text><Text style={styles.experienceSubtitle}>{experience.subtitle}</Text></View>
                    <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
                  </View>
                </TouchableOpacity>;
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionTitle}>Handpicked journeys</Text></View>
              <TouchableOpacity onPress={() => router.push('/packages')}><Text style={styles.linkText}>All journeys</Text></TouchableOpacity>
            </View>
            <View style={styles.activeFilters}>
              {(['duration', 'budget', 'destination', 'category'] as const).map((name) => (
                <TouchableOpacity key={name} style={styles.activeFilter} onPress={() => { setShowFilters(true); setShowSuggestions(false); }}>
                  <Text style={styles.activeFilterText}>{filters[name] === 'Any' ? name : filters[name]}</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.journeyLayout, isWide && styles.journeyLayoutWide]}>
            {filteredPackages.length ? (
              <ScrollView horizontal style={[styles.journeyPackages, isWide && styles.journeyPackagesWide]} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packageRow}>
                {filteredPackages.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.packageCard} activeOpacity={0.9} onPress={() => router.push(`/packages/${item.id}`)}>
                    <ImageBackground source={{ uri: item.image }} style={styles.packageImage} imageStyle={styles.packageImageStyle}>
                      {item.badge ? <Text style={styles.packageBadge}>{item.badge}</Text> : null}
                      {item.rating ? <View style={styles.packageRating}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.packageRatingText}>{item.rating.replace(/[^0-9.]/g, '')}</Text></View> : null}
                    </ImageBackground>
                    <View style={styles.packageBody}>
                      <Text style={styles.packageTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.packageMeta}><Ionicons name="time-outline" size={13} color={Colors.textLight} /><Text style={styles.packageDuration}>{item.duration}</Text></View>
                      <View style={styles.packageBottom}><Text style={styles.packagePrice}>From {item.price}</Text><Ionicons name="arrow-forward" size={16} color={Colors.primary} /></View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={[styles.emptyState, styles.journeyPackages]}><Text style={styles.emptyStateText}>No journeys match those filters. Try a broader search.</Text></View>
            )}
            <View style={[styles.personalPanel, isWide && styles.personalPanelWide]}>
            <Image source={require('../../../../assets/images/App Logo.png')} style={styles.personalLogo} resizeMode="contain" />
            <View style={styles.personalCopy}>
              <Text style={styles.personalTitle}>{user ? 'Trips picked for you' : 'Not sure where to go?'}</Text>
              <Text style={styles.personalSubtitle}>{user ? `Welcome back, ${user.name.split(' ')[0]}. Your next story is waiting.` : 'Choose a travel mood and we’ll help you find a place to start.'}</Text>
            </View>
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
              {!user ? <TouchableOpacity onPress={() => router.push('/login')} style={styles.signInLink}><Text style={styles.signInText}>Sign in for picks</Text><Ionicons name="arrow-forward" size={14} color={Colors.primary} /></TouchableOpacity> : null}
            </View>
            </View>
          </View>
          </View>

          <View style={styles.trustStrip}>
            <View style={styles.trustItem}><Ionicons name="shield-checkmark" size={22} color={Colors.primary}/><View><Text style={styles.trustTitle}>Secure bookings</Text><Text style={styles.trustSubtitle}>Your trip, our priority</Text></View></View>
            <View style={styles.trustItem}><TravelArtworkIcon name="offer" size={34}/><View><Text style={styles.trustTitle}>Transparent pricing</Text><Text style={styles.trustSubtitle}>No hidden charges</Text></View></View>
            <View style={styles.trustItem}><TravelArtworkIcon name="help" size={34}/><View><Text style={styles.trustTitle}>Travel support</Text><Text style={styles.trustSubtitle}>We’re here, 24/7</Text></View></View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBrand}><Image source={require('../../../../assets/images/App Logo.png')} style={styles.footerLogoImage} resizeMode="cover"/></View>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  pageContent: { paddingBottom: 22 },
  pageWidth: { width: '100%', maxWidth: 1380, alignSelf: 'center' },
  header: { minHeight: 70, paddingHorizontal: 22, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brandLockup: { minWidth: 166, height: 56, alignItems: 'flex-start', justifyContent: 'center' },
  headerNav: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 26 },
  navLink: { minHeight: 54, justifyContent: 'center', paddingHorizontal: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navLinkActive: { borderBottomColor: Colors.accent },
  navText: { color: 'rgba(255,255,255,0.86)', fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  navTextActive: { color: Colors.accent, fontWeight: '900' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAction: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accent },
  avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  mobileCart: { display: 'none' },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  searchSection: { position: 'absolute', top: 14, left: 14, right: 14, zIndex: 5 },
  searchSectionWide: { left: undefined, right: 16, width: 370 },
  searchBox: { minHeight: 49, paddingLeft: 14, paddingRight: 7, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)', borderRadius: 15, shadowColor: '#052b20', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  searchText: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, paddingVertical: 8 },
  clearSearch: { padding: 6 },
  filterButton: { minWidth: 72, height: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, backgroundColor: Colors.primary },
  filterButtonActive: { backgroundColor: Colors.primaryDark },
  filterButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  suggestionPanel: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, shadowColor: '#052b20', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  suggestionHeading: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  suggestionRow: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  noSuggestions: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, paddingVertical: 10 },
  filterPanel: { marginTop: 8, padding: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, gap: 11, shadowColor: '#052b20', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  filterGroup: { gap: 7 },
  filterLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  filterOptions: { gap: 7 },
  filterChip: { paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.background },
  filterChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  filterChipTextSelected: { color: Colors.white },
  heroWrap: { position: 'relative', marginTop: 8, marginHorizontal: 16 },
  hero: { minHeight: 300, justifyContent: 'flex-end', borderRadius: 17, overflow: 'hidden', backgroundColor: Colors.primaryDark },
  heroWide: { minHeight: 238 },
  heroImage: { borderRadius: 17 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(3, 39, 30, 0.34)' },
  heroContent: { paddingHorizontal: 24, paddingBottom: 25, paddingTop: 100, maxWidth: 570 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', letterSpacing: 1.25 },
  heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 36, lineHeight: 43, fontWeight: '900', marginTop: 5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.96)', fontFamily: 'Manrope', fontSize: 14, lineHeight: 21, marginTop: 6, maxWidth: 365 },
  heroCta: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', gap: 10, marginTop: 14, paddingHorizontal: 15, borderRadius: 22, backgroundColor: Colors.accent },
  heroCtaText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  section: { paddingTop: 18 },
  sectionHeading: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 9 },
  sectionTitle: { color: '#123e33', fontFamily: 'Manrope', fontSize: 21, fontWeight: '900', marginTop: 2 },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', paddingBottom: 3 },
  destinationRow: { paddingHorizontal: 20, gap: 12 },
  destinationCard: { width: 310, height: 146, borderRadius: 11, overflow: 'hidden', backgroundColor: Colors.surfaceMuted },
  destinationImage: { flex: 1, justifyContent: 'space-between', padding: 13 },
  destinationImageStyle: { borderRadius: 11 },
  destinationShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 30, 25, 0.48)' },
  saveButton: { alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
  destinationCopy: { paddingBottom: 2 },
  destinationCountry: { color: 'rgba(255,255,255,0.88)', fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  destinationName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 1 },
  destinationPrice: { color: Colors.white, fontFamily: 'Manrope', fontSize: 9, fontWeight: '600', marginTop: 2 },
  experienceRow: { paddingHorizontal: 20, gap: 10 },
  experienceCard: { width: 190, height: 112, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8, borderRadius: 11, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent', backgroundColor: '#edf4e9' },
  experienceCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  experienceImage: { width: 74, height: 78, borderRadius: 8 },
  experienceCopy: { flex: 1, minWidth: 0 },
  experienceName: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  experienceSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 3 },
  activeFilters: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 },
  activeFilter: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: '#f4f8f3' },
  activeFilterText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  journeyLayout: { gap: 12, paddingHorizontal: 16 },
  journeyLayoutWide: { flexDirection: 'row', alignItems: 'stretch' },
  journeyPackages: { width: '100%' },
  journeyPackagesWide: { flex: 1, minWidth: 0, width: undefined },
  packageRow: { paddingHorizontal: 4, gap: 10 },
  packageCard: { width: 248, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden', shadowColor: '#15372e', shadowOpacity: 0.07, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  packageImage: { height: 91, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', padding: 8 },
  packageImageStyle: { borderTopLeftRadius: 11, borderTopRightRadius: 11 },
  packageBadge: { overflow: 'hidden', color: Colors.primaryDark, backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' },
  packageRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(20, 31, 25, 0.72)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12 },
  packageRatingText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  packageBody: { padding: 10 },
  packageTitle: { minHeight: 20, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  packageMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  packageDuration: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  packageBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, paddingTop: 7, borderTopWidth: 1, borderTopColor: Colors.border },
  packagePrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  emptyState: { marginHorizontal: 16, padding: 17, borderRadius: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyStateText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 },
  personalPanel: { width: '100%', minHeight: 150, padding: 15, borderRadius: 13, backgroundColor: '#fff4bf', justifyContent: 'center' },
  personalPanelWide: { width: 260, minHeight: 145 },
  personalLogo: { width: 44, height: 44, marginBottom: 5, borderRadius: 9 },
  personalCopy: { maxWidth: 600 },
  personalTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 17, lineHeight: 22, fontWeight: '900', marginTop: 2 },
  personalSubtitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginTop: 5 },
  preferenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 10 },
  preferenceChip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(6,59,36,0.12)', backgroundColor: 'rgba(255,255,255,0.72)' },
  preferenceChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  preferenceText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  preferenceTextActive: { color: Colors.white },
  signInLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 8 },
  signInText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  trustStrip: { marginTop: 12, marginHorizontal: 20, minHeight: 54, paddingHorizontal: 20, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 8, backgroundColor: '#edf5eb', borderRadius: 12 },
  trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  trustTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  trustSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 2 },
  footer: { marginTop: 12, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerLogoImage: { width: 118, height: 38 },
  footerTagline: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  footerLink: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  footerCopyright: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
});
