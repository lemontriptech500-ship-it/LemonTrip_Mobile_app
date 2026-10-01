import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ImageBackground, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type VisaCountry = {
  code: string;
  name: string;
  image: string;
  visaTypes: string[];
  processing: string;
  fee?: string;
};

const supportedCountries: VisaCountry[] = [
  { code: 'UAE', name: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85', visaTypes: ['Tourist Visa'], processing: '3–5 days', fee: '₹4,500' },
  { code: 'UK', name: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=85', visaTypes: ['Business Visa', 'Student Visa'], processing: '10–15 days (Business) · 15–30 days (Student)' },
  { code: 'USA', name: 'United States', image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=900&q=85', visaTypes: ['Business Visa'], processing: '10–15 days' },
  { code: 'Canada', name: 'Canada', image: 'https://images.unsplash.com/photo-1503614472-8c93d56cd9b6?w=900&q=85', visaTypes: ['Student Visa'], processing: '15–30 days' },
  { code: 'Australia', name: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=900&q=85', visaTypes: ['Student Visa'], processing: '15–30 days' },
  { code: 'Schengen', name: 'Schengen Area', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=85', visaTypes: ['Business Visa'], processing: '10–15 days', fee: '₹7,200' },
  { code: 'Singapore', name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=85', visaTypes: ['Tourist Visa'], processing: '3–5 days' },
  { code: 'Thailand', name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=85', visaTypes: ['Tourist Visa'], processing: '3–5 days' },
];

const commonDocuments = [
  'Valid passport',
  'Passport-size photographs',
  'Proof of travel plans',
  'Financial documents',
  'Accommodation details',
];

const trackingStages = ['Submitted', 'Documents', 'Under review', 'Approved / rejected'];

export default function VisaScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<VisaCountry | null>(null);
  const [applicationId, setApplicationId] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');

  const visibleCountries = useMemo(() => supportedCountries.filter((country) => {
    const search = query.trim().toLowerCase();
    return !search || `${country.name} ${country.code} ${country.visaTypes.join(' ')}`.toLowerCase().includes(search);
  }), [query]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  };

  const handleStartApplication = async (country: VisaCountry) => {
    const subject = encodeURIComponent(`Visa assistance enquiry · ${country.name}`);
    const body = encodeURIComponent(`Hello LemonTrip, I would like to start a ${country.visaTypes[0]} enquiry for ${country.name}.`);
    try {
      await Linking.openURL(`mailto:hello@lemontrip.in?subject=${subject}&body=${body}`);
    } catch {
      setTrackingMessage('Application intake is not connected. Contact hello@lemontrip.in to start your enquiry.');
    }
  };

  const checkApplication = () => {
    if (!applicationId.trim()) {
      setTrackingMessage('Enter an application ID to check its status.');
      return;
    }
    setTrackingMessage('Live application tracking is not connected yet. Contact hello@lemontrip.in with your application ID.');
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
            <Text style={styles.countryCount}>{visibleCountries.length} countries</Text>
          </View>

          <View style={[styles.countryGrid, desktop && styles.countryGridDesktop]}>
            {visibleCountries.map((country) => (
              <TouchableOpacity key={country.code} accessibilityRole="button" accessibilityState={{ selected: selectedCountry?.code === country.code }} onPress={() => setSelectedCountry((current) => current?.code === country.code ? null : country)} style={[styles.countryCard, desktop && styles.countryCardDesktop, selectedCountry?.code === country.code && styles.countryCardSelected]}>
                <ImageBackground source={{ uri: country.image }} style={styles.countryImage} imageStyle={styles.countryImageStyle}>
                  <View style={styles.countryShade} />
                  <View style={styles.countryImageTop}><Text style={styles.countryCode}>{country.code}</Text><Ionicons name="arrow-forward" size={13} color={Colors.primaryDark} style={styles.countryArrow} /></View>
                  <Text style={styles.countryName}>{country.name}</Text>
                </ImageBackground>
                <View style={styles.countryBody}>
                  <Text style={styles.countryVisaType}>{country.visaTypes.join(' · ')}</Text>
                  <View style={styles.countryMeta}><Ionicons name="time-outline" size={12} color={Colors.textLight} /><Text style={styles.countryMetaText}>{country.processing}</Text></View>
                  <View style={styles.countryFooter}><Text style={styles.countryFee}>{country.fee ? `From ${country.fee}` : 'Fees not listed'}</Text><Text style={styles.checkText}>Check requirements</Text></View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {visibleCountries.length === 0 ? <View style={styles.emptyState}><Ionicons name="search-outline" size={22} color={Colors.primary} /><Text style={styles.emptyTitle}>No supported country found</Text><Text style={styles.emptyText}>Search the current service list or clear your search.</Text></View> : null}

          <View style={styles.serviceNotice}><Ionicons name="shield-checkmark-outline" size={15} color={Colors.secondary} /><Text style={styles.serviceNoticeText}>Country and visa-type support is based on the existing LemonTrip service list. Requirements, processing estimates, and fees require advisor confirmation.</Text></View>

          {selectedCountry ? (
            <View style={styles.detailsSection}>
              <View style={styles.detailsHeading}><View><Text style={styles.eyebrow}>REQUIREMENTS OVERVIEW</Text><Text style={styles.sectionTitle}>{selectedCountry.name}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close country details" onPress={() => setSelectedCountry(null)} style={styles.closeButton}><Ionicons name="close" size={17} color={Colors.textDark} /></TouchableOpacity></View>
              <View style={[styles.detailsLayout, desktop && styles.detailsLayoutDesktop]}>
                <View style={styles.detailsMain}>
                  <VisaDetail title="Eligibility" icon="person-outline"><Text style={styles.detailText}>Eligibility depends on nationality, travel purpose, and individual circumstances. Confirm requirements with a visa advisor before applying.</Text></VisaDetail>
                  <VisaDetail title="Documents" icon="document-text-outline">
                    <Text style={styles.detailNote}>Common checklist from the existing demo guidance; country-specific requirements are not connected.</Text>
                    {commonDocuments.map((document) => <View key={document} style={styles.documentRow}><Ionicons name="checkmark-circle-outline" size={14} color={Colors.secondary} /><Text style={styles.documentText}>{document}</Text></View>)}
                  </VisaDetail>
                  <VisaDetail title="Processing timeline" icon="time-outline"><Text style={styles.detailText}>{selectedCountry.processing} · indicative service data only; processing times are not guaranteed.</Text></VisaDetail>
                  <VisaDetail title="Fees" icon="card-outline"><Text style={styles.detailText}>{selectedCountry.fee ? `${selectedCountry.fee} shown in demo data; confirm the current fee before applying.` : 'A current fee was not supplied for this destination.'}</Text></VisaDetail>
                  <VisaDetail title="Process" icon="git-branch-outline"><Text style={styles.detailText}>Requirements review → document preparation → application guidance. Submission and decisions are handled by the relevant authorities.</Text></VisaDetail>
                  <VisaDetail title="FAQs" icon="help-circle-outline"><Text style={styles.detailText}>Destination-specific FAQs are not available in the current service data. Contact an advisor for guidance.</Text></VisaDetail>
                  <TouchableOpacity onPress={() => handleStartApplication(selectedCountry)} style={styles.startButton}><Ionicons name="mail-outline" size={15} color={Colors.primaryDark} /><Text style={styles.startButtonText}>Start application</Text></TouchableOpacity>
                </View>
                {desktop ? <TrackingPanel applicationId={applicationId} onChange={setApplicationId} message={trackingMessage} onCheck={checkApplication} /> : null}
              </View>
            </View>
          ) : null}

          <View style={styles.trackingSection}>
            <View style={styles.trackingHeading}><View><Text style={styles.eyebrow}>APPLICATION STATUS</Text><Text style={styles.sectionTitle}>Application tracking</Text></View><View style={styles.trackingBadge}><Text style={styles.trackingBadgeText}>NOT CONNECTED</Text></View></View>
            <Text style={styles.trackingIntro}>Track an existing application after its provider integration is connected.</Text>
            <View style={styles.trackingInputRow}>
              <TextInput value={applicationId} onChangeText={(value) => { setApplicationId(value); setTrackingMessage(''); }} placeholder="Application ID" placeholderTextColor={Colors.textLight} style={styles.trackingInput} />
              <TouchableOpacity onPress={checkApplication} style={styles.checkButton}><Text style={styles.checkButtonText}>Check status</Text></TouchableOpacity>
            </View>
            {trackingMessage ? <Text style={styles.trackingMessage}>{trackingMessage}</Text> : null}
            <View style={styles.trackingSteps}>
              {[
                { icon: 'send-outline' as const, label: 'Submitted' },
                { icon: 'documents-outline' as const, label: 'Documents' },
                { icon: 'time-outline' as const, label: 'Under review' },
                { icon: 'checkmark-done-outline' as const, label: 'Approved / rejected' },
              ].map((stage, index) => (
                <View key={stage.label} style={styles.trackingStep}><View style={styles.stepIcon}><Ionicons name={stage.icon} size={15} color={Colors.textLight} /></View><Text style={styles.stepLabel}>{stage.label}</Text>{index < 3 ? <View style={styles.stepLine} /> : null}</View>
              ))}
            </View>
            <Text style={styles.trackingFootnote}>These are possible process stages, not a live application status.</Text>
          </View>
        </View>
      </ScrollView>

      {selectedCountry ? (
        <View style={styles.mobileBar}>
          <View style={styles.mobileCountry}><Text style={styles.mobileCountryName}>{selectedCountry.name}</Text><Text style={styles.mobileCountryFee}>{selectedCountry.fee ? `From ${selectedCountry.fee}` : 'Fee not listed'}</Text></View>
          <TouchableOpacity onPress={() => handleStartApplication(selectedCountry)} style={styles.mobileStart}><Text style={styles.mobileStartText}>Start application</Text></TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function VisaDetail({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) {
  return <View style={styles.visaDetail}><View style={styles.visaDetailHeading}><View style={styles.visaDetailIcon}><Ionicons name={icon} size={15} color={Colors.primary} /></View><Text style={styles.visaDetailTitle}>{title}</Text></View><View style={styles.visaDetailBody}>{children}</View></View>;
}

function TrackingPanel({ applicationId, onChange, message, onCheck }: { applicationId: string; onChange: (value: string) => void; message: string; onCheck: () => void }) {
  return (
    <View style={styles.trackingPanel}>
      <Text style={styles.trackingPanelTitle}>Track an application</Text>
      <Text style={styles.trackingIntro}>Application status is not connected to a provider yet.</Text>
      <View style={styles.trackingInputRow}><TextInput value={applicationId} onChangeText={onChange} placeholder="Application ID" placeholderTextColor={Colors.textLight} style={styles.trackingInput} /><TouchableOpacity onPress={onCheck} style={styles.checkButton}><Ionicons name="search-outline" size={13} color={Colors.primaryDark} /></TouchableOpacity></View>
      {message ? <Text style={styles.trackingMessage}>{message}</Text> : null}
      <View style={styles.trackingUnavailable}><Ionicons name="information-circle-outline" size={14} color={Colors.textLight} /><Text style={styles.trackingUnavailableText}>No live status is available.</Text></View>
    </View>
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
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { maxWidth: 360, color: Colors.white, fontFamily: 'Manrope', fontSize: 28, lineHeight: 34, fontWeight: '900', marginTop: 6 },
  heroSubtitle: { maxWidth: 340, color: 'rgba(255,255,255,0.88)', fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, marginTop: 6, marginBottom: 12 },
  searchBar: { maxWidth: 430, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 11, borderRadius: 11, backgroundColor: Colors.surface },
  searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, paddingVertical: 8 },
  catalogHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.9 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 3 },
  countryCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9, paddingHorizontal: 15 },
  countryGridDesktop: { justifyContent: 'flex-start', gap: 10 },
  countryCard: { width: '48.5%', overflow: 'hidden', borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  countryCardDesktop: { width: '24%' },
  countryCardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  countryImage: { height: 102, justifyContent: 'space-between', padding: 8 },
  countryImageStyle: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  countryShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 30, 23, 0.25)' },
  countryImageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countryCode: { color: Colors.white, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  countryArrow: { width: 24, height: 24, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', borderRadius: 9, backgroundColor: Colors.accent },
  countryName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  countryBody: { padding: 8 },
  countryVisaType: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  countryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  countryMetaText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, flex: 1 },
  countryFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginTop: 7 },
  countryFee: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  checkText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800' },
  emptyState: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, padding: 18, borderRadius: 14, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  serviceNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginHorizontal: 16, marginTop: 13, padding: 9, borderRadius: 10, backgroundColor: Colors.surfaceMuted },
  serviceNoticeText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12 },
  detailsSection: { marginTop: 21, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  detailsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 9 },
  closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.surface },
  detailsLayout: { gap: 13, paddingHorizontal: 16 },
  detailsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
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
  trackingPanel: { width: 285, padding: 13, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface },
  trackingPanelTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  trackingIntro: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12, marginTop: 5 },
  trackingInputRow: { flexDirection: 'row', gap: 6, marginTop: 9 },
  trackingInput: { flex: 1, minWidth: 0, minHeight: 35, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: 'Manrope', fontSize: 8, color: Colors.textDark },
  checkButton: { minHeight: 35, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, borderRadius: 8, backgroundColor: Colors.accent },
  checkButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  trackingMessage: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, lineHeight: 11, marginTop: 6 },
  trackingUnavailable: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 10 },
  trackingUnavailableText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7 },
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