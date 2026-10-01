import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FareSummary from './FareSummary';
import FlightResults from './FlightResults';
import FlightSearchForm from './FlightSearchForm';
import { searchFlights } from './flightApi';
import type { FlightOffer, FlightSearchRequest } from './types';

export default function FlightSearchScreen() {
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<FlightSearchRequest | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);

  const handleSearch = async (searchRequest: FlightSearchRequest) => {
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setRequest(searchRequest);
    setOffers([]);
    try {
      const response = await searchFlights(searchRequest);
      setOffers(response.offers);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Flight search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.breadcrumbRow}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')}><Text style={styles.breadcrumb}>Home</Text></TouchableOpacity>
            <Ionicons name="chevron-forward" size={12} color={Colors.textLight} />
            <Text style={styles.breadcrumbCurrent}>Flights</Text>
            <View style={styles.headerSpacer} />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => router.push('/cart')} style={styles.cartButton}>
              <Ionicons name="bag-outline" size={18} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Find your flight</Text>
          <Text style={styles.subtitle}>Compare live fares and choose the journey that works for you.</Text>

          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1500&q=90' }}
            style={styles.hero}
            imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>THE JOURNEY STARTS HERE</Text>
              <Text style={styles.heroText}>A better way to get there.</Text>
            </View>
          </ImageBackground>

          <FlightSearchForm loading={loading} onSearch={handleSearch} />

          {request && hasSearched ? (
            <View style={styles.resultsSection}>
              <FareSummary request={request} offer={offers[0]} />
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
                  <FlightResults offers={offers} loading={loading} />
                </>
              )}
            </View>
          ) : null}

          <View style={styles.footer}>
            <Ionicons name="shield-checkmark-outline" size={15} color={Colors.secondary} />
            <Text style={styles.footerText}>Secure search. Prices and availability come directly from the flight service.</Text>
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
  breadcrumbRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18 },
  breadcrumb: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  breadcrumbCurrent: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  headerSpacer: { flex: 1 },
  cartButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, borderRadius: 12 },
  title: { paddingHorizontal: 18, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 29, fontWeight: '900' },
  subtitle: { paddingHorizontal: 18, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 16 },
  hero: { height: 188, marginHorizontal: 16, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 18 },
  heroImage: { borderRadius: 18 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 38, 27, 0.3)' },
  heroCopy: { paddingHorizontal: 18, paddingBottom: 21, maxWidth: 430 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  heroText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 23, fontWeight: '800', marginTop: 6 },
  resultsSection: { gap: 13, marginTop: 24 },
  resultsTitle: { paddingHorizontal: 16, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800' },
  errorPanel: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderWidth: 1, borderColor: '#f1d3d3', borderRadius: 14, backgroundColor: Colors.surface },
  errorIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#fff1f1' },
  errorCopy: { flex: 1, minWidth: 0 },
  errorTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  errorMessage: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 14, marginTop: 3 },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 8, borderRadius: 9, backgroundColor: Colors.accent },
  retryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24, paddingHorizontal: 20 },
  footerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, textAlign: 'center' },
});