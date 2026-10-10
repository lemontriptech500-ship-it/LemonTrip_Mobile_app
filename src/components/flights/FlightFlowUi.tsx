import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Pill } from '@/components/trains/TrainUi';
import { formatTime } from './flightFormat';
import { AirlineBadge, FlightRouteLine, TimeBlock } from './FlightParts';
import type { FlightFareOption, FlightOffer } from '@/components/flights/types';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export { formatDuration, formatPrice, formatTime } from './flightFormat';

const STEPS = ['Select', 'Travellers', 'Seats', 'Payment', 'Done'];

export function FlightProgress({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <View style={s.progress} accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of ${STEPS.length}: ${STEPS[current]}`}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={s.progressItem}>
            {i > 0 ? <View style={[s.progressLine, (done || active) && s.progressLineOn]} /> : null}
            <View style={[s.dot, done && s.dotDone, active && s.dotActive]}>
              {done ? <Ionicons name="checkmark" size={13} color={Colors.white} /> : <Text style={[s.dotText, active && s.dotTextActive]}>{i + 1}</Text>}
            </View>
            <Text style={[s.stepLabel, (active || done) && s.stepLabelOn]} numberOfLines={1}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Compact flight recap used on travellers / seats / payment screens (mirrors the train JourneySummary). */
export function FlightJourney({ offer, fare, date }: { offer: FlightOffer; fare?: FlightFareOption; date?: string }) {
  return (
    <View style={s.summary}>
      <View style={s.summaryTop}>
        <AirlineBadge offer={offer} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.summaryName} numberOfLines={1}>{offer.airline.name}</Text>
          <Text style={s.summaryMeta} numberOfLines={1}>{offer.flightNumber}  ·  {fare?.name?.replace(/\s*·\s*sample/i, '') ?? 'Standard'}</Text>
        </View>
        <Pill label={offer.stops === 0 ? 'Nonstop' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`} tone="neutral" />
      </View>
      <View style={s.times}>
        <TimeBlock time={formatTime(offer.departure.time)} code={offer.departure.airportCode} sub={date} />
        <FlightRouteLine offer={offer} />
        <TimeBlock time={formatTime(offer.arrival.time)} code={offer.arrival.airportCode} align="right" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  progress: { flexDirection: 'row', marginHorizontal: Ui.space.page, marginBottom: 16, paddingVertical: 12, paddingHorizontal: 8, ...Ui.card, borderRadius: 18 },
  progressItem: { flex: 1, alignItems: 'center' },
  progressLine: { position: 'absolute', top: 11, right: '50%', width: '100%', height: 2, backgroundColor: Colors.border },
  progressLineOn: { backgroundColor: Colors.primary },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.borderStrong },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotActive: { borderColor: Colors.primary, backgroundColor: Colors.accent },
  dotText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.textLight },
  dotTextActive: { color: Colors.primaryDark },
  stepLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight, marginTop: 5 },
  stepLabelOn: { color: Colors.primary },
  summary: { ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 14, padding: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  summaryMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
});
