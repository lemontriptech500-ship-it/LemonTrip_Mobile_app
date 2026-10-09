import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDuration, formatShortDate, getClassOptions, inr, lowestFare, type FareBreakdown, type Quota, type TrainResult } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pill, Row } from './TrainUi';

const TYPE_TONE = { Rajdhani: 'brand', Shatabdi: 'brand', Superfast: 'neutral', Express: 'neutral' } as const;

function TimeBlock({ time, code, align = 'left', sub }: { time: string; code: string; align?: 'left' | 'right'; sub?: string }) {
  return (
    <View style={{ alignItems: align === 'left' ? 'flex-start' : 'flex-end', minWidth: 64 }}>
      <Text style={s.time}>{time}</Text>
      <Text style={s.code}>{code}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}

function RouteLine({ result }: { result: TrainResult }) {
  return (
    <View style={s.line}>
      <Text style={s.duration}>{formatDuration(result.durationMin)}</Text>
      <View style={s.track}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="train" size={14} color={Colors.primary} /><View style={s.rule} /><View style={s.dotEnd} /></View>
      <Text style={s.duration}>{result.distanceKm} km</Text>
    </View>
  );
}

/** Result card. `onSelectClass` fires when a class tile is tapped; `onOpen` when the card header is tapped. */
export function TrainCard({ result, date, quota = 'GN', onOpen, onSelectClass, wishlisted, onToggleWishlist }: {
  result: TrainResult; date: string; quota?: Quota; onOpen: () => void; onSelectClass: (code: string) => void; wishlisted?: boolean; onToggleWishlist?: () => void;
}) {
  const options = getClassOptions(result, date, quota);
  const { train } = result;
  return (
    <View style={s.card}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${train.name}, open details`} onPress={onOpen} activeOpacity={0.85}>
        <View style={s.top}>
          <View style={s.iconBox}><Ionicons name="train-outline" size={20} color={Colors.primary} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>{train.name}</Text>
            <Text style={s.number}>#{train.number}  ·  {train.runsOn.length === 7 ? 'Runs daily' : `Runs ${train.runsOn.length} days/week`}</Text>
          </View>
          <Pill label={train.type} tone={TYPE_TONE[train.type]} />
          {onToggleWishlist ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'} accessibilityState={{ selected: !!wishlisted }} onPress={onToggleWishlist} hitSlop={8} style={s.heart}>
              <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={19} color={wishlisted ? Colors.error : Colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={s.times}>
          <TimeBlock time={result.departure} code={result.from.code} sub={formatShortDate(date)} />
          <RouteLine result={result} />
          <TimeBlock time={result.arrival} code={result.to.code} align="right" sub={result.arrivalDayOffset > 0 ? `+${result.arrivalDayOffset} day` : undefined} />
        </View>
      </TouchableOpacity>
      <View style={s.classes}>
        {options.map((o) => (
          <TouchableOpacity key={o.code} accessibilityRole="button" accessibilityLabel={`${o.info.name}, ${inr(o.fare)}, ${o.availability.label}`} onPress={() => onSelectClass(o.code)} style={s.classTile} activeOpacity={0.8}>
            <View style={s.classHead}><Text style={s.classCode}>{o.code}</Text><Text style={s.classFare}>{inr(o.fare)}</Text></View>
            <Text style={[s.avail, o.availability.tone === 'good' ? s.good : o.availability.tone === 'warn' ? s.warn : s.bad]}>{o.availability.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.foot}>
        <Text style={s.footText}>{train.pantry ? 'Meals available' : 'No pantry car'}  ·  from <Text style={s.footBold}>{inr(lowestFare(options))}</Text></Text>
        <TouchableOpacity accessibilityRole="button" onPress={onOpen}><Text style={s.link}>View details</Text></TouchableOpacity>
      </View>
    </View>
  );
}

/** Compact journey recap used on passengers / review / payment screens. */
export function JourneySummary({ result, date, className, quota }: { result: TrainResult; date: string; className: string; quota: Quota }) {
  return (
    <View style={s.summary}>
      <View style={s.summaryTop}>
        <View style={{ flex: 1, minWidth: 0 }}><Text style={s.summaryName} numberOfLines={1}>{result.train.name}</Text><Text style={s.number}>#{result.train.number}  ·  {className}</Text></View>
        <Pill label={quota === 'TQ' ? 'Tatkal' : 'General'} tone={quota === 'TQ' ? 'warn' : 'neutral'} />
      </View>
      <View style={s.times}>
        <TimeBlock time={result.departure} code={result.from.code} sub={formatShortDate(date)} />
        <RouteLine result={result} />
        <TimeBlock time={result.arrival} code={result.to.code} align="right" sub={result.arrivalDayOffset > 0 ? `+${result.arrivalDayOffset} day` : undefined} />
      </View>
    </View>
  );
}

export function FareSummary({ fare, couponCode }: { fare: FareBreakdown; couponCode?: string | null }) {
  return (
    <View>
      <Row label={`Base fare × ${fare.passengers}`} value={inr(fare.base)} />
      <Row label="Reservation & superfast" value={inr(fare.reservation)} />
      {fare.tatkal > 0 ? <Row label="Tatkal charge" value={inr(fare.tatkal)} /> : null}
      {fare.gst > 0 ? <Row label="GST (5%)" value={inr(fare.gst)} /> : null}
      <Row label="Convenience fee" value={inr(fare.convenience)} />
      {fare.discount > 0 ? <Row label={`Coupon ${couponCode ?? ''}`.trim()} value={`− ${inr(fare.discount)}`} tone="good" /> : null}
      <View style={s.divider} />
      <Row label="Total payable" value={inr(fare.total)} bold />
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...Ui.card, padding: 14, marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  name: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark },
  number: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  heart: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  time: { fontFamily: 'Manrope', fontSize: 22, fontWeight: '800', color: Colors.textDark },
  code: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.secondary, marginTop: 1 },
  sub: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 1 },
  line: { flex: 1, alignItems: 'center', gap: 4 },
  duration: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.textLight },
  track: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  classes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  classTile: { flexGrow: 1, flexBasis: '30%', minWidth: 96, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  classHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classCode: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.primaryDark },
  classFare: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.textDark },
  avail: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', marginTop: 5 },
  good: { color: Colors.success }, warn: { color: '#8A6500' }, bad: { color: Colors.error },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  footText: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight },
  footBold: { fontWeight: '800', color: Colors.textDark },
  link: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primary },
  summary: { ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 14, padding: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryName: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
});
