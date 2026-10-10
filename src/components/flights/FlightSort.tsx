import { Chip } from '@/components/trains/TrainUi';
import { ScrollView, StyleSheet } from 'react-native';
import type { FlightSortOption } from './types';

const options: Array<{ id: FlightSortOption; label: string; icon: React.ComponentProps<typeof Chip>['icon'] }> = [
  { id: 'recommended', label: 'Recommended', icon: 'sparkles-outline' },
  { id: 'earliest', label: 'Earliest', icon: 'time-outline' },
  { id: 'fastest', label: 'Fastest', icon: 'flash-outline' },
  { id: 'cheapest', label: 'Cheapest', icon: 'wallet-outline' },
];

type FlightSortProps = { selected: FlightSortOption; onChange: (value: FlightSortOption) => void };

export default function FlightSort({ selected, onChange }: FlightSortProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
      {options.map((o) => <Chip key={o.id} icon={o.icon} label={o.label} selected={selected === o.id} onPress={() => onChange(o.id)} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ options: { gap: 8, alignItems: 'center' } });
