import { recordRecentSearch } from '@/utils/personalStore';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import FareSummary from './FareSummary';
import FlightResults from './FlightResults';
import FlightSearchForm from './FlightSearchForm';
import { searchFlights } from './flightApi';
import { setFlightSelection } from './flightSelectionStore';
import type { FlightOffer, FlightSearchRequest } from './types';

export default function FlightSearchScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const lastSearch = useRef<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<'live' | 'mock' | null>(null);
  const [request, setRequest] = useState<FlightSearchRequest | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);

  const handleSearch = async (searchRequest: FlightSearchRequest) => {
    void recordRecentSearch('Flights', `${searchRequest.origin} → ${searchRequest.destination}`, JSON.stringify(searchRequest));
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setResultSource(null);
    setRequest(searchRequest);
    setOffers([]);
    try {
      const response = await searchFlights(searchRequest);
      setOffers(response.offers);
      setResultSource(response.source ?? 'live');
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Flight search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search || search === lastSearch.current) return;
    let active = true;
    // Route changes launch a search after this render has completed.
    void Promise.resolve().then(() => {
      if (!active) return;
      lastSearch.current = search;
      try {
        const parsed = JSON.parse(search) as FlightSearchRequest;
        if (typeof parsed.origin !== 'string' || typeof parsed.destination !== 'string' || typeof parsed.departureDate !== 'string' || !['oneWay', 'roundTrip', 'multiCity'].includes(parsed.tripType) || !Number.isInteger(parsed.travellers) || parsed.travellers < 1 || parsed.travellers > 9) throw new Error('Invalid search');
        void handleSearch(parsed);
      } catch { setError('Please enter your journey details and search again.'); }
    });
    return () => { active = false; };
  }, [search]);

  const handleSelectFlight = (offer: FlightOffer) => {
    if (!request) return;
    setFlightSelection(request, offer);
    router.push('/(tabs)/explore/flight-details');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Find your flight" subtitle="Compare live fares and find your next adventure." eyebrow="THE JOURNEY STARTS HERE" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} rightAction={{ label: 'Cart', icon: 'bag-outline', onPress: () => router.push('/cart') }} />

          <View style={{ paddingTop: 25 }}><FlightSearchForm loading={loading} onSearch={handleSearch} /></View>

          {request && hasSearched ? (
            <View style={styles.resultsSection}>
              <FareSummary request={request} offer={offers[0]} />
              {resultSource === 'mock' ? (
                <View style={styles.demoNotice}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.primaryDark} />
                  <Text style={styles.demoNoticeText}>Sample flight data for preview only. Prices and availability are not real; payment is disabled.</Text>
                </View>
              ) : null}
              {error ? (
                <View style={styles.errorPanel}>
                  <View style={styles.errorIcon}><Ionicons name="cloud-offline-outline" size={21} color={Colors.error} /></View>
                  <View style={styles.errorCopy}>
                    <Text style={styles.errorTitle}>Unable to load flights</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button" onPress={() => handleSearch(request)} style={styles.retryButton}>
                    <Ionicons name="refresh" size={15} color={Colors.primaryDark} />
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.resultsTitle}>{loading ? 'Searching available flights' : 'Available flights'}</Text>
                  <FlightResults offers={offers} loading={loading} onSelect={handleSelectFlight} />
                </>
              )}
            </View>
          ) : null}

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark-outline" size={15} color={Colors.secondary} />
            <Text style={styles.footerText}>Live prices appear when the flight service is connected. Sample results are clearly marked.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  page: { paddingBottom: 34 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  breadcrumbRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  breadcrumb: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  breadcrumbCurrent: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  headerSpacer: { flex: 1 },
  cartButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, borderRadius: 12 },
  title: { paddingHorizontal: 18, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 29, fontWeight: '800' },
  subtitle: { paddingHorizontal: 18, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 16 },
  hero: { height: 188, marginHorizontal: Ui.space.page, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 18 },
  heroImage: { borderRadius: 18 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.imageOverlay },
  heroCopy: { paddingHorizontal: 18, paddingBottom: 21, maxWidth: 430 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 23, fontWeight: '800', marginTop: 6 },
  resultsSection: { gap: 13, marginTop: 24 },
  resultsTitle: { paddingHorizontal: 16, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800' },
  errorPanel: { ...Ui.card, marginHorizontal: Ui.space.page, flexDirection: 'row', alignItems: 'center', gap: 10, padding: Ui.space.card, borderWidth: 1, borderColor: Colors.errorBorder, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  errorIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.errorSoft },
  errorCopy: { flex: 1, minWidth: 0 },
  errorTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  errorMessage: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 3 },
  retryButton: { minHeight: 44,  flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 8, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  retryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24, paddingHorizontal: 20 },
  footerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, textAlign: 'center' },
  demoNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, padding: 12, borderRadius: 12, backgroundColor: Colors.accentSoft },
  demoNoticeText: { flex: 1, color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, lineHeight: 17, fontWeight: '700' },
});
