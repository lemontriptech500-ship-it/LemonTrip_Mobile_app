/**
 * Hotel flow UI kit. Same look as the holiday-package flow: photo hero, rounded step tracker that overlaps it,
 * white rounded cards and dark green actions. Layout primitives still come from the shared train kit.
 */
import { Text } from '@/components/ui/Text';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { HeroBox } from '@/components/packages/PackageUi';
import { Notice as BaseNotice, Pill as BasePill, PrimaryButton as BasePrimaryButton } from '@/components/trains/TrainUi';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';

export {
  Chip, EmptyState, Field, FlowScreen, FooterBar, Row,
  goBackOr, goTo, replaceTo,
} from '@/components/trains/TrainUi';

export const HOTEL_ROUTES = {
  results: '/(tabs)/explore/hotels',
  details: '/(tabs)/explore/hotel-details',
  guests: '/(tabs)/explore/hotel-guests',
  review: '/(tabs)/explore/hotel-review',
  payment: '/(tabs)/explore/hotel-payment',
  confirmation: '/(tabs)/explore/hotel-confirmation',
} as const;

const GREEN = '#103D30';
const STEPS = ['Room', 'Guests', 'Review', 'Payment', 'Done'];
const HOTEL_BANNER: ImageSourcePropType = require('../../../assets/images/Modern Plaza with Mosque and Pavilion.png');

/** Top bar (back + title) followed by the photo hero. Drop-in replacement for ScreenHeader. */
export function HotelHeader({ title, subtitle, onBack, eyebrow = 'LEMONTRIP / HOTELS' }: { title: string; subtitle?: string; onBack?: () => void; eyebrow?: string }) {
  return (
    <View>
      <View style={s.topBar}>
        {onBack ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={GREEN} /></TouchableOpacity> : <View style={s.backBtn} />}
        <Text accessibilityRole="header" style={s.topTitle}>Hotels</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[s.backBtn, { backgroundColor: Colors.successSoft }]}><Ionicons name="settings-outline" size={20} color={GREEN} /></TouchableOpacity>
      </View>
      <HeroBox image={HOTEL_BANNER} style={s.hero}>
        <LinearGradient pointerEvents="none" colors={['rgba(8,34,52,0.78)', 'rgba(8,34,52,0.45)', 'rgba(8,34,52,0.05)']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} style={StyleSheet.absoluteFill} />
        <View style={s.heroCopy}>
          <Text style={s.heroEyebrow}>{eyebrow}</Text>
          <Text style={s.heroTitle} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={s.heroSub} numberOfLines={2}>{subtitle}</Text> : null}
        </View>
      </HeroBox>
    </View>
  );
}

export function HotelProgress({ current, overlap = true }: { current: 0 | 1 | 2 | 3 | 4; overlap?: boolean }) {
  const count = STEPS.length;
  const inset = `${100 / (count * 2)}%` as const;
  return (
    <View style={[s.pgCard, overlap && s.pgOverlap]} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: count, now: current + 1 }}>
      <View style={s.pgRow}>
        <View pointerEvents="none" style={[s.pgTrack, { left: inset, right: inset }]}><View style={[s.pgFill, { width: `${(current / (count - 1)) * 100}%` }]} /></View>
        {STEPS.map((label, i) => {
          const done = i < current; const active = i === current;
          return (
            <View key={label} style={s.pgItem}>
              <View style={[s.pgDot, (done || active) && s.pgDotOn]}>
                {done ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : <Text style={[s.pgDotText, active && { color: Colors.white }]}>{i + 1}</Text>}
              </View>
              <Text style={[s.pgLabel, (done || active) && s.pgLabelOn]} numberOfLines={1}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) { return <View style={[s.card, style]}>{children}</View>; }

export function SectionTitle({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <View style={s.heading}>
      <View style={{ flex: 1, minWidth: 0 }}>{eyebrow ? <Text style={s.headEyebrow}>{eyebrow}</Text> : null}<Text style={s.headTitle}>{title}</Text></View>
      {right}
    </View>
  );
}

export function PrimaryButton(props: ComponentProps<typeof BasePrimaryButton>) { return <BasePrimaryButton {...props} variant={props.variant === 'soft' ? 'soft' : 'dark'} />; }
export function Pill({ tone, ...rest }: ComponentProps<typeof BasePill>) { return <BasePill {...rest} tone={tone === 'brand' || tone === 'warn' ? 'neutral' : tone} />; }
export function Notice({ tone, ...rest }: ComponentProps<typeof BaseNotice>) { return <BaseNotice {...rest} tone={tone === 'warn' ? 'info' : tone} />; }

const s = StyleSheet.create({
  topBar: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontFamily: 'Inter-Bold', fontSize: 18, color: GREEN },
  hero: { alignSelf: 'stretch', width: '100%', overflow: 'hidden', minHeight: 190, paddingTop: 14, paddingBottom: 48, paddingHorizontal: 16, backgroundColor: '#0E3B52', justifyContent: 'flex-end' },
  heroCopy: { width: '78%', paddingTop: 30 },
  heroEyebrow: { fontFamily: 'Inter-SemiBold', fontSize: 11, letterSpacing: 1.2, color: Colors.white },
  heroTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 24, lineHeight: 28, color: Colors.white, marginTop: 6 },
  heroSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16, color: Colors.white, marginTop: 10 },
  pgCard: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 22 },
  pgOverlap: { marginTop: -34 },
  pgRow: { flexDirection: 'row' },
  pgTrack: { position: 'absolute', top: 14, height: 2, borderRadius: 1, backgroundColor: Colors.border },
  pgFill: { height: 2, borderRadius: 1, backgroundColor: GREEN },
  pgItem: { flex: 1, minWidth: 0, alignItems: 'center' },
  pgDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderStrong },
  pgDotOn: { backgroundColor: GREEN, borderColor: GREEN },
  pgDotText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textLight },
  pgLabel: { marginTop: 5, maxWidth: '100%', fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight },
  pgLabelOn: { fontFamily: 'Inter-SemiBold', color: GREEN },
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  headEyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: GREEN },
  headTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
});