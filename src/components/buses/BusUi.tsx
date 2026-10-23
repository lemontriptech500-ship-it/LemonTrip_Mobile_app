/**
 * Bus flow UI kit. The search page still uses the shared train-style primitives (re-exported below);
 * the booking steps (seats → done) use the same light layout as the flight flow.
 */
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { TextSize } from '@/constants/typography';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { BRAND, INTER, FlightBanner, FlightHeading, FlightShell, FlightSteps, FlightTag } from '@/components/flights/FlightFlowUi';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type ImageSourcePropType, type TextInputProps } from 'react-native';

export {
  Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle,
  goBackOr, goTo, replaceTo,
} from '@/components/trains/TrainUi';
export { BRAND, INTER };
export { FlightHeading as BusHeading, FlightTag as BusTag };

export const BUS_ROUTES = {
  results: '/(tabs)/explore/buses',
  details: '/(tabs)/explore/bus-details',
  passengers: '/(tabs)/explore/bus-passengers',
  review: '/(tabs)/explore/bus-review',
  payment: '/(tabs)/explore/bus-payment',
  confirmation: '/(tabs)/explore/bus-confirmation',
} as const;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Banner artwork lives in assets/images (file names as saved in the project).
const BUS_BANNER = require('../../../assets/images/Emerald Highway Journey.png');
export const BUS_DONE_BANNER: ImageSourcePropType = require('../../../assets/images/Celebratory Green Payment Confirmation Banner.png');

const BUS_STEPS = ['Seats', 'Passengers', 'Review', 'Payment', 'Done'] as const;

export function BusShell({ children, footer, onBack }: { children: ReactNode; footer?: ReactNode; onBack: () => void }) {
  return <FlightShell title="Buses" onBack={onBack} footer={footer}>{children}</FlightShell>;
}
export function BusBanner({ title, text }: { title: string; text: string }) {
  return <FlightBanner eyebrow="LEMONTRIP / BUS" image={BUS_BANNER} title={title} text={text} />;
}
export function BusSteps({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return <FlightSteps steps={BUS_STEPS} current={current} />;
}
/** Kept for screens that still import the old name. */
export const BusProgress = BusSteps;

export function BusCardBox({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function BusFooter({ caption, amount, label, icon, onPress, disabled, loading }: { caption: string; amount: string; label: string; icon: IconName; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption} numberOfLines={1}>{caption}</Text>
        <Text style={s.footerAmount} numberOfLines={1}>{amount}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!loading }} disabled={disabled || loading} onPress={onPress} activeOpacity={0.85} style={[s.continue, (disabled || loading) && { opacity: 0.6 }]}>
        <Text style={s.continueText} numberOfLines={1}>{label}</Text>
        {loading ? <ActivityIndicator color={BRAND} /> : <Ionicons name={icon} size={20} color={BRAND} />}
      </TouchableOpacity>
    </View>
  );
}

export function BusInput({ label, icon, error, ...input }: TextInputProps & { label: string; icon?: IconName; error?: string }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.input, !!error && s.inputError]}>
        {icon ? <Ionicons name={icon} size={20} color={Colors.textLight} /> : null}
        <TextInput {...input} placeholderTextColor={Colors.textLight} style={s.inputText} accessibilityLabel={label} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function BusRow({ label, value, bold, good }: { label: string; value: string; bold?: boolean; good?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && s.rowBold]} numberOfLines={2}>{label}</Text>
      <Text style={[s.rowValue, bold && s.rowBold, good && { color: Colors.secondary }]}>{value}</Text>
    </View>
  );
}

export function BusNotice({ icon = 'information-circle-outline', title, children, tone = 'info' }: { icon?: IconName; title?: string; children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <View style={[s.notice, tone === 'warn' && s.noticeWarn]}>
      <Ionicons name={icon} size={22} color={Colors.textLight} />
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? <Text style={s.noticeTitle}>{title}</Text> : null}
        <Text style={s.noticeText}>{children}</Text>
      </View>
    </View>
  );
}

export const busStyles = StyleSheet.create({
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
});

const s = StyleSheet.create({
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flex: 1, minWidth: 0 },
  footerCaption: { fontFamily: INTER.medium, color: BRAND, fontSize: TextSize.caption },
  footerAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.heading, marginTop: 1 },
  continue: { minWidth: 168, maxWidth: '62%', height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, borderRadius: 27, backgroundColor: Colors.accent },
  continueText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.bodyLarge, flexShrink: 1 },
  field: { marginBottom: 12 },
  label: { fontFamily: INTER.semibold, fontSize: TextSize.caption, letterSpacing: 0.6, color: Colors.secondary, marginBottom: 8 },
  input: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.surfaceMuted, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  inputText: { flex: 1, minWidth: 0, minHeight: 52, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 5 },
  rowLabel: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  rowValue: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND, textAlign: 'right' },
  rowBold: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  noticeWarn: { backgroundColor: '#FBF1C7' },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  noticeText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 2 },
});