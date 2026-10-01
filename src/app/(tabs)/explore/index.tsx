import { Colors } from '@/constants/colors';
import { destinations } from '@/data/destinations';
import { travelPackages } from '@/data/packages';
import { services } from '@/data/services';
import { useAuth } from '@/utils/authStore';
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
};

const experienceTypes = [
  { name: 'Adventure', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=85' },
  { name: 'Beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=85' },
  { name: 'Mountains', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=85' },
  { name: 'Family', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=85' },
  { name: 'Honeymoon', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=85' },
  { name: 'Weekend', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=85' },
  { name: 'Luxury', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=85' },
  { name: 'Business', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=85' },
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

  const handlePress = (serviceId: string) => {
    if (serviceId === 'visa') {
      router.push('/(tabs)/explore/visa');
    } else if (serviceId === 'hotels') {
      router.push('/(tabs)/explore/hotels');
    } else if (serviceId === 'packages') {
      router.push('/packages');
    } else {
      router.push(`/(tabs)/explore/${serviceId}`);
    }
  };

  const selectSearch = (value: string) => {
    setQuery(value);
    setRecentSearches((current) => [value, ...current.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 4));
    setShowSuggestions(false);
  };

  const filteredDestinations = useMemo(() => {
    const search = query.trim().toLowerCase();
    return destinations.filter((destination) => {
      const country = destinationCountries[destination.id] ?? '';
      return !search || `${destination.name} ${country}`.toLowerCase().includes(search);
    });
  }, [query]);

  const filteredPackages = useMemo(() => {
    return travelPackages.filter((item) => {
      const nights = Number(item.duration.match(/\d+/)?.[0] ?? 0);
      const price = Number(item.price.replace(/[^\d]/g, ''));
      const destinationFilter = filters.destination.toLowerCase();
      const matchesDestination = filters.destination === 'Any' || item.title.toLowerCase().includes(destinationFilter);
      const text = `${item.title} ${item.badge} ${item.highlights.join(' ')}`.toLowerCase();
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
        || (experienceText === 'family' && /popular|best seller/i.test(item.badge))
        || (experienceText === 'business' && /dubai/i.test(item.title))
        || (experienceText === 'luxury' && /luxury/i.test(`${item.title} ${item.badge}`));

      return matchesDestination && matchesCategory && matchesDuration && matchesBudget && matchesExperience;
    });
  }, [filters, selectedExperience]);

  const suggestions = query.trim()
    ? destinations
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
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.eyebrow}>LEMONTRIP / EXPLORE</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => router.push('/cart')} style={styles.cartButton}>
                <Ionicons name="bag-outline" size={19} color={Colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Find your next destination, stay, experience or journey.</Text>
          </View>

          <View style={styles.searchSection}>
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
                <Ionicons name="options-outline" size={19} color={showFilters ? Colors.white : Colors.primary} />
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
                {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((filterName) => (
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

          <View style={styles.heroWrap}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1500&q=90' }}
              style={styles.hero}
              imageStyle={styles.heroImage}>
              <View style={styles.heroShade} />
              <View style={styles.heroContent}>
                <Text style={styles.heroEyebrow}>A WORLD OF POSSIBILITY</Text>
                <Text style={styles.heroTitle}>Go where you feel most alive.</Text>
                <Text style={styles.heroSubtitle}>Find the places and experiences worth making time for.</Text>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.eyebrow}>LEMONTRIP, YOUR WAY</Text><Text style={styles.sectionTitle}>Travel your way</Text></View>
            </View>
            <View style={styles.servicesGrid}>
              {services.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.serviceCard, { width: isWide ? '31.8%' : '48.3%' }]} onPress={() => handlePress(item.id)} activeOpacity={0.88}>
                  <View style={styles.serviceIcon}><Ionicons name={item.icon} size={23} color={Colors.primary} /></View>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                  <Text style={styles.serviceSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} style={styles.serviceArrow} />
                </TouchableOpacity>
              ))}
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
                          <Text style={styles.destinationPrice}>From {item.priceFrom}</Text>
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
              <View><Text style={styles.eyebrow}>FIND YOUR KIND OF ESCAPE</Text><Text style={styles.sectionTitle}>Popular experiences</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.experienceRow}>
              {experienceTypes.map((experience) => (
                <TouchableOpacity key={experience.name} onPress={() => setSelectedExperience((current) => current === experience.name ? null : experience.name)} activeOpacity={0.9}>
                  <ImageBackground source={{ uri: experience.image }} style={[styles.experienceCard, selectedExperience === experience.name && styles.experienceCardSelected]} imageStyle={styles.experienceImage}>
                    <View style={styles.experienceShade} />
                    <Text style={styles.experienceName}>{experience.name}</Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.eyebrow}>THOUGHTFULLY PUT TOGETHER</Text><Text style={styles.sectionTitle}>Curated journeys</Text></View>
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
            {filteredPackages.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packageRow}>
                {filteredPackages.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.packageCard} activeOpacity={0.9} onPress={() => router.push(`/packages/${item.id}`)}>
                    <ImageBackground source={{ uri: item.image }} style={styles.packageImage} imageStyle={styles.packageImageStyle}>
                      <Text style={styles.packageBadge}>{item.badge}</Text>
                      <View style={styles.packageRating}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.packageRatingText}>{item.rating.replace(/[^0-9.]/g, '')}</Text></View>
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
              <View style={styles.emptyState}><Text style={styles.emptyStateText}>No journeys match those filters. Try a broader search.</Text></View>
            )}
          </View>

          <View style={styles.personalPanel}>
            <View style={styles.personalCopy}>
              <Text style={styles.eyebrow}>A LITTLE MORE YOU</Text>
              <Text style={styles.personalTitle}>{user ? 'Trips picked for you' : 'Tell us what kind of trip you want'}</Text>
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

          <View style={styles.footer}>
            <View style={styles.footerBrand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>L</Text></View><Text style={styles.footerLogo}>LemonTrip</Text></View>
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
  pageContent: { paddingBottom: 28 },
  pageWidth: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  header: { paddingTop: 17, paddingBottom: 19, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 19 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  headerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 34, fontWeight: '800' },
  headerSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, marginTop: 5, lineHeight: 20 },
  cartButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  searchSection: { zIndex: 5, marginHorizontal: 16 },
  searchBox: { minHeight: 62, paddingLeft: 17, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, shadowColor: '#16392d', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 13, elevation: 3 },
  searchText: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, paddingVertical: 11 },
  clearSearch: { padding: 6 },
  filterButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.accentSoft },
  filterButtonActive: { backgroundColor: Colors.primary },
  suggestionPanel: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 15 },
  suggestionHeading: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  suggestionRow: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  noSuggestions: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, paddingVertical: 10 },
  filterPanel: { marginTop: 8, padding: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, gap: 11 },
  filterGroup: { gap: 7 },
  filterLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  filterOptions: { gap: 7 },
  filterChip: { paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.background },
  filterChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  filterChipTextSelected: { color: Colors.white },
  heroWrap: { marginTop: 18, paddingHorizontal: 16 },
  hero: { minHeight: 300, justifyContent: 'flex-end', borderRadius: 22, overflow: 'hidden' },
  heroImage: { borderRadius: 22 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 32, 24, 0.34)' },
  heroContent: { paddingHorizontal: 22, paddingBottom: 25, paddingTop: 60, maxWidth: 530 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 31, lineHeight: 38, fontWeight: '800', marginTop: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.92)', fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 330 },
  section: { paddingTop: 30 },
  sectionHeading: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 21, fontWeight: '800', marginTop: 4 },
  linkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', paddingBottom: 3 },
  servicesGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  serviceCard: { minHeight: 161, padding: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16 },
  serviceIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, borderRadius: 13, marginBottom: 12 },
  serviceTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', marginBottom: 5 },
  serviceSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15 },
  serviceArrow: { marginTop: 8, alignSelf: 'flex-end' },
  destinationRow: { paddingHorizontal: 16, gap: 12 },
  destinationCard: { width: 270, height: 315, borderRadius: 19, overflow: 'hidden', backgroundColor: Colors.surfaceMuted },
  destinationImage: { flex: 1, justifyContent: 'space-between', padding: 13 },
  destinationImageStyle: { borderRadius: 19 },
  destinationShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 27, 22, 0.24)' },
  saveButton: { alignSelf: 'flex-end', width: 38, height: 38, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  destinationCopy: { paddingBottom: 8 },
  destinationCountry: { color: 'rgba(255,255,255,0.88)', fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  destinationName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 25, fontWeight: '800', marginTop: 2 },
  destinationPrice: { color: Colors.white, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', marginTop: 4 },
  experienceRow: { paddingHorizontal: 16, gap: 10 },
  experienceCard: { width: 148, height: 184, justifyContent: 'flex-end', padding: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  experienceCardSelected: { borderColor: Colors.accent },
  experienceImage: { borderRadius: 14 },
  experienceShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(9, 29, 23, 0.28)' },
  experienceName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  activeFilters: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  activeFilter: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface },
  activeFilterText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  packageRow: { paddingHorizontal: 16, gap: 12 },
  packageCard: { width: 280, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, overflow: 'hidden' },
  packageImage: { height: 176, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', padding: 11 },
  packageImageStyle: { borderTopLeftRadius: 17, borderTopRightRadius: 17 },
  packageBadge: { overflow: 'hidden', color: Colors.primaryDark, backgroundColor: Colors.accent, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 7, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  packageRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(20, 31, 25, 0.72)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12 },
  packageRatingText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  packageBody: { padding: 13 },
  packageTitle: { minHeight: 42, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  packageMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  packageDuration: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  packageBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  packagePrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  emptyState: { marginHorizontal: 16, padding: 17, borderRadius: 13, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyStateText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 },
  personalPanel: { marginTop: 30, marginHorizontal: 16, padding: 18, borderRadius: 19, backgroundColor: Colors.accentSoft },
  personalCopy: { maxWidth: 600 },
  personalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 21, lineHeight: 27, fontWeight: '800', marginTop: 5 },
  personalSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 6 },
  preferenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 14 },
  preferenceChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  preferenceChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  preferenceText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  preferenceTextActive: { color: Colors.white },
  signInLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 8 },
  signInText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  footer: { marginTop: 32, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Colors.accent },
  brandMarkText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  footerLogo: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  footerTagline: { marginTop: 7, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginTop: 17 },
  footerLink: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  footerCopyright: { marginTop: 17, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
});