import { Pressable, TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getGoogleIdToken, signOutGoogleUser } from '@/utils/googleNativeAuth';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions, type TextInput as NativeTextInput } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

WebBrowser.maybeCompleteAuthSession();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  onBack: () => void;
  children: ReactNode;
};

type AuthFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  icon?: IconName;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  maxLength?: number;
  secure?: boolean;
  onToggleSecure?: () => void;
};

/* ---------- layout ---------- */

const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const HERO = require('../../../assets/images/Hot Air Balloons Over Mountain Lake.png');
const LOGO = require('../../../assets/images/Glossy Lemon Trip Logo.png');

export function AuthLayout({ title, subtitle, onBack, children }: AuthLayoutProps) {
  const { height } = useWindowDimensions();
  const heroHeight = Math.max(260, Math.min(height * 0.32, 320));
  const verify = title === 'Verify your number';

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.formScroll} contentContainerStyle={styles.scrollGrow} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">
          <View style={styles.column}>
            <ImageBackground source={HERO} resizeMode="cover" style={[styles.hero, { height: heroHeight }]}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.heroBackBtn}>
                <Ionicons name="arrow-back" size={20} color={Colors.primaryDark} />
              </TouchableOpacity>
              <Image source={LOGO} resizeMode="contain" accessibilityLabel="LemonTrip" style={styles.heroLogo} />
              <View style={styles.heroCopy}>
                {/* <View style={styles.goldLine} /> */}
                {verify ? <Text style={styles.heroTitle}>{title}</Text> : (
                  <>
                    <Text style={styles.heroTitle}>Your Next Adventure</Text>
                    <Text style={[styles.heroTitle, styles.heroTitleGold]}>Starts Here.</Text>
                  </>
                )}
                <Text style={styles.heroSub}>{subtitle}</Text>
                <View style={styles.goldLine} />
              </View>
            </ImageBackground>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- form pieces ---------- */

export function AuthField({ label, value, placeholder, onChangeText, error, hint, icon, autoCapitalize = 'sentences', keyboardType = 'default', maxLength, secure = false, onToggleSecure }: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const fieldBg = error ? Colors.errorSoft : focused ? Colors.surface : Colors.background;
  const autofillFix = Platform.OS === 'web' ? ({ boxShadow: `0 0 0 100px ${fieldBg} inset` } as object) : null;
  return (
    <View style={styles.fieldGroup}>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, !!error && styles.inputWrapError]}>
        {icon ? <Ionicons name={icon} size={17} color={error ? Colors.error : Colors.primary} style={styles.inputIcon} /> : null}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secure}
          autoCorrect={false}
          style={[styles.input, !icon && { paddingLeft: 14 }, autofillFix]}
        />
        {onToggleSecure ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={secure ? 'Show password' : 'Hide password'} onPress={onToggleSecure} style={styles.visibilityButton}>
            <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={18} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
}

/** Six boxes backed by one hidden numeric input, so SMS autofill and paste keep working. */
export function OtpCodeField({ value, onChangeText, error }: { value: string; onChangeText: (value: string) => void; error?: string }) {
  const ref = useRef<NativeTextInput>(null);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>VERIFICATION CODE</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Enter verification code" onPress={() => ref.current?.focus()} style={styles.otpRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={[styles.otpBox, value.length === i && styles.otpBoxActive, !!error && styles.otpBoxError]}>
            <Text style={styles.otpDigit}>{value[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={ref}
        accessibilityLabel="Verification code"
        value={value}
        onChangeText={onChangeText}
        maxLength={6}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        caretHidden
        style={styles.otpHidden}
      />
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function AuthButton({ label, onPress, loading = false, disabled = false }: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean }) {
  const off = loading || disabled;
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: off, busy: loading }} disabled={off} onPress={onPress} activeOpacity={0.85} style={[styles.primaryButton, off && styles.primaryButtonOff]}>
      {loading ? <ActivityIndicator color={Colors.white} /> : null}
      <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : label}</Text>
      {!loading ? <View style={styles.arrowCircle}><Ionicons name="arrow-forward" size={18} color={Colors.primaryDark} /></View> : null}
    </TouchableOpacity>
  );
}

export function AuthDivider({ label = 'OR' }: { label?: string }) {
  return <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>{label}</Text><View style={styles.divider} /></View>;
}

export function AuthLink({ children, onPress, align = 'center' }: { children: ReactNode; onPress: () => void; align?: 'center' | 'right' }) {
  return <TouchableOpacity accessibilityRole="link" onPress={onPress} hitSlop={8} style={[styles.link, align === 'right' && { alignSelf: 'flex-end' }]}><Text style={styles.linkText}>{children}</Text></TouchableOpacity>;
}

export function AuthSwitch({ prompt, action, onPress }: { prompt: string; action: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="link" accessibilityLabel={`${prompt} ${action}`} onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }} style={styles.switchLink}>
      <Text style={styles.switchText}>{prompt} <Text style={styles.switchTextStrong}>{action}</Text></Text>
    </TouchableOpacity>
  );
}

export function AuthNotice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' }) {
  const bad = tone === 'error';
  return (
    <View accessibilityRole={bad ? 'alert' : undefined} style={[styles.notice, bad && styles.noticeError]}>
      <Ionicons name={bad ? 'alert-circle' : 'information-circle-outline'} size={17} color={bad ? Colors.error : Colors.primary} style={{ marginTop: 1 }} />
      <Text style={[styles.noticeText, bad && { color: Colors.error }]}>{children}</Text>
    </View>
  );
}

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <Path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <Path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <Path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </Svg>
  );
}

export function GoogleAuthButton({ label, onSuccess }: { label: string; onSuccess: (idToken: string) => Promise<void> }) {
  const clientIds = {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim(),
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim(),
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim(),
  };
  const isPlaceholder = (value?: string) => !value || value.startsWith('your-google-');
  // Native Google Sign-In needs the WEB client ID (it is the token audience); iOS also needs its own client ID.
  const configured = Platform.OS === 'ios'
    ? !isPlaceholder(clientIds.webClientId) && !isPlaceholder(clientIds.iosClientId)
    : !isPlaceholder(clientIds.webClientId);

  if (!configured) {
    return (
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: true }} disabled style={[styles.googleButton, styles.googleButtonDisabled]}>
        <View style={styles.googleMark}><GoogleLogo /></View>
        <Text style={styles.googleButtonText}>Google sign-in not configured</Text>
      </TouchableOpacity>
    );
  }

  if (Platform.OS === 'web') return <ConfiguredGoogleAuthButton label={label} onSuccess={onSuccess} {...clientIds} />;
  return <NativeGoogleAuthButton label={label} onSuccess={onSuccess} />;
}

function NativeGoogleAuthButton({ label, onSuccess }: { label: string; onSuccess: (idToken: string) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const startGoogleAuth = async () => {
    if (loading) return;
    setAuthError('');
    setLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      if (!idToken) return; // cancelled by the user
      await onSuccess(idToken); // backend exchange + navigation happen in the screen
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
      void signOutGoogleUser(); // so the next attempt shows the account picker (e.g. to pick a different account)
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={() => void startGoogleAuth()} style={[styles.googleButton, loading && styles.googleButtonDisabled]}>
        <View style={styles.googleMark}><GoogleLogo /></View>
        <Text style={styles.googleButtonText}>{loading ? 'Connecting to Google…' : label}</Text>
      </TouchableOpacity>
      {authError ? <Text accessibilityRole="alert" style={styles.googleError}>{authError}</Text> : null}
    </View>
  );
}

function ConfiguredGoogleAuthButton({
  label,
  onSuccess,
  webClientId,
  iosClientId,
  androidClientId,
}: {
  label: string;
  onSuccess: (idToken: string) => Promise<void>;
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
}) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
  });
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const handledResponse = useRef<unknown>(null);

  useEffect(() => {
    if (!response || response.type !== 'success' || response === handledResponse.current) return;

    handledResponse.current = response;
    const idToken = response.params.id_token;
    void Promise.resolve()
      .then(() => {
        if (!idToken) throw new Error('Google did not return a verified identity token. Please try again.');
        return onSuccess(idToken);
      })
      .catch((error) => setAuthError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [response, onSuccess]);

  const startGoogleAuth = async () => {
    setAuthError('');
    setLoading(true);
    try {
      const result = await promptAsync();

      if (result.type === 'error') {
        setAuthError('Google sign-in could not be completed. Check the OAuth client configuration and try again.');
        setLoading(false);
        return;
      }
      if (result.type !== 'success') setLoading(false);
    } catch {
      setAuthError('Google sign-in could not start. Check the OAuth client ID and authorized redirect URI.');
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity accessibilityRole="button" disabled={!request || loading} onPress={() => void startGoogleAuth()} style={[styles.googleButton, (!request || loading) && styles.googleButtonDisabled]}>
        <View style={styles.googleMark}><GoogleLogo /></View>
        <Text style={styles.googleButtonText}>{!request ? 'Preparing Google sign-in…' : loading ? 'Connecting to Google…' : label}</Text>
      </TouchableOpacity>
      {authError ? <Text accessibilityRole="alert" style={styles.googleError}>{authError}</Text> : null}
    </View>
  );
}

export function AuthLegalLinks({ onTerms, onPrivacy }: { onTerms: () => void; onPrivacy: () => void }) {
  return (
    <View style={styles.legalRow}>
      <Text style={styles.legalText}>By continuing, you agree to our </Text>
      <TouchableOpacity onPress={onTerms}><Text style={styles.legalLink}>Terms</Text></TouchableOpacity>
      <Text style={styles.legalText}> and </Text>
      <TouchableOpacity onPress={onPrivacy}><Text style={styles.legalLink}>Privacy Policy</Text></TouchableOpacity>
      <Text style={styles.legalText}>.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scrollGrow: { flexGrow: 1 },
  column: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  hero: { overflow: 'hidden', justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 47, backgroundColor: Colors.primaryDark },
  heroBackBtn: { position: 'absolute', top: 16, left: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.white },
  heroLogo: { position: 'absolute', top: 12, right: 20, width: 58, height: 41 },
  heroCopy: { gap: 4 },
  goldLine: { width: 28, height: 2, marginVertical: 8, backgroundColor: Colors.accent },
  heroTitle: { color: Colors.white, fontFamily: INTER.bold, fontSize: TextSize.displaySmall, lineHeight: 30 },
  heroTitleGold: { color: Colors.white },
  heroSub: { color: Colors.white, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, marginTop: 6, maxWidth: 340 },
  sheet: { flexGrow: 1, marginTop: -32, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: Colors.surface },
  handle: { alignSelf: 'center', width: 54, height: 5, borderRadius: 3, marginBottom: 28, backgroundColor: Colors.border },
  arrowCircle: { position: 'absolute', right: 8, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.white },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoiding: { flex: 1 },
  layout: { flex: 1 },
  layoutDesktop: { flexDirection: 'row' },
  visual: { overflow: 'hidden', backgroundColor: Colors.primaryDark },
  desktopVisual: { flex: 1.05, minWidth: 0 },
  mobileVisual: { height: 230, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  visualShade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.heroOverlay },
  visualCopy: { flex: 1, justifyContent: 'space-between', padding: 30 },
  visualCopyCompact: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 44 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  visualMessage: { maxWidth: 480, paddingBottom: 22 },
  visualEyebrow: { color: Colors.accent, fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.3 },
  visualTitle: { color: Colors.white, fontFamily: INTER.extrabold, fontSize: TextSize.hero, lineHeight: 41, marginTop: 9 },
  visualTitleCompact: { fontSize: TextSize.displaySmall, lineHeight: 28, marginTop: 6, maxWidth: 300 },
  visualSubtitle: { color: Colors.onDarkMuted, fontFamily: INTER.regular, fontSize: TextSize.body, marginTop: 9 },
  heroBack: { position: 'absolute', top: 14, left: 16, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.onDarkSurface },
  formPane: { flex: 1, minWidth: 0, backgroundColor: Colors.background },
  formScroll: { flex: 1 },
  formScrollContent: { flexGrow: 1, paddingBottom: 28 },
  formScrollContentDesktop: { justifyContent: 'center', paddingHorizontal: 38, paddingVertical: 24 },
  formWrap: { ...Ui.card, padding: 22, width: '100%', maxWidth: 460, alignSelf: 'center' },
  formWrapMobile: { marginTop: -34, width: undefined, marginHorizontal: 16, alignSelf: 'stretch' },
  backPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, marginBottom: 16, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  backPillText: { color: Colors.primary, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  eyebrow: { color: Colors.secondary, fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.1 },
  title: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.display, lineHeight: 33, marginTop: 5 },
  subtitle: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 19, marginTop: 5, marginBottom: 22 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: Colors.textLight, fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 0.9, marginBottom: 6 },
  inputWrap: { overflow: 'hidden', minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.field.borderRadius, backgroundColor: Colors.background },
  inputWrapFocused: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  inputWrapError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  inputIcon: { marginLeft: 13 },
  input: { minHeight: Ui.field.minHeight, flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: INTER.regular, fontSize: TextSize.body, paddingLeft: 9, paddingRight: 12, paddingVertical: 10 },
  visibilityButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.error, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 17, marginTop: 5 },
  hintText: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 17, marginTop: 5 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  otpBox: { flex: 1, maxWidth: 52, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  otpBoxActive: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  otpBoxError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  otpDigit: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.displaySmall },
  otpHidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  primaryButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Ui.radius.button, backgroundColor: '#103D30' },
  primaryButtonOff: { opacity: 0.6 },
  primaryButtonText: { color: Colors.white, fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textLight, fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1 },
  link: { paddingVertical: 6 },
  linkText: { color: Colors.primary, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  switchLink: { alignItems: 'center', marginTop: 16, paddingVertical: 8, minHeight: 44, justifyContent: 'center' },
  switchText: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.body },
  switchTextStrong: { color: Colors.primary, fontFamily: INTER.extrabold },
  notice: { flexDirection: 'row', gap: 9, padding: 12, borderRadius: 14, marginBottom: 12, backgroundColor: Colors.surfaceMuted },
  noticeError: { backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.errorBorder },
  noticeText: { flex: 1, color: Colors.textDark, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18 },
  googleButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: Ui.radius.button, backgroundColor: Colors.surface },
  googleButtonDisabled: { opacity: 0.55 },
  googleError: { color: Colors.error, fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 19, marginTop: 6, textAlign: 'center' },
  googleMark: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  googleMarkText: { color: Colors.googleBlue, fontFamily: INTER.extrabold, fontSize: TextSize.title },
  googleButtonText: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: TextSize.body },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 },
  legalText: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18 },
  legalLink: { color: Colors.primary, fontFamily: INTER.extrabold, fontSize: TextSize.caption, lineHeight: 18 },
});