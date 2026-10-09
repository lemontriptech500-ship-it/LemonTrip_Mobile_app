import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, AuthLegalLinks, GoogleAuthButton } from '@/components/auth/AuthLayout';
import { exchangeFirebasePhoneIdentity, loginWithGoogle, normalizePhoneInput, signupWithEmail } from '@/utils/authApi';
import { useFirebasePhoneOtp } from '@/utils/useFirebasePhoneOtp';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const phoneOtp = useFirebasePhoneOtp();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Clear reCAPTCHA when leaving the screen so it never touches a removed element.
  useEffect(() => () => { void phoneOtp.reset(); }, []);

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
      else if (!normalizePhoneInput(phone)) nextErrors.phone = 'Enter a valid number. India (+91) is used when no country code is entered.';
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setLoading(true);
    try {
      if (mode === 'email') {
        const result = await signupWithEmail({ name: name.trim(), email: email.trim(), password });
        Alert.alert('Verify your email', result.message, [{ text: 'Continue to sign in', onPress: () => router.replace('/login') }]);
      } else if (!phoneOtp.challenge) {
        await phoneOtp.sendCode(normalizePhoneInput(phone)!);
        return;
      } else {
        const idToken = await phoneOtp.verifyCode();
        if (!idToken) return;
        await login(await exchangeFirebasePhoneIdentity({ idToken, purpose: 'signup', name: name.trim() }));
        router.replace('/(tabs)/profile');
      }
    } catch (error) {
      if (mode === 'phone') {
        const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code : '';
        phoneOtp.showError(error instanceof Error ? error.message : 'Phone registration could not be completed.', code);
      } else Alert.alert('Sign-up failed', error instanceof Error ? error.message : 'Please try again.');
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
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('email'); void phoneOtp.reset(); }} style={[styles.modeButton, mode === 'email' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>Email + password</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => { setMode('phone'); void phoneOtp.reset(); }} style={[styles.modeButton, mode === 'phone' && styles.modeButtonActive]}><Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>Phone OTP</Text></TouchableOpacity>
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
        placeholder="Phone number (+91 default)"
        onChangeText={(value) => { setPhone(value); if (phoneOtp.challenge) void phoneOtp.reset(); if (errors.phone) setErrors((current) => ({ ...current, phone: '' })); }}
        error={errors.phone}
        autoCapitalize="none"
        keyboardType="phone-pad"
      /> : null}
      {mode === 'phone' && phoneOtp.challenge ? <>
        <AuthField label="Verification code" value={phoneOtp.code} placeholder="Six-digit code" onChangeText={phoneOtp.setCode} error={phoneOtp.error} keyboardType="phone-pad" autoCapitalize="none" />
        <View style={styles.otpActions}>
          <TouchableOpacity accessibilityRole="button" onPress={() => void phoneOtp.reset()}><Text style={styles.otpActionText}>Edit phone</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={phoneOtp.busy || phoneOtp.resendSeconds > 0} onPress={() => { const number = normalizePhoneInput(phone); if (number) void phoneOtp.sendCode(number); }}>
            <Text style={[styles.otpActionText, (phoneOtp.busy || phoneOtp.resendSeconds > 0) && styles.otpActionDisabled]}>{phoneOtp.resendSeconds > 0 ? `Resend in ${phoneOtp.resendSeconds}s` : 'Resend code'}</Text>
          </TouchableOpacity>
        </View>
      </> : null}
      {mode === 'phone' && Platform.OS === 'web' ? <View id="lemontrip-phone-recaptcha" style={styles.recaptcha} /> : null}
      {mode === 'phone' ? <Text style={styles.smsNotice}>We’ll send an SMS to verify your number. Standard messaging rates may apply.</Text> : null}
      {mode === 'phone' && phoneOtp.error && !phoneOtp.challenge ? <Text accessibilityRole="alert" style={styles.phoneError}>{phoneOtp.error}</Text> : null}
      {mode === 'phone' && phoneOtp.errorCode === 'PHONE_ACCOUNT_EXISTS' ? <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/login')} style={styles.accountLink}><Text style={styles.accountLinkText}>Sign in to your existing account</Text></TouchableOpacity> : null}
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

      <TouchableOpacity accessibilityRole="button" disabled={loading || phoneOtp.busy} style={[styles.primaryButton, (loading || phoneOtp.busy) && styles.disabledButton]} onPress={() => void validateAndSignup()}>
        <Text style={styles.primaryButtonText}>{loading || phoneOtp.busy ? 'Please wait…' : mode === 'phone' && !phoneOtp.challenge ? 'Send verification code' : mode === 'phone' ? 'Verify & create account' : 'Create account'}</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Sign up with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken, 'signup')); router.replace('/(tabs)/profile'); }} />

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
  otpActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, marginBottom: 10 },
  otpActionText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  otpActionDisabled: { color: Colors.textLight },
  recaptcha: { minHeight: 78, alignItems: 'flex-start', marginTop: 8, marginBottom: 8 },
  smsNotice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 14, marginBottom: 8 },
  phoneError: { color: '#B42318', fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginBottom: 8 },
  accountLink: { alignItems: 'center', paddingVertical: 8 },
  accountLinkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
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