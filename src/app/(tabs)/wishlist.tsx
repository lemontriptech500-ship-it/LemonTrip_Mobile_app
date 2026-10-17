import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Chip, EmptyState, Pill, PrimaryButton } from '@/components/trains/TrainUi';
import { packageDetailsRoute } from '@/components/packages/PackageUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { toggleWishlist, useWishlist, type WishlistItem } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

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

  const categoryOf = (item: WishlistItem) => item.category ?? 'Destinations';
  const counts = (id: Filter) => (id === 'All' ? wishlist.length : wishlist.filter((w) => categoryOf(w) === id).length);
  const items = filter === 'All' ? wishlist : wishlist.filter((w) => categoryOf(w) === filter);

  return (
    <AppScreen edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={s.content}>
          <ScreenHeader
            title="Saved places"
            subtitle={wishlist.length ? `${wishlist.length} saved ${wishlist.length === 1 ? 'place' : 'places'} waiting for your next trip.` : 'Save destinations, hotels and packages you love.'}
            eyebrow="LEMONTRIP / WISHLIST"
          />

          {wishlist.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters} style={s.filterWrap}>
              {FILTERS.map((f) => <Chip key={f.id} icon={f.icon} label={`${f.label} · ${counts(f.id)}`} selected={filter === f.id} onPress={() => setFilter(f.id)} />)}
            </ScrollView>
          ) : null}

          {wishlist.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="No saved places yet"
              text="Tap the heart on any destination, hotel or package to keep it here for later."
              action={<View style={s.emptyActions}><PrimaryButton label="Explore destinations" icon="compass-outline" onPress={() => router.push('/(tabs)/explore')} /><PrimaryButton variant="soft" label="Browse packages" icon="umbrella-outline" onPress={() => router.push('/packages' as Href)} /></View>}
            />
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
  emptyActions: { gap: 10 },
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
  placeText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary },
  name: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 22, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  priceLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.7, color: Colors.textLight },
  price: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.primaryDark, marginTop: 2 },
  cta: { width: 150 },
});
