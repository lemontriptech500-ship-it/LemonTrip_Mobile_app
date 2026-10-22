import { useAppLanguage, getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { emptyFlightFilters, type FlightFiltersState, type FlightOffer } from './types';

const GREEN = '#103D30';
type IconName = React.ComponentProps<typeof Ionicons>['name'];
type FlightFiltersProps = { offers: FlightOffer[]; value: FlightFiltersState; onChange: (filters: FlightFiltersState) => void };
type ListKey = 'stops' | 'airlines' | 'departurePeriods' | 'arrivalPeriods';

export function periodFor(value: string) {
  const hour = new Date(value).getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

const PERIODS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const STOPS = ['Nonstop', '1 stop', '2+ stops'];

export const activeFilterCount = (f: FlightFiltersState) =>
  f.stops.length + f.airlines.length + f.departurePeriods.length + f.arrivalPeriods.length + (f.maxDurationHours !== null ? 1 : 0) + (f.maxPrice !== null ? 1 : 0) + (f.baggage !== 'any' ? 1 : 0);

function FilterPill({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} activeOpacity={0.85} style={[s.pill, selected && s.pillOn]}>
      {icon ? <Ionicons name={icon} size={15} color={selected ? Colors.white : GREEN} /> : null}
      <Text style={[s.pillText, selected && s.pillTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{children}</ScrollView>
    </View>
  );
}

/** One quick chip row (All, stops, departure time) with the rarer filters tucked under "More". */
export default function FlightFilters({ offers, value, onChange }: FlightFiltersProps) {
  useAppLanguage();
  const [more, setMore] = useState(false);
  const airlines = useMemo(() => [...new Set(offers.map((o) => o.airline.name))], [offers]);
  const maxPrice = Math.max(0, ...offers.map((o) => o.price.amount));
  const hasBaggage = offers.some((o) => o.baggage !== undefined);
  const count = activeFilterCount(value);
  const hidden = count - value.stops.length - value.departurePeriods.length;
  const isAll = !value.stops.length && !value.departurePeriods.length;

  const toggle = (key: ListKey, item: string) => {
    const selected = value[key];
    onChange({ ...value, [key]: selected.includes(item) ? selected.filter((c) => c !== item) : [...selected, item] });
  };
  const pills = (key: ListKey, items: string[]) => items.map((i) => <FilterPill key={i} label={i} selected={value[key].includes(i)} onPress={() => toggle(key, i)} />);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        <FilterPill label="All" selected={isAll} onPress={() => onChange({ ...value, stops: [], departurePeriods: [] })} />
        {pills('stops', STOPS)}
        {pills('departurePeriods', PERIODS)}
        <FilterPill label={hidden ? `More · ${hidden}` : 'More'} icon="options-outline" selected={more} onPress={() => setMore((v) => !v)} />
      </ScrollView>

      {more ? (
        <Card style={s.moreCard}>
          <ChipRow label="ARRIVES">{pills('arrivalPeriods', PERIODS)}</ChipRow>
          {airlines.length > 1 ? <ChipRow label="AIRLINE">{pills('airlines', airlines)}</ChipRow> : null}
          <ChipRow label="DURATION">
            {[null, 4, 8, 12].map((h) => <FilterPill key={h ?? 'any'} label={h === null ? 'Any' : `Up to ${h}h`} selected={value.maxDurationHours === h} onPress={() => onChange({ ...value, maxDurationHours: h })} />)}
          </ChipRow>
          <ChipRow label="PRICE">
            {[null, 0.5, 0.75].map((f) => {
              const ceiling = f === null ? null : Math.round(maxPrice * f);
              return <FilterPill key={f ?? 'any'} label={ceiling === null ? 'Any price' : `Up to \u20B9${ceiling.toLocaleString(getAppLocale())}`} selected={value.maxPrice === ceiling} onPress={() => onChange({ ...value, maxPrice: ceiling })} />;
            })}
          </ChipRow>
          {hasBaggage ? (
            <ChipRow label="BAGGAGE">
              {(['any', 'included', 'notIncluded'] as const).map((o) => <FilterPill key={o} label={o === 'any' ? 'Any' : o === 'included' ? 'Included' : 'Not included'} selected={value.baggage === o} onPress={() => onChange({ ...value, baggage: o })} />)}
            </ChipRow>
          ) : null}
          {count ? <TouchableOpacity accessibilityRole="button" onPress={() => onChange(emptyFlightFilters)}><Text style={s.clear}>Clear all</Text></TouchableOpacity> : null}
        </Card>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 10 },
  label: { ...Ui.eyebrow, color: Colors.textLight, marginBottom: 6 },
  chips: { gap: 8, alignItems: 'center', paddingRight: 8 },
  pill: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  pillOn: { backgroundColor: GREEN, borderColor: GREEN },
  pillText: { fontFamily: 'Inter-Medium', fontSize: TextSize.body, color: Colors.textDark },
  pillTextOn: { color: Colors.white },
  clear: { fontFamily: 'Inter-Bold', fontSize: TextSize.body, color: Colors.error, paddingVertical: 6, alignSelf: 'flex-start' },
  moreCard: { marginHorizontal: 0, marginTop: 12, paddingBottom: 6 },
});