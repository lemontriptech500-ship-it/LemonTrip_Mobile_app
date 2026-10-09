import { Action, Copy, FeatureScreen, Field, Panel, Row } from '@/components/FeatureScreen';
import { useState } from 'react';
export default function ResetPasswordScreen() {
  const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState('');
  return <FeatureScreen title="A fresh start." subtitle="Choose a new password for your LemonTrip account." eyebrow="ACCOUNT RECOVERY"><Panel title="Reset your password"><Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" /><Field label="Confirm new password" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoComplete="new-password" /><Copy>Password reset links are not available from the account service yet. Use verified phone sign-in or contact account support to recover access.</Copy><Action label="Reset password" disabled onPress={() => {}} /><Row title="Sign in with phone verification" icon="phone-portrait-outline" route={{ pathname: '/login', params: { mode: 'phone' } }} /><Row title="Get account support" route="/contact" icon="headset-outline" /></Panel></FeatureScreen>;
}
