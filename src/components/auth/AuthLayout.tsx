import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

WebBrowser.maybeCompleteAuthSession();

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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  onToggleSecure?: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function AuthLayout({ eyebrow, title, subtitle, onBack, children }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.layout}>
          <View style={styles.authHeader}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={18} color={Colors.white} />
            </TouchableOpacity>
            <View accessibilityLabel="LemonTrip" style={styles.lemonMark}>
              <View style={styles.lemonFruit} />
              <View style={styles.lemonLeaf} />
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.formPane}>
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.formWrap}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <View style={styles.formContent}>{children}</View>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
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
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=90' }}
      resizeMode="cover"
      style={[styles.visual, style]}
      imageStyle={styles.visualImage}>
      <View style={styles.visualShade} />
      <View style={[styles.visualCopy, compact && styles.visualCopyCompact]}>
        <View style={styles.brandRow}><LemonTripBrand size={54} /></View>
        <View style={[styles.visualMessage, compact && { paddingBottom: 8 }]}>
          {!compact ? <>
            <Text style={styles.visualEyebrow}>YOUR NEXT STORY IS OUT THERE</Text>
            <Text style={styles.visualTitle}>Make room for somewhere new.</Text>
            <Text style={styles.visualSubtitle}>Thoughtful travel starts with a single step.</Text>
          </> : <><Text style={styles.visualEyebrow}>YOUR NEXT STORY STARTS HERE</Text><Text style={[styles.visualTitle, { fontSize: 24, lineHeight: 30 }]}>Welcome to a world of possibilities.</Text></>}
        </View>
      </View>
    </ImageBackground>
  );
}

export function AuthField({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  secure = false,
  onToggleSecure,
  icon,
}: AuthFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        {icon ? <Ionicons name={icon} size={18} color={Colors.secondary} style={styles.fieldIcon} /> : null}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          autoCorrect={false}
          style={styles.input}
        />
        {onToggleSecure ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={secure ? 'Show password' : 'Hide password'} onPress={onToggleSecure} style={styles.visibilityButton}>
            <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={17} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function OtpCodeField({ value, onChangeText, error }: { value: string; onChangeText: (value: string) => void; error?: string }) {
  return (
    <View style={styles.otpFieldWrap}>
      <View style={styles.otpBoxes}>
        {Array.from({ length: 6 }, (_, index) => (
          <View key={index} style={[styles.otpBox, error && styles.inputWrapError, index === value.length && styles.otpBoxActive]}>
            <Text style={styles.otpDigit}>{value[index] ?? ''}</Text>
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Six-digit verification code"
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        style={styles.otpInputOverlay}
      />
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
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
        <Text style={styles.googleButtonText}>{label}</Text>
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
  safeArea: { flex: 1, backgroundColor: Colors.primaryDark },
  keyboardAvoiding: { flex: 1 },
  layout: { flex: 1 },
  layoutDesktop: { flexDirection: 'row' },
  visual: { overflow: 'hidden', backgroundColor: Colors.primaryDark },
  desktopVisual: { flex: 1.05, minWidth: 0 },
  mobileVisual: { height: 220, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  visualImage: {},
  visualShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 35, 23, 0.38)' },
  visualCopy: { flex: 1, justifyContent: 'space-between', padding: 30 },
  visualCopyCompact: { justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accent },
  brandMarkText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  brandName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  visualMessage: { maxWidth: 480, paddingBottom: 22 },
  visualEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  visualTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 34, lineHeight: 41, fontWeight: '900', marginTop: 9 },
  visualSubtitle: { color: 'rgba(255,255,255,0.86)', fontFamily: 'Manrope', fontSize: 12, marginTop: 9 },
  formPane: { flex: 1, minWidth: 0, backgroundColor: Colors.background },
  formScroll: { flex: 1 },
  formScrollContent: { flexGrow: 1, justifyContent: 'flex-start', paddingHorizontal: 18, paddingVertical: 24 },
  formScrollContentDesktop: { paddingHorizontal: 38 },
  formWrap: { ...Ui.card, padding: 20, width: '100%', maxWidth: 460, alignSelf: 'center' },
  authNav: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, marginBottom: 14, borderRadius: 18 },
  backButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)' },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 26, lineHeight: 32, fontWeight: '900', marginTop: 5 },
  subtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 20 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', marginBottom: 6 },
  inputWrap: { minHeight: Ui.field.minHeight, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.surface },
  inputWrapError: { borderColor: Colors.error },
  input: { minHeight: Ui.field.minHeight,  flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },
  visibilityButton: { width: 40, height: 42, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.error, fontFamily: 'Manrope', fontSize: 13, marginTop: 4 },
  googleButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.surface },
  googleButtonDisabled: { opacity: 0.55 },
  googleError: { color: Colors.error, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center' },
  googleMark: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  googleMarkText: { color: '#4285F4', fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' },
  googleButtonText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 },
  legalText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 },
  legalLink: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, fontWeight: '800' },
});