import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { FlightSearchRequest, SpecialFare, TripType } from './types';

const tripTypes: Array<{ id: TripType; label: string }> = [
  { id: 'oneWay', label: 'One Way' },
  { id: 'roundTrip', label: 'Round Trip' },
  { id: 'multiCity', label: 'Multi City' },
];

const fares: Array<{ id: SpecialFare; label: string }> = [
  { id: 'regular', label: 'Regular' },
  { id: 'student', label: 'Student' },
  { id: 'seniorCitizen', label: 'Senior Citizen' },
  { id: 'armedForces', label: 'Armed Forces' },
];

type FlightSearchFormProps = { loading: boolean; onSearch: (request: FlightSearchRequest) => void };

function Field({ label, value, placeholder, onChangeText, keyboardType }: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numbers-and-punctuation';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        autoCapitalize="characters"
        style={styles.input}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function FlightSearchForm({ loading, onSearch }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<TripType>('roundTrip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [secondOrigin, setSecondOrigin] = useState('');
  const [secondDestination, setSecondDestination] = useState('');
  const [secondDate, setSecondDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [specialFare, setSpecialFare] = useState<SpecialFare>('regular');
  const [validationError, setValidationError] = useState('');

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const submit = () => {
    if (!origin.trim() || !destination.trim() || !departureDate.trim()) {
      setValidationError('Enter your origin, destination and departure date.');
      return;
    }
    if (tripType === 'roundTrip' && !returnDate.trim()) {
      setValidationError('Enter a return date for your round trip.');
      return;
    }
    if (tripType === 'multiCity' && (!secondOrigin.trim() || !secondDestination.trim() || !secondDate.trim())) {
      setValidationError('Complete the second leg of your multi-city journey.');
      return;
    }

    setValidationError('');
    onSearch({
      tripType,
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate: departureDate.trim(),
      ...(tripType === 'roundTrip' ? { returnDate: returnDate.trim() } : {}),
      ...(tripType === 'multiCity' ? { multiCityLegs: [{ origin: secondOrigin.trim(), destination: secondDestination.trim(), departureDate: secondDate.trim() }] } : {}),
      travellers,
      cabinClass,
      specialFare,
    });
  };

  return (
    <View style={styles.panel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripTabs}>
        {tripTypes.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => { setTripType(item.id); setValidationError(''); }} style={[styles.tripTab, tripType === item.id && styles.tripTabSelected]}>
            <Text style={[styles.tripTabText, tripType === item.id && styles.tripTabTextSelected]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.locationRow}>
        <Field label="FROM" value={origin} placeholder="City or airport code" onChangeText={setOrigin} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap origin and destination" onPress={swapLocations} style={styles.swapButton}>
          <Ionicons name="swap-horizontal" size={19} color={Colors.primary} />
        </TouchableOpacity>
        <Field label="TO" value={destination} placeholder="City or airport code" onChangeText={setDestination} />
      </View>

      <View style={styles.fieldGrid}>
        <Field label="DEPARTURE" value={departureDate} placeholder="YYYY-MM-DD" onChangeText={setDepartureDate} keyboardType="numbers-and-punctuation" />
        {tripType === 'roundTrip' ? <Field label="RETURN" value={returnDate} placeholder="YYYY-MM-DD" onChangeText={setReturnDate} keyboardType="numbers-and-punctuation" /> : null}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>TRAVELLERS</Text>
          <View style={styles.counter}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove traveller" disabled={travellers <= 1} onPress={() => setTravellers((count) => Math.max(1, count - 1))} style={styles.counterButton}>
              <Ionicons name="remove" size={16} color={travellers <= 1 ? Colors.borderStrong : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.counterText}>{travellers}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add traveller" onPress={() => setTravellers((count) => Math.min(9, count + 1))} style={styles.counterButton}>
              <Ionicons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>CLASS</Text>
          <View style={styles.classOptions}>
            {['Economy', 'Premium', 'Business', 'First'].map((item) => (
              <TouchableOpacity key={item} onPress={() => setCabinClass(item)} style={[styles.classButton, cabinClass === item && styles.classButtonSelected]}>
                <Text style={[styles.classText, cabinClass === item && styles.classTextSelected]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {tripType === 'multiCity' ? (
        <View style={styles.multiCityBlock}>
          <Text style={styles.fieldLabel}>SECOND LEG</Text>
          <View style={styles.locationRow}>
            <Field label="FROM" value={secondOrigin} placeholder="City or airport code" onChangeText={setSecondOrigin} />
            <Field label="TO" value={secondDestination} placeholder="City or airport code" onChangeText={setSecondDestination} />
          </View>
          <View style={styles.secondDate}><Field label="DEPARTURE" value={secondDate} placeholder="YYYY-MM-DD" onChangeText={setSecondDate} keyboardType="numbers-and-punctuation" /></View>
        </View>
      ) : null}

      <View style={styles.fareHeader}><Text style={styles.fieldLabel}>SPECIAL FARES</Text><Text style={styles.fareHint}>Optional</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fareOptions}>
        {fares.map((fare) => (
          <TouchableOpacity key={fare.id} onPress={() => setSpecialFare(fare.id)} style={[styles.fareOption, specialFare === fare.id && styles.fareOptionSelected]}>
            <Text style={[styles.fareOptionText, specialFare === fare.id && styles.fareOptionTextSelected]}>{fare.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {validationError ? <Text accessibilityRole="alert" style={styles.validationError}>{validationError}</Text> : null}
      <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={submit} style={[styles.searchButton, loading && styles.searchButtonDisabled]}>
        <Ionicons name={loading ? 'hourglass-outline' : 'search-outline'} size={17} color={Colors.primaryDark} />
        <Text style={styles.searchButtonText}>{loading ? 'Searching flights…' : 'Search Flights'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginHorizontal: 16, marginTop: -25, padding: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, shadowColor: '#17372b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.09, shadowRadius: 16, elevation: 4 },
  tripTabs: { gap: 5, paddingBottom: 16 },
  tripTab: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, backgroundColor: Colors.background },
  tripTabSelected: { backgroundColor: Colors.primary },
  tripTabText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  tripTabTextSelected: { color: Colors.white },
  locationRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  field: { flex: 1, minWidth: 0, marginBottom: 12 },
  fieldLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  input: { minHeight: 46, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.background, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11 },
  swapButton: { width: 36, height: 36, marginBottom: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: Colors.accentSoft },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  counter: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.background, paddingHorizontal: 5 },
  counterButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  counterText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  classOptions: { minHeight: 46, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  classButton: { paddingHorizontal: 7, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.background },
  classButtonSelected: { backgroundColor: Colors.accentSoft },
  classText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700' },
  classTextSelected: { color: Colors.primaryDark },
  multiCityBlock: { padding: 12, marginVertical: 4, borderRadius: 12, backgroundColor: Colors.background },
  secondDate: { width: '50%' },
  fareHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  fareHint: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  fareOptions: { gap: 7, paddingTop: 8, paddingBottom: 14 },
  fareOption: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 15 },
  fareOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  fareOptionText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  fareOptionTextSelected: { color: Colors.primaryDark },
  validationError: { color: Colors.error, fontFamily: 'Manrope', fontSize: 11, marginBottom: 10 },
  searchButton: { minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 11, backgroundColor: Colors.accent },
  searchButtonDisabled: { opacity: 0.65 },
  searchButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
});