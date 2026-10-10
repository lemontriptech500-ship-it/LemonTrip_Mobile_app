import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { FlightFiltersState, FlightOffer } from './types';

type FlightFiltersProps = {
  offers: FlightOffer[];
  value: FlightFiltersState;
  onChange: (filters: FlightFiltersState) => void;
};

function periodFor(value: string) {
  const hour = new Date(value).getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

export default function FlightFilters({ offers, value, onChange }: FlightFiltersProps) {
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(width >= 900);
  const airlines = useMemo(() => [...new Set(offers.map((offer) => offer.airline.name))], [offers]);
  const maxPrice = Math.max(0, ...offers.map((offer) => offer.price.amount));
  const maxDuration = Math.max(0, ...offers.map((offer) => offer.durationMinutes));
  const hasBaggage = offers.some((offer) => offer.baggage !== undefined);

  const toggle = (key: 'stops' | 'airlines' | 'departurePeriods' | 'arrivalPeriods', item: string) => {
    const selected = value[key];
    onChange({ ...value, [key]: selected.includes(item) ? selected.filter((current) => current !== item) : [...selected, item] });
  };

  const options = [
    { label: 'Stops', values: ['Nonstop', '1 stop', '2+ stops'], key: 'stops' as const },
    { label: 'Airlines', values: airlines, key: 'airlines' as const },
    { label: 'Departure time', values: ['Morning', 'Afternoon', 'Evening', 'Night'], key: 'departurePeriods' as const },
    { label: 'Arrival time', values: ['Morning', 'Afternoon', 'Evening', 'Night'], key: 'arrivalPeriods' as const },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.heading} onPress={() => setExpanded((current) => !current)}>
        <View style={styles.headingLeft}><Ionicons name="options-outline" size={16} color={Colors.primary} /><Text style={styles.title}>Filters</Text></View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
      </TouchableOpacity>
      {expanded ? (
        <ScrollView style={styles.content} nestedScrollEnabled>
          {options.map((section) => section.values.length ? (
            <View key={section.key} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.label}</Text>
              {section.values.map((item) => {
                const selected = value[section.key].includes(item);
                return (
                  <TouchableOpacity key={item} style={styles.option} onPress={() => toggle(section.key, item)}>
                    <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={16} color={selected ? Colors.primary : Colors.textLight} />
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null)}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            {[null, 4, 8, 12].filter((hours) => hours === null || maxDuration === 0 || hours * 60 <= maxDuration || hours === 12).map((hours) => (
              <TouchableOpacity key={hours ?? 'any'} style={styles.option} onPress={() => onChange({ ...value, maxDurationHours: hours })}>
                <Ionicons name={value.maxDurationHours === hours ? 'radio-button-on' : 'radio-button-off'} size={16} color={value.maxDurationHours === hours ? Colors.primary : Colors.textLight} />
                <Text style={styles.optionText}>{hours === null ? 'Any duration' : `Up to ${hours} hours`}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            {[null, 0.5, 0.75].map((fraction) => {
              const ceiling = fraction === null ? null : Math.round(maxPrice * fraction);
              return (
                <TouchableOpacity key={fraction ?? 'any'} style={styles.option} onPress={() => onChange({ ...value, maxPrice: ceiling })}>
                  <Ionicons name={value.maxPrice === ceiling ? 'radio-button-on' : 'radio-button-off'} size={16} color={value.maxPrice === ceiling ? Colors.primary : Colors.textLight} />
                  <Text style={styles.optionText}>{ceiling === null ? 'Any price' : `Up to ${ceiling.toLocaleString('en-IN')}`}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {hasBaggage ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Baggage</Text>
              {(['any', 'included', 'notIncluded'] as const).map((option) => (
                <TouchableOpacity key={option} style={styles.option} onPress={() => onChange({ ...value, baggage: option })}>
                  <Ionicons name={value.baggage === option ? 'radio-button-on' : 'radio-button-off'} size={16} color={value.baggage === option ? Colors.primary : Colors.textLight} />
                  <Text style={styles.optionText}>{option === 'any' ? 'Any' : option === 'included' ? 'Included' : 'Not included'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <Text style={styles.facetNote}>Filter options reflect this search’s results.</Text>
        </ScrollView>
      ) : null}
    </View>
  );
}

export { periodFor };

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, overflow: 'hidden' },
  heading: { minHeight: 48, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  content: { maxHeight: 480, paddingHorizontal: 13 },
  section: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  sectionTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginBottom: 8 },
  option: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  facetNote: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, paddingBottom: 14 },
});