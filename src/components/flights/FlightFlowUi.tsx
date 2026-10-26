import { StepProgress } from '@/components/ui/StepProgress';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Pill } from '@/components/trains/TrainUi';
import { formatDuration, formatTime } from './flightFormat';
import { AirlineBadge, FlightRouteLine, TimeBlock } from './FlightParts';
import type { FlightFareOption, FlightOffer } from '@/components/flights/types';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useSegments, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroBox } from '@/components/packages/PackageUi';
import { AppScreen } from '@/components/AppScreen';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export { formatDuration, formatPrice, formatTime } from './flightFormat';

// Inter (static weights, loaded in app/_layout.tsx).
export const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
export const BRAND = '#103D30';
// Banner artwork lives in assets/images (file name as saved in the project).
const BANNER = require('../../../assets/images/herolatestnew.png');
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const STEPS = ['Select', 'Details', 'Seats', 'Review', 'Payment', 'Done'];

export const FLIGHT_ROUTES = {
  results: '/(tabs)/explore/flights',
  details: '/(tabs)/explore/flight-details',
  travellers: '/(tabs)/explore/flight-travellers',
  seats: '/(tabs)/explore/flight-seats',
  review: '/(tabs)/explore/flight-review',
  payment: '/(tabs)/explore/flight-payment',
  confirmation: '/(tabs)/explore/flight-confirmation',
} as const;

export { goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';

export function FlightShell({ children, footer, onBack, title = 'Flights' }: { children: ReactNode; footer?: ReactNode; onBack: () => void; title?: string }) {
  const insets = useSafeAreaInsets();
  // Inside the tab navigator the tab bar already covers the bottom system inset.
  const insideTabs = (useSegments() as string[]).includes('(tabs)');
  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={s.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.headerTitle}>{title}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as Href)} style={s.gearButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={BRAND} />
        </TouchableOpacity>
      </View>
      <View style={s.flex}>{children}</View>
      {footer ? <View style={[s.footerWrap, { paddingBottom: insideTabs ? 0 : Math.max(insets.bottom, 12) }]}>{footer}</View> : null}
    </AppScreen>
  );
}

export function FlightBanner({ title = 'Book flight tickets', text = 'Search routes, compare fares and pick the flight that suits you.', eyebrow = 'LEMONTRIP / FLIGHTS', image = BANNER }: { title?: string; text?: string; eyebrow?: string; image?: ImageSourcePropType }) {
  return (
    <HeroBox image={image} style={s.hero}>
      <LinearGradient pointerEvents="none" colors={['rgba(8,34,52,0.78)', 'rgba(8,34,52,0.45)', 'rgba(8,34,52,0.05)']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} style={StyleSheet.absoluteFill} />
      <View style={s.heroCopy}>
        <Text style={s.eyebrowLight}>{eyebrow}</Text>
        <Text style={s.bannerTitle} numberOfLines={2}>{title}</Text>
        <Text style={s.bannerText} numberOfLines={2}>{text}</Text>
      </View>
    </HeroBox>
  );
}

export function FlightSteps({ current, steps = STEPS, overlap = true }: { current: number; steps?: readonly string[]; overlap?: boolean }) {
  const inset = `${100 / (steps.length * 2)}%` as const;
  return (
    <View style={[s.card, s.pgCard, overlap && s.pgOverlap]} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps.length, now: current + 1 }}>
      <View style={s.stepsRow}>
        <View pointerEvents="none" style={[s.track, { left: inset, right: inset }]}><View style={[s.trackFill, { width: `${(current / (steps.length - 1)) * 100}%` }]} /></View>
        {steps.map((label, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <View key={label} style={s.stepItem}>
              <View style={[s.dot, (done || active) && s.dotDone]}>
                {done ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : <Text style={[s.dotText, active && s.dotTextOn]}>{i + 1}</Text>}
              </View>
              <Text style={[s.stepLabel, (done || active) && s.stepLabelOn]} numberOfLines={1}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function FlightHeading({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <View style={s.heading}>
      <View style={s.flex}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.headingText}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function FlightTag({ icon, label }: { icon?: IconName; label: string }) {
  return (
    <View style={s.tag}>
      {icon ? <Ionicons name={icon} size={13} color={BRAND} /> : null}
      <Text style={s.tagText} numberOfLines={1}>{label}</Text>
    </View>
  );
}


export function FlightSummaryCard({ offer, fare, date }: { offer: FlightOffer; fare?: FlightFareOption; date?: string }) {
  const stops = offer.stops === 0 ? 'Nonstop' : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`;
  return (
    <View style={s.card}>
      <View style={s.sumTop}>
        <AirlineBadge offer={offer} size={52} />
        <View style={s.flex}>
          <Text style={s.sumName} numberOfLines={1}>{offer.airline.name}</Text>
          <Text style={s.sumMeta} numberOfLines={1}>{offer.flightNumber} · {fare?.name?.replace(/\s*·\s*sample/i, '') ?? 'Standard'}</Text>
        </View>
        <FlightTag label={stops} />
      </View>
      <View style={s.sumTimes}>
        <View style={s.sumEnd}>
          <Text style={s.sumTime}>{formatTime(offer.departure.time)}</Text>
          <Text style={s.sumCode}>{offer.departure.airportCode}</Text>
          {date ? <Text style={s.sumDate}>{date}</Text> : null}
        </View>
        <View style={s.sumMid}>
          <Text style={s.sumMidText}>{formatDuration(offer.durationMinutes)}</Text>
          <View style={s.sumRoute}>
            <View style={s.sumDot} /><View style={s.sumRule} />
            <Ionicons name="airplane" size={14} color={BRAND} />
            <View style={s.sumRule} /><View style={s.sumDot} />
          </View>
          <Text style={s.sumMidText}>{stops}</Text>
        </View>
        <View style={[s.sumEnd, { alignItems: 'flex-end' }]}>
          <Text style={s.sumTime}>{formatTime(offer.arrival.time)}</Text>
          <Text style={s.sumCode}>{offer.arrival.airportCode}</Text>
          {date ? <Text style={s.sumDate}>{date}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export function FlightProgress({ current }: { current: 0 | 1 | 2 | 3 | 4 | 5 }) {
  return <StepProgress steps={STEPS} current={current} />;
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
  sumTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sumName: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.bodyLarge },
  sumMeta: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, marginTop: 2 },
  sumTimes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 18 },
  sumEnd: { minWidth: 84 },
  sumTime: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.displaySmall },
  sumCode: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body, marginTop: 6 },
  sumDate: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, marginTop: 4 },
  sumMid: { flex: 1, alignItems: 'center', gap: 6 },
  sumMidText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption },
  sumRoute: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center' },
  sumDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },
  sumRule: { flex: 1, height: 1.5, backgroundColor: Colors.borderStrong },
  flex: { flex: 1, minWidth: 0 },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: INTER.bold, flex: 1, color: BRAND, fontSize: TextSize.title },
  gearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.successSoft },
  hero: { alignSelf: 'stretch', width: '100%', overflow: 'hidden', minHeight: 190, paddingTop: 14, paddingBottom: 48, paddingHorizontal: 16, backgroundColor: '#0E3B52', justifyContent: 'flex-end' },
  heroCopy: { width: '78%', paddingTop: 30 },
  pgCard: { marginBottom: 12, paddingVertical: 12, paddingHorizontal: 4 },
  pgOverlap: { marginTop: -34 },
  eyebrowLight: { fontFamily: INTER.semibold, color: Colors.white, fontSize: 11, letterSpacing: 1.2 },
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: 24, lineHeight: 28, marginTop: 6 },
  bannerText: { color: Colors.white, fontFamily: INTER.regular, fontSize: 11, lineHeight: 16, marginTop: 10 },
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22, backgroundColor: Colors.surface },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  eyebrow: { fontFamily: INTER.extrabold, color: BRAND, fontSize: 11, letterSpacing: 1.2 },
  headingText: { fontFamily: INTER.extrabold, color: Colors.textDark, fontSize: 16, marginTop: 2 },
  stepsRow: { flexDirection: 'row' },
  track: { position: 'absolute', top: 14, height: 2, borderRadius: 1, backgroundColor: Colors.border },
  stepItem: { flex: 1, minWidth: 0, alignItems: 'center' },
  halo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  haloOn: { backgroundColor: Colors.accentSoft },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.borderStrong },
  dotDone: { backgroundColor: BRAND, borderColor: BRAND },
  dotText: { fontFamily: INTER.semibold, fontSize: 12, color: Colors.textLight },
  dotTextOn: { color: Colors.white },
  stepLabel: { marginTop: 5, maxWidth: '100%', fontFamily: INTER.regular, fontSize: 11, color: Colors.textLight },
  stepLabelOn: { fontFamily: INTER.semibold, color: BRAND },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E3EFE9' },
  tagText: { fontFamily: INTER.semibold, color: BRAND, fontSize: TextSize.caption },
  footerWrap: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  trackFill: { height: 2, backgroundColor: BRAND },
  summary: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  summaryMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
});