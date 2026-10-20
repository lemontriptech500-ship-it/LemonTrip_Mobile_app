import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode, Ref } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ImageSourcePropType, type TextInputProps } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const goTo = (path: string) => router.push(path as Href);
export const goBackOr = (fallback: string) => (router.canGoBack() ? router.back() : router.replace(fallback as Href));

/** Page shell for help-style screens: brand header, scrollable body, optional sticky footer. */
export function SupportPage({ title, subtitle, eyebrow = 'LEMONTRIP / SUPPORT', onBack, footer, scrollRef, onContentSizeChange, hero, children }: { hero?: { image: ImageSourcePropType; topTitle?: string; onSettings?: () => void }; title: string; subtitle?: string; eyebrow?: string; onBack?: () => void; footer?: ReactNode; scrollRef?: Ref<ScrollView>; onContentSizeChange?: (width: number, height: number) => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <AppScreen headerTone={hero ? 'light' : 'brand'}>
      {hero ? (
        <View style={s.topBar}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack ?? (() => goBackOr('/settings'))} style={s.topBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={s.topTitle}>{hero.topTitle ?? title}</Text>
          {hero.onSettings ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={hero.onSettings} style={[s.topBtn, s.topBtnTint]}>
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          ) : <View style={s.topBtn} />}
        </View>
      ) : null}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} onContentSizeChange={onContentSizeChange} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
          {hero ? (
            <View style={s.heroWrap}>
              <View style={s.hero}>
                <Image source={hero.image} resizeMode="cover" style={s.heroImg} />
                <View style={s.heroCopy}>
                  <Text style={s.heroEyebrow}>{eyebrow}</Text>
                  <Text style={s.heroTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
                  {subtitle ? <Text style={s.heroSub} numberOfLines={2}>{subtitle}</Text> : null}
                </View>
              </View>
            </View>
          ) : (
            <ScreenHeader title={title} subtitle={subtitle} eyebrow={eyebrow} onBack={onBack ?? (() => goBackOr('/settings'))} />
          )}
          {children}
        </ScrollView>
        {footer ? <View style={s.footer}><View style={[s.footerInner, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>{footer}</View></View> : null}
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

export function SupportCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SupportHeading({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <View style={s.heading}>
      <View style={{ flex: 1, minWidth: 0 }}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text style={s.headingText}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

/** Icon tile + title + optional detail + chevron. Put several inside a SupportCard with `last` on the final one. */
export function SupportItem({ icon, title, detail, onPress, last = false, trailing, tone }: { tone?: 'mint'; icon: IconName; title: string; detail?: string; onPress: () => void; last?: boolean; trailing?: ReactNode }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} onPress={onPress} activeOpacity={0.7} style={[s.item, !last && s.itemDivider]}>
      <View style={[s.itemIcon, tone === 'mint' && s.itemIconMint]}><Ionicons name={icon} size={19} color={Colors.primary} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.itemTitle}>{title}</Text>
        {detail ? <Text style={s.itemDetail} numberOfLines={2}>{detail}</Text> : null}
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />}
    </TouchableOpacity>
  );
}

export function SupportField({ label, error, multiline, counter, ...input }: TextInputProps & { label: string; error?: string; counter?: string }) {
  return (
    <View style={s.field}>
      <View style={s.fieldHead}><Text style={s.fieldLabel}>{label.toUpperCase()}</Text>{counter ? <Text style={s.counter}>{counter}</Text> : null}</View>
      <TextInput
        {...input}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={Colors.textLight}
        style={[s.input, multiline && s.inputMulti, !!error && s.inputError]}
      />
      {error ? <Text accessibilityRole="alert" style={s.errorText}>{error}</Text> : null}
    </View>
  );
}

export function SupportChip({ label, selected, onPress, icon, disabled }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName; disabled?: boolean }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: !!selected, disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[s.chip, selected && s.chipOn]}>
      {icon ? <Ionicons name={icon} size={14} color={selected ? Colors.white : Colors.primary} /> : null}
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SupportButton({ label, onPress, icon, loading, disabled, variant = 'accent' }: { label: string; onPress: () => void; icon?: IconName; loading?: boolean; disabled?: boolean; variant?: 'accent' | 'outline' | 'soft' }) {
  const off = !!loading || !!disabled;
  const bg = variant === 'accent' ? Colors.accent : variant === 'soft' ? Colors.surfaceMuted : Colors.surface;
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: off, busy: !!loading }} disabled={off} onPress={onPress} activeOpacity={0.85} style={[s.button, { backgroundColor: bg }, variant === 'outline' && s.buttonOutline, off && { opacity: 0.55 }]}>
      {loading ? <ActivityIndicator color={Colors.primaryDark} /> : <><Text style={s.buttonText}>{label}</Text>{icon ? <Ionicons name={icon} size={18} color={Colors.primaryDark} /> : null}</>}
    </TouchableOpacity>
  );
}

export function SupportNotice({ children, tone = 'info', icon }: { children: ReactNode; tone?: 'info' | 'error' | 'good'; icon?: IconName }) {
  const bg = tone === 'error' ? Colors.errorSoft : tone === 'good' ? Colors.successSoft : Colors.surfaceMuted;
  const fg = tone === 'error' ? Colors.error : tone === 'good' ? Colors.success : Colors.primary;
  return (
    <View accessibilityRole={tone === 'error' ? 'alert' : undefined} style={[s.notice, { backgroundColor: bg }]}>
      <Ionicons name={icon ?? (tone === 'error' ? 'alert-circle' : tone === 'good' ? 'checkmark-circle' : 'information-circle-outline')} size={18} color={fg} style={{ marginTop: 1 }} />
      <Text style={[s.noticeText, tone === 'error' && { color: Colors.error }]}>{children}</Text>
    </View>
  );
}

export const kit = { margin: Ui.space.page };

const s = StyleSheet.create({
  heroWrap: { paddingHorizontal: Ui.space.page, marginTop: 14, marginBottom: 16 },
  hero: { width: '100%', aspectRatio: 2170 / 725, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: '#103D30' },
  heroCopy: { width: '62%', paddingLeft: 18 },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  topBar: { backgroundColor: Colors.surface, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: Ui.space.page },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: 'Inter-Bold', fontSize: TextSize.title, color: '#103D30' },
  heroEyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: TextSize.micro, letterSpacing: 1.2, color: Colors.accent, marginBottom: 4 },
  heroTitle: { fontFamily: 'Inter-ExtraBold', fontSize: TextSize.displaySmall, color: '#FFFFFF' },
  heroSub: { fontFamily: 'Inter-Regular', fontSize: TextSize.body, lineHeight: 18, color: Colors.onDarkMuted, marginTop: 4 },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 28 },
  card: { ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 14, padding: Ui.space.card },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary, marginBottom: 3 },
  headingText: { fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  item: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemIconMint: { backgroundColor: Colors.successSoft, borderRadius: 20 },
  itemIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  itemTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  itemDetail: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 17, color: Colors.textLight, marginTop: 2 },
  field: { marginBottom: 14 },
  fieldHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, color: Colors.textLight },
  counter: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight },
  input: { minHeight: Ui.field.minHeight, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Ui.field.borderRadius, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, color: Colors.textDark },
  inputMulti: { minHeight: 130, textAlignVertical: 'top', paddingTop: 12 },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  errorText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark },
  chipTextOn: { color: Colors.white },
  button: { ...Ui.button, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  buttonOutline: { borderWidth: 1, borderColor: Colors.borderStrong },
  buttonText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  notice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, marginHorizontal: Ui.space.page, marginBottom: 14 },
  noticeText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, color: Colors.textDark },
  footer: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  footerInner: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: Ui.space.page, paddingVertical: 12 },
});