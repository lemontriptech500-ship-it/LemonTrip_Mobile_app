import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { formatDuration } from './flightFormat';
import type { FlightOffer } from './types';

export function TimeBlock({ time, code, align = 'left', sub }: { time: string; code: string; align?: 'left' | 'right'; sub?: string }) {
  return (
    <View style={{ alignItems: align === 'left' ? 'flex-start' : 'flex-end', minWidth: 64 }}>
      <Text style={s.time}>{time}</Text>
      <Text style={s.code}>{code}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}

export function FlightRouteLine({ offer }: { offer: FlightOffer }) {
  return (
    <View style={s.line}>
      <Text style={s.duration}>{formatDuration(offer.durationMinutes)}</Text>
      <View style={s.track}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="airplane" size={14} color={Colors.primary} /><View style={s.rule} /><View style={s.dotEnd} /></View>
      <Text style={s.duration}>{offer.stops === 0 ? 'Nonstop' : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`}</Text>
    </View>
  );
}

export function AirlineBadge({ offer, size = 38 }: { offer: FlightOffer; size?: number }) {
  return offer.airline.logoUrl
    ? <Image source={{ uri: offer.airline.logoUrl }} style={{ width: size, height: size, borderRadius: 12, backgroundColor: Colors.background }} resizeMode="contain" accessibilityLabel={`${offer.airline.name} logo`} />
    : <View style={[s.iconBox, { width: size, height: size }]}><Ionicons name="airplane-outline" size={20} color={Colors.primary} /></View>;
}

const s = StyleSheet.create({
  iconBox: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  time: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  code: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary, marginTop: 1 },
  sub: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  line: { flex: 1, alignItems: 'center', gap: 4 },
  duration: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight },
  track: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
});
