import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, AuthLegalLinks, GoogleAuthButton } from '@/components/auth/AuthLayout';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateAndLogin = () => {
    let hasError = false;
    setIdentifierError('');
    setPasswordError('');

    if (!identifier.trim()) {
      setIdentifierError('Email or mobile number is required');
      hasError = true;
    } else if (identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setIdentifierError('Enter a valid email address');
      hasError = true;
    } else if (!identifier.includes('@') && identifier.replace(/\D/g, '').length < 7) {
      setIdentifierError('Enter a valid mobile number');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    const value = identifier.trim();
    const isEmail = value.includes('@');
    login({
      name: isEmail ? value.split('@')[0] || 'Traveler' : 'Traveler',
      email: value,
      ...(!isEmail ? { phone: value } : {}),
    });
    router.replace('/(tabs)/profile');
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
        label="Email or mobile"
        value={identifier}
        placeholder="Enter email or mobile number"
        onChangeText={(value) => { setIdentifier(value); if (identifierError) setIdentifierError(''); }}
        error={identifierError}
        autoCapitalize="none"
      />
      <AuthField
        label="Password"
        value={password}
        placeholder="Enter your password"
        onChangeText={(value) => { setPassword(value); if (passwordError) setPasswordError(''); }}
        error={passwordError}
        secure={!showPassword}
        onToggleSecure={() => setShowPassword((visible) => !visible)}
        autoCapitalize="none"
      />

      <TouchableOpacity onPress={() => showUnavailable('Password reset')} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={validateAndLogin}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Continue with Google" onPress={() => showUnavailable('Google sign-in')} />

      <TouchableOpacity onPress={() => router.push('/signup')} style={styles.switchLink}>
        <Text style={styles.switchText}>New to LemonTrip? <Text style={styles.switchTextStrong}>Create an account</Text></Text>
      </TouchableOpacity>
      <AuthLegalLinks onTerms={() => showUnavailable('Terms')} onPrivacy={() => showUnavailable('Privacy policy')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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
