import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { FlightSortOption } from './types';

const options: Array<{ id: FlightSortOption; label: string }> = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'cheapest', label: 'Cheapest' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'earliest', label: 'Earliest' },
];

type FlightSortProps = { selected: FlightSortOption; onChange: (value: FlightSortOption) => void };

export default function FlightSort({ selected, onChange }: FlightSortProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SORT BY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
        {options.map((option) => (
          <TouchableOpacity key={option.id} onPress={() => onChange(option.id)} style={[styles.option, selected === option.id && styles.optionSelected]}>
            <Text style={[styles.optionText, selected === option.id && styles.optionTextSelected]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  options: { gap: 7 },
  option: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  optionSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  optionTextSelected: { color: Colors.white },
});