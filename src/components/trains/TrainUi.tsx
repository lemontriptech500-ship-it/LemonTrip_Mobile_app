import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, type TextInputProps } from 'react-native';
import { AppScreen } from '@/components/AppScreen';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const goTo = (path: string, params?: Record<string, string>) => router.push((params ? { pathname: path, params } : path) as Href);
export const replaceTo = (path: string) => router.replace(path as Href);
export const goBackOr = (fallback: string) => (router.canGoBack() ? router.back() : router.replace(fallback as Href));

export const TRAIN_ROUTES = {
  results: '/(tabs)/explore/trains',
  details: '/(tabs)/explore/train-details',
  passengers: '/(tabs)/explore/train-passengers',
  review: '/(tabs)/explore/train-review',
  payment: '/(tabs)/explore/train-payment',
  confirmation: '/(tabs)/explore/train-confirmation',
} as const;

/* ---------- progress ---------- */

const STEPS = ['Select', 'Passengers', 'Review', 'Payment', 'Done'];
export function TrainProgress({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
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

/* ---------- layout ---------- */

/** Screen with scrollable body + optional sticky footer. */
export function FlowScreen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <AppScreen edges={['top']}>
      <View style={s.flex}>{children}</View>
      {footer ? <View style={s.footerWrap}>{footer}</View> : null}
    </AppScreen>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) { return <View style={[s.card, style]}>{children}</View>; }

export function SectionTitle({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <View style={s.sectionTitle}>
      <View style={s.flex}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text style={s.sectionText}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Pill({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'brand'; icon?: IconName }) {
  const palette = { neutral: [Colors.surfaceMuted, Colors.primary], good: [Colors.successSoft, Colors.success], warn: [Colors.accentSoft, '#7A5B00'], bad: [Colors.errorSoft, Colors.error], brand: [Colors.accent, Colors.primaryDark] }[tone];
  return <View style={[s.pill, { backgroundColor: palette[0] }]}>{icon ? <Ionicons name={icon} size={11} color={palette[1]} /> : null}<Text style={[s.pillText, { color: palette[1] }]}>{label}</Text></View>;
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress} style={[s.chip, selected && s.chipOn]}>
      {icon ? <Ionicons name={icon} size={13} color={selected ? Colors.white : Colors.primary} /> : null}
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: 'good' }) {
  return <View style={s.row}><Text style={[s.rowLabel, bold && s.rowBold]}>{label}</Text><Text style={[s.rowValue, bold && s.rowBold, tone === 'good' && { color: Colors.success }]}>{value}</Text></View>;
}

/* ---------- inputs ---------- */

export function Field({ label, error, icon, ...input }: TextInputProps & { label: string; error?: string; icon?: IconName }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.inputWrap, !!error && s.inputError]}>
        {icon ? <Ionicons name={icon} size={16} color={Colors.primary} /> : null}
        <TextInput {...input} placeholderTextColor={Colors.textLight} style={s.input} accessibilityLabel={label} />
      </View>
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, loading, disabled, icon, variant = 'accent' }: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; icon?: IconName; variant?: 'accent' | 'dark' | 'soft' }) {
  const bg = variant === 'accent' ? Colors.accent : variant === 'dark' ? Colors.primary : Colors.surfaceMuted;
  const fg = variant === 'dark' ? Colors.white : Colors.primaryDark;
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!loading }} disabled={disabled || loading} onPress={onPress} style={[s.button, { backgroundColor: bg }, (disabled || loading) && { opacity: 0.6 }]}>
      {loading ? <ActivityIndicator color={fg} /> : <><Text style={[s.buttonText, { color: fg }]}>{label}</Text>{icon ? <Ionicons name={icon} size={18} color={fg} /> : null}</>}
    </TouchableOpacity>
  );
}

/** Sticky bottom bar: price on the left, action on the right. */
export function FooterBar({ caption, amount, action }: { caption: string; amount: string; action: ReactNode }) {
  return (
    <View style={s.footer}>
      <View style={s.footerPrice}><Text style={s.footerCaption}>{caption}</Text><Text style={s.footerAmount}>{amount}</Text></View>
      <View style={s.footerAction}>{action}</View>
    </View>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return <View style={s.empty}><View style={s.emptyIcon}><Ionicons name={icon} size={26} color={Colors.primary} /></View><Text style={s.emptyTitle}>{title}</Text><Text style={s.emptyText}>{text}</Text>{action ? <View style={{ marginTop: 14, alignSelf: 'stretch' }}>{action}</View> : null}</View>;
}

export function Notice({ icon = 'information-circle-outline', title, children, tone = 'info' }: { icon?: IconName; title?: string; children: ReactNode; tone?: 'info' | 'warn' | 'good' }) {
  const bg = tone === 'warn' ? Colors.accentSoft : tone === 'good' ? Colors.successSoft : Colors.surfaceMuted;
  return <View style={[s.notice, { backgroundColor: bg }]}><Ionicons name={icon} size={18} color={Colors.primary} style={{ marginTop: 1 }} /><View style={s.flex}>{title ? <Text style={s.noticeTitle}>{title}</Text> : null}<Text style={s.noticeText}>{children}</Text></View></View>;
}

/* ---------- styles ---------- */

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  progress: { flexDirection: 'row', marginHorizontal: Ui.space.page, marginBottom: 16, paddingVertical: 12, paddingHorizontal: 8, ...Ui.card, borderRadius: 18 },
  progressItem: { flex: 1, alignItems: 'center' },
  progressLine: { position: 'absolute', top: 11, right: '50%', width: '100%', height: 2, backgroundColor: Colors.border },
  progressLineOn: { backgroundColor: Colors.primary },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.borderStrong },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotActive: { borderColor: Colors.primary, backgroundColor: Colors.accent },
  dotText: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', color: Colors.textLight },
  dotTextActive: { color: Colors.primaryDark },
  stepLabel: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', color: Colors.textLight, marginTop: 5 },
  stepLabelOn: { color: Colors.primary },
  footerWrap: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  card: { ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 14, padding: Ui.space.card },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary, marginBottom: 3 },
  sectionText: { fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', color: Colors.textDark },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textDark },
  chipTextOn: { color: Colors.white },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 6 },
  rowLabel: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textLight, flexShrink: 1 },
  rowValue: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textDark, textAlign: 'right', flexShrink: 1 },
  rowBold: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  field: { marginBottom: 12 },
  fieldLabel: { ...Ui.eyebrow, letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  inputWrap: { minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: Ui.field.borderRadius, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  input: { flex: 1, minWidth: 0, minHeight: Ui.field.minHeight, fontFamily: 'Manrope', fontSize: 15, color: Colors.textDark },
  errorText: { fontFamily: 'Manrope', fontSize: 12, color: Colors.error, marginTop: 4 },
  button: { ...Ui.button, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  buttonText: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: Ui.space.page, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { minWidth: 96 },
  footerCaption: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, fontWeight: '700' },
  footerAmount: { fontFamily: 'Manrope', fontSize: 20, fontWeight: '800', color: Colors.primaryDark, marginTop: 1 },
  footerAction: { flex: 1 },
  empty: { alignItems: 'center', padding: 28, marginHorizontal: Ui.space.page, ...Ui.card },
  emptyIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  emptyTitle: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', color: Colors.textDark, marginTop: 12, textAlign: 'center' },
  emptyText: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, color: Colors.textLight, marginTop: 5, textAlign: 'center' },
  notice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, marginHorizontal: Ui.space.page, marginBottom: 14 },
  noticeTitle: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primaryDark, marginBottom: 2 },
  noticeText: { fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, color: Colors.textDark },
});
