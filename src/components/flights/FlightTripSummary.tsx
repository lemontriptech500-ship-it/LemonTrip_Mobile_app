import { Colors } from '@/constants/colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FlightFareOption } from './types';

type FlightTripSummaryProps = {
  fareOption: FlightFareOption | null;
  onContinue: () => void;
};

function formatPrice(amount: number | undefined, currency: string) {
  if (amount === undefined) return 'Not provided';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

export default function FlightTripSummary({ fareOption, onContinue }: FlightTripSummaryProps) {
  const currency = fareOption?.price.currency ?? '';
  const rows: Array<{ label: string; amount: number | undefined; total?: boolean }> = [
    { label: 'Base fare', amount: fareOption?.price.baseFare },
    { label: 'Taxes', amount: fareOption?.price.taxes },
    { label: 'Fees', amount: fareOption?.price.fees },
    { label: 'Total', amount: fareOption?.price.total, total: true },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Trip summary</Text>
      <Text style={styles.subtitle}>{fareOption ? fareOption.name : 'Select an available fare'}</Text>
      {rows.map((row) => (
        <View key={row.label} style={[styles.row, row.total && styles.totalRow]}>
          <Text style={[styles.label, row.total && styles.totalLabel]}>{row.label}</Text>
          <Text style={[styles.amount, row.total && styles.totalAmount]}>{formatPrice(row.amount, currency)}</Text>
        </View>
      ))}
      <Text style={styles.disclaimer}>Breakdown is shown as returned by the flight service.</Text>
      <TouchableOpacity accessibilityRole="button" disabled={!fareOption} onPress={onContinue} style={[styles.continueButton, !fareOption && styles.continueDisabled]}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, backgroundColor: Colors.surface },
  title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  subtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 4, marginBottom: 9 },
  row: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  totalRow: { minHeight: 48, marginTop: 5, borderTopWidth: 1, borderTopColor: Colors.border },
  label: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  amount: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  totalLabel: { color: Colors.textDark, fontSize: 12, fontWeight: '800' },
  totalAmount: { color: Colors.primaryDark, fontSize: 16, fontWeight: '900' },
  disclaimer: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, marginTop: 1 },
  continueButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: 11, backgroundColor: Colors.accent },
  continueDisabled: { opacity: 0.5 },
  continueText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
});