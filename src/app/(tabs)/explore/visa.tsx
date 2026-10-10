import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import type { VisaCountry } from '@/types/content';
import { getVisaServices } from '@/utils/visaService';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function VisaScreen() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
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
  const visible = countries.filter(country => `${country.name} ${country.visaType}`.toLowerCase().includes(query.trim().toLowerCase()));
  const destination = countries.find(country => country.id === selected);
  return <View style={{ flex: 1, backgroundColor: Colors.background }}>
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <ExploreSectionIntro eyebrow="TRAVEL WITH CONFIDENCE" title="Visa Services" subtitle="Explore visa guidance for your next destination.">
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="My visa applications" onPress={() => router.push('/(tabs)/explore/visa/applications')} style={styles.applications}><Ionicons name="document-text-outline" size={18} color={Colors.primaryDark} /><Text style={styles.applicationsText}>My applications</Text></TouchableOpacity>
      </ExploreSectionIntro>
      <View style={styles.page}>
      <View style={styles.search}><Ionicons name="search-outline" size={17} color={Colors.textLight} /><TextInput accessibilityLabel="Search countries" value={query} onChangeText={setQuery} placeholder="Search country or visa" placeholderTextColor={Colors.textLight} style={styles.input} /></View>
      {loading ? <ActivityIndicator accessibilityLabel="Loading visa services" color={Colors.secondary} /> : result?.error ? <View style={styles.state}><Text style={styles.body}>{result.error}</Text><TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => setAttempt(value => value + 1)}><Text style={styles.buttonText}>Try again</Text></TouchableOpacity></View> : visible.length === 0 ? <Text style={styles.body}>No visa services found. Try another country.</Text> : visible.map(country => <TouchableOpacity key={country.id} accessibilityRole="radio" accessibilityLabel={`${country.name}, ${country.visaType}`} accessibilityState={{ selected: selected === country.id, checked: selected === country.id }} onPress={() => setSelected(country.id)} style={[styles.country, selected === country.id && styles.selected]}>
        <Text style={styles.flag}>{visaCountryFlag(country.name)}</Text><View style={styles.countryCopy}><Text style={styles.countryName}>{country.name}</Text><Text style={styles.body}>{country.visaType}</Text></View><Ionicons name={selected === country.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected === country.id ? Colors.secondary : Colors.textLight} />
      </TouchableOpacity>)}
      </View>
    </ScrollView>
    {!loading && !result?.error && countries.length > 0 ? <View style={styles.footer}><TouchableOpacity accessibilityRole="button" disabled={!destination} style={[styles.button, !destination && styles.disabled]} onPress={() => { if (destination) { blurWebNavigationFocus(); router.push({ pathname: '/(tabs)/explore/visa/[id]', params: { id: destination.id } }); } }}><Text style={styles.buttonText}>Continue</Text></TouchableOpacity></View> : null}
  </View>;
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 28 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  hero: { minHeight: 285, justifyContent: 'flex-end', marginHorizontal: 15, overflow: 'hidden', borderRadius: 20, backgroundColor: Colors.primaryDark },
  heroImage: { borderRadius: 20 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 31, 23, 0.42)' },
  heroContent: { maxWidth: 520, padding: 18 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { maxWidth: 360, color: Colors.white, fontFamily: 'Manrope', fontSize: 28, lineHeight: 34, fontWeight: '900', marginTop: 6 },
  heroSubtitle: { maxWidth: 340, color: 'rgba(255,255,255,0.88)', fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 12 },
  searchBar: { maxWidth: 430, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 11, borderRadius: 11, backgroundColor: Colors.surface },
  searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, paddingVertical: 8 },
  catalogHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.9 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 3 },
  countryCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9, paddingHorizontal: 15 },
  countryGridDesktop: { justifyContent: 'flex-start', gap: 10 },
  countryCard: { ...Ui.card, width: '48.5%', overflow: 'hidden', borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  countryCardDesktop: { width: '24%' },
  countryImage: { height: 102, justifyContent: 'space-between', padding: 8 },
  countryImageStyle: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  countryShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 30, 23, 0.25)' },
  countryImageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countryCode: { color: Colors.white, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  countryArrow: { width: 24, height: 24, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', borderRadius: 9, backgroundColor: Colors.accent },
  countryName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  countryBody: { padding: 8 },
  countryVisaType: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, fontWeight: '800' },
  countryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  countryMetaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, flex: 1 },
  countryFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginTop: 7 },
  countryFee: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  countryDocuments: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 5 },
  checkText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  emptyState: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, padding: 18, borderRadius: 14, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  retryButton: { minHeight: 44,  marginTop: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  retryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  serviceNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginHorizontal: 16, marginTop: 13, padding: 9, borderRadius: 10, backgroundColor: Colors.surfaceMuted },
  serviceNoticeText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 },
  detailsSection: { marginTop: 21, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  detailsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 9 },
  closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.surface },
  detailsLayout: { gap: 13, paddingHorizontal: 16 },
  detailsMain: { flex: 1, minWidth: 0 },
  visaDetail: { paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.border },
  visaDetailHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  visaDetailIcon: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Colors.accentSoft },
  visaDetailTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  visaDetailBody: { marginTop: 6, paddingLeft: 34 },
  detailText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 },
  detailNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginBottom: 3 },
  documentRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3 },
  documentText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13 },
  startButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  startButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  trackingInputRow: { flexDirection: 'row', gap: 6, marginTop: 9 },
  trackingInput: { flex: 1, minWidth: 0, minHeight: 35, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: 'Manrope', fontSize: 14, color: Colors.textDark },
  checkButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  checkButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  trackingMessage: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 6 },
  trackingSection: { ...Ui.card, marginHorizontal: 16, marginTop: 24, padding: Ui.space.card, borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  trackingHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  trackingBadge: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.surfaceMuted },
  trackingBadgeText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  trackingIntro: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 6 },
  trackingSteps: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 13 },
  trackingStep: { flex: 1, alignItems: 'center', position: 'relative' },
  stepIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  stepLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, textAlign: 'center', marginTop: 4 },
  stepLine: { position: 'absolute', top: 14, left: '62%', width: '76%', height: 1, backgroundColor: Colors.borderStrong },
  trackingFootnote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, textAlign: 'center', marginTop: 9 },
  mobileBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobileCountry: { flex: 1, minWidth: 0 },
  mobileCountryName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  mobileCountryFee: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, marginTop: 2 },
  mobileStart: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 9, backgroundColor: Colors.accent },
  mobileStartText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
});
