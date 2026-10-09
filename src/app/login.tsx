import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, AuthLegalLinks, GoogleAuthButton } from '@/components/auth/AuthLayout';
import { exchangeFirebasePhoneIdentity, loginWithEmail, loginWithGoogle, normalizePhoneInput } from '@/utils/authApi';
import { useFirebasePhoneOtp } from '@/utils/useFirebasePhoneOtp';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const phoneOtp = useFirebasePhoneOtp();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear reCAPTCHA when leaving the screen so it never touches a removed element.
  useEffect(() => () => { void phoneOtp.reset(); }, []);

  const validateAndLogin = async () => {
    setIdentifierError('');
    setPasswordError('');

    if (!identifier.trim()) {
      setIdentifierError(mode === 'email' ? 'Email is required' : 'Mobile number is required');
      return;
    }
    if (mode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      setIdentifierError('Enter a valid email address');
      return;
    }
    const phoneNumber = mode === 'phone' ? normalizePhoneInput(identifier) : null;
    if (mode === 'phone' && !phoneNumber) {
      setIdentifierError('Enter a valid number. India (+91) is used when no country code is entered.');
      return;
    }

    if (mode === 'email' && !password) {
      setPasswordError('Password is required');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'email') await login(await loginWithEmail({ email: identifier.trim(), password }));
      else if (!phoneOtp.challenge) { await phoneOtp.sendCode(phoneNumber!); return; }
      else {
        const idToken = await phoneOtp.verifyCode();
        if (!idToken) return;
        await login(await exchangeFirebasePhoneIdentity({ idToken, purpose: 'login' }));
      }
      router.replace('/(tabs)/profile');
    } catch (error) {
      if (mode === 'phone') phoneOtp.showError(error instanceof Error ? error.message : 'Phone sign-in could not be completed.');
      else Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const showUnavailable = (feature: string) => {
    Alert.alert(feature, `${feature} is not connected yet. Contact hello@lemontrip.in for help.`);
  };

  return (
    <AuthLayout
      eyebrow="LEMONTRIP / LOGIN"
      title="Welcome back"
      subtitle="Sign in to pick up where your journey left off."
      onBack={handleBack}>
      <AuthField
        label={mode === 'email' ? 'Email' : 'Mobile number'}
        value={identifier}
        placeholder={mode === 'email' ? 'you@example.com' : 'Phone number (+91 default)'}
        onChangeText={(value) => { setIdentifier(value); if (phoneOtp.challenge) void phoneOtp.reset(); if (identifierError) setIdentifierError(''); }}
        error={identifierError}
        autoCapitalize="none"
        keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'}
      />
      <View style={styles.modeSwitch}>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('email'); void phoneOtp.reset(); }} style={[styles.modeButton, mode === 'email' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>Email</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('phone'); void phoneOtp.reset(); }} style={[styles.modeButton, mode === 'phone' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>Phone OTP</Text></TouchableOpacity>
      </View>
      {mode === 'email' ? <AuthField
        label="Password"
        value={password}
        placeholder="Enter your password"
        onChangeText={(value) => { setPassword(value); if (passwordError) setPasswordError(''); }}
        error={passwordError}
        secure={!showPassword}
        onToggleSecure={() => setShowPassword((visible) => !visible)}
        autoCapitalize="none"
      /> : phoneOtp.challenge ? <>
        <AuthField label="Verification code" value={phoneOtp.code} placeholder="Six-digit code" onChangeText={phoneOtp.setCode} error={phoneOtp.error} keyboardType="phone-pad" autoCapitalize="none" />
        <View style={styles.otpActions}>
          <TouchableOpacity accessibilityRole="button" onPress={() => void phoneOtp.reset()}><Text style={styles.otpActionText}>Edit phone</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={phoneOtp.busy || phoneOtp.resendSeconds > 0} onPress={() => { const phone = normalizePhoneInput(identifier); if (phone) void phoneOtp.sendCode(phone); }}>
            <Text style={[styles.otpActionText, (phoneOtp.busy || phoneOtp.resendSeconds > 0) && styles.otpActionDisabled]}>{phoneOtp.resendSeconds > 0 ? `Resend in ${phoneOtp.resendSeconds}s` : 'Resend code'}</Text>
          </TouchableOpacity>
        </View>
      </> : null}
      {mode === 'phone' && Platform.OS === 'web' ? <View id="lemontrip-phone-recaptcha" style={styles.recaptcha} /> : null}
      {mode === 'phone' ? <Text style={styles.smsNotice}>We’ll send an SMS to verify your number. Standard messaging rates may apply.</Text> : null}
      {mode === 'phone' && phoneOtp.error && !phoneOtp.challenge ? <Text accessibilityRole="alert" style={styles.phoneError}>{phoneOtp.error}</Text> : null}

      {mode === 'email' ? <TouchableOpacity onPress={() => showUnavailable('Password reset')} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity> : null}

      <TouchableOpacity accessibilityRole="button" disabled={loading || phoneOtp.busy} style={[styles.primaryButton, (loading || phoneOtp.busy) && styles.disabledButton]} onPress={() => void validateAndLogin()}>
        <Text style={styles.primaryButtonText}>{loading || phoneOtp.busy ? 'Please wait…' : mode === 'phone' && !phoneOtp.challenge ? 'Send code' : mode === 'phone' ? 'Verify & sign in' : 'Login'}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Continue with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken, 'login')); router.replace('/(tabs)/profile'); }} />

      <TouchableOpacity onPress={() => router.push('/signup')} style={styles.switchLink}>
        <Text style={styles.switchText}>New to LemonTrip? <Text style={styles.switchTextStrong}>Create an account</Text></Text>
      </TouchableOpacity>
      <AuthLegalLinks onTerms={() => showUnavailable('Terms')} onPrivacy={() => showUnavailable('Privacy policy')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  modeSwitch: { flexDirection: 'row', padding: 3, marginBottom: 12, borderRadius: 10, backgroundColor: Colors.surfaceMuted },
  modeButton: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  modeButtonActive: { backgroundColor: Colors.surface },
  modeText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  modeTextActive: { color: Colors.primary, fontWeight: '900' },
  otpActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, marginBottom: 10 },
  otpActionText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  otpActionDisabled: { color: Colors.textLight },
  recaptcha: { minHeight: 78, alignItems: 'flex-start', marginTop: 8, marginBottom: 8 },
  smsNotice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 14, marginBottom: 8 },
  phoneError: { color: '#B42318', fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginBottom: 8 },
  disabledButton: { opacity: 0.6 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -3, marginBottom: 11, paddingVertical: 5 },
  forgotText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  primaryButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.primary },
  primaryButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  switchLink: { alignItems: 'center', marginTop: 15, paddingVertical: 5 },
  switchText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  switchTextStrong: { color: Colors.primary, fontWeight: '800' },
});