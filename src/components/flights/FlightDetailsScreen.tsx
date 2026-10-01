import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    addToCart({
      id: `flight-${selection.offer.id}-${selectedFare.id}`,
      serviceName: 'Flight',
      itemName: `${selection.offer.airline.name} ${selection.offer.flightNumber} · ${selection.offer.departure.airportCode} to ${selection.offer.arrival.airportCode} · ${selectedFare.name}`,
      price: formatPrice(selectedFare.price.total, selectedFare.price.currency),
    });
    router.push('/cart');
  };

  if (!selection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingSelection}>
          <Ionicons name="airplane-outline" size={28} color={Colors.primary} />
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
          <View style={styles.breadcrumbRow}>
            <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backIcon}>
              <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.breadcrumb}>Flights</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.textLight} />
            <Text style={styles.breadcrumbCurrent}>Choose your fare</Text>
          </View>

          <FareSummary request={selection.request} offer={selection.offer} />

          <View style={[styles.columns, wide && styles.columnsWide]}>
            <View style={styles.mainColumn}>
              <View style={styles.sectionHeading}>
                <Text style={styles.eyebrow}>YOUR FLIGHT</Text>
                <Text style={styles.sectionTitle}>Itinerary</Text>
              </View>
              <FlightItineraryCard offer={selection.offer} />

              <View style={styles.sectionHeading}>
                <Text style={styles.eyebrow}>COMPARE WHAT'S INCLUDED</Text>
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
                <Text style={styles.secureText}>Fare details are shown as supplied by the airline.</Text>
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
  page: { paddingHorizontal: 16, paddingBottom: 34 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  breadcrumbRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surface },
  breadcrumb: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  breadcrumbCurrent: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  columns: { gap: 15, marginTop: 20 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { flex: 1, minWidth: 0 },
  summaryColumn: { gap: 10, marginTop: 18 },
  summaryColumnWide: { width: 300, marginTop: 36 },
  sectionHeading: { marginTop: 21, marginBottom: 11 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 19, fontWeight: '800', marginTop: 3 },
  secureNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingHorizontal: 4 },
  secureText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 14 },
  missingSelection: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 },
  missingTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 12 },
  missingText: { maxWidth: 310, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6 },
  backButton: { marginTop: 15, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10, backgroundColor: Colors.accent },
  backButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(8, 26, 18, 0.48)' },
  modalCard: { width: '100%', maxWidth: 480, padding: 18, borderRadius: 18, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitleWrap: { flex: 1 },
  modalEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  modalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', marginTop: 4 },
  modalFareName: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 3 },
  modalClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.background },
  conditionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  conditionLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  conditionValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, lineHeight: 16, marginTop: 4 },
  doneButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: 10, backgroundColor: Colors.accent },
  doneText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
});