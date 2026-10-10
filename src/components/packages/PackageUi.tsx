import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Pill, Row } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { countsLabel, formatShortDate, inr, type PackageFare } from '@/data/packages';
import type { PackageSnapshot } from '@/utils/packageBookingStore';
import type { Counts } from '@/data/packages';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export const PACKAGE_ROUTES = {
  list: '/packages',
  plan: '/packages/plan',
  travellers: '/packages/travellers',
  review: '/packages/review',
  payment: '/packages/payment',
  confirmation: '/packages/confirmation',
} as const;
export const packageDetailsRoute = (id: string) => `/packages/${id}`;

/* ---------- progress ---------- */

const STEPS = ['Plan', 'Travellers', 'Review', 'Payment', 'Done'];
export function PackageProgress({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <View style={s.progress} accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of ${STEPS.length}: ${STEPS[current]}`}>
      {STEPS.map((label, i) => {
        const done = i < current; const active = i === current;
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

/* ---------- summaries ---------- */

/** Compact trip recap shown on every step. */
export function PackageSummary({ pkg, date, endDate, counts }: { pkg: PackageSnapshot; date: string; endDate: string; counts: Counts }) {
  return (
    <View style={s.summary}>
      {pkg.image ? <Image source={{ uri: pkg.image }} style={s.thumb} /> : <View style={[s.thumb, s.thumbEmpty]}><Ionicons name="image-outline" size={22} color={Colors.textLight} /></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={s.place}><Ionicons name="location-outline" size={12} color={Colors.secondary} /><Text style={s.placeText} numberOfLines={1}>{pkg.destination}</Text></View>
        <Text style={s.title} numberOfLines={2}>{pkg.title}</Text>
        <Text style={s.meta} numberOfLines={1}>{pkg.duration} · {formatShortDate(date)} – {formatShortDate(endDate)}</Text>
        <Text style={s.meta} numberOfLines={1}>{countsLabel(counts)}</Text>
      </View>
    </View>
  );
}

export function PackageFareSummary({ fare, couponCode }: { fare: PackageFare; couponCode?: string | null }) {
  return (
    <View>
      <Row label={`Adults ${inr(fare.unit)} × ${fare.counts.adults}`} value={inr(fare.adultTotal)} />
      {fare.counts.children > 0 ? <Row label={`Children ${inr(fare.childUnit)} × ${fare.counts.children}`} value={inr(fare.childTotal)} /> : null}
      {fare.counts.infants > 0 ? <Row label={`Infants × ${fare.counts.infants}`} value="Free" tone="good" /> : null}
      <Row label="GST (5%)" value={inr(fare.gst)} />
      <Row label="Convenience fee" value={inr(fare.convenience)} />
      {fare.discount > 0 ? <Row label={`Coupon ${couponCode ?? ''}`.trim()} value={`− ${inr(fare.discount)}`} tone="good" /> : null}
      <View style={s.divider} />
      <Row label="Total payable" value={inr(fare.total)} bold />
    </View>
  );
}

/* ---------- inputs ---------- */

export function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const atMin = value <= min; const atMax = value >= max;
  return (
    <View style={s.stepper}>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={s.stepperLabel}>{label}</Text>{hint ? <Text style={s.stepperHint}>{hint}</Text> : null}</View>
      <View style={s.stepperControls}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Decrease ${label}`} disabled={atMin} onPress={() => onChange(value - 1)} style={[s.stepBtn, atMin && s.stepBtnOff]}><Ionicons name="remove" size={18} color={Colors.primary} /></TouchableOpacity>
        <Text style={s.stepValue} accessibilityLabel={`${label}: ${value}`}>{value}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Increase ${label}`} disabled={atMax} onPress={() => onChange(value + 1)} style={[s.stepBtn, atMax && s.stepBtnOff]}><Ionicons name="add" size={18} color={Colors.primary} /></TouchableOpacity>
      </View>
    </View>
  );
}

export function TypePill({ type }: { type: 'Adult' | 'Child' | 'Infant' }) {
  return <Pill label={type.toUpperCase()} tone={type === 'Adult' ? 'brand' : type === 'Child' ? 'warn' : 'neutral'} />;
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
  summary: { ...Ui.card, flexDirection: 'row', gap: 12, marginHorizontal: Ui.space.page, marginBottom: 14, padding: 12 },
  thumb: { width: 84, height: 96, borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  placeText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary, flexShrink: 1 },
  title: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 20, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 3 },
  meta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 3 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  stepperLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  stepperHint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  stepBtnOff: { opacity: 0.35 },
  stepValue: { minWidth: 30, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark },
});
