import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
﻿import { Card, Row, SectionTitle } from '@/components/trains/TrainUi';
import type { FlightFareOption, FlightOffer } from '@/components/flights/types';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

// Shows 06:15 for "2026-12-01T06:15:00"; leaves other formats untouched.
export function formatTime(value: string) {
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : value;
}

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

export function FlightJourney({ offer, fare }: { offer: FlightOffer; fare?: FlightFareOption }) {
  const hours = Math.floor(offer.durationMinutes / 60);
  const minutes = offer.durationMinutes % 60;
  return (
    <Card>
      <SectionTitle eyebrow="YOUR FLIGHT" title={`${offer.airline.name} ${offer.flightNumber}`} />
      <Row label="Route" value={`${offer.departure.airportCode} to ${offer.arrival.airportCode}`} />
      <Row label="Departs" value={formatTime(offer.departure.time)} />
      <Row label="Arrives" value={formatTime(offer.arrival.time)} />
      <Row label="Duration" value={`${hours}h ${minutes}m${offer.stops === 0 ? ' · Nonstop' : ` · ${offer.stops} stop`}`} />
      <Row label="Fare" value={fare?.name ?? 'Standard'} />
    </Card>
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
});
