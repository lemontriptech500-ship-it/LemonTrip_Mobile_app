import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, AuthLegalLinks, GoogleAuthButton } from '@/components/auth/AuthLayout';
import { loginWithEmail, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } from '@/utils/authApi';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateAndLogin = async () => {
    setIdentifierError('');
    setPasswordError('');
    setOtpError('');

    if (!identifier.trim()) {
      setIdentifierError(mode === 'email' ? 'Email is required' : 'Mobile number is required');
      return;
    }
    if (mode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      setIdentifierError('Enter a valid email address');
      return;
    }
    if (mode === 'phone' && identifier.replace(/\D/g, '').length < 7) {
      setIdentifierError('Enter a valid mobile number');
      return;
    }

    if (mode === 'email' && !password) {
      setPasswordError('Password is required');
      return;
    }
    if (mode === 'phone' && otpSent && !/^\d{6}$/.test(otp)) {
      setOtpError('Enter the six-digit code');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'email') await login(await loginWithEmail({ email: identifier.trim(), password }));
      else if (!otpSent) {
        await sendPhoneOtp({ phone: identifier.trim(), purpose: 'login' });
        setOtpSent(true);
        Alert.alert('Code sent', 'If this number can be used, a verification code will arrive shortly.');
        return;
      } else await login(await verifyPhoneOtp({ phone: identifier.trim(), code: otp, purpose: 'login' }));
      router.replace('/(tabs)/profile');
    } catch (error) {
      Alert.alert('Sign-in failed', error instanceof Error ? error.message : 'Please try again.');
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
        placeholder={mode === 'email' ? 'you@example.com' : '+91 mobile number'}
        onChangeText={(value) => { setIdentifier(value); setOtpSent(false); if (identifierError) setIdentifierError(''); }}
        error={identifierError}
        autoCapitalize="none"
        keyboardType={mode === 'email' ? 'email-address' : 'phone-pad'}
      />
      <View style={styles.modeSwitch}>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('email'); setOtpSent(false); }} style={[styles.modeButton, mode === 'email' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>Email</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('phone'); setOtpSent(false); }} style={[styles.modeButton, mode === 'phone' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>Phone OTP</Text></TouchableOpacity>
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
      /> : otpSent ? <AuthField label="Verification code" value={otp} placeholder="Six-digit code" onChangeText={(value) => { setOtp(value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }} error={otpError} keyboardType="phone-pad" autoCapitalize="none" /> : null}

      {mode === 'email' ? <TouchableOpacity onPress={() => showUnavailable('Password reset')} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity> : null}

      <TouchableOpacity accessibilityRole="button" disabled={loading} style={[styles.primaryButton, loading && styles.disabledButton]} onPress={() => void validateAndLogin()}>
        <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : mode === 'phone' && !otpSent ? 'Send code' : mode === 'phone' ? 'Verify & sign in' : 'Login'}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Continue with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken)); router.replace('/(tabs)/profile'); }} />

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
