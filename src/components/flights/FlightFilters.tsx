import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Card, Chip } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { emptyFlightFilters, type FlightFiltersState, type FlightOffer } from './types';

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

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{children}</ScrollView>
    </View>
  );
}

/** Chip-based filters (same chips as the train time-slot filter), with the rarer ones tucked under "More filters". */
export default function FlightFilters({ offers, value, onChange }: FlightFiltersProps) {
  const [more, setMore] = useState(false);
  const airlines = useMemo(() => [...new Set(offers.map((o) => o.airline.name))], [offers]);
  const maxPrice = Math.max(0, ...offers.map((o) => o.price.amount));
  const hasBaggage = offers.some((o) => o.baggage !== undefined);
  const count = activeFilterCount(value);

  const toggle = (key: ListKey, item: string) => {
    const selected = value[key];
    onChange({ ...value, [key]: selected.includes(item) ? selected.filter((c) => c !== item) : [...selected, item] });
  };
  const list = (key: ListKey, items: string[]) => items.map((i) => <Chip key={i} label={i} selected={value[key].includes(i)} onPress={() => toggle(key, i)} />);

  return (
    <View>
      <ChipRow label="STOPS">{list('stops', STOPS)}</ChipRow>
      <ChipRow label="DEPARTS">{list('departurePeriods', PERIODS)}</ChipRow>
      {airlines.length > 1 ? <ChipRow label="AIRLINE">{list('airlines', airlines)}</ChipRow> : null}

      <View style={s.moreRow}>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore((v) => !v)} style={s.moreBtn}>
          <Ionicons name="options-outline" size={16} color={Colors.primary} />
          <Text style={s.moreText}>{more ? 'Fewer filters' : 'More filters'}{count ? ` · ${count} active` : ''}</Text>
          <Ionicons name={more ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textLight} />
        </TouchableOpacity>
        {count ? <TouchableOpacity accessibilityRole="button" onPress={() => onChange(emptyFlightFilters)}><Text style={s.clear}>Clear all</Text></TouchableOpacity> : null}
      </View>

      {more ? (
        <Card style={s.moreCard}>
          <ChipRow label="ARRIVES">{list('arrivalPeriods', PERIODS)}</ChipRow>
          <ChipRow label="DURATION">
            {[null, 4, 8, 12].map((h) => <Chip key={h ?? 'any'} label={h === null ? 'Any' : `Up to ${h}h`} selected={value.maxDurationHours === h} onPress={() => onChange({ ...value, maxDurationHours: h })} />)}
          </ChipRow>
          <ChipRow label="PRICE">
            {[null, 0.5, 0.75].map((f) => {
              const ceiling = f === null ? null : Math.round(maxPrice * f);
              return <Chip key={f ?? 'any'} label={ceiling === null ? 'Any price' : `Up to ₹${ceiling.toLocaleString('en-IN')}`} selected={value.maxPrice === ceiling} onPress={() => onChange({ ...value, maxPrice: ceiling })} />;
            })}
          </ChipRow>
          {hasBaggage ? (
            <ChipRow label="BAGGAGE">
              {(['any', 'included', 'notIncluded'] as const).map((o) => <Chip key={o} label={o === 'any' ? 'Any' : o === 'included' ? 'Included' : 'Not included'} selected={value.baggage === o} onPress={() => onChange({ ...value, baggage: o })} />)}
            </ChipRow>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 10 },
  label: { ...Ui.eyebrow, color: Colors.textLight, marginBottom: 6 },
  chips: { gap: 8, alignItems: 'center' },
  moreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  moreText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  clear: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.error },
  moreCard: { marginHorizontal: 0, paddingBottom: 6 },
});
