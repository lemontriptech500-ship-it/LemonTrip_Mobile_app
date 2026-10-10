import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Pill } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { formatPrice, formatTime } from './flightFormat';
import { AirlineBadge, FlightRouteLine, TimeBlock } from './FlightParts';
import type { FlightOffer } from './types';

type FlightCardProps = {
  offer: FlightOffer;
  onSelect: (offer: FlightOffer) => void;
  /** Marks the cheapest visible flight. */
  best?: boolean;
  dateLabel?: string;
};

/** Result card — mirrors TrainCard: header, timeline, fare tiles, footer. */
export default function FlightCard({ offer, onSelect, best = false, dateLabel }: FlightCardProps) {
  const fares = offer.fareOptions?.length ? offer.fareOptions : null;
  const refundNote = offer.refundable === true ? 'Refundable' : offer.refundable === false ? 'Non-refundable' : null;
  const open = () => onSelect(offer);
  return (
    <View style={[s.card, best && s.cardBest]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${offer.airline.name} ${offer.flightNumber}, open details`} onPress={open} activeOpacity={0.85}>
        <View style={s.top}>
          <AirlineBadge offer={offer} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>{offer.airline.name}</Text>
            <Text style={s.number} numberOfLines={1}>{[offer.flightNumber, offer.aircraft?.name ?? offer.aircraft?.code].filter(Boolean).join('  ·  ')}</Text>
          </View>
          {offer.isDemo ? <Pill label="Sample" tone="warn" icon="information-circle-outline" /> : best ? <Pill label="Best price" tone="brand" icon="sparkles" /> : null}
        </View>
        <View style={s.times}>
          <TimeBlock time={formatTime(offer.departure.time)} code={offer.departure.airportCode} sub={dateLabel} />
          <FlightRouteLine offer={offer} />
          <TimeBlock time={formatTime(offer.arrival.time)} code={offer.arrival.airportCode} align="right" />
        </View>
      </TouchableOpacity>

      <View style={s.classes}>
        {(fares ?? [{ id: 'base', name: refundNote ?? 'Fare', price: { total: offer.price.amount, currency: offer.price.currency } }]).map((f) => (
          <TouchableOpacity key={f.id} accessibilityRole="button" accessibilityLabel={`${f.name}, ${formatPrice(f.price.total, f.price.currency)}`} onPress={open} style={s.classTile} activeOpacity={0.8}>
            <Text style={s.classCode} numberOfLines={1}>{f.name.replace(/\s*·\s*sample/i, '')}</Text>
            <Text style={s.classFare}>{formatPrice(f.price.total, f.price.currency)}</Text>
            {'refundable' in f && f.refundable !== undefined ? <Text style={[s.avail, f.refundable ? s.good : s.warn]}>{f.refundable ? 'Refundable' : 'Non-refundable'}</Text> : null}
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.foot}>
        <Text style={s.footText} numberOfLines={1}>{offer.baggage ?? 'Baggage details unavailable'}  ·  from <Text style={s.footBold}>{formatPrice(offer.price.amount, offer.price.currency)}</Text></Text>
        <TouchableOpacity accessibilityRole="button" onPress={open}><Text style={s.link}>View details</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...Ui.card, padding: 14, marginBottom: 12 },
  cardBest: { borderColor: Colors.accent, borderWidth: 1.5 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  number: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  classes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  classTile: { flexGrow: 1, flexBasis: '30%', minWidth: 120, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  classCode: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  classFare: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 2 },
  avail: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, marginTop: 5 },
  good: { color: Colors.success }, warn: { color: '#8A6500' },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 12 },
  footText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight },
  footBold: { fontWeight: FontWeight.extraBold, color: Colors.textDark },
  link: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
});
