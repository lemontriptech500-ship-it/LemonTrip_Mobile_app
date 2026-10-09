import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, GoogleAuthButton, OtpCodeField } from '@/components/auth/AuthLayout';
import { exchangeFirebasePhoneIdentity, loginWithEmail, loginWithGoogle, normalizePhoneInput } from '@/utils/authApi';
import { useFirebasePhoneOtp } from '@/utils/useFirebasePhoneOtp';
import { login } from '@/utils/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const phoneOtp = useFirebasePhoneOtp();
  const [mode, setMode] = useState<'email' | 'phone'>(initialMode === 'phone' ? 'phone' : 'email');
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
    if (identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      setIdentifierError('Enter a valid email address');
      return;
    }
    const authMode = identifier.includes('@') ? 'email' : 'phone';
    const phoneNumber = authMode === 'phone' ? normalizePhoneInput(identifier) : null;
    if (authMode === 'phone' && !phoneNumber) {
      setIdentifierError('Enter a valid number. India (+91) is used when no country code is entered.');
      return;
    }

    if (authMode === 'email' && !password) {
      setPasswordError('Password is required');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'email') await login(await loginWithEmail({ email: identifier.trim(), password }));
      else if (!phoneOtp.challenge) { await phoneOtp.sendCode(phoneNumber!); return; }
      else {
        const idToken = await phoneOtp.verifyCode();
        if (!idToken) return;
        await login(await exchangeFirebasePhoneIdentity({ idToken, purpose: 'login' }));
      }
      router.replace('/(tabs)/profile');
    } catch (error) {
      if (authMode === 'phone') phoneOtp.showError(error instanceof Error ? error.message : 'Phone sign-in could not be completed.');
      else Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };



  return (
    <AuthLayout
      eyebrow="LEMONTRIP / LOGIN"
      title={mode === 'phone' && phoneOtp.challenge ? 'Verify Your Number' : 'Welcome Back'}
      subtitle={mode === 'phone' && phoneOtp.challenge
        ? `Enter the six-digit code sent to ${normalizePhoneInput(identifier) ?? identifier}.`
        : 'Log in to continue your journey.'}
      onBack={handleBack}>
      {!phoneOtp.challenge ? <>
      <AuthField
        label="Email or Mobile Number"
        value={identifier}
        placeholder="Email or mobile number"
        onChangeText={(value) => {
          setIdentifier(value);
          setMode(value.trim() && /^[+\d\s()-]+$/.test(value.trim()) ? 'phone' : 'email');
          if (phoneOtp.challenge) void phoneOtp.reset();
          if (identifierError) setIdentifierError('');
        }}
        error={identifierError}
        autoCapitalize="none"
        keyboardType="email-address"
        icon={mode === 'email' ? 'mail-outline' : 'call-outline'}
      />
      </> : null}
      {mode === 'email' ? <AuthField
        label="Password"
        value={password}
        placeholder="Enter your password"
        onChangeText={(value) => { setPassword(value); if (passwordError) setPasswordError(''); }}
        error={passwordError}
        secure={!showPassword}
        onToggleSecure={() => setShowPassword((visible) => !visible)}
        autoCapitalize="none"
        icon="lock-closed-outline"
      /> : phoneOtp.challenge ? <>
        <OtpCodeField value={phoneOtp.code} onChangeText={phoneOtp.setCode} error={phoneOtp.error} />
        <View style={styles.otpActions}>
          <TouchableOpacity accessibilityRole="button" onPress={() => void phoneOtp.reset()}><Text style={styles.otpActionText}>Edit phone</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={phoneOtp.busy || phoneOtp.resendSeconds > 0} onPress={() => { const phone = normalizePhoneInput(identifier); if (phone) void phoneOtp.sendCode(phone); }}>
            <Text style={[styles.otpActionText, (phoneOtp.busy || phoneOtp.resendSeconds > 0) && styles.otpActionDisabled]}>{phoneOtp.resendSeconds > 0 ? `Resend in ${phoneOtp.resendSeconds}s` : 'Resend code'}</Text>
          </TouchableOpacity>
        </View>
      </> : null}
      {mode === 'phone' && !phoneOtp.challenge && Platform.OS === 'web' ? <View id="lemontrip-phone-recaptcha" style={styles.recaptcha} /> : null}
      {mode === 'phone' && !phoneOtp.challenge ? <Text style={styles.smsNotice}>We’ll send an SMS to verify your number. Standard messaging rates may apply.</Text> : null}
      {mode === 'phone' && phoneOtp.error && !phoneOtp.challenge ? <Text accessibilityRole="alert" style={styles.phoneError}>{phoneOtp.error}</Text> : null}

      {mode === 'email' ? <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity> : null}

      <TouchableOpacity accessibilityRole="button" disabled={loading || phoneOtp.busy} style={[styles.primaryButton, (loading || phoneOtp.busy) && styles.disabledButton]} onPress={() => void validateAndLogin()}>
        <Text style={styles.primaryButtonText}>{loading || phoneOtp.busy ? 'Please wait…' : mode === 'phone' && !phoneOtp.challenge ? 'Send OTP' : mode === 'phone' ? 'Verify' : 'Log In'}</Text>
      </TouchableOpacity>

      {!phoneOtp.challenge ? <>
      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Continue with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken, 'login')); router.replace('/(tabs)/profile'); }} />

      <TouchableOpacity onPress={() => router.push('/signup')} style={styles.switchLink}>
        <Text style={styles.switchText}>Don’t have an account? <Text style={styles.switchTextStrong}>Sign Up</Text></Text>
      </TouchableOpacity>
      </> : null}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  otpActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, marginBottom: 10 },
  otpActionText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  otpActionDisabled: { color: Colors.textLight },
  recaptcha: { minHeight: 78, alignItems: 'flex-start', marginTop: 8, marginBottom: 8 },
  smsNotice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  phoneError: { color: Colors.error, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  disabledButton: { opacity: 0.6 },
  forgotRow: { alignSelf: 'flex-end', marginTop: -3, marginBottom: 11, paddingVertical: 5 },
  forgotText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  primaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  switchLink: { alignItems: 'center', marginTop: 15, paddingVertical: 5 },
  switchText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  switchTextStrong: { color: Colors.primary, fontWeight: '800' },
});
