import { SupportCard, SupportHeading, SupportItem, SupportNotice, SupportPage, goTo } from '@/components/support/SupportKit';
import { Field, Notice, PrimaryButton } from '@/components/trains/TrainUi';
import { confirmPasswordReset } from '@/utils/accountApi';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const linkToken = Array.isArray(params.token) ? params.token[0] : params.token;

  const [pastedToken, setPastedToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = (linkToken ?? pastedToken).trim();

  const submit = async () => {
    if (token.length < 20) {
      setError('Paste the full reset code from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await confirmPasswordReset(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SupportPage title="Password updated." subtitle="You can now log in with your new password." eyebrow="ACCOUNT RECOVERY" onBack={() => router.replace('/login')}>
        <Notice icon="checkmark-circle-outline" tone="good" title="All set">
          Your password was changed and you were signed out of all devices. Log in again to continue.
        </Notice>
        <SupportCard>
          <PrimaryButton label="Go to log in" onPress={() => router.replace('/login')} />
        </SupportCard>
      </SupportPage>
    );
  }

  return (
    <SupportPage title="A fresh start." subtitle="Choose a new password for your LemonTrip account." eyebrow="ACCOUNT RECOVERY" onBack={() => router.replace('/login')}>
      <SupportCard>
        <SupportHeading eyebrow="NEW PASSWORD" title="Reset your password" />
        {linkToken ? null : (
          <Field
            label="Reset code from your email"
            value={pastedToken}
            onChangeText={(value) => {
              setPastedToken(value);
              if (error) setError('');
            }}
            placeholder="Paste the code after token="
            autoCapitalize="none"
            autoCorrect={false}
            icon="key-outline"
          />
        )}
        <Field
          label="New password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (error) setError('');
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          icon="lock-closed-outline"
        />
        <Field
          label="Confirm new password"
          value={confirmation}
          onChangeText={(value) => {
            setConfirmation(value);
            if (error) setError('');
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          icon="lock-closed-outline"
          error={error}
        />
        <PrimaryButton label="Reset password" onPress={() => void submit()} loading={loading} />
      </SupportCard>

      <SupportCard>
        <SupportHeading eyebrow="NEED A NEW LINK?" title="Other options" />
        <SupportItem icon="mail-outline" title="Send me a new reset link" onPress={() => router.replace('/forgot-password' as Href)} />
        <SupportItem icon="headset-outline" title="Get account support" onPress={() => goTo('/contact')} last />
      </SupportCard>

      <SupportNotice icon="shield-checkmark-outline">
        Reset links work once and expire in 30 minutes. After a reset, all your devices are signed out.
      </SupportNotice>
    </SupportPage>
  );
}
