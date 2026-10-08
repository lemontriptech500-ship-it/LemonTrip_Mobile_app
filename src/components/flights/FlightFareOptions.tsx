import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { FlightFareOption } from './types';

type FlightFareOptionsProps = {
  options: FlightFareOption[];
  selectedId: string | null;
  onSelect: (option: FlightFareOption) => void;
  onFareConditions: (option: FlightFareOption) => void;
};

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

function Detail({ label, value }: { label: string; value?: string | boolean }) {
  let displayValue = 'Not provided';
  if (typeof value === 'boolean') displayValue = value ? 'Refundable' : 'Non-refundable';
  else if (typeof value === 'string' && value.trim()) displayValue = value;

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, displayValue === 'Not provided' && styles.missing]}>{displayValue}</Text>
    </View>
  );
}

export default function FlightFareOptions({ options, selectedId, onSelect, onFareConditions }: FlightFareOptionsProps) {
  const { width } = useWindowDimensions();
  const mobile = width < 720;
  const threeColumns = width >= 1100;
  const [expandedId, setExpandedId] = useState<string | null>(options[0]?.id ?? null);

  if (!options.length) {
    return (
      <View style={styles.noFares}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.textLight} />
        <Text style={styles.noFaresText}>Fare options were not included in the flight response.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.grid, !mobile && styles.gridWide]}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        const expanded = !mobile || expandedId === option.id;
        return (
          <View key={option.id} style={[styles.card, !mobile && styles.cardWide, threeColumns && styles.cardThreeColumns, selected && styles.cardSelected]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => { onSelect(option); setExpandedId((current) => current === option.id ? null : option.id); }}
              style={styles.cardHeader}>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{option.name}</Text>
                <Text style={styles.price}>{formatPrice(option.price.total, option.price.currency)}</Text>
              </View>
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? Colors.primary : Colors.textLight} />
              {mobile ? <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} /> : null}
            </TouchableOpacity>

            {expanded ? (
              <View style={styles.details}>
                <Detail label="Cabin" value={option.cabin} />
                <Detail label="Baggage" value={option.baggage} />
                <Detail label="Cancellation" value={option.cancellation} />
                <Detail label="Date change" value={option.dateChange} />
                <Detail label="Seat selection" value={option.seatSelection} />
                <Detail label="Refundability" value={option.refundable} />
                <TouchableOpacity accessibilityRole="button" onPress={() => onFareConditions(option)} style={styles.conditionsButton}>
                  <Text style={styles.conditionsText}>Fare conditions</Text>
                  <Ionicons name="open-outline" size={13} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 9 },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  card: { ...Ui.card, overflow: 'hidden', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card },
  cardWide: { width: '48.5%' },
  cardThreeColumns: { width: '32%' },
  cardSelected: { borderColor: Colors.primary, borderWidth: 1.5 },
  cardHeader: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, paddingVertical: 11 },
  nameWrap: { flex: 1 },
  name: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  price: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', marginTop: 4 },
  details: { paddingHorizontal: 13, paddingBottom: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingTop: 9 },
  detailLabel: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  detailValue: { flex: 1.25, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  missing: { color: Colors.textLight, fontWeight: '400' },
  conditionsButton: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 12 },
  conditionsText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  noFares: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  noFaresText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 },
});