import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { VisaCountry } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VisaScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [query, setQuery] = useState('');
  const { items: supportedCountries, loading, error, retry } = useContentItems<VisaCountry>('visa');

  const visibleCountries = useMemo(() => supportedCountries.filter((country) => {
    const search = query.trim().toLowerCase();
    return !search || `${country.name} ${country.id} ${country.visaType}`.toLowerCase().includes(search);
  }), [query, supportedCountries]);

  const handleBack = () => {
    blurWebNavigationFocus();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Visa assistance" subtitle="Clear guidance for the next step in your journey." eyebrow="LEMONTRIP / VISA" onBack={handleBack} />

          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1500&q=90' }} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>DESTINATION SUPPORT</Text>
              <Text style={styles.heroTitle}>Global travel, simplified.</Text>
              <Text style={styles.heroSubtitle}>Explore visa assistance for countries currently listed by LemonTrip.</Text>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={17} color={Colors.primary} />
                <TextInput value={query} onChangeText={setQuery} placeholder="Search or select a country" placeholderTextColor={Colors.textLight} style={styles.searchInput} />
                {query ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear country search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={Colors.textLight} /></TouchableOpacity> : null}
              </View>
            </View>
          </ImageBackground>

          <View style={styles.catalogHeader}>
            <View><Text style={styles.eyebrow}>CURRENT SERVICE LIST</Text><Text style={styles.sectionTitle}>Choose a destination</Text></View>
            <Text style={styles.countryCount}>{loading ? 'Loading…' : error ? 'Unavailable' : `${supportedCountries.length} countries`}</Text>
          </View>

          <View style={[styles.countryGrid, desktop && styles.countryGridDesktop]}>
          {loading ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>Loading visa services…</Text></View> : error ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={retry} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></TouchableOpacity></View> : visibleCountries.map((country) => (
              <TouchableOpacity key={country.id} accessibilityRole="button" onPress={() => { blurWebNavigationFocus(); router.push({ pathname: '/(tabs)/explore/visa/[id]', params: { id: country.id } }); }} style={[styles.countryCard, desktop && styles.countryCardDesktop]}>
                <ImageBackground source={{ uri: country.image }} style={styles.countryImage} imageStyle={styles.countryImageStyle}>
                  <View style={styles.countryShade} />
                  <View style={styles.countryImageTop}><Text style={styles.countryCode}>VISA SUPPORT</Text><Ionicons name="arrow-forward" size={13} color={Colors.primaryDark} style={styles.countryArrow} /></View>
                  <Text style={styles.countryName}>{country.name}</Text>
                </ImageBackground>
                <View style={styles.countryBody}>
                  <Text style={styles.countryVisaType}>{country.visaType}</Text>
                  <View style={styles.countryMeta}><Ionicons name="time-outline" size={12} color={Colors.textLight} /><Text style={styles.countryMetaText}>{country.processing ?? 'Processing time not listed'}</Text></View>
                  <View style={styles.countryFooter}><Text style={styles.countryFee}>{country.fee ? `From ${country.fee}` : 'Price not listed'}</Text><Text style={styles.checkText}>Check requirements →</Text></View>
                  <Text numberOfLines={2} style={styles.countryDocuments}>Documents: {country.documents.join(', ') || 'Requirements not listed'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {!loading && !error && visibleCountries.length === 0 ? <View style={styles.emptyState}><Ionicons name="search-outline" size={22} color={Colors.primary} /><Text style={styles.emptyTitle}>No supported country found</Text><Text style={styles.emptyText}>Search the current service list or clear your search.</Text></View> : null}

          <View style={styles.serviceNotice}><Ionicons name="information-circle-outline" size={15} color={Colors.secondary} /><Text style={styles.serviceNoticeText}>These visa listings are mock service content for browsing. Requirements, processing estimates, and fees are indicative and require advisor confirmation.</Text></View>

        </View>
      </ScrollView>

    </SafeAreaView>
  );
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
  countryCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9, paddingHorizontal: 15 },
  countryGridDesktop: { justifyContent: 'flex-start', gap: 10 },
  countryCard: { width: '48.5%', overflow: 'hidden', borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  countryCardDesktop: { width: '24%' },
  countryImage: { height: 102, justifyContent: 'space-between', padding: 8 },
  countryImageStyle: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  countryShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 30, 23, 0.25)' },
  countryImageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countryCode: { color: Colors.white, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  countryArrow: { width: 24, height: 24, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', borderRadius: 9, backgroundColor: Colors.accent },
  countryName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  countryBody: { padding: 8 },
  countryVisaType: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, lineHeight: 17, fontWeight: '800' },
  countryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  countryMetaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, flex: 1 },
  countryFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginTop: 7 },
  countryFee: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  countryDocuments: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 13, marginTop: 5 },
  checkText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  emptyState: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, padding: 18, borderRadius: 14, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  retryButton: { marginTop: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.accent },
  retryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  serviceNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginHorizontal: 16, marginTop: 13, padding: 9, borderRadius: 10, backgroundColor: Colors.surfaceMuted },
  serviceNoticeText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 16 },
  detailsSection: { marginTop: 21, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  detailsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 9 },
  closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.surface },
  detailsLayout: { gap: 13, paddingHorizontal: 16 },
  detailsMain: { flex: 1, minWidth: 0 },
  visaDetail: { paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.border },
  visaDetailHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  visaDetailIcon: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Colors.accentSoft },
  visaDetailTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  visaDetailBody: { marginTop: 6, paddingLeft: 34 },
  detailText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12 },
  detailNote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 11, marginBottom: 3 },
  documentRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3 },
  documentText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 7 },
  startButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, borderRadius: 10, backgroundColor: Colors.accent },
  startButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  trackingInputRow: { flexDirection: 'row', gap: 6, marginTop: 9 },
  trackingInput: { flex: 1, minWidth: 0, minHeight: 35, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: 'Manrope', fontSize: 8, color: Colors.textDark },
  checkButton: { minHeight: 35, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, borderRadius: 8, backgroundColor: Colors.accent },
  checkButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  trackingMessage: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, lineHeight: 11, marginTop: 6 },
  trackingSection: { marginHorizontal: 16, marginTop: 24, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  trackingHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  trackingBadge: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.surfaceMuted },
  trackingBadgeText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '900', letterSpacing: 0.6 },
  trackingIntro: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12, marginTop: 6 },
  trackingSteps: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 13 },
  trackingStep: { flex: 1, alignItems: 'center', position: 'relative' },
  stepIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  stepLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, textAlign: 'center', marginTop: 4 },
  stepLine: { position: 'absolute', top: 14, left: '62%', width: '76%', height: 1, backgroundColor: Colors.borderStrong },
  trackingFootnote: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, textAlign: 'center', marginTop: 9 },
  mobileBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobileCountry: { flex: 1, minWidth: 0 },
  mobileCountryName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  mobileCountryFee: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, marginTop: 2 },
  mobileStart: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 9, backgroundColor: Colors.accent },
  mobileStartText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
});
