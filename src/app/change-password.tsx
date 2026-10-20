import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { BrandedPage, BRAND, INTER } from '@/components/account/BrandedPage';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/utils/authStore';
import { changePassword } from '@/utils/featureApi';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Note = { text: string; tone: 'good' | 'error' } | null;

function PasswordField({ label, placeholder, value, onChangeText }: { label: string; placeholder: string; value: string; onChangeText: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      <View style={s.inputWrap}>
        <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={label}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          style={s.input}
        />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible((v) => !v)} hitSlop={8}>
          <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  useAppLanguage();
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

  const off = !user || busy || !next || !confirm;

  return (
    <BrandedPage title="Change password" subtitle="Keep your account secure." eyebrow="LEMONTRIP / ACCOUNT">
      <View style={s.card}>
        <Text style={s.cardEyebrow}>SECURITY</Text>
        <Text style={s.cardTitle}>Update your password</Text>
        <PasswordField label="Current password" placeholder="Enter current password" value={current} onChangeText={setCurrent} />
        <PasswordField label="New password" placeholder="Enter new password" value={next} onChangeText={setNext} />
        <PasswordField label="Confirm new password" placeholder="Confirm new password" value={confirm} onChangeText={setConfirm} />
        {note ? (
          <View accessibilityRole={note.tone === 'error' ? 'alert' : undefined} style={[s.note, note.tone === 'error' ? s.noteError : s.noteGood]}>
            <Ionicons name={note.tone === 'error' ? 'alert-circle' : 'checkmark-circle'} size={18} color={note.tone === 'error' ? Colors.error : Colors.success} />
            <Text style={[s.noteText, note.tone === 'error' && { color: Colors.error }]}>{note.text}</Text>
          </View>
        ) : null}
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: off, busy }} disabled={off} onPress={() => void submit()} activeOpacity={0.85} style={[s.button, off && { opacity: 0.55 }]}>
          {busy ? <ActivityIndicator color={BRAND} /> : <><Text style={s.buttonText}>Change password</Text><Ionicons name="arrow-forward" size={18} color={BRAND} /></>}
        </TouchableOpacity>
      </View>

      <View style={s.notice}>
        <View style={s.noticeIcon}><Ionicons name="shield-checkmark-outline" size={22} color={BRAND} /></View>
        <View style={s.flex}>
          <Text style={s.noticeTitle}>{!user ? 'Sign in to change your password.' : 'Keep your account safe'}</Text>
          {user ? <Text style={s.noticeBody}>If you signed up with Google or a phone code and have no password yet, leave the current password empty.</Text> : null}
        </View>
      </View>
    </BrandedPage>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardEyebrow: { fontFamily: INTER.extrabold, color: Colors.secondary, fontSize: TextSize.micro, letterSpacing: 1.2 },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginTop: 4, marginBottom: 12 },
  field: { marginBottom: 12 },
  fieldLabel: { fontFamily: INTER.semibold, color: Colors.textLight, fontSize: TextSize.micro, letterSpacing: 1, marginBottom: 6 },
  inputWrap: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  input: { flex: 1, minWidth: 0, paddingVertical: 10, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, marginBottom: 12 },
  noteGood: { backgroundColor: Colors.successSoft },
  noteError: { backgroundColor: Colors.errorSoft },
  noteText: { flex: 1, fontFamily: INTER.medium, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17 },
  button: { minHeight: 52, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, backgroundColor: Colors.accent },
  buttonText: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.body },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 14, borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  noticeIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.white },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  noticeBody: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
});