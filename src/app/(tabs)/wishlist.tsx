import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { InfoBanner } from '@/components/account/InfoBanner';
// Same slightly smaller type scale as Explore.
const TextSize = { micro: 10, caption: 11, body: 13, bodyLarge: 14, title: 16, heading: 18, displaySmall: 20, display: 24 } as const;
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Chip, EmptyState, Pill, PrimaryButton } from '@/components/trains/TrainUi';
import { packageDetailsRoute } from '@/components/packages/PackageUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { toggleWishlist, useWishlist, type WishlistItem } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

// Inter (static weights, loaded in app/_layout.tsx).
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const BRAND = '#103D30';
// Banner artwork lives in assets/images (file name as saved in the project).
const BANNER = require('../../../assets/images/Green Travel Search Adventure.png');

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Filter = 'All' | NonNullable<WishlistItem['category']>;

const FILTERS: { id: Filter; label: string; icon: IconName }[] = [
  { id: 'All', label: 'All', icon: 'heart-outline' },
  { id: 'Destinations', label: 'Destinations', icon: 'location-outline' },
  { id: 'Hotels', label: 'Hotels', icon: 'bed-outline' },
  { id: 'Packages', label: 'Packages', icon: 'umbrella-outline' },
];

const META: Record<NonNullable<WishlistItem['category']>, { label: string; action: string; icon: IconName; open: (item: WishlistItem) => Href }> = {
  Destinations: { label: 'DESTINATION', action: 'Explore', icon: 'location-outline', open: () => '/(tabs)/explore' as Href },
  Hotels: { label: 'HOTEL', action: 'View hotels', icon: 'bed-outline', open: () => '/(tabs)/explore/hotels' as Href },
  Packages: { label: 'PACKAGE', action: 'View package', icon: 'umbrella-outline', open: (item) => packageDetailsRoute(item.id) as Href },
};

export default function WishlistScreen() {
  useAppLanguage();
  const wishlist = useWishlist();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>('All');
  const wide = width >= 900;
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile' as Href); };

  const categoryOf = (item: WishlistItem) => item.category ?? 'Destinations';
  const counts = (id: Filter) => (id === 'All' ? wishlist.length : wishlist.filter((w) => categoryOf(w) === id).length);
  const items = filter === 'All' ? wishlist : wishlist.filter((w) => categoryOf(w) === filter);

  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.headerTitle}>Saved places</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as Href)} style={s.gearButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={BRAND} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={s.content}>
          <InfoBanner title="Saved places" text={wishlist.length ? `${wishlist.length} saved ${wishlist.length === 1 ? 'place' : 'places'} waiting for your next trip.` : 'Save places you love for your next trip.'} />
          {/* Banner hidden (commented, not deleted)
          <View style={s.bannerWrap}>
          <ImageBackground source={BANNER} style={s.banner} imageStyle={s.bannerImage} resizeMode="cover">
            <View style={s.bannerCopy}>
              <Text style={s.eyebrow}>LEMONTRIP / WISHLIST</Text>
              <Text style={s.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Saved places</Text>
              <Text style={s.bannerText}>{wishlist.length ? `${wishlist.length} saved ${wishlist.length === 1 ? 'place' : 'places'} waiting for your next trip.` : 'Save destinations, hotels and packages you love.'}</Text>
            </View>
          </ImageBackground>
          </View>
          */}

          {wishlist.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters} style={s.filterWrap}>
              {FILTERS.map((f) => <Chip key={f.id} icon={f.icon} label={`${f.label} · ${counts(f.id)}`} selected={filter === f.id} onPress={() => setFilter(f.id)} />)}
            </ScrollView>
          ) : null}

          {wishlist.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}><Ionicons name="heart-outline" size={30} color={BRAND} /></View>
              <Text style={s.emptyTitle}>No saved places yet</Text>
              <Text style={s.emptyText}>Tap the heart on any destination, hotel or package to keep it here for later.</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={s.exploreButton} activeOpacity={0.85}>
                <Text style={s.exploreText}>Explore destinations</Text>
                <View style={s.exploreArrow}><Ionicons name="arrow-forward" size={16} color={BRAND} /></View>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/packages' as Href)} style={s.softButton} activeOpacity={0.85}>
                <Text style={s.softText}>Browse packages</Text>
                <Ionicons name="umbrella-outline" size={17} color={BRAND} />
              </TouchableOpacity>
            </View>
          ) : items.length === 0 ? (
            <EmptyState icon="filter-outline" title={`No saved ${filter.toLowerCase()}`} text="Try another category to see the rest of your saved places." action={<PrimaryButton variant="soft" label="Show all" onPress={() => setFilter('All')} />} />
          ) : (
            <View style={[s.grid, wide && s.gridWide]}>
              {items.map((item) => {
                const meta = META[categoryOf(item)];
                return (
                  <View key={item.id} style={[s.card, wide && s.cardWide]}>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${meta.action}: ${item.name}`} activeOpacity={0.9} onPress={() => router.push(meta.open(item))}>
                      <View>
                        {item.image ? <Image source={{ uri: item.image }} style={s.image} /> : <View style={[s.image, s.imageEmpty]}><Ionicons name="image-outline" size={28} color={Colors.textLight} /></View>}
                        <View style={s.imageTop}><Pill icon={meta.icon} label={meta.label} tone="brand" /></View>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from saved places`} onPress={() => toggleWishlist(item)} style={s.heart} hitSlop={8}>
                      <Ionicons name="heart" size={18} color={Colors.error} />
                    </TouchableOpacity>
                    <View style={s.body}>
                      {item.location && item.location !== item.name ? <View style={s.place}><Ionicons name="location-outline" size={12} color={Colors.secondary} /><Text style={s.placeText} numberOfLines={1}>{item.location}</Text></View> : null}
                      <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                      <View style={s.footer}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={s.priceLabel}>{item.price ? 'STARTING FROM' : 'LEMONTRIP'}</Text>
                          <Text style={s.price} numberOfLines={1}>{item.price || 'Journey'}</Text>
                        </View>
                        <View style={s.cta}><PrimaryButton label={meta.action} icon="arrow-forward" onPress={() => router.push(meta.open(item))} /></View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 960, alignSelf: 'center' },
  filterWrap: { marginBottom: 16 },
  filters: { gap: 8, paddingHorizontal: Ui.space.page },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: INTER.bold, flex: 1, color: BRAND, fontSize: TextSize.title },
  gearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  bannerWrap: { paddingHorizontal: 16, marginTop: 14, marginBottom: 16 },
  banner: { width: '100%', aspectRatio: 2.3, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: BRAND },
  bannerImage: { borderRadius: 22 },
  bannerCopy: { width: '62%', paddingLeft: 18, paddingRight: 0 },
  eyebrow: { fontFamily: INTER.extrabold, color: Colors.accent, fontSize: TextSize.micro, letterSpacing: 1.2, marginBottom: 4 },
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.displaySmall },
  bannerText: { color: Colors.onDarkMuted, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 18, marginTop: 4 },
  empty: { marginHorizontal: 16, alignItems: 'center', padding: 22, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 36, backgroundColor: Colors.surfaceMuted },
  emptyTitle: { fontFamily: INTER.extrabold, marginTop: 14, color: BRAND, fontSize: TextSize.bodyLarge, textAlign: 'center' },
  emptyText: { marginTop: 6, marginBottom: 18, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, textAlign: 'center' },
  exploreButton: { alignSelf: 'stretch', minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 6, borderRadius: 999, backgroundColor: BRAND },
  exploreText: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.body },
  exploreArrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.white },
  softButton: { alignSelf: 'stretch', minHeight: 48, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  softText: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.caption },
  grid: { gap: 14, paddingHorizontal: Ui.space.page },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { ...Ui.card, overflow: 'hidden', padding: 0 },
  cardWide: { width: '48.5%' },
  image: { width: '100%', height: 170, backgroundColor: Colors.surfaceMuted },
  imageEmpty: { alignItems: 'center', justifyContent: 'center' },
  imageTop: { position: 'absolute', top: 12, left: 12 },
  heart: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  body: { padding: 14 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  placeText: { fontFamily: INTER.extrabold, flexShrink: 1, fontSize: TextSize.caption, color: Colors.secondary },
  name: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, lineHeight: 22, color: Colors.textDark, marginTop: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  priceLabel: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 0.7, color: Colors.textLight },
  price: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: Colors.primaryDark, marginTop: 2 },
  cta: { width: 150 },
});