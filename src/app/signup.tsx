import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, AuthLegalLinks, GoogleAuthButton } from '@/components/auth/AuthLayout';
import { loginWithGoogle, sendPhoneOtp, signupWithEmail, verifyPhoneOtp } from '@/utils/authApi';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '' });
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateAndSignup = async () => {
    const nextErrors = { name: '', email: '', phone: '', password: '' };
    if (!name.trim()) nextErrors.name = 'Your name is required';
    if (mode === 'email') {
      if (!email.trim()) nextErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address';
      if (!password) nextErrors.password = 'Password is required';
      else if (password.length < 8) nextErrors.password = 'Use at least 8 characters';
    } else {
      if (!phone.trim()) nextErrors.phone = 'Mobile number is required';
      else if (phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Enter a valid mobile number';
      if (otpSent && !/^\d{6}$/.test(otp)) setOtpError('Enter the six-digit code');
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean) || (mode === 'phone' && otpSent && !/^\d{6}$/.test(otp))) return;
    setLoading(true);
    try {
      if (mode === 'email') {
        const result = await signupWithEmail({ name: name.trim(), email: email.trim(), password });
        Alert.alert('Verify your email', result.message, [{ text: 'Continue to sign in', onPress: () => router.replace('/login') }]);
      } else if (!otpSent) {
        await sendPhoneOtp({ phone: phone.trim(), purpose: 'signup', name: name.trim() });
        setOtpSent(true);
        Alert.alert('Code sent', 'Enter the verification code sent to your phone.');
      } else {
        await login(await verifyPhoneOtp({ phone: phone.trim(), code: otp, purpose: 'signup' }));
        router.replace('/(tabs)/profile');
      }
    } catch (error) {
      Alert.alert('Sign-up failed', error instanceof Error ? error.message : 'Please try again.');
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
      eyebrow="LEMONTRIP / CREATE ACCOUNT"
      title="Create your LemonTrip account"
      subtitle="Save your plans and keep every journey close."
      onBack={handleBack}>
      <AuthField
        label="Name"
        value={name}
        placeholder="Your full name"
        onChangeText={(value) => { setName(value); if (errors.name) setErrors((current) => ({ ...current, name: '' })); }}
        error={errors.name}
        autoCapitalize="words"
      />
      <View style={styles.modeSwitch}>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('email'); setOtpSent(false); }} style={[styles.modeButton, mode === 'email' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>Email + password</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('phone'); setOtpSent(false); }} style={[styles.modeButton, mode === 'phone' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>Phone OTP</Text></TouchableOpacity>
      </View>
      {mode === 'email' ? <AuthField
        label="Email"
        value={email}
        placeholder="you@example.com"
        onChangeText={(value) => { setEmail(value); if (errors.email) setErrors((current) => ({ ...current, email: '' })); }}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      /> : null}
      {mode === 'phone' ? <AuthField
        label="Mobile"
        value={phone}
        placeholder="+91 mobile number"
        onChangeText={(value) => { setPhone(value); if (errors.phone) setErrors((current) => ({ ...current, phone: '' })); }}
        error={errors.phone}
        autoCapitalize="none"
        keyboardType="phone-pad"
      /> : null}
      {mode === 'phone' && otpSent ? <AuthField label="Verification code" value={otp} placeholder="Six-digit code" onChangeText={(value) => { setOtp(value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }} error={otpError} keyboardType="phone-pad" autoCapitalize="none" /> : null}
      {mode === 'email' ? <AuthField
        label="Password"
        value={password}
        placeholder="Create a password"
        onChangeText={(value) => { setPassword(value); if (errors.password) setErrors((current) => ({ ...current, password: '' })); }}
        error={errors.password}
        secure={!showPassword}
        onToggleSecure={() => setShowPassword((visible) => !visible)}
        autoCapitalize="none"
      /> : null}

      <TouchableOpacity accessibilityRole="button" disabled={loading} style={[styles.primaryButton, loading && styles.disabledButton]} onPress={() => void validateAndSignup()}>
        <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : mode === 'phone' && !otpSent ? 'Send verification code' : mode === 'phone' ? 'Verify & create account' : 'Create account'}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Sign up with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken)); router.replace('/(tabs)/profile'); }} />

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.switchLink}>
        <Text style={styles.switchText}>Already have an account? <Text style={styles.switchTextStrong}>Login</Text></Text>
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
  primaryButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', marginTop: 1, borderRadius: 11, backgroundColor: Colors.primary },
  primaryButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  switchLink: { alignItems: 'center', marginTop: 13, paddingVertical: 4 },
  switchText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  switchTextStrong: { color: Colors.primary, fontWeight: '800' },
});