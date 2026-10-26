import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDuration, formatShortDate, getClassOptions, getStation, inr, lowestFare, type FareBreakdown, type Quota, type TrainResult } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { BRAND, INTER, Pill, TrainRow, TrainTag } from './TrainFlowUi';

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

/** Compact journey recap used on class / passengers / seats / review / payment screens (same layout as the bus and flight recaps). */
export function JourneySummary({ result, date, className, quota }: { result: TrainResult; date: string; className: string; quota: Quota }) {
  const from = getStation(result.from.code); const to = getStation(result.to.code);
  return (
    <View style={s.summary}>
      <View style={s.summaryTop}>
        <View style={s.summaryIcon}><Ionicons name="train-outline" size={24} color={BRAND} /></View>
        <View style={{ flex: 1, minWidth: 0 }}><Text style={s.summaryName} numberOfLines={1}>{result.train.name}</Text><Text style={s.summaryMeta} numberOfLines={1}>#{result.train.number}  ·  {className}</Text></View>
        <TrainTag label={quota === 'TQ' ? 'Tatkal' : 'General'} />
      </View>
      <View style={s.times}>
        <View style={s.end}>
          <Text style={s.sTime}>{result.departure}</Text>
          <Text style={s.sCode}>{result.from.code}</Text>
          <Text style={s.sSub} numberOfLines={2}>{from?.city ?? ''} · {formatShortDate(date)}</Text>
        </View>
        <View style={s.mid}>
          <Text style={s.midText}>{formatDuration(result.durationMin)}</Text>
          <View style={s.track}><View style={s.sDot} /><View style={s.rule} /><Ionicons name="train" size={15} color={BRAND} /><View style={s.rule} /><View style={s.sDot} /></View>
          <Text style={s.midText}>{result.distanceKm} km</Text>
        </View>
        <View style={[s.end, { alignItems: 'flex-end' }]}>
          <Text style={s.sTime}>{result.arrival}</Text>
          <Text style={s.sCode}>{result.to.code}</Text>
          <Text style={[s.sSub, { textAlign: 'right' }]} numberOfLines={2}>{result.arrivalDayOffset > 0 ? `${to?.city ?? ''} · +${result.arrivalDayOffset} day` : to?.city}</Text>
        </View>
      </View>
    </View>
  );
}

export function FareSummary({ fare, couponCode }: { fare: FareBreakdown; couponCode?: string | null }) {
  return (
    <View>
      <TrainRow label={`Base fare × ${fare.passengers}`} value={inr(fare.base)} />
      <TrainRow label="Reservation & superfast" value={inr(fare.reservation)} />
      {fare.tatkal > 0 ? <TrainRow label="Tatkal charge" value={inr(fare.tatkal)} /> : null}
      {fare.gst > 0 ? <TrainRow label="GST (5%)" value={inr(fare.gst)} /> : null}
      <TrainRow label="Convenience fee" value={inr(fare.convenience)} />
      {fare.discount > 0 ? <TrainRow label={`Coupon ${couponCode ?? ''}`.trim()} value={`− ${inr(fare.discount)}`} good /> : null}
      <View style={s.divider} />
      <TrainRow label="Total payable" value={inr(fare.total)} bold />
    </View>
  );
}

const s = StyleSheet.create({
  card: { ...Ui.card, padding: 14, marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  name: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  number: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  heart: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  time: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  code: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary, marginTop: 1 },
  sub: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
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
  footText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight },
  footBold: { fontWeight: FontWeight.extraBold, color: Colors.textDark },
  link: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  summary: { ...Ui.card, marginHorizontal: 10, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
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