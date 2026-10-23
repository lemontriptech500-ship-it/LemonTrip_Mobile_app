import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { ServiceBanner } from '@/components/ui/ServiceHeader';
import type { PackageCategory, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { getPackageGallery } from '@/data/packageImages';

const GREEN = '#103D30';
const TABS = [
  { title: 'Explore', route: '/(tabs)/explore', active: false },
  { title: 'Packages', route: '/(tabs)/explore/packages', active: true },
  { title: 'Offers', route: '/(tabs)/explore/offers', active: false },
  { title: 'Visa Services', route: '/(tabs)/explore/visa', active: false },
];
const FEELINGS: PackageCategory[] = ['International', 'Domestic'];

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
          <ServiceBanner eyebrow="LEMONTRIP / PACKAGES" title="Journeys worth remembering." subtitle="Thoughtfully designed ways to see somewhere new." image={require('../../../assets/images/Tropical Travel Essentials in Green.png')} aspectRatio={2170 / 725} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsRow}>
            {TABS.map((tab) => (
              <TouchableOpacity key={tab.title} accessibilityRole="button" accessibilityState={{ selected: tab.active }} onPress={() => { if (!tab.active) router.navigate(tab.route as never); }} style={[s.tab, tab.active && s.tabOn]}>
                <Text style={[s.tabText, tab.active && s.tabTextOn]}>{tab.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.searchCard}>
            <View style={s.searchPill}>
              <Ionicons name="search-outline" size={20} color={Colors.textLight} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Where do you want to go?" placeholderTextColor={Colors.textLight} style={s.searchInput} returnKeyType="search" accessibilityLabel="Search packages" />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear filters" onPress={() => { setQuery(''); setCategory(null); }} style={s.filterBtn}>
                <Ionicons name="options-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.pad}>
            <Text style={s.eyebrow}>FIND YOUR KIND OF TRIP</Text>
            <Text style={s.title}>Browse by feeling</Text>
            <View style={s.chips}>
              {FEELINGS.map((c) => (
                <TouchableOpacity key={c} accessibilityRole="button" onPress={() => setCategory((cur) => (cur === c ? null : c))} style={[s.chip, category === c && s.chipOn]}>
                  <Text style={[s.chipText, category === c && s.chipTextOn]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[s.pad, s.headRow]}>
            <Text style={s.title}>{category ?? 'Curated journeys'}</Text>
            <Text style={s.count}>{results.length} journeys</Text>
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

function PackageCard({ item }: { item: TravelPackage }) {
  const cover = getPackageGallery(item.id, item.title, item.destination, item.image, item.gallery)[0];
  const saved = isInWishlist(item.id);
  const place = item.destination ?? 'Holiday package';
  const open = () => router.push(`/packages/${item.id}`);
  const extra = item.highlights.length - 2;
  const amount = item.price.replace(/\s*\/\s*person/i, '');
  return (
    <View style={s.card}>
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.9} onPress={open}>
        <ImageBackground source={{ uri: cover }} style={s.photo}>
          <View style={s.photoTop}>
            <View style={s.pill}><Ionicons name="location-outline" size={14} color={GREEN} /><Text style={s.pillText} numberOfLines={1}>{place}</Text></View>
            <View style={s.heartSpace} />
          </View>
          <View style={s.arrow}><Ionicons name="arrow-forward" size={18} color={GREEN} /></View>
        </ImageBackground>
        <View style={s.body}>
          <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={s.metaRow}><Ionicons name="time-outline" size={14} color={Colors.textLight} /><Text style={s.meta}>{item.duration}</Text></View>
          <View style={s.bottom}>
            <View style={s.tags}>
              {item.highlights.slice(0, 2).map((h) => <View key={h} style={s.tag}><Text style={s.tagText} numberOfLines={1}>{h}</Text></View>)}
              {extra > 0 ? <View style={s.tag}><Text style={s.tagText}>{`+${extra}`}</Text></View> : null}
            </View>
            <View style={s.priceBox}>
              <Text style={s.priceLabel}>{'FROM \u00B7 PER PERSON'}</Text>
              <Text style={s.price}>{amount}</Text>
              <Text style={s.perPerson}>/ person</Text>
            </View>
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
  pad: { paddingHorizontal: Ui.space.page, marginTop: 18 },
  tabsRow: { gap: 26, paddingHorizontal: Ui.space.page },
  tab: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Colors.accent },
  tabText: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.textLight },
  tabTextOn: { fontFamily: 'Inter-SemiBold', color: GREEN },
  searchCard: { ...Ui.card, marginHorizontal: Ui.space.page, marginTop: 8, padding: 10 },
  searchPill: { minHeight: 52, paddingLeft: 14, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Inter-Regular', fontSize: 14, paddingVertical: 10 },
  filterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  eyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: 10, letterSpacing: 1, color: Colors.secondary },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 18, color: Colors.textDark, marginTop: 3 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 19, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textDark },
  chipTextOn: { color: Colors.white },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.textLight },
  grid: { gap: 14, paddingHorizontal: Ui.space.page, marginTop: 12 },
  card: { ...Ui.card, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  photo: { height: 150, justifyContent: 'space-between', padding: 10 },
  photoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pill: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.92)' },
  pillText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: GREEN, flexShrink: 1 },
  heart: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  heartPos: { position: 'absolute', top: 10, right: 10 },
  heartSpace: { width: 36, height: 36 },
  arrow: { alignSelf: 'flex-end', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  body: { padding: 12 },
  cardTitle: { fontFamily: 'Inter-Bold', fontSize: 15, color: Colors.textDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  meta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  tags: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { maxWidth: 110, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: Colors.successSoft },
  tagText: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textDark },
  priceBox: { alignItems: 'flex-end', paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: Colors.border },
  priceLabel: { fontFamily: 'Inter-SemiBold', fontSize: 9, letterSpacing: 0.5, color: Colors.textLight },
  price: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  perPerson: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight },
  empty: { minHeight: 140, alignItems: 'center', justifyContent: 'center', marginHorizontal: Ui.space.page, marginTop: 12, padding: 20, borderRadius: 16, backgroundColor: Colors.surface },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 14, color: Colors.textDark, textAlign: 'center' },
  clear: { minHeight: 40, marginTop: 10, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.accent },
  clearText: { fontFamily: 'Inter-Bold', fontSize: 13, color: GREEN },
});