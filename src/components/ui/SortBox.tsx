import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Chip } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type SortChoice<T extends string> = { id: T; label: string; icon: IconName };

type SortBoxProps = { currentLabel: string; open: boolean; onToggle: () => void };

/** "Sort by" dropdown-style box. Show SortOptions below it when open. */
export function SortBox({ currentLabel, open, onToggle }: SortBoxProps) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Sort by ${currentLabel}`} accessibilityState={{ expanded: open }} onPress={onToggle} activeOpacity={0.85} style={s.box}>
      <Ionicons name="swap-vertical" size={20} color={Colors.textDark} />
      <View style={s.textCol}>
        <Text style={s.caption}>Sort by</Text>
        <Text style={s.value} numberOfLines={1}>{currentLabel}</Text>
      </View>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textDark} />
    </TouchableOpacity>
  );
}

type SortOptionsProps<T extends string> = { options: SortChoice<T>[]; selected: T; onChange: (value: T) => void };

export function SortOptions<T extends string>({ options, selected, onChange }: SortOptionsProps<T>) {
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
