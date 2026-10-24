import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { APP_API_URL } from '@/utils/apiConfig';
import { Colors } from '@/constants/colors';
import type { VisaCountry } from '@/types/content';
import { getVisaServices } from '@/utils/visaService';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';

const GREEN = '#103D30';
const POPULAR_COUNT = 6;
const TABS = [
  { title: 'Explore', route: '/(tabs)/explore', active: false },
  { title: 'Packages', route: '/(tabs)/explore/packages', active: false },
  { title: 'Offers', route: '/(tabs)/explore/offers', active: false },
  { title: 'Visa Services', route: '/(tabs)/explore/visa', active: true },
];
const BLURBS: Record<string, string> = {
  Australia: 'Explore the land of stunning landscapes and vibrant cities.',
  France: 'Discover the culture, cuisine and iconic landmarks.',
  Singapore: 'Experience a modern city with amazing attractions.',
  Thailand: 'Enjoy beautiful beaches, rich culture and great shopping.',
  'United Kingdom': 'Explore historic cities and world famous landmarks.',
  'United States': 'Visit top destinations and experience diverse cultures.',
};
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&q=80`;
const FALLBACK_PHOTOS: Record<string, string> = {
  Australia: unsplash('photo-1506973035872-a4ec16b8e8d9'),
  France: unsplash('photo-1499856871958-5b9627545d1a'),
  Singapore: unsplash('photo-1525625293386-3f8f99389edd'),
  Thailand: unsplash('photo-1552465011-b4e21bf6e79a'),
  'United Kingdom': unsplash('photo-1513635269975-59663e0ac1ad'),
  'United States': unsplash('photo-1496588152823-86ff7695e68f'),
};
const resolveImage = (url: string) => !url ? '' : url.startsWith('//') ? `https:${url}` : url.startsWith('/') ? `${APP_API_URL}${url}` : url;

function VisaThumb({ country }: { country: VisaCountry }) {
  const sources = useMemo(() => [resolveImage(country.image), FALLBACK_PHOTOS[country.name] ?? ''].filter((url, index, all) => url && all.indexOf(url) === index), [country.image, country.name]);
  const [failed, setFailed] = useState(0);
  const uri = sources[failed];
  if (!uri) return <View style={[s.thumb, s.thumbEmpty]}><Ionicons name="earth-outline" size={26} color={GREEN} /></View>;
  return <Image source={{ uri }} resizeMode="cover" style={s.thumb} onError={() => setFailed(count => count + 1)} />;
}
const blurbFor = (country: VisaCountry) => BLURBS[country.name]
  ?? [country.processing, country.fee ? `from ${country.fee}` : null].filter(Boolean).join(' · ');

export default function VisaScreen() {
  useAppLanguage();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; items: VisaCountry[]; error: string } | null>(null);
  useEffect(() => {
    let active = true;
    getVisaServices().then(items => { if (active) setResult({ attempt, items, error: '' }); })
      .catch(error => { if (active) setResult({ attempt, items: [], error: error instanceof Error ? error.message : 'Visa services could not load.' }); });
    return () => { active = false; };
  }, [attempt]);
  const loading = result?.attempt !== attempt;
  const countries = useMemo(() => result?.attempt === attempt ? result.items : [], [result, attempt]);
  const search = query.trim().toLowerCase();
  const matches = countries.filter(country => `${country.name} ${country.visaType}`.toLowerCase().includes(search));
  const visible = search || showAll ? matches : matches.slice(0, POPULAR_COUNT);
  const destination = countries.find(country => country.id === selected);
  const ready = !loading && !result?.error && countries.length > 0;
  const proceed = () => {
    if (!destination) return;
    blurWebNavigationFocus();
    router.push({ pathname: '/(tabs)/explore/visa/[id]', params: { id: destination.id } });
  };

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsRow}>
            {TABS.map(tab => (
              <TouchableOpacity key={tab.title} accessibilityRole="button" accessibilityState={{ selected: tab.active }} onPress={() => { if (!tab.active) router.navigate(tab.route as never); }} style={[s.tab, tab.active && s.tabOn]}>
                <Text style={[s.tabText, tab.active && s.tabTextOn]}>{tab.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.hero}>
            <Image source={require('../../../../assets/images/Passport to Paris Riverside.png')} resizeMode="cover" style={s.heroImg} />
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)' }} />
            <View style={s.heroCopy}>
              <Text style={s.heroEyebrow}>TRAVEL WITH CONFIDENCE</Text>
              <Text style={s.heroTitle}>Visa Services</Text>
              <Text style={s.heroSub}>Explore visa guidance for your next destination.</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="My visa applications" onPress={() => router.push('/(tabs)/explore/visa/applications')} style={s.applications}>
                <Ionicons name="document-text-outline" size={18} color={GREEN} />
                <Text style={s.applicationsText}>My applications</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.searchCard}>
            <View style={s.searchPill}>
              <Ionicons name="search-outline" size={20} color={Colors.textLight} />
              <TextInput accessibilityLabel="Search countries" value={query} onChangeText={setQuery} placeholder="Search country or visa" placeholderTextColor={Colors.textLight} style={s.searchInput} returnKeyType="search" />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => { setQuery(''); setShowAll(false); }} style={s.filterBtn}>
                <Ionicons name="options-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.headRow}>
            <Text accessibilityRole="header" style={s.title}>{search ? 'Search results' : 'Popular destinations'}</Text>
            {ready && !search ? (
              <TouchableOpacity accessibilityRole="button" onPress={() => setShowAll(value => !value)} style={s.seeAll}>
                <Text style={s.seeAllText}>{showAll && matches.length > POPULAR_COUNT ? 'Show less' : 'See all'}</Text>
                <Ionicons name={showAll && matches.length > POPULAR_COUNT ? 'arrow-up' : 'arrow-forward'} size={16} color={GREEN} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={s.list}>
            {loading ? <ActivityIndicator accessibilityLabel="Loading visa services" color={Colors.secondary} style={s.loader} />
              : result?.error ? (
                <View style={s.empty}>
                  <Text style={s.emptyTitle}>{result.error}</Text>
                  <TouchableOpacity accessibilityRole="button" style={s.retry} onPress={() => setAttempt(value => value + 1)}><Text style={s.retryText}>Try again</Text></TouchableOpacity>
                </View>
              ) : visible.length === 0 ? (
                <View style={s.empty}><Text style={s.emptyTitle}>No visa services found. Try another country.</Text></View>
              ) : visible.map(country => {
                const on = selected === country.id;
                return (
                  <TouchableOpacity key={country.id} accessibilityRole="radio" accessibilityLabel={`${country.name}, ${country.visaType}`} accessibilityState={{ selected: on, checked: on }} activeOpacity={0.9} onPress={() => setSelected(country.id)} style={[s.card, on && s.cardOn]}>
                    <VisaThumb country={country} />
                    <View style={s.copy}>
                      <Text style={s.name} numberOfLines={1}>{country.name}</Text>
                      <Text style={s.type} numberOfLines={1}>{country.visaType}</Text>
                      <Text style={s.blurb} numberOfLines={2}>{blurbFor(country)}</Text>
                    </View>
                    <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>
      </ScrollView>

      {ready ? (
        <View style={s.footer}>
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !destination }} disabled={!destination} style={[s.button, !destination && s.buttonOff]} onPress={proceed}>
            <Text style={s.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 16 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  tabsScroll: { backgroundColor: Colors.surface, flexGrow: 0 },
  tabsRow: { gap: 24, paddingHorizontal: 16 },
  tab: { minHeight: 40, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Colors.accent },
  tabText: { fontFamily: 'Inter-Medium', fontSize: 13, color: Colors.textDark },
  tabTextOn: { fontFamily: 'Inter-SemiBold', color: GREEN },
  hero: { width: '100%', minHeight: 188, aspectRatio: 2, justifyContent: 'flex-start', paddingTop: 14, paddingBottom: 34, backgroundColor: '#DCEBE5', overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  heroCopy: { width: '62%', paddingLeft: 16 },
  heroEyebrow: { fontFamily: 'Inter-SemiBold', fontSize: 9, letterSpacing: 1.6, color: '#FFFFFF' },
  heroTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 24, lineHeight: 27, color: '#FFFFFF', marginTop: 4 },
  heroSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: '#FFFFFF', marginTop: 4 },
  applications: { minHeight: 38, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: Colors.white, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  applicationsText: { fontFamily: 'Inter-ExtraBold', fontSize: 13, color: GREEN },
  searchCard: { ...Ui.card, marginHorizontal: 10, marginTop: -28, padding: 8, borderRadius: 22 },
  searchPill: { minHeight: 44, paddingLeft: 14, paddingRight: 5, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 24, backgroundColor: '#F7F9F7', borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Inter-Regular', fontSize: 13, paddingVertical: 8 },
  filterBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, marginTop: 16 },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 18, color: GREEN },
  seeAll: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: GREEN },
  list: { gap: 10, paddingHorizontal: 10, marginTop: 10 },
  loader: { marginTop: 30 },
  card: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, paddingRight: 12, borderRadius: 16, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: Colors.surface, shadowColor: GREEN, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  cardOn: { borderColor: GREEN, backgroundColor: '#F4FAF7' },
  thumb: { width: 68, height: 68, borderRadius: 12, backgroundColor: '#E6EEEA' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  flag: { fontSize: 24, width: 32, textAlign: 'center' },
  copy: { flex: 1, minWidth: 0 },
  name: { fontFamily: 'Inter-ExtraBold', fontSize: 15, color: Colors.textDark },
  type: { fontFamily: 'Inter-Medium', fontSize: 12, color: Colors.textDark, marginTop: 1 },
  blurb: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: Colors.textLight, marginTop: 3 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#9AA7A2', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: GREEN },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: GREEN },
  empty: { minHeight: 140, alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 16, backgroundColor: Colors.surface },
  emptyTitle: { fontFamily: 'Inter-Bold', fontSize: 14, color: Colors.textDark, textAlign: 'center' },
  retry: { minHeight: 40, marginTop: 10, paddingHorizontal: 18, justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.accent },
  retryText: { fontFamily: 'Inter-Bold', fontSize: 13, color: GREEN },
  footer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, backgroundColor: Colors.background },
  button: { width: '100%', maxWidth: 740, alignSelf: 'center', minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: GREEN },
  buttonOff: { backgroundColor: '#A3BDB3' },
  buttonText: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.white },
});