import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import FlightCard from './FlightCard';
import FlightFilters, { periodFor } from './FlightFilters';
import FlightSort from './FlightSort';
import type { FlightFiltersState, FlightOffer, FlightSortOption } from './types';

type FlightResultsProps = { offers: FlightOffer[]; loading: boolean; onSelect: (offer: FlightOffer) => void };

export default function FlightResults({ offers, loading, onSelect }: FlightResultsProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [filters, setFilters] = useState<FlightFiltersState>({ stops: [], airlines: [], departurePeriods: [], arrivalPeriods: [], maxDurationHours: null, maxPrice: null, baggage: 'any' });
  const [sort, setSort] = useState<FlightSortOption>('recommended');

  const visibleOffers = useMemo(() => {
    const filtered = offers.filter((offer) => {
      const stopType = offer.stops === 0 ? 'Nonstop' : offer.stops === 1 ? '1 stop' : '2+ stops';
      const baggageIncluded = Boolean(offer.baggage && /included|\d+\s?(kg|pc|piece)/i.test(offer.baggage));
      return (!filters.stops.length || filters.stops.includes(stopType))
        && (!filters.airlines.length || filters.airlines.includes(offer.airline.name))
        && (!filters.departurePeriods.length || filters.departurePeriods.includes(periodFor(offer.departure.time)))
        && (!filters.arrivalPeriods.length || filters.arrivalPeriods.includes(periodFor(offer.arrival.time)))
        && (filters.maxDurationHours === null || offer.durationMinutes <= filters.maxDurationHours * 60)
        && (filters.maxPrice === null || offer.price.amount <= filters.maxPrice)
        && (filters.baggage === 'any' || (filters.baggage === 'included' ? baggageIncluded : !baggageIncluded));
    });

    if (sort === 'cheapest') filtered.sort((a, b) => a.price.amount - b.price.amount);
    if (sort === 'fastest') filtered.sort((a, b) => a.durationMinutes - b.durationMinutes);
    if (sort === 'earliest') filtered.sort((a, b) => new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime());
    return filtered;
  }, [offers, filters, sort]);

  return (
    <View style={[styles.resultsLayout, desktop && styles.resultsLayoutDesktop]}>
      <View style={[styles.filterColumn, desktop && styles.filterColumnDesktop]}>
        <FlightFilters offers={offers} value={filters} onChange={setFilters} />
      </View>
      <View style={styles.resultColumn}>
        {loading ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((item) => <View key={item} style={styles.skeletonCard}><View style={styles.skeletonLine} /><View style={styles.skeletonRoute} /><View style={styles.skeletonLineShort} /></View>)}
          </View>
        ) : offers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Ionicons name="airplane-outline" size={24} color={Colors.primary} /></View>
            <Text style={styles.emptyTitle}>No flights found</Text>
            <Text style={styles.emptyText}>Try another date or adjust your search details.</Text>
          </View>
        ) : visibleOffers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No flights match these filters</Text>
            <Text style={styles.emptyText}>Clear a filter to see more available flights.</Text>
            <TouchableOpacity onPress={() => setFilters({ stops: [], airlines: [], departurePeriods: [], arrivalPeriods: [], maxDurationHours: null, maxPrice: null, baggage: 'any' })} style={styles.clearButton}><Text style={styles.clearButtonText}>Clear filters</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.listHeading}>
              <Text style={styles.resultCount}>{visibleOffers.length} {visibleOffers.length === 1 ? 'flight' : 'flights'}</Text>
              <FlightSort selected={sort} onChange={setSort} />
            </View>
            <View style={styles.listContent}>
              {visibleOffers.map((offer) => <FlightCard key={offer.id} offer={offer} onSelect={onSelect} />)}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultsLayout: { gap: 12 },
  resultsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  filterColumn: { paddingHorizontal: 16 },
  filterColumnDesktop: { width: 255, paddingHorizontal: 0 },
  resultColumn: { flex: 1, minWidth: 0 },
  listHeading: { paddingHorizontal: 16, gap: 11, marginBottom: 12 },
  resultCount: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  skeletonList: { paddingHorizontal: 16, gap: 10 },
  skeletonCard: { minHeight: 170, padding: 15, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, backgroundColor: Colors.surface, justifyContent: 'space-between' },
  skeletonLine: { width: '42%', height: 11, backgroundColor: Colors.surfaceMuted, borderRadius: 6 },
  skeletonLineShort: { width: '34%', height: 12, backgroundColor: Colors.surfaceMuted, borderRadius: 6 },
  skeletonRoute: { width: '100%', height: 48, backgroundColor: Colors.surfaceMuted, borderRadius: 9 },
  emptyState: { marginHorizontal: 16, marginTop: 10, minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 22, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, backgroundColor: Colors.surface },
  emptyIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accentSoft, marginBottom: 12 },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 6 },
  clearButton: { marginTop: 12, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.accent },
  clearButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
});