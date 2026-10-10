import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FlightCard from './FlightCard';
import FlightFilters, { periodFor } from './FlightFilters';
import FlightSort from './FlightSort';
import { emptyFlightFilters, type FlightFiltersState, type FlightOffer, type FlightSortOption } from './types';

type FlightResultsProps = { offers: FlightOffer[]; loading: boolean; onSelect: (offer: FlightOffer) => void; dateLabel?: string };

export default function FlightResults({ offers, loading, onSelect, dateLabel }: FlightResultsProps) {
  const [filters, setFilters] = useState<FlightFiltersState>(emptyFlightFilters);
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

  const bestId = visibleOffers.length > 1 ? visibleOffers.reduce((a, b) => (b.price.amount < a.price.amount ? b : a)).id : null;

  if (loading) {
    return <View>{[0, 1, 2].map((i) => <View key={i} style={s.skeleton}><View style={s.skLine} /><View style={s.skRoute} /><View style={s.skLineShort} /></View>)}</View>;
  }
  if (offers.length === 0) {
    return <EmptyState icon="airplane-outline" title="No flights found" text="Try another date or adjust your search details." />;
  }

  return (
    <View>
      <View style={s.head}>
        <Text style={s.count}>{visibleOffers.length} {visibleOffers.length === 1 ? 'flight' : 'flights'} {visibleOffers.length === offers.length ? 'found' : 'match'}</Text>
      </View>
      <FlightSort selected={sort} onChange={setSort} />
      <View style={{ height: 12 }} />
      <FlightFilters offers={offers} value={filters} onChange={setFilters} />
      {visibleOffers.length ? visibleOffers.map((offer) => <FlightCard key={offer.id} offer={offer} onSelect={onSelect} best={offer.id === bestId} dateLabel={dateLabel} />) : (
        <EmptyState icon="airplane-outline" title="No flights match these filters" text="Clear a filter to see more available flights." action={<PrimaryButton variant="soft" label="Clear filters" onPress={() => setFilters(emptyFlightFilters)} />} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  head: { marginBottom: 10 },
  count: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  skeleton: { ...Ui.card, minHeight: 150, padding: 14, marginBottom: 12, justifyContent: 'space-between' },
  skLine: { width: '42%', height: 11, backgroundColor: Colors.surfaceMuted, borderRadius: 6 },
  skLineShort: { width: '34%', height: 12, backgroundColor: Colors.surfaceMuted, borderRadius: 6 },
  skRoute: { width: '100%', height: 44, backgroundColor: Colors.surfaceMuted, borderRadius: 9 },
});
