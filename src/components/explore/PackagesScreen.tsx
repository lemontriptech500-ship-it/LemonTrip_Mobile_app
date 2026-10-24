import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import type { PackageCategory, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { getPackageGallery } from '@/data/packageImages';

const GREEN = '#103D30';
const TABS = [
  { title: 'Explore', route: '/(tabs)/explore', active: false },
  { title: 'Packages', route: '/(tabs)/explore/packages', active: true },
  { title: 'Offers', route: '/(tabs)/explore/offers', active: false },
  { title: 'Visa Services', route: '/(tabs)/explore/visa', active: false },
];
const FEELINGS: PackageCategory[] = ['International', 'Domestic'];
const FEELING_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = { International: 'globe-outline', Domestic: 'map-outline' };

export default function PackagesListScreen() {
  useAppLanguage();
  useWishlist();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PackageCategory | null>(null);
  const { items, loading, error } = useContentItems<TravelPackage>('package');
  const results = useMemo(() => items.filter((item) => {
    const search = query.trim().toLowerCase();
    const okQuery = !search || `${item.title} ${item.destination ?? ''} ${item.description}`.toLowerCase().includes(search);
    return okQuery && (!category || item.categories?.includes(category));
  }), [category, query, items]);

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsRow}>
            {TABS.map((tab) => (
              <TouchableOpacity key={tab.title} accessibilityRole="button" accessibilityState={{ selected: tab.active }} onPress={() => { if (!tab.active) router.navigate(tab.route as never); }} style={[s.tab, tab.active && s.tabOn]}>
                <Text style={[s.tabText, tab.active && s.tabTextOn]}>{tab.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.hero}>
            <Image source={require('../../../assets/images/Tropical Overwater Paradise at Sunset.png')} resizeMode="cover" style={s.heroImg} />
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)' }} />
            <View style={s.heroCopy}>
              <Text style={s.heroEyebrow}>HOLIDAY PACKAGES</Text>
              <Text style={s.heroTitle}>Unforgettable Journeys Await</Text>
              <Text style={s.heroSub}>Curated holiday packages for every kind of traveller.</Text>
            </View>
          </View>
          <View style={s.searchCard}>
            <View style={s.searchPill}>
              <Ionicons name="search-outline" size={20} color={Colors.textLight} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Where do you want to go?" placeholderTextColor={Colors.textLight} style={s.searchInput} returnKeyType="search" accessibilityLabel="Search packages" />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear filters" onPress={() => { setQuery(''); setCategory(null); }} style={s.filterBtn}>
                <Ionicons name="options-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={s.chips}>
              {FEELINGS.map((c) => (
                <TouchableOpacity key={c} accessibilityRole="button" accessibilityState={{ selected: category === c }} onPress={() => setCategory((cur) => (cur === c ? null : c))} style={[s.chip, category === c && s.chipOn]}>
                  <Ionicons name={FEELING_ICONS[c] ?? 'earth-outline'} size={15} color={category === c ? Colors.white : GREEN} /><Text style={[s.chipText, category === c && s.chipTextOn]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[s.pad, s.headRow]}>
            <Text style={s.title}>{category ?? 'Curated packages'}</Text>
            <Text style={s.count}>{results.length} packages</Text>
          </View>
          {loading ? <View style={s.empty}><Text style={s.emptyTitle}>Loading journeys...</Text></View> : error ? <View style={s.empty}><Text style={s.emptyTitle}>{error}</Text></View> : results.length ? (
            <View style={s.grid}>{results.map((item) => <PackageCard key={item.id} item={item} />)}</View>
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No journeys in this collection yet</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => { setCategory(null); setQuery(''); }} style={s.clear}><Text style={s.clearText}>See all journeys</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const tagIcon = (text: string): React.ComponentProps<typeof Ionicons>['name'] => {
  const t = text.toLowerCase();
  if (/beach|water|island|lake|cruise|sea/.test(t)) return 'water-outline';
  if (/city|dubai|explore|burj|tower|mall|skyline/.test(t)) return 'business-outline';
  if (/mountain|snow|trek|hill|gulmarg|valley/.test(t)) return 'triangle-outline';
  return 'leaf-outline';
};

function PackageCard({ item }: { item: TravelPackage }) {
  const cover = getPackageGallery(item.id, item.title, item.destination, item.image, item.gallery)[0];
  const saved = isInWishlist(item.id);
  const place = item.destination ?? 'Holiday package';
  const open = () => router.push(`/packages/${item.id}`);
  const extra = item.highlights.length - 2;
  const amount = item.price.replace(/\s*\/\s*person/i, '');
  return (
    <View style={s.card}>
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.92} onPress={open}>
        <ImageBackground source={{ uri: cover }} style={s.photo}>
          <View style={s.photoTop}>
            <View style={s.pill}><Ionicons name="location" size={15} color={GREEN} /><Text style={s.pillText} numberOfLines={1}>{item.title}</Text></View>
            <View style={s.heartSpace} />
          </View>
        </ImageBackground>
        <View style={s.body}>
          <View style={s.bodyLeft}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={s.metaRow}><Ionicons name="time-outline" size={15} color={Colors.textLight} /><Text style={s.meta}>{item.duration}</Text></View>
            <View style={s.tags}>
              {item.highlights.slice(0, 2).map((h) => <View key={h} style={s.tag}><Ionicons name={tagIcon(h)} size={14} color={GREEN} /><Text style={s.tagText} numberOfLines={1}>{h}</Text></View>)}
              {extra > 0 ? <View style={s.tag}><Text style={s.tagText}>{`+${extra}`}</Text></View> : null}
            </View>
          </View>
          <View style={s.priceBox}>
            <View>
              <Text style={s.priceLabel}>{'FROM \u00B7 PER PERSON'}</Text>
              <Text style={s.price}>{amount}</Text>
              <Text style={s.perPerson}>per person</Text>
            </View>
            <View style={s.arrow}><Ionicons name="arrow-forward" size={18} color={Colors.white} /></View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? 'Remove from wishlist' : 'Add to wishlist'} onPress={() => toggleWishlist({ id: item.id, name: item.title, image: cover, price: item.price, category: 'Packages', location: place })} style={[s.heart, s.heartPos]}>
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? Colors.error : GREEN} />
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 34 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  pad: { paddingHorizontal: 10, marginTop: 18 },
  tabsScroll: { backgroundColor: Colors.surface, flexGrow: 0 },
  hero: { width: '100%', aspectRatio: 1.8, overflow: 'hidden', backgroundColor: '#103D30', justifyContent: 'center', paddingTop: 14, paddingBottom: 30 },
  heroImg: { position: 'absolute', left: 0, bottom: 0, width: '100%', height: '135%' },
  heroCopy: { width: '62%', paddingLeft: 16 },
  heroEyebrow: { fontFamily: 'Inter-SemiBold', fontSize: 9, letterSpacing: 1.6, color: '#FFFFFF' },
  heroTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 24, lineHeight: 27, color: '#FFFFFF', marginTop: 6 },
  heroSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: '#FFFFFF', marginTop: 6 },
  tabsRow: { gap: 24, paddingHorizontal: 16 },
  tab: { minHeight: 40, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Colors.accent },
  tabText: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textDark },
  tabTextOn: { fontFamily: 'Inter-SemiBold', color: GREEN },
  searchCard: { ...Ui.card, marginHorizontal: 10, marginTop: -52, padding: 8, borderRadius: 22 },
  searchPill: { minHeight: 48, paddingLeft: 14, paddingRight: 5, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 24, backgroundColor: '#F7F9F7', borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Inter-Regular', fontSize: 14, paddingVertical: 10 },
  filterBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 18, color: Colors.primaryDark, marginTop: 3 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 10, paddingHorizontal: 2 },
  chip: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.textDark },
  chipTextOn: { color: Colors.white },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.textLight },
  grid: { gap: 14, paddingHorizontal: 10, marginTop: 12 },
  card: { ...Ui.card, overflow: 'hidden', borderRadius: 26, backgroundColor: Colors.surface, shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  photo: { height: 140, padding: 12 },
  photoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pill: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)' },
  pillText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark, flexShrink: 1 },
  heart: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  heartPos: { position: 'absolute', top: 12, right: 12 },
  heartSpace: { width: 34, height: 34 },
  arrow: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  body: { flexDirection: 'row', alignItems: 'stretch', gap: 10, padding: 14 },
  cardTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 17, color: Colors.textDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.textLight },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { maxWidth: 120, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: Colors.successSoft },
  tagText: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textDark, flexShrink: 1 },
  bodyLeft: { flex: 1, minWidth: 0 },
  priceBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: Colors.border },
  priceLabel: { fontFamily: 'Inter-SemiBold', fontSize: 8, letterSpacing: 0.4, color: Colors.textLight },
  price: { fontFamily: 'Inter-ExtraBold', fontSize: 15, color: Colors.textDark, marginTop: 3 },
  perPerson: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight, marginTop: 1 },
  empty: { minHeight: 140, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10, marginTop: 12, padding: 20, borderRadius: 16, backgroundColor: Colors.surface },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 14, color: Colors.textDark, textAlign: 'center' },
  clear: { minHeight: 40, marginTop: 10, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.accent },
  clearText: { fontFamily: 'Inter-Bold', fontSize: 13, color: GREEN },
});