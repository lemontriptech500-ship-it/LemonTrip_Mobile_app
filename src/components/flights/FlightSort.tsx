import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Chip } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { FlightSortOption } from './types';

const options: Array<{ id: FlightSortOption; label: string; icon: React.ComponentProps<typeof Chip>['icon'] }> = [
  { id: 'recommended', label: 'Recommended', icon: 'sparkles-outline' },
  { id: 'earliest', label: 'Earliest', icon: 'time-outline' },
  { id: 'fastest', label: 'Fastest', icon: 'flash-outline' },
  { id: 'cheapest', label: 'Cheapest', icon: 'wallet-outline' },
];

type FlightSortProps = { selected: FlightSortOption; open: boolean; onToggle: () => void };

/** "Sort by" dropdown button. The option chips are shown by FlightSortOptions when it is open. */
export default function FlightSort({ selected, open, onToggle }: FlightSortProps) {
  useAppLanguage();
  const current = options.find((o) => o.id === selected)?.label ?? 'Recommended';
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Sort by ${current}`} accessibilityState={{ expanded: open }} onPress={onToggle} activeOpacity={0.85} style={s.box}>
      <Ionicons name="swap-vertical" size={20} color={Colors.textDark} />
      <View style={s.textCol}>
        <Text style={s.caption}>Sort by</Text>
        <Text style={s.value} numberOfLines={1}>{current}</Text>
      </View>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textDark} />
    </TouchableOpacity>
  );
}

export function FlightSortOptions({ selected, onChange }: { selected: FlightSortOption; onChange: (value: FlightSortOption) => void }) {
  useAppLanguage();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.options}>
      {options.map((o) => <Chip key={o.id} icon={o.icon} label={o.label} selected={selected === o.id} onPress={() => onChange(o.id)} />)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  textCol: { flexShrink: 1 },
  caption: { fontFamily: 'Inter-Regular', fontSize: TextSize.micro, color: Colors.textLight },
  value: { fontFamily: 'Inter-SemiBold', fontSize: TextSize.body, color: Colors.textDark },
  options: { gap: 8, alignItems: 'center' },
});