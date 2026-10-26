import * as React from 'react';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Pill } from '@/components/trains/TrainUi';
import { PriceDisplay } from '@/components/PriceDisplay';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { countsLabel, formatShortDate, inr, type PackageFare } from '@/data/packages';
import type { PackageSnapshot } from '@/utils/packageBookingStore';
import type { Counts } from '@/data/packages';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';

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

const STEPS = ['Select', 'Plan', 'Travellers', 'Review', 'Payment', 'Done'];
const GREEN = '#103D30';
/** Green step tracker for the whole package flow. `overlap` pulls it up over a hero image. */
export function PackageProgress({ current, overlap }: { current: 0 | 1 | 2 | 3 | 4 | 5; overlap?: boolean }) {
  const count = STEPS.length;
  const inset = `${100 / (count * 2)}%` as const;
  const fill = `${(current / (count - 1)) * 100}%` as const;
  return (
    <View style={[s.pgCard, overlap ? s.pgOverlap : s.pgPlain]} accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of ${count}: ${STEPS[current]}`} accessibilityValue={{ min: 1, max: count, now: current + 1 }}>
      <View style={s.pgRow}>
        <View pointerEvents="none" style={[s.pgTrack, { left: inset, right: inset }]}><View style={[s.pgFill, { width: fill }]} /></View>
        {STEPS.map((label, i) => {
          const done = i < current; const active = i === current;
          return (
            <View key={label} style={s.pgItem}>
              <View style={[s.pgDot, done && s.pgDotOn, active && s.pgDotOn]}>
                {done ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : <Text style={[s.pgDotText, active && s.pgDotTextOn]}>{i + 1}</Text>}
              </View>
              <Text style={[s.pgLabel, (done || active) && s.pgLabelOn]} numberOfLines={1}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- chrome shared by every step ---------- */

export function PackageTopBar({ onBack, title = 'Packages' }: { onBack: () => void; title?: string }) {
  return (
    <View style={s.topBar}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={GREEN} /></TouchableOpacity>
      <Text accessibilityRole="header" style={s.topTitle}>{title}</Text>
    </View>
  );
}

/** Hero container that measures itself and sizes its background image in exact pixels, so the photo always covers the full box. */
export function HeroBox({ uri, image, style, children }: { uri?: string; image?: import('react-native').ImageSourcePropType; style: any; children?: React.ReactNode }) {
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);
  return (
    <View style={[style, { overflow: 'hidden' }]} onLayout={(e) => { const { width, height } = e.nativeEvent.layout; setBox((p) => (p && p.w === width && p.h === height ? p : { w: width, h: height })); }}>
      {(uri || image) && box ? <Image key={`${box.w}x${box.h}`} source={image ?? { uri }} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: box.w, height: box.h }} /> : null}
      {children}
    </View>
  );
}

/** Green hero used under the top bar on steps 2-5. Leave room for the overlapping step tracker. */
export function PackageHero({ title, subtitle, image }: { title: string; subtitle: string; image?: string }) {
  return (
    <HeroBox uri={image} style={s.hero}>
      <LinearGradient pointerEvents="none" colors={['rgba(8,34,52,0.78)', 'rgba(8,34,52,0.45)', 'rgba(8,34,52,0.05)']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} style={StyleSheet.absoluteFill} />
      <View style={s.heroCopy}>
        <Text style={s.heroEyebrow}>LEMONTRIP / HOLIDAYS</Text>
        <Text style={s.heroTitle}>{title}</Text>
        <Text style={s.heroSub}>{subtitle}</Text>
      </View>
    </HeroBox>
  );
}

/** Sticky bottom bar: caption + amount on the left, dark green action on the right. */
export function PackageFooter({ caption, amount, estimateAmount, label, icon = 'arrow-forward', onPress, disabled }: { caption: string; amount: string; estimateAmount?: number; label: string; icon?: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void; disabled?: boolean }) {
  return (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption}>{caption}</Text>
        {estimateAmount === undefined ? <Text style={s.footerAmount} numberOfLines={1}>{amount}</Text> : <PriceDisplay amount={estimateAmount} currency="INR" amountStyle={s.footerAmount} />}
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[s.footerBtn, disabled && { opacity: 0.6 }]}>
        <Text style={s.footerBtnText}>{label}</Text>
        <View style={s.footerBtnArrow}><Ionicons name={icon} size={16} color={Colors.white} /></View>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- summaries ---------- */

const capitalise = (text: string) => text.replace(/\b\w/g, (c) => c.toUpperCase());

/** Compact trip recap shown on every step. */
export function PackageSummary({ pkg, date, endDate, counts, rooms, compact, onChange, changeLabel = 'Change package', changeIcon = 'swap-horizontal' }: { pkg: PackageSnapshot; date: string; endDate: string; counts: Counts; rooms?: number; compact?: boolean; onChange?: () => void; changeLabel?: string; changeIcon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={s.summary}>
      {pkg.image ? <Image source={{ uri: pkg.image }} style={s.thumb} /> : <View style={[s.thumb, s.thumbEmpty]}><Ionicons name="image-outline" size={22} color={Colors.textLight} /></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={s.placeRow}>
          <View style={s.place}><Ionicons name="location-outline" size={13} color={GREEN} /><Text style={s.placeText} numberOfLines={1}>{pkg.destination}</Text></View>
          {onChange ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={changeLabel} onPress={onChange} style={s.changeBtn}>
              <Ionicons name={changeIcon} size={13} color={GREEN} /><Text style={s.changeText}>{changeLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={s.title} numberOfLines={2}>{pkg.title}</Text>
        <View style={s.metaRow}>
          <Ionicons name="time-outline" size={13} color={Colors.textLight} /><Text style={s.meta} numberOfLines={1}>{pkg.duration}</Text>
          {compact ? <><View style={s.metaDivider} /><Ionicons name="airplane-outline" size={13} color={Colors.textLight} /><Text style={s.meta} numberOfLines={1}>{pkg.international ? 'International' : 'Domestic'}</Text></> : null}
        </View>
        {compact ? null : <Text style={[s.meta, { marginTop: 4 }]} numberOfLines={1}>{formatShortDate(date)} – {formatShortDate(endDate)}</Text>}
        <View style={s.metaRow}>
          <Ionicons name="people-outline" size={13} color={Colors.textLight} />
          <Text style={s.meta} numberOfLines={1}>{capitalise(countsLabel(counts))}{rooms ? ` · ${rooms} Room${rooms > 1 ? 's' : ''}` : ''}</Text>
        </View>
      </View>
    </View>
  );
}

function FareRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <View style={s.fareRow}><Text style={s.fareLabel}>{label}</Text><Text style={[s.fareValue, good && { color: Colors.success }]}>{value}</Text></View>;
}

export function PackageFareSummary({ fare, couponCode }: { fare: PackageFare; couponCode?: string | null }) {
  return (
    <View>
      <FareRow label={`Adults (${inr(fare.unit)} × ${fare.counts.adults})`} value={inr(fare.adultTotal)} />
      {fare.counts.children > 0 ? <FareRow label={`Children (${inr(fare.childUnit)} × ${fare.counts.children})`} value={inr(fare.childTotal)} /> : null}
      {fare.counts.infants > 0 ? <FareRow label={`Infants × ${fare.counts.infants}`} value="Free" good /> : null}
      <FareRow label="GST (5%)" value={inr(fare.gst)} />
      <FareRow label="Convenience fee" value={inr(fare.convenience)} />
      {fare.discount > 0 ? <FareRow label={`Coupon ${couponCode ?? ''}`.trim()} value={`− ${inr(fare.discount)}`} good /> : null}
      <View style={s.totalBar}><Text style={s.totalLabel}>Total payable</Text><Text style={s.totalValue}>{inr(fare.total)}</Text></View>
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
  topBar: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  topTitle: { flex: 1, fontFamily: 'Inter-Bold', fontSize: 18, color: GREEN },
  hero: { alignSelf: 'stretch', width: '100%', overflow: 'hidden', minHeight: 190, paddingTop: 14, paddingBottom: 48, paddingHorizontal: 16, backgroundColor: '#0E3B52', justifyContent: 'flex-end' },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroCopy: { width: '78%', paddingTop: 30 },
  heroEyebrow: { fontFamily: 'Inter-SemiBold', fontSize: 11, letterSpacing: 1.2, color: Colors.white },
  heroTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 24, lineHeight: 28, color: Colors.white, marginTop: 6 },
  heroSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16, color: Colors.white, marginTop: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flexShrink: 1, minWidth: 110, paddingRight: 14, borderRightWidth: 1, borderRightColor: Colors.border },
  footerCaption: { fontFamily: 'Inter-Regular', fontSize: 10, color: Colors.textLight },
  footerAmount: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  footerBtn: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 24, backgroundColor: GREEN },
  footerBtnText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
  footerBtnArrow: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E3F0EA' },
  changeText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: GREEN },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaDivider: { width: 1, height: 12, backgroundColor: Colors.border, marginHorizontal: 2 },
  fareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  fareLabel: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight },
  fareValue: { fontFamily: 'Inter-ExtraBold', fontSize: 12, color: Colors.textDark },
  totalBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#E3F0EA' },
  totalLabel: { fontFamily: 'Inter-ExtraBold', fontSize: 13, color: Colors.textDark },
  totalValue: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: GREEN },
  pgCard: { ...Ui.card, marginHorizontal: 10, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 22 },
  pgPlain: { marginTop: 14, marginBottom: 14 },
  pgOverlap: { marginTop: -34, marginBottom: 12 },
  pgRow: { flexDirection: 'row' },
  pgTrack: { position: 'absolute', top: 14, height: 2, borderRadius: 1, backgroundColor: Colors.border },
  pgFill: { height: 2, borderRadius: 1, backgroundColor: GREEN },
  pgItem: { flex: 1, minWidth: 0, alignItems: 'center' },
  pgDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderStrong },
  pgDotOn: { backgroundColor: GREEN, borderColor: GREEN },
  pgDotText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textLight },
  pgDotTextOn: { color: Colors.white },
  pgLabel: { marginTop: 5, maxWidth: '100%', fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight },
  pgLabelOn: { fontFamily: 'Inter-SemiBold', color: GREEN },
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
  summary: { ...Ui.card, flexDirection: 'row', gap: 12, marginHorizontal: 10, marginBottom: 12, padding: 12, borderRadius: 22 },
  thumb: { width: 88, height: 96, borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  place: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeText: { fontFamily: 'Inter-Regular', fontSize: 12, color: GREEN, flexShrink: 1 },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 17, lineHeight: 21, color: Colors.textDark, marginTop: 4 },
  meta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  stepperLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  stepperHint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  stepBtnOff: { opacity: 0.35 },
  stepValue: { minWidth: 30, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark },
});