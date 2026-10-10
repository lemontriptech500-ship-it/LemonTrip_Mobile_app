import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ExploreSectionIntro } from '@/components/explore/ExploreSectionIntro';
import type { PackageCategory, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function PackagesListScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PackageCategory | null>(null);
  const { items: travelPackages, loading, error } = useContentItems<TravelPackage>('package');
  const categories = useMemo(() => [...new Set(travelPackages.flatMap((item) => item.categories ?? []))], [travelPackages]);

  const results = useMemo(() => travelPackages.filter((item) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || `${item.title} ${item.destination ?? ''} ${item.description}`.toLowerCase().includes(search);
    const matchesCategory = !activeCategory || item.categories?.includes(activeCategory);
    return matchesQuery && matchesCategory;
  }), [activeCategory, query, travelPackages]);

  const destinations = travelPackages.filter((item, index, all) => all.findIndex((candidate) => candidate.destination === item.destination) === index);

  const openPackage = (item: TravelPackage) => router.push(`/packages/${item.id}`);

  return (
    <View style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ExploreSectionIntro eyebrow="CURATED ESCAPES" title="Journeys worth remembering." subtitle="Thoughtfully designed ways to see somewhere new.">
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.primary} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Where do you want to go?" placeholderTextColor={Colors.textLight} style={styles.searchInput} returnKeyType="search" />
              {query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={Colors.textLight} /></TouchableOpacity> : null}
            </View>
          </ExploreSectionIntro>

          <View style={styles.section}>
            <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>FIND YOUR KIND OF TRIP</Text><Text style={styles.sectionTitle}>Browse by feeling</Text></View></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categories.map((category) => (
                <TouchableOpacity key={category} onPress={() => setActiveCategory((current) => current === category ? null : category)} style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}>
                  <Text style={[styles.categoryText, activeCategory === category && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>START SOMEWHERE</Text><Text style={styles.sectionTitle}>Destinations to dream about</Text></View></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationRow}>
              {destinations.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => { setQuery(item.destination ?? item.title); setActiveCategory(null); }} style={styles.destinationCard} activeOpacity={0.9}>
                  <ImageBackground source={{ uri: item.image }} style={styles.destinationImage} imageStyle={styles.destinationImageStyle}>
                    <View style={styles.destinationShade} />
                    <View style={styles.destinationCopy}><Text style={styles.destinationOverline}>EXPLORE</Text><Text style={styles.destinationName}>{item.destination ?? item.title}</Text><Text style={styles.destinationPrice}>From {item.price}</Text></View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.eyebrow}>MADE FOR THE WAY YOU TRAVEL</Text><Text style={styles.sectionTitle}>{activeCategory ?? 'Curated journeys'}</Text></View>
              <Text style={styles.resultCount}>{results.length} journeys</Text>
            </View>
            {loading ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>Loading journeys…</Text></View> : error ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>{error}</Text></View> : results.length ? (
              <View style={styles.packageGrid}>
                {results.map((item) => <PackageCard key={item.id} item={item} desktop={desktop} onPress={() => openPackage(item)} />)}
              </View>
            ) : (
              <View style={styles.emptyState}><TravelArtworkIcon name="package" size={40} /><Text style={styles.emptyTitle}>No journeys in this collection yet</Text><Text style={styles.emptyText}>Try another category or destination.</Text><TouchableOpacity onPress={() => { setActiveCategory(null); setQuery(''); }} style={styles.clearButton}><Text style={styles.clearButtonText}>See all journeys</Text></TouchableOpacity></View>
            )}
          </View>

          <View style={styles.footer}><Text style={styles.footerBrand}>LemonTrip</Text><Text style={styles.footerText}>Good journeys begin with a little inspiration.</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

function PackageCard({ item, desktop, onPress }: { item: TravelPackage; desktop: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.9} onPress={onPress} style={[styles.packageCard, desktop && styles.packageCardDesktop]}>
      <ImageBackground source={{ uri: item.image }} style={styles.packageImage} imageStyle={styles.packageImageStyle}>
        <View style={styles.imageTop}>{item.badge ? <Text style={styles.packageBadge}>{item.badge}</Text> : null}{item.rating ? <View style={styles.rating}><Ionicons name="star" size={11} color={Colors.accent} /><Text style={styles.ratingText}>{item.rating.replace(/[^0-9.]/g, '')}</Text></View> : null}</View>
        <View style={styles.imageArrow}><Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} /></View>
      </ImageBackground>
      <View style={styles.packageBody}>
        <View style={styles.packageDestination}><Ionicons name="location-outline" size={12} color={Colors.secondary} /><Text style={styles.packageDestinationText}>{item.destination ?? 'Holiday package'}</Text></View>
        <Text style={styles.packageTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.packageMeta}><Ionicons name="time-outline" size={13} color={Colors.textLight} /><Text style={styles.packageDuration}>{item.duration}</Text></View>
        <View style={styles.highlights}>
          {item.highlights.slice(0, 2).map((highlight) => <View key={highlight} style={styles.highlight}><Text style={styles.highlightText} numberOfLines={1}>{highlight}</Text></View>)}
        </View>
        <View style={styles.packageFooter}><View><Text style={styles.priceLabel}>FROM · PER PERSON</Text><Text style={styles.packagePrice}>{item.price}</Text></View><Ionicons name="arrow-forward" size={16} color={Colors.primary} /></View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 34 },
  content: { width: '100%', maxWidth: 1380, alignSelf: 'center' },
  searchBar: { minHeight: 47, maxWidth: 500, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.surface },
  searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, paddingVertical: 9 },
  section: { marginTop: 25 },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 11 },
  eyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 3 },
  categoryRow: { gap: 7, paddingHorizontal: 16 },
  categoryChip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: Ui.radius.pill, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  categoryTextActive: { color: Colors.white },
  destinationRow: { gap: 10, paddingHorizontal: 16 },
  destinationCard: { width: 210, height: 145, overflow: 'hidden', borderRadius: 15, backgroundColor: Colors.surfaceMuted },
  destinationImage: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  destinationImageStyle: { borderRadius: 15 },
  destinationShade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.imageOverlay },
  destinationCopy: { position: 'relative' },
  destinationOverline: { color: Colors.accent, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, letterSpacing: 0.9 },
  destinationName: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 3 },
  destinationPrice: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.bold, marginTop: 3 },
  resultCount: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11, paddingHorizontal: 16 },
  packageCard: { ...Ui.card, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  packageCardDesktop: { width: '48.8%' },
  packageImage: { height: 190, justifyContent: 'space-between', padding: 11 },
  packageImageStyle: { borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  imageTop: { flexDirection: 'row', justifyContent: 'space-between' },
  packageBadge: { color: Colors.primaryDark, backgroundColor: Colors.accent, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 10, backgroundColor: Colors.strongOverlay },
  ratingText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  imageArrow: { alignSelf: 'flex-end', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accent },
  packageBody: { padding: 12 },
  packageDestination: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  packageDestinationText: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  packageTitle: { minHeight: 38, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 24, fontWeight: FontWeight.extraBold, marginTop: 5 },
  packageMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  packageDuration: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 9 },
  highlight: { maxWidth: '70%', paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.background },
  highlightText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  packageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingTop: 9, borderTopWidth: 1, borderTopColor: Colors.border },
  priceLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.7 },
  packagePrice: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 3 },
  emptyState: { minHeight: 160, alignItems: 'center', justifyContent: 'center', marginHorizontal: Ui.space.page, padding: 20, borderRadius: 15, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 9 },
  emptyText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 4 },
  clearButton: { minHeight: 44,  marginTop: 10, paddingHorizontal: 11, paddingVertical: 8, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  clearButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  footer: { marginTop: 27, paddingHorizontal: 16, paddingVertical: 15, borderTopWidth: 1, borderColor: Colors.border },
  footerBrand: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  footerText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 3 },
});
