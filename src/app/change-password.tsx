import { SupportButton, SupportCard, SupportField, SupportHeading, SupportNotice, SupportPage } from '@/components/support/SupportKit';
import { useAuth } from '@/utils/authStore';
import { changePassword } from '@/utils/featureApi';
import { useState } from 'react';

type Note = { text: string; tone: 'good' | 'error' } | null;

export default function ChangePasswordScreen() {
  const user = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);

  const submit = async () => {
    if (next.length < 8) { setNote({ text: 'New password must be at least 8 characters.', tone: 'error' }); return; }
    if (next !== confirm) { setNote({ text: 'The new passwords do not match.', tone: 'error' }); return; }
    setBusy(true); setNote(null);
    try {
      await changePassword(current || undefined, next);
      setCurrent(''); setNext(''); setConfirm('');
      setNote({ text: 'Your password has been changed. Other devices have been signed out.', tone: 'good' });
    } catch (cause) {
      setNote({ text: cause instanceof Error ? cause.message : 'Password could not be changed.', tone: 'error' });
    } finally { setBusy(false); }
  };

  return (
    <SupportPage title="Change password" subtitle="Keep your account secure." eyebrow="LEMONTRIP / ACCOUNT">
      <SupportCard>
        <SupportHeading eyebrow="SECURITY" title="Update your password" />
        <SupportField label="Current password" value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" autoCorrect={false} />
        <SupportField label="New password" value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" autoCorrect={false} />
        <SupportField label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" autoCorrect={false} />
        <SupportButton label={busy ? 'Saving...' : 'Change password'} icon="checkmark" disabled={!user || busy || !next || !confirm} onPress={() => void submit()} />
      </SupportCard>
      <SupportNotice icon="information-circle-outline">{!user ? 'Sign in to change your password.' : 'If you signed up with Google or a phone code and have no password yet, leave the current password empty.'}</SupportNotice>
      {note ? <SupportNotice tone={note.tone}>{note.text}</SupportNotice> : null}
    </SupportPage>
  );
}