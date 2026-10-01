import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toggleWishlist, useWishlist, type WishlistItem } from '@/utils/wishlistStore';

const tabs = ['Destinations', 'Hotels', 'Packages'] as const;
type WishlistCategory = typeof tabs[number];

function getCategory(item: WishlistItem): WishlistCategory {
  return item.category ?? 'Destinations';
}

function formatSavedDate(value: string | undefined) {
  if (!value) return 'Saved recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved recently';
  return `Saved ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function openExplore(category: WishlistCategory) {
  if (category === 'Hotels') router.push('/(tabs)/explore/hotels');
  else if (category === 'Packages') router.push('/packages');
  else router.push('/(tabs)/explore');
}

export default function WishlistScreen() {
  const wishlist = useWishlist();
  const { width } = useWindowDimensions();
  const desktop = width >= 860;
  const [activeTab, setActiveTab] = useState<WishlistCategory>('Destinations');
  const visibleItems = useMemo(() => wishlist.filter((item) => getCategory(item) === activeTab), [activeTab, wishlist]);

  const header = (
    <View style={styles.headerContent}>
      <View style={styles.headerTitleRow}>
        <View><Text style={styles.eyebrow}>YOUR TRAVEL LIST</Text><Text style={styles.pageTitle}>Saved travel</Text></View>
        <View style={styles.savedCount}><Ionicons name="heart" size={13} color={Colors.primary} /><Text style={styles.savedCountText}>{wishlist.length}</Text></View>
      </View>
      <Text style={styles.subtitle}>Keep the places and plans you want to return to.</Text>
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const count = wishlist.filter((item) => getCategory(item) === tab).length;
          const selected = activeTab === tab;
          return (
            <TouchableOpacity key={tab} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setActiveTab(tab)} style={[styles.tab, selected && styles.tabActive]}>
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab}</Text>
              <Text style={[styles.tabCount, selected && styles.tabCountActive]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const empty = wishlist.length === 0 ? (
    <View style={styles.emptyArea}>
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}><Ionicons name="heart-outline" size={23} color={Colors.primary} /></View>
        <Text style={styles.emptyTitle}>Your travel list is waiting.</Text>
        <Text style={styles.emptyDescription}>Save destinations, hotels and journeys you want to revisit.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Explore destinations</Text><Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.emptyArea}>
      <View style={styles.filteredEmpty}>
        <Ionicons name={activeTab === 'Hotels' ? 'bed-outline' : activeTab === 'Packages' ? 'map-outline' : 'earth-outline'} size={22} color={Colors.primary} />
        <Text style={styles.filteredEmptyTitle}>No saved {activeTab.toLowerCase()} yet.</Text>
        <Text style={styles.emptyDescription}>Save a favorite and it will be here when you need it.</Text>
        <TouchableOpacity onPress={() => openExplore(activeTab)} style={styles.secondaryExplore}><Text style={styles.secondaryExploreText}>Explore {activeTab.toLowerCase()}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        key={desktop ? 'saved-grid' : 'saved-list'}
        data={visibleItems}
        keyExtractor={(item) => `${getCategory(item)}-${item.id}`}
        renderItem={({ item }) => <SavedCard item={item} onRemove={() => toggleWishlist(item)} onExplore={() => openSavedItem(item)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        numColumns={desktop ? 2 : 1}
        columnWrapperStyle={desktop && visibleItems.length ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function openSavedItem(item: WishlistItem) {
  if (getCategory(item) === 'Packages') router.push(`/packages/${item.id}`);
  else openExplore(getCategory(item));
}

function SavedCard({ item, onRemove, onExplore }: { item: WishlistItem; onRemove: () => void; onExplore: () => void }) {
  const category = getCategory(item);
  return (
    <View style={styles.card}>
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{category}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from saved travel`} onPress={onRemove} style={styles.heartButton}>
          <Ionicons name="heart" size={17} color={Colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.itemLocation}><Ionicons name="location-outline" size={12} color={Colors.textLight} /><Text style={styles.locationText} numberOfLines={1}>{item.location ?? category}</Text></View>
        <View style={styles.cardMetaRow}><Text style={styles.itemPrice}>{item.price}</Text><Text style={styles.savedDate}>{formatSavedDate(item.savedAt)}</Text></View>
        <TouchableOpacity accessibilityRole="button" onPress={onExplore} style={styles.cardExplore}><Text style={styles.cardExploreText}>Explore</Text><Ionicons name="arrow-forward" size={13} color={Colors.primary} /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: 26 },
  headerContent: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 17, paddingTop: 17 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  pageTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 23, fontWeight: '900', marginTop: 3 },
  savedCount: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: Colors.accentSoft },
  savedCountText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' },
  subtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, marginTop: 4 },
  tabs: { flexDirection: 'row', gap: 6, marginTop: 16, marginBottom: 12 },
  tab: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  tabTextActive: { color: Colors.white },
  tabCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  tabCountActive: { color: Colors.accent },
  gridRow: { width: '100%', maxWidth: 1120, alignSelf: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 17, marginBottom: 12 },
  card: { marginHorizontal: 15, marginBottom: 11, overflow: 'hidden', borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  cardImageWrap: { height: 168, position: 'relative', backgroundColor: Colors.surfaceMuted },
  cardImage: { width: '100%', height: '100%' },
  categoryBadge: { position: 'absolute', top: 9, left: 9, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.white },
  categoryBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  heartButton: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.white },
  cardBody: { padding: 11 },
  itemName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, lineHeight: 17, fontWeight: '800' },
  itemLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  locationText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  itemPrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  savedDate: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7 },
  cardExplore: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8, borderRadius: 8, backgroundColor: Colors.background },
  cardExploreText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  emptyArea: { width: '100%', maxWidth: 1120, minHeight: 265, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 15 },
  emptyState: { minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 19, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  emptyIcon: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.accentSoft, marginBottom: 10 },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  emptyDescription: { maxWidth: 270, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, textAlign: 'center', marginTop: 5 },
  exploreButton: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingHorizontal: 12, borderRadius: 9, backgroundColor: Colors.accent },
  exploreButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  filteredEmpty: { minHeight: 170, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 15, backgroundColor: Colors.surface },
  filteredEmptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', marginTop: 4 },
  secondaryExplore: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 8, marginTop: 3 },
  secondaryExploreText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
});