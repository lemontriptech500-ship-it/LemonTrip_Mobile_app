import { useAppLanguage } from '@/utils/intl';
import { SupportCard, SupportHeading, SupportItem, SupportNotice, SupportPage, goTo } from '@/components/support/SupportKit';
import { Field, Notice, PrimaryButton } from '@/components/trains/TrainUi';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { FontFamily, FontWeight, TextSize } from '@/constants/typography';
import { requestPasswordReset } from '@/utils/accountApi';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountRecoveryScreen() {
  useAppLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(value);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupportPage
      title="Let's get you back in."
      subtitle="Reset your LemonTrip password by email."
      eyebrow="ACCOUNT RECOVERY"
      onBack={() => router.replace('/login')}
    >
      <View style={s.hero}>
        <View style={s.heroIcon}>
          <Ionicons name="key-outline" size={30} color={Colors.primaryDark} />
        </View>
        <Text style={s.heroTitle}>Forgot your password?</Text>
        <Text style={s.heroText}>Enter the email on your account and we will send you a reset link.</Text>
      </View>

      <SupportCard>
        <SupportHeading eyebrow="RESET BY EMAIL" title="Your account email" />
        <Field
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (error) setError('');
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          icon="mail-outline"
          error={error}
        />
        <PrimaryButton label={sent ? 'Send again' : 'Send reset link'} onPress={() => void submit()} loading={loading} />
      </SupportCard>

      {sent ? (
        <Notice icon="mail-outline" tone="good" title="Check your email">
          If an account exists for this email, a reset link is on its way. The link works once and expires in 30 minutes.
        </Notice>
      ) : null}

      <SupportCard>
        <SupportHeading eyebrow="OTHER OPTIONS" title="Need another way in?" />
        <SupportItem
          icon="key-outline"
          title="I already have a reset code"
          detail="Paste the code from your email"
          onPress={() => router.push('/reset-password' as Href)}
        />
        <SupportItem
          icon="phone-portrait-outline"
          title="Sign in with phone OTP"
          detail="Use your verified phone number"
          onPress={() => router.replace({ pathname: '/login', params: { mode: 'phone' } } as Href)}
        />
        <SupportItem icon="headset-outline" title="Get account support" onPress={() => goTo('/contact')} />
        <SupportItem icon="log-in-outline" title="Back to log in" onPress={() => router.replace('/login')} last />
      </SupportCard>

      <SupportNotice icon="shield-checkmark-outline">
        LemonTrip will never ask for your password or one-time code by phone, chat or email.
      </SupportNotice>
    </SupportPage>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: 'center', marginHorizontal: Ui.space.page, marginBottom: 14, padding: 22, borderRadius: Ui.radius.card, backgroundColor: Colors.accentSoft },
  heroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  heroTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.primaryDark, marginTop: 14 },
  heroText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 22, color: Colors.textDark, marginTop: 6, textAlign: 'center' },
});
