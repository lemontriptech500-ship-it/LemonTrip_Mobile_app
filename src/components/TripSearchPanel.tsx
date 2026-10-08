import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon, type TravelArtworkName } from '@/components/TravelArtworkIcon';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export type SearchType = 'flights' | 'hotels' | 'buses' | 'trains' | 'packages';

type TripSearchPanelProps = {
  defaultType?: SearchType;
  loading?: boolean;
  error?: string | null;
  onSearch?: (type: SearchType) => void;
};

const tripTabs: { id: SearchType; label: string; artwork: TravelArtworkName }[] = [
  { id: 'flights', label: 'Flights', artwork: 'flight' },
  { id: 'hotels', label: 'Hotels', artwork: 'hotel' },
  { id: 'buses', label: 'Buses', artwork: 'bus' },
  { id: 'trains', label: 'Trains', artwork: 'train' },
  { id: 'packages', label: 'Packages', artwork: 'package' },
];

const tripModes = ['One way', 'Round trip', 'Multi-city'];

export default function TripSearchPanel({
  defaultType = 'flights',
  loading = false,
  error = null,
  onSearch,
}: TripSearchPanelProps) {
  const [selectedType, setSelectedType] = useState<SearchType>(defaultType);
  const [selectedMode, setSelectedMode] = useState('Round trip');

  const handleSearch = () => {
    onSearch?.(selectedType);
  };

  return (
    <View style={styles.card}>
      <View style={styles.tabsRow}>
        {tripTabs.map((tab) => (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            onPress={() => setSelectedType(tab.id)}
            style={[styles.tab, selectedType === tab.id && styles.tabActive]}>
            <TravelArtworkIcon name={tab.artwork} size={27} />
            <Text style={[styles.tabLabel, selectedType === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.modeRow}>
        {tripModes.map((mode) => (
          <TouchableOpacity
            key={mode}
            activeOpacity={0.8}
            onPress={() => setSelectedMode(mode)}
            style={[styles.modeButton, selectedMode === mode && styles.modeButtonActive]}>
            <Text style={[styles.modeButtonText, selectedMode === mode && styles.modeButtonTextActive]}>{mode}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.fieldGrid}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>From</Text>
          <TextInput style={styles.input} value="Delhi" placeholderTextColor={Colors.textLight} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>To</Text>
          <TextInput style={styles.input} value="Bengaluru" placeholderTextColor={Colors.textLight} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Departure</Text>
          <TextInput style={styles.input} value="18 Sep" placeholderTextColor={Colors.textLight} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Return</Text>
          <TextInput style={styles.input} value="22 Sep" placeholderTextColor={Colors.textLight} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Travellers</Text>
          <TextInput style={styles.input} value="2 adults" placeholderTextColor={Colors.textLight} />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Class</Text>
          <TextInput style={styles.input} value="Economy" placeholderTextColor={Colors.textLight} />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleSearch}
        disabled={loading}
        style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}>
        <Text style={styles.ctaText}>{loading ? 'Searching…' : 'Search'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...Ui.card,
    marginTop: -42,
    marginHorizontal: 18,
    padding: Ui.space.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Ui.radius.card,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.primary,
  },
  tabLabel: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: Colors.primaryDark,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  modeButtonText: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: Colors.white,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  field: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldLabel: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 5,
  },
  input: { minHeight: Ui.field.minHeight,
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0,
  },
  errorText: {
    color: Colors.error,
    fontFamily: 'Manrope',
    fontSize: 13,
    marginTop: 10,
  },
  ctaButton: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
  },
});
