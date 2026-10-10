import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { FlightSearchRequest, SpecialFare, TripType } from './types';

const tripTypes: { id: TripType; label: string }[] = [
  { id: 'oneWay', label: 'One Way' },
  { id: 'roundTrip', label: 'Round Trip' },
  { id: 'multiCity', label: 'Multi City' },
];

const fares: { id: SpecialFare; label: string }[] = [
  { id: 'regular', label: 'Regular' },
  { id: 'student', label: 'Student' },
  { id: 'seniorCitizen', label: 'Senior Citizen' },
  { id: 'armedForces', label: 'Armed Forces' },
];

type FlightSearchFormProps = {
  compact?: boolean;
  hideTripTypeSelector?: boolean;
  searchButtonLabel?: string;
  initialOrigin?: string;
  initialTravellers?: number;
  loading: boolean;
  onSearch: (request: FlightSearchRequest) => void;
};

function Field({ label, value, placeholder, onChangeText, keyboardType, grid = false, compact = false }: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numbers-and-punctuation';
  grid?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[styles.field, grid && styles.gridField, compact && styles.compactField, grid && compact && styles.compactGridField]}>
      <Text style={[styles.fieldLabel, compact && styles.compactFieldLabel]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        autoCapitalize="characters"
        style={[styles.input, compact && styles.compactInput]}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function FlightSearchForm({ compact = false, hideTripTypeSelector = false, searchButtonLabel = 'Search Flights', initialOrigin = '', initialTravellers = 1, loading, onSearch }: FlightSearchFormProps) {
  const [showOptions, setShowOptions] = useState(!compact);
  const [tripType, setTripType] = useState<TripType>('roundTrip');
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [secondOrigin, setSecondOrigin] = useState('');
  const [secondDestination, setSecondDestination] = useState('');
  const [secondDate, setSecondDate] = useState('');
  const [travellers, setTravellers] = useState(Math.max(1, Math.min(9, initialTravellers)));
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
    <View style={[styles.panel, compact && { marginTop: 0, marginHorizontal: 0, borderWidth: 0, backgroundColor: Colors.surface }]}>
      {!hideTripTypeSelector ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripTabs}>
        {tripTypes.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => { setTripType(item.id); setValidationError(''); }} style={[styles.tripTab, tripType === item.id && styles.tripTabSelected]}>
            <Text style={[styles.tripTabText, tripType === item.id && styles.tripTabTextSelected]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView> : null}

      <View style={styles.locationRow}>
        <Field compact={compact} label="FROM" value={origin} placeholder="City / airport" onChangeText={setOrigin} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Swap origin and destination" onPress={swapLocations} style={[styles.swapButton, compact && styles.compactSwapButton]}>
          <Ionicons name="swap-horizontal" size={19} color={Colors.primary} />
        </TouchableOpacity>
        <Field compact={compact} label="TO" value={destination} placeholder="City / airport" onChangeText={setDestination} />
      </View>

      <View style={styles.fieldGrid}>
        <Field compact={compact} grid label="DEPARTURE" value={departureDate} placeholder={compact ? 'Add date' : 'YYYY-MM-DD'} onChangeText={setDepartureDate} keyboardType="numbers-and-punctuation" />
        {tripType === 'roundTrip' ? <Field compact={compact} grid label="RETURN" value={returnDate} placeholder={compact ? 'Add date' : 'YYYY-MM-DD'} onChangeText={setReturnDate} keyboardType="numbers-and-punctuation" /> : null}
        <View style={[styles.field, styles.gridField, compact && styles.compactField, compact && styles.compactGridField]}>
          <Text style={[styles.fieldLabel, compact && styles.compactFieldLabel]}>TRAVELLERS</Text>
          <View style={[styles.counter, compact && styles.compactCounter]}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove traveller" disabled={travellers <= 1} onPress={() => setTravellers((count) => Math.max(1, count - 1))} style={styles.counterButton}>
              <Ionicons name="remove" size={16} color={travellers <= 1 ? Colors.borderStrong : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.counterText}>{travellers}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add traveller" onPress={() => setTravellers((count) => Math.min(9, count + 1))} style={styles.counterButton}>
              <Ionicons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {showOptions ? (
        <View style={[styles.field, styles.gridField]}>
          <Text style={styles.fieldLabel}>CLASS</Text>
          <View style={styles.classOptions}>
            {['Economy', 'Premium', 'Business', 'First'].map((item) => (
              <TouchableOpacity key={item} onPress={() => setCabinClass(item)} style={[styles.classButton, cabinClass === item && styles.classButtonSelected]}>
                <Text style={[styles.classText, cabinClass === item && styles.classTextSelected]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        ) : null}
      </View>

      {tripType === 'multiCity' ? (
        <View style={styles.multiCityBlock}>
          <Text style={styles.fieldLabel}>SECOND LEG</Text>
          <View style={styles.locationRow}>
            <Field label="FROM" value={secondOrigin} placeholder="City / airport" onChangeText={setSecondOrigin} />
            <Field label="TO" value={secondDestination} placeholder="City / airport" onChangeText={setSecondDestination} />
          </View>
          <View style={styles.secondDate}><Field label="DEPARTURE" value={secondDate} placeholder="YYYY-MM-DD" onChangeText={setSecondDate} keyboardType="numbers-and-punctuation" /></View>
        </View>
      ) : null}

      {compact && !hideTripTypeSelector ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showOptions }} onPress={() => setShowOptions(value => !value)} style={{ paddingBottom: 12 }}><Text style={styles.fareHint}>{showOptions ? 'Fewer options' : 'Cabin class & special fares'}</Text></TouchableOpacity> : null}
      {showOptions ? <>
      <View style={styles.fareHeader}><Text style={styles.fieldLabel}>SPECIAL FARES</Text><Text style={styles.fareHint}>Optional</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fareOptions}>
        {fares.map((fare) => (
          <TouchableOpacity key={fare.id} onPress={() => setSpecialFare(fare.id)} style={[styles.fareOption, specialFare === fare.id && styles.fareOptionSelected]}>
            <Text style={[styles.fareOptionText, specialFare === fare.id && styles.fareOptionTextSelected]}>{fare.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </> : null}

      {validationError ? <Text accessibilityRole="alert" style={styles.validationError}>{validationError}</Text> : null}
      <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={submit} style={[styles.searchButton, loading && styles.searchButtonDisabled]}>
        <Ionicons name={loading ? 'hourglass-outline' : 'search-outline'} size={17} color={Colors.primaryDark} />
        <Text style={styles.searchButtonText}>{loading ? 'Searching flights…' : searchButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { ...Ui.card, marginHorizontal: Ui.space.page, marginTop: -25, padding: Ui.space.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card },
  tripTabs: { gap: 5, paddingBottom: 16 },
  tripTab: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, backgroundColor: Colors.background },
  tripTabSelected: { backgroundColor: Colors.primary },
  tripTabText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  tripTabTextSelected: { color: Colors.white },
  locationRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  field: { flex: 1, minWidth: 0, marginBottom: 12 },
  fieldLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.8, marginBottom: 6 },
  input: { minHeight: Ui.field.minHeight, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.surfaceMuted, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  swapButton: { width: 36, height: 36, marginBottom: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: Colors.accentSoft },
  compactSwapButton: { backgroundColor: '#E7F1EC' },
  gridField: { flexBasis: '46%', flexGrow: 1, flexShrink: 0 },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  compactField: { marginBottom: 7 },
  compactGridField: { flexBasis: 0, flexGrow: 1, flexShrink: 1 },
  compactFieldLabel: { fontSize: TextSize.micro, marginBottom: 3 },
  compactInput: { minHeight: 30, paddingHorizontal: 0, paddingVertical: 3, borderWidth: 0, borderBottomWidth: 1, borderColor: Colors.border, borderRadius: 0, backgroundColor: 'transparent', fontSize: TextSize.caption },
  compactCounter: { minHeight: 32, paddingHorizontal: 0, borderWidth: 0, borderBottomWidth: 1, borderRadius: 0, backgroundColor: 'transparent' },
  counter: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.background, paddingHorizontal: 5 },
  counterButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  counterText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  classOptions: { minHeight: 46, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  classButton: { paddingHorizontal: 7, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.background },
  classButtonSelected: { backgroundColor: Colors.accentSoft },
  classText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  classTextSelected: { color: Colors.primaryDark },
  multiCityBlock: { padding: 12, marginVertical: 4, borderRadius: 12, backgroundColor: Colors.background },
  secondDate: { width: '50%' },
  fareHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  fareHint: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  fareOptions: { gap: 7, paddingTop: 8, paddingBottom: 14 },
  fareOption: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 15 },
  fareOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  fareOptionText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold },
  fareOptionTextSelected: { color: Colors.primaryDark },
  validationError: { color: Colors.error, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginBottom: 10 },
  searchButton: { minHeight: Ui.button.minHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  searchButtonDisabled: { opacity: 0.65 },
  searchButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
});
