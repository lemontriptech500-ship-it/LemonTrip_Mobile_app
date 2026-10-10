import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { AuthButton, AuthDivider, AuthField, AuthLayout, AuthLegalLinks, AuthLink, AuthNotice, AuthSwitch, GoogleAuthButton, OtpCodeField } from '@/components/auth/AuthLayout';
import { exchangeFirebasePhoneIdentity, loginWithGoogle, normalizePhoneInput, signupWithEmail } from '@/utils/authApi';
import { useFirebasePhoneOtp } from '@/utils/useFirebasePhoneOtp';
import { login } from '@/utils/authStore';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  useEffect(() => () => { phoneOtp.reset().catch(() => undefined); }, []);

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
    else router.replace('/login');
  };

  const verifying = mode === 'phone' && !!phoneOtp.challenge;
  const busy = loading || phoneOtp.busy;

  return (
    <AuthLayout
      eyebrow="LEMONTRIP / CREATE ACCOUNT"
      title={verifying ? 'Verify your number' : 'Create your account'}
      subtitle={verifying ? `Enter the six-digit code sent to ${normalizePhoneInput(phone) ?? phone}.` : 'Join LemonTrip and keep every trip in one place.'}
      onBack={handleBack}>
      {!phoneOtp.challenge ? (
        <>
          <AuthField
            label="Full name"
            value={name}
            placeholder="Your full name"
            onChangeText={(value) => { setName(value); if (errors.name) setErrors((current) => ({ ...current, name: '' })); }}
            error={errors.name}
            autoCapitalize="words"
            icon="person-outline"
          />
          <AuthField
            label="Email or mobile number"
            value={mode === 'email' ? email : phone}
            placeholder="you@example.com or 98765 43210"
            onChangeText={(value) => {
              const phoneMode = Boolean(value.trim()) && /^[+\d\s()-]+$/.test(value.trim());
              setMode(phoneMode ? 'phone' : 'email');
              if (phoneMode) {
                setPhone(value);
                if (errors.phone) setErrors((current) => ({ ...current, phone: '' }));
              } else {
                setEmail(value);
                if (errors.email) setErrors((current) => ({ ...current, email: '' }));
              }
              if (phoneOtp.challenge) void phoneOtp.reset();
            }}
            error={mode === 'phone' ? errors.phone : errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={mode === 'phone' ? 'call-outline' : 'mail-outline'}
          />
        </>
      ) : null}

      {mode === 'phone' && phoneOtp.challenge ? (
        <>
          <OtpCodeField value={phoneOtp.code} onChangeText={phoneOtp.setCode} error={phoneOtp.error} />
          <View style={styles.otpActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => void phoneOtp.reset()}><Text style={styles.otpActionText}>Edit phone</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={phoneOtp.busy || phoneOtp.resendSeconds > 0} onPress={() => { const number = normalizePhoneInput(phone); if (number) void phoneOtp.sendCode(number); }}>
              <Text style={[styles.otpActionText, (phoneOtp.busy || phoneOtp.resendSeconds > 0) && styles.otpActionDisabled]}>{phoneOtp.resendSeconds > 0 ? `Resend in ${phoneOtp.resendSeconds}s` : 'Resend code'}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {mode === 'phone' && !phoneOtp.challenge && Platform.OS === 'web' ? <View id="lemontrip-phone-recaptcha" style={styles.recaptcha} /> : null}
      {mode === 'phone' && !phoneOtp.challenge ? <AuthNotice>We’ll send an SMS to verify your number. Standard messaging rates may apply.</AuthNotice> : null}
      {mode === 'phone' && phoneOtp.error && !phoneOtp.challenge ? <AuthNotice tone="error">{phoneOtp.error}</AuthNotice> : null}
      {mode === 'phone' && phoneOtp.errorCode === 'PHONE_ACCOUNT_EXISTS' ? <AuthLink onPress={() => router.replace('/login')}>Sign in to your existing account</AuthLink> : null}

      {mode === 'email' ? (
        <AuthField
          label="Password"
          value={password}
          placeholder="Create a password"
          onChangeText={(value) => { setPassword(value); if (errors.password) setErrors((current) => ({ ...current, password: '' })); }}
          error={errors.password}
          hint="Use at least 8 characters."
          secure={!showPassword}
          onToggleSecure={() => setShowPassword((visible) => !visible)}
          autoCapitalize="none"
          icon="lock-closed-outline"
        />
      ) : null}

      <AuthButton label={mode === 'phone' && !phoneOtp.challenge ? 'Send OTP' : mode === 'phone' ? 'Verify' : 'Create account'} loading={busy} onPress={() => void validateAndSignup()} />

      {!phoneOtp.challenge ? (
        <>
          <AuthDivider />
          <GoogleAuthButton label="Sign up with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken, 'signup')); router.replace('/(tabs)/profile'); }} />
          <AuthLegalLinks onTerms={() => router.push('/terms' as Href)} onPrivacy={() => router.push('/privacy' as Href)} />
          <AuthSwitch prompt="Already have an account?" action="Log in" onPress={() => router.replace('/login')} />
        </>
      ) : null}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  otpActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  otpActionText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, paddingVertical: 6 },
  otpActionDisabled: { color: Colors.textLight },
  recaptcha: { minHeight: 78, alignItems: 'flex-start', marginBottom: 12 },
});
