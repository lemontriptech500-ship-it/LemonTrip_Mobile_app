import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { LemonTripBrand } from '@/components/BrandGradientBar';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getGoogleIdToken, signOutGoogleUser } from '@/utils/googleNativeAuth';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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

export function AuthLayout({ eyebrow, title, subtitle, onBack, children }: AuthLayoutProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.layout, desktop && styles.layoutDesktop]}>
          {desktop ? <TravelVisual style={styles.desktopVisual} /> : null}
          <View style={styles.formPane}>
            <ScrollView style={styles.formScroll} contentContainerStyle={[styles.formScrollContent, desktop && styles.formScrollContentDesktop]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {!desktop ? (
                <View>
                  <TravelVisual style={styles.mobileVisual} compact />
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.heroBack}>
                    <Ionicons name="arrow-back" size={19} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={[styles.formWrap, !desktop && styles.formWrapMobile]}>
                {desktop ? (
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backPill}>
                    <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                    <Text style={styles.backPillText}>Back</Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                {children}
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TravelVisual({ style, compact = false }: { style: object; compact?: boolean }) {
  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=90' }} resizeMode="cover" style={[styles.visual, style]}>
      <View style={styles.visualShade} />
      <View style={[styles.visualCopy, compact && styles.visualCopyCompact]}>
        <View style={styles.brandRow}><LemonTripBrand size={compact ? 44 : 54} /></View>
        <View style={styles.visualMessage}>
          <Text style={styles.visualEyebrow}>{compact ? 'YOUR NEXT STORY STARTS HERE' : 'YOUR NEXT STORY IS OUT THERE'}</Text>
          <Text style={[styles.visualTitle, compact && styles.visualTitleCompact]}>{compact ? 'Welcome to a world of possibilities.' : 'Make room for somewhere new.'}</Text>
          {!compact ? <Text style={styles.visualSubtitle}>Thoughtful travel starts with a single step.</Text> : null}
        </View>
      </View>
    </ImageBackground>
  );
}

/* ---------- form pieces ---------- */

export function AuthField({ label, value, placeholder, onChangeText, error, hint, icon, autoCapitalize = 'sentences', keyboardType = 'default', maxLength, secure = false, onToggleSecure }: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
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
          style={[styles.input, !icon && { paddingLeft: 14 }]}
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
  const ref = useRef<TextInput>(null);
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
      {loading ? <ActivityIndicator color={Colors.primaryDark} /> : null}
      <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : label}</Text>
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
        <View style={styles.googleMark}><Text style={styles.googleMarkText}>G</Text></View>
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
        <View style={styles.googleMark}><Text style={styles.googleMarkText}>G</Text></View>
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
        <View style={styles.googleMark}><Text style={styles.googleMarkText}>G</Text></View>
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
  visualEyebrow: { color: Colors.accent, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1.3 },
  visualTitle: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.hero, lineHeight: 41, fontWeight: FontWeight.extraBold, marginTop: 9 },
  visualTitleCompact: { fontSize: TextSize.displaySmall, lineHeight: 28, marginTop: 6, maxWidth: 300 },
  visualSubtitle: { color: Colors.onDarkMuted, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 9 },
  heroBack: { position: 'absolute', top: 14, left: 16, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.onDarkSurface },
  formPane: { flex: 1, minWidth: 0, backgroundColor: Colors.background },
  formScroll: { flex: 1 },
  formScrollContent: { flexGrow: 1, paddingBottom: 28 },
  formScrollContentDesktop: { justifyContent: 'center', paddingHorizontal: 38, paddingVertical: 24 },
  formWrap: { ...Ui.card, padding: 22, width: '100%', maxWidth: 460, alignSelf: 'center' },
  formWrapMobile: { marginTop: -34, width: undefined, marginHorizontal: 16, alignSelf: 'stretch' },
  backPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, marginBottom: 16, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  backPillText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  eyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1.1 },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.display, lineHeight: 33, fontWeight: FontWeight.extraBold, marginTop: 5 },
  subtitle: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 5, marginBottom: 22 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, marginBottom: 6 },
  inputWrap: { minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.field.borderRadius, backgroundColor: Colors.background },
  inputWrapFocused: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  inputWrapError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  inputIcon: { marginLeft: 13 },
  input: { minHeight: Ui.field.minHeight, flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, paddingLeft: 9, paddingRight: 12, paddingVertical: 10 },
  visibilityButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.error, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 17, marginTop: 5 },
  hintText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 17, marginTop: 5 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  otpBox: { flex: 1, maxWidth: 52, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  otpBoxActive: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  otpBoxError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  otpDigit: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold },
  otpHidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  primaryButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  primaryButtonOff: { opacity: 0.6 },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  link: { paddingVertical: 6 },
  linkText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  switchLink: { alignItems: 'center', marginTop: 16, paddingVertical: 8, minHeight: 44, justifyContent: 'center' },
  switchText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  switchTextStrong: { color: Colors.primary, fontWeight: FontWeight.extraBold },
  notice: { flexDirection: 'row', gap: 9, padding: 12, borderRadius: 14, marginBottom: 12, backgroundColor: Colors.surfaceMuted },
  noticeError: { backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.errorBorder },
  noticeText: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  googleButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: Ui.radius.button, backgroundColor: Colors.surface },
  googleButtonDisabled: { opacity: 0.55 },
  googleError: { color: Colors.error, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 6, textAlign: 'center' },
  googleMark: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  googleMarkText: { color: Colors.googleBlue, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  googleButtonText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 },
  legalText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  legalLink: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, fontWeight: FontWeight.extraBold },
});
