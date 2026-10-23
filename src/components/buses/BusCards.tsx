import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDuration, formatShortDate, getCity, getDeckInfo, inr, lowestFare, seatsLeft, type Bus, type DeckId, type FareBreakdown } from '@/data/buses';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { BRAND, BusRow, BusTag, INTER, Pill, busStyles } from './BusUi';

function TimeBlock({ time, code, align = 'left', sub }: { time: string; code: string; align?: 'left' | 'right'; sub?: string }) {
  return (
    <View style={{ alignItems: align === 'left' ? 'flex-start' : 'flex-end', minWidth: 64 }}>
      <Text style={s.time}>{time}</Text>
      <Text style={s.code}>{code}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}

export function RouteLine({ bus }: { bus: Bus }) {
  return (
    <View style={s.line}>
      <Text style={s.duration}>{formatDuration(bus.durationMin)}</Text>
      <View style={s.track}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="bus" size={14} color={Colors.primary} /><View style={s.rule} /><View style={s.dotEnd} /></View>
      <Text style={s.duration}>{bus.distanceKm} km</Text>
    </View>
  );
}

const rating = (bus: Bus) => `${bus.rating.toFixed(1)} ★`;

/** Result card. `onSelectDeck` fires when a deck tile is tapped; `onOpen` when the card header is tapped. */
export function BusCard({ bus, date, onOpen, onSelectDeck }: { bus: Bus; date: string; onOpen: () => void; onSelectDeck: (deck: DeckId) => void }) {
  const decks = getDeckInfo(bus, date);
  const left = seatsLeft(decks);
  const from = getCity(bus.fromCode); const to = getCity(bus.toCode);
  return (
    <View style={s.card}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${bus.operator}, open details`} onPress={onOpen} activeOpacity={0.85}>
        <View style={s.top}>
          <View style={s.iconBox}><Ionicons name="bus-outline" size={20} color={Colors.primary} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>{bus.operator}</Text>
            <Text style={s.number} numberOfLines={1}>{bus.type}</Text>
          </View>
          <Pill label={bus.ac ? 'AC' : 'Non-AC'} tone={bus.ac ? 'brand' : 'neutral'} />
        </View>
        <View style={s.times}>
          <TimeBlock time={bus.departure} code={bus.fromCode} sub={`${from?.name ?? ''} · ${formatShortDate(date)}`} />
          <RouteLine bus={bus} />
          <TimeBlock time={bus.arrival} code={bus.toCode} align="right" sub={bus.arrivalDayOffset > 0 ? `${to?.name ?? ''} · +${bus.arrivalDayOffset} day` : to?.name} />
        </View>
      </TouchableOpacity>
      <View style={s.classes}>
        {decks.map((d) => (
          <TouchableOpacity key={d.id} disabled={d.free === 0} accessibilityRole="button" accessibilityLabel={`${d.label}, from ${inr(d.fromFare)}, ${d.text}`} onPress={() => onSelectDeck(d.id)} style={[s.classTile, d.free === 0 && { opacity: 0.55 }]} activeOpacity={0.8}>
            <View style={s.classHead}><Text style={s.classCode}>{d.label}</Text><Text style={s.classFare}>{inr(d.fromFare)}</Text></View>
            <Text style={[s.avail, d.tone === 'good' ? s.good : d.tone === 'warn' ? s.warn : s.bad]}>{d.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.foot}>
        <Text style={s.footText}>{rating(bus)}  ·  {left} seats left  ·  from <Text style={s.footBold}>{inr(lowestFare(bus, date))}</Text></Text>
        <TouchableOpacity accessibilityRole="button" onPress={onOpen}><Text style={s.link}>View seats</Text></TouchableOpacity>
      </View>
    </View>
  );
}

/** Compact journey recap used on seats / passengers / review / payment screens. */
export function JourneySummary({ bus, date, seats }: { bus: Bus; date: string; seats?: string[] }) {
  const from = getCity(bus.fromCode); const to = getCity(bus.toCode);
  return (
    <View style={s.summary}>
      <View style={s.summaryTop}>
        <View style={s.summaryIcon}><Ionicons name="bus-outline" size={24} color={BRAND} /></View>
        <View style={{ flex: 1, minWidth: 0 }}><Text style={s.summaryName} numberOfLines={1}>{bus.operator}</Text><Text style={s.summaryMeta} numberOfLines={1}>{bus.type}</Text></View>
        <BusTag label={seats && seats.length ? `${seats.length} seat${seats.length > 1 ? 's' : ''}` : rating(bus)} />
      </View>
      <View style={s.times}>
        <View style={s.end}>
          <Text style={s.sTime}>{bus.departure}</Text>
          <Text style={s.sCode}>{bus.fromCode}</Text>
          <Text style={s.sSub} numberOfLines={2}>{from?.name ?? ''} · {formatShortDate(date)}</Text>
        </View>
        <View style={s.mid}>
          <Text style={s.midText}>{formatDuration(bus.durationMin)}</Text>
          <View style={s.track}><View style={s.sDot} /><View style={s.rule} /><Ionicons name="bus" size={15} color={BRAND} /><View style={s.rule} /><View style={s.sDot} /></View>
          <Text style={s.midText}>{bus.distanceKm} km</Text>
        </View>
        <View style={[s.end, { alignItems: 'flex-end' }]}>
          <Text style={s.sTime}>{bus.arrival}</Text>
          <Text style={s.sCode}>{bus.toCode}</Text>
          <Text style={[s.sSub, { textAlign: 'right' }]} numberOfLines={2}>{bus.arrivalDayOffset > 0 ? `${to?.name ?? ''} · +${bus.arrivalDayOffset} day` : to?.name}</Text>
        </View>
      </View>
    </View>
  );
}

export function FareSummary({ fare, couponCode }: { fare: FareBreakdown; couponCode?: string | null }) {
  return (
    <View>
      <BusRow label={`Base fare × ${fare.seats}`} value={inr(fare.base)} />
      {fare.gst > 0 ? <BusRow label="GST (5%)" value={inr(fare.gst)} /> : null}
      {fare.insurance > 0 ? <BusRow label="Travel insurance" value={inr(fare.insurance)} /> : null}
      <BusRow label="Convenience fee" value={inr(fare.convenience)} />
      {fare.discount > 0 ? <BusRow label={`Coupon ${couponCode ?? ''}`.trim()} value={`− ${inr(fare.discount)}`} good /> : null}
      <View style={busStyles.divider} />
      <BusRow label="Total payable" value={inr(fare.total)} bold />
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...Ui.card, padding: 14, marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  name: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  number: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  time: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  code: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary, marginTop: 1 },
  sub: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1, maxWidth: 110 },
  line: { flex: 1, alignItems: 'center', gap: 4 },
  duration: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight },
  track: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  classes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  classTile: { flexGrow: 1, flexBasis: '30%', minWidth: 96, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  classHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classCode: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  classFare: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  avail: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, marginTop: 5 },
  good: { color: Colors.success }, warn: { color: '#8A6500' }, bad: { color: Colors.error },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  footText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, flexShrink: 1 },
  footBold: { fontWeight: FontWeight.extraBold, color: Colors.textDark },
  link: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  summary: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  summaryName: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: BRAND },
  summaryMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  end: { flex: 1, minWidth: 0 },
  sTime: { fontFamily: INTER.extrabold, fontSize: TextSize.displaySmall, color: BRAND },
  sCode: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND, marginTop: 6 },
  sSub: { fontFamily: INTER.regular, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 3 },
  mid: { width: 92, alignItems: 'center', gap: 6 },
  midText: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  sDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
});