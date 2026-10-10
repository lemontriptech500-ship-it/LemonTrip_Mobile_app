import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { addToCart } from '@/utils/cartStore';
import FareSummary from './FareSummary';
import FlightFareOptions from './FlightFareOptions';
import FlightItineraryCard from './FlightItineraryCard';
import FlightTripSummary from './FlightTripSummary';
import { getFlightSelection, selectFlightFare } from './flightSelectionStore';
import type { FlightFareOption } from './types';

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

function fareConditionRows(option: FlightFareOption) {
  return [
    { label: 'Cancellation', value: option.cancellation },
    { label: 'Date change', value: option.dateChange },
    { label: 'Seat selection', value: option.seatSelection },
    { label: 'Baggage', value: option.baggage },
    { label: 'Refundability', value: option.refundable === undefined ? undefined : option.refundable ? 'Refundable' : 'Non-refundable' },
  ];
}

export default function FlightDetailsScreen() {
  const selection = getFlightSelection();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const fares = selection?.offer.fareOptions ?? [];
  const [selectedFareId, setSelectedFareId] = useState(fares[0]?.id ?? null);
  const [conditionsFare, setConditionsFare] = useState<FlightFareOption | null>(null);
  const selectedFare = fares.find((fare) => fare.id === selectedFareId) ?? null;

  const handleContinue = () => {
    if (!selection || !selectedFare) return;
    selectFlightFare(selectedFare);
    router.push('/flight-booking/traveller' as never);
  };
  if (!selection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingSelection}>
          <TravelArtworkIcon name="flight" size={48} />
          <Text style={styles.missingTitle}>No flight selected</Text>
          <Text style={styles.missingText}>Search for a flight and select an offer to view its itinerary and fares.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/explore/flights')}>
            <Text style={styles.backButtonText}>Search flights</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ScreenHeader title="Your flight" subtitle="Choose the fare that fits your journey." eyebrow="ONE STEP CLOSER" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}  />

          <FareSummary request={selection.request} offer={selection.offer} />

          <View style={[styles.columns, wide && styles.columnsWide]}>
            <View style={styles.mainColumn}>
              <View style={styles.sectionHeading}>
                <Text style={styles.eyebrow}>YOUR FLIGHT</Text>
                <Text style={styles.sectionTitle}>Itinerary</Text>
              </View>
              <FlightItineraryCard offer={selection.offer} />

              <View style={styles.sectionHeading}>
                <Text style={styles.eyebrow}>COMPARE WHAT’S INCLUDED</Text>
                <Text style={styles.sectionTitle}>Choose a fare</Text>
              </View>
              <FlightFareOptions
                options={fares}
                selectedId={selectedFareId}
                onSelect={(fare) => setSelectedFareId(fare.id)}
                onFareConditions={setConditionsFare}
              />
            </View>

            <View style={[styles.summaryColumn, wide && styles.summaryColumnWide]}>
              <FlightTripSummary fareOption={selectedFare} onContinue={handleContinue} />
              <View style={styles.secureNote}>
                <Ionicons name="shield-checkmark-outline" size={15} color={Colors.secondary} />
                <Text style={styles.secureText}>{selection.offer.isDemo ? 'Sample fare details only. This journey cannot be booked until the flight service is connected.' : 'Fare details are shown as supplied by the airline.'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={conditionsFare !== null} transparent animationType="fade" onRequestClose={() => setConditionsFare(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalEyebrow}>FARE DETAILS</Text>
                <Text style={styles.modalTitle}>Fare conditions</Text>
                {conditionsFare ? <Text style={styles.modalFareName}>{conditionsFare.name}</Text> : null}
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close fare conditions" onPress={() => setConditionsFare(null)} style={styles.modalClose}>
                <Ionicons name="close" size={18} color={Colors.textDark} />
              </TouchableOpacity>
            </View>
            {conditionsFare ? fareConditionRows(conditionsFare).map((row) => (
              <View key={row.label} style={styles.conditionRow}>
                <Text style={styles.conditionLabel}>{row.label}</Text>
                <Text style={styles.conditionValue}>{row.value ?? 'Not provided by the flight service'}</Text>
              </View>
            )) : null}
            <TouchableOpacity onPress={() => setConditionsFare(null)} style={styles.doneButton}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  page: { paddingHorizontal: Ui.space.page, paddingBottom: 34 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  breadcrumbRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  backIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.onDarkSurface },
  breadcrumb: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  breadcrumbCurrent: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  columns: { gap: 15, marginTop: 20 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { flex: 1, minWidth: 0 },
  summaryColumn: { gap: 10, marginTop: 18 },
  summaryColumnWide: { width: 300, marginTop: 36 },
  sectionHeading: { marginTop: 21, marginBottom: 11 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 19, fontWeight: '800', marginTop: 3 },
  secureNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingHorizontal: 4 },
  secureText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 },
  missingSelection: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 },
  missingTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 12 },
  missingText: { maxWidth: 310, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
  backButton: { minHeight: 44,  marginTop: 15, paddingHorizontal: 16, paddingVertical: 11, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  backButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(8, 26, 18, 0.48)' },
  modalCard: { ...Ui.card, width: '100%', maxWidth: 480, padding: 18, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitleWrap: { flex: 1 },
  modalEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  modalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', marginTop: 4 },
  modalFareName: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 3 },
  modalClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.background },
  conditionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  conditionLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  conditionValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4 },
  doneButton: { minHeight: Ui.button.minHeight, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  doneText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
});