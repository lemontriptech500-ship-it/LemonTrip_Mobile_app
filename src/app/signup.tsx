import { Colors } from '@/constants/colors';
import { AuthField, AuthLayout, AuthLegalLinks, GoogleAuthButton } from '@/components/auth/AuthLayout';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const validateAndSignup = () => {
    const nextErrors = { name: '', email: '', phone: '', password: '' };
    if (!name.trim()) nextErrors.name = 'Your name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address';
    if (!phone.trim()) nextErrors.phone = 'Mobile number is required';
    else if (phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Enter a valid mobile number';
    if (!password.trim()) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Use at least 6 characters';

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    login({ name: name.trim(), email: email.trim(), phone: phone.trim() });
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
      <AuthField
        label="Email"
        value={email}
        placeholder="you@example.com"
        onChangeText={(value) => { setEmail(value); if (errors.email) setErrors((current) => ({ ...current, email: '' })); }}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AuthField
        label="Mobile"
        value={phone}
        placeholder="Your mobile number"
        onChangeText={(value) => { setPhone(value); if (errors.phone) setErrors((current) => ({ ...current, phone: '' })); }}
        error={errors.phone}
        autoCapitalize="none"
        keyboardType="phone-pad"
      />
      <AuthField
        label="Password"
        value={password}
        placeholder="Create a password"
        onChangeText={(value) => { setPassword(value); if (errors.password) setErrors((current) => ({ ...current, password: '' })); }}
        error={errors.password}
        secure={!showPassword}
        onToggleSecure={() => setShowPassword((visible) => !visible)}
        autoCapitalize="none"
      />

      <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={validateAndSignup}>
        <Text style={styles.primaryButtonText}>Create account</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR</Text><View style={styles.divider} /></View>
      <GoogleAuthButton label="Sign up with Google" onPress={() => showUnavailable('Google sign-up')} />

      <TouchableOpacity onPress={() => router.push('/login')} style={styles.switchLink}>
        <Text style={styles.switchText}>Already have an account? <Text style={styles.switchTextStrong}>Login</Text></Text>
      </TouchableOpacity>
      <AuthLegalLinks onTerms={() => showUnavailable('Terms')} onPrivacy={() => showUnavailable('Privacy policy')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  primaryButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', marginTop: 1, borderRadius: 11, backgroundColor: Colors.primary },
  primaryButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  switchLink: { alignItems: 'center', marginTop: 13, paddingVertical: 4 },
  switchText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  switchTextStrong: { color: Colors.primary, fontWeight: '800' },
});