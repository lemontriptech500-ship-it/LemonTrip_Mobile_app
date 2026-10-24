import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { AuthButton, AuthDivider, AuthField, AuthLayout, AuthLink, AuthNotice, AuthSwitch, GoogleAuthButton, OtpCodeField } from '@/components/auth/AuthLayout';
import { checkPhoneAccount, exchangeFirebasePhoneIdentity, loginWithEmail, loginWithGoogle, normalizePhoneInput, resendVerificationEmail } from '@/utils/authApi';
import { useFirebasePhoneOtp } from '@/utils/useFirebasePhoneOtp';
import { login } from '@/utils/authStore';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function LoginScreen() {
  useAppLanguage();
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const phoneOtp = useFirebasePhoneOtp();
  const [mode, setMode] = useState<'email' | 'phone'>(initialMode === 'phone' ? 'phone' : 'email');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: 'info' | 'error' } | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const resendEmail = async () => {
    if (sendingVerification) return;
    setSendingVerification(true);
    try {
      const result = await resendVerificationEmail(identifier.trim());
      setNotice({ tone: 'info', message: result.message + ' Check your inbox and spam folder, then open the verification link before signing in.' });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Could not resend the verification email. Try again.' });
    } finally {
      setSendingVerification(false);
    }
  };

  // Clear reCAPTCHA when leaving the screen so it never touches a removed element.
  // The catch matters: an unhandled rejection from this cleanup can take the screen down while navigating away.
  useEffect(() => () => { phoneOtp.reset().catch(() => undefined); }, []);

  const validateAndLogin = async () => {
    setIdentifierError('');
    setPasswordError('');
    setNotice(null);
    setNeedsVerification(false);

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
      setIdentifierError('Enter a valid number. Include your country code if needed.');
      return;
    }

    if (authMode === 'email' && !password) {
      setPasswordError('Password is required');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'email') await login(await loginWithEmail({ email: identifier.trim(), password }));
      else if (!phoneOtp.challenge) { await checkPhoneAccount(phoneNumber!, 'login'); await phoneOtp.sendCode(phoneNumber!); return; } // no SMS for unknown numbers
      else {
        const idToken = await phoneOtp.verifyCode();
        if (!idToken) return;
        await login(await exchangeFirebasePhoneIdentity({ idToken, purpose: 'login' }));
      }
      router.replace('/(tabs)/home');
    } catch (error) {
      if (authMode === 'phone') phoneOtp.showError(error instanceof Error ? error.message : 'Phone sign-in could not be completed.', (error as { code?: string } | null)?.code ?? '');
      else if ((error as { code?: string } | null)?.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setNotice({ tone: 'info', message: 'Verify your email before signing in. Open the verification link in your inbox or spam folder, or request a new email below.' });
      } else setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else return;
  };

  // Open the sign-up screen. Never leave the user stranded on login if the push is rejected.
  const openSignup = () => {
    try { router.push('/signup' as Href); } catch { router.replace('/signup' as Href); }
  };

  const verifying = mode === 'phone' && !!phoneOtp.challenge;
  const busy = loading || phoneOtp.busy || sendingVerification;

  return (
    <AuthLayout
      eyebrow="LEMONTRIP / LOGIN"
      title={verifying ? 'Verify your number' : 'Welcome back'}
      subtitle={verifying ? `Enter the six-digit code sent to ${normalizePhoneInput(identifier) ?? identifier}.` : 'Log in to continue your journey.'}
      onBack={handleBack}>
      {!phoneOtp.challenge ? (
        <AuthField
          label="Email or mobile number"
          value={identifier}
          placeholder="you@example.com or 98765 43210"
          onChangeText={(value) => {
            setIdentifier(value);
            setNotice(null);
            setNeedsVerification(false);
            setMode(value.trim() && /^[+\d\s()-]+$/.test(value.trim()) ? 'phone' : 'email');
            if (phoneOtp.challenge) void phoneOtp.reset();
            if (identifierError) setIdentifierError('');
          }}
          error={identifierError}
          autoCapitalize="none"
          keyboardType="email-address"
          icon={mode === 'email' ? 'mail-outline' : 'call-outline'}
        />
      ) : null}

      {mode === 'email' ? (
        <>
          <AuthField
            label="Password"
            value={password}
            placeholder="Enter your password"
            onChangeText={(value) => { setPassword(value); if (passwordError) setPasswordError(''); }}
            error={passwordError}
            secure={!showPassword}
            onToggleSecure={() => setShowPassword((visible) => !visible)}
            autoCapitalize="none"
            icon="lock-closed-outline"
          />
          <AuthLink align="right" onPress={() => router.push('/forgot-password')}>Forgot password?</AuthLink>
        </>
      ) : phoneOtp.challenge ? (
        <>
          <OtpCodeField value={phoneOtp.code} onChangeText={phoneOtp.setCode} error={phoneOtp.error} />
          <View style={styles.otpActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => void phoneOtp.reset()}><Text style={styles.otpActionText}>Edit phone</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={phoneOtp.busy || phoneOtp.resendSeconds > 0} onPress={() => { const phone = normalizePhoneInput(identifier); if (phone) void phoneOtp.sendCode(phone); }}>
              <Text style={[styles.otpActionText, (phoneOtp.busy || phoneOtp.resendSeconds > 0) && styles.otpActionDisabled]}>{phoneOtp.resendSeconds > 0 ? `Resend in ${phoneOtp.resendSeconds}s` : 'Resend code'}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {mode === 'phone' && !phoneOtp.challenge && Platform.OS === 'web' ? <View id="lemontrip-phone-recaptcha" style={styles.recaptcha} /> : null}
      {mode === 'phone' && !phoneOtp.challenge ? <AuthNotice>We’ll send an SMS to verify your number. Standard messaging rates may apply.</AuthNotice> : null}
      {mode === 'phone' && phoneOtp.error && !phoneOtp.challenge ? <AuthNotice tone="error">{phoneOtp.error}</AuthNotice> : null}
      {mode === 'phone' && phoneOtp.errorCode === 'PHONE_ACCOUNT_NOT_FOUND' ? <AuthLink onPress={openSignup}>Create an account</AuthLink> : null}

      {mode === 'email' && notice ? <AuthNotice tone={notice.tone}>{notice.message}</AuthNotice> : null}
      {mode === 'email' && needsVerification ? <AuthButton label="Resend verification email" loading={sendingVerification} onPress={() => void resendEmail()} /> : null}
      <AuthButton label={mode === 'phone' && !phoneOtp.challenge ? 'Send OTP' : mode === 'phone' ? 'Verify' : 'Log in'} loading={busy} onPress={() => void validateAndLogin()} />

      {!phoneOtp.challenge ? (
        <>
          <AuthDivider />
          <GoogleAuthButton label="Continue with Google" onSuccess={async (idToken) => { await login(await loginWithGoogle(idToken, 'login')); router.replace('/(tabs)/home'); }} />
          <AuthSwitch prompt="Don’t have an account?" action="Sign up" onPress={openSignup} />
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
