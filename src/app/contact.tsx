import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { BrandedPage, BRAND, INTER } from '@/components/account/BrandedPage';
import { Colors } from '@/constants/colors';
import { supportContact } from '@/constants/navigation';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { submitSupportRequest, supportTopics, type SupportTopic } from '@/utils/supportApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View, type TextInputProps } from 'react-native';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 5000;

export default function ContactScreen() {
  useAppLanguage();
  const { reference, topic: initialTopic } = useLocalSearchParams<{ reference?: string; topic?: string }>();
  const user = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: user?.email ?? '', subject: reference ? `Help with ${reference}` : '', message: '' });
  const [topic, setTopic] = useState<SupportTopic | ''>(supportTopics.includes(initialTopic as SupportTopic) ? initialTopic as SupportTopic : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [received, setReceived] = useState('');
  const submitting = useRef(false);
  const submissionKey = useRef('');

  const edit = (key: keyof typeof form, value: string) => { setForm((current) => ({ ...current, [key]: value })); submissionKey.current = ''; setError(''); };

  const send = async () => {
    if (submitting.current) return;
    if (!form.firstName.trim() || !form.lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !topic || form.subject.trim().length < 3 || form.message.trim().length < MESSAGE_MIN) {
      setError('Add both names, a valid email, topic, subject, and a message of at least 10 characters.');
      return;
    }
    const token = getAccessToken();
    if (!user || !token) { setError('Sign in to submit and track your support request.'); return; }
    submitting.current = true; setBusy(true); setError('');
    if (!submissionKey.current) submissionKey.current = uuid();
    try {
      const result = await submitSupportRequest({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), topic, reference, submissionKey: submissionKey.current }, token);
      if (!result.request?.id) throw new Error('Support did not return a request reference. Please retry.');
      setReceived(result.request.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send your message.');
    } finally {
      submitting.current = false; setBusy(false);
    }
  };

  const open = async (url: string) => { try { await Linking.openURL(url); } catch { setError(`Contact us at ${supportContact.email}.`); } };
  const back = () => (router.canGoBack() ? router.back() : router.replace('/help' as never));

  if (received) {
    return (
      <BrandedPage title="Request received" subtitle="Thanks for reaching out. We’ll be in touch." eyebrow="LEMONTRIP / SUPPORT" onBack={back}
        footer={<><PrimaryButton label="View my support requests" onPress={() => router.replace('/manage/support-requests' as never)} /><View style={{ height: 10 }} /><SoftButton label="Back to help" onPress={() => router.replace('/help' as never)} /></>}>
        <View style={s.done}>
          <View style={s.doneIcon}><Ionicons name="checkmark" size={34} color={BRAND} /></View>
          <Text style={s.doneTitle}>We’ve got your message</Text>
          <Text style={s.doneText}>Follow this request and its updates in My Support Requests.</Text>
          <View style={s.refBox}><Text style={s.refLabel}>REFERENCE</Text><Text selectable style={s.ref}>{received}</Text></View>
        </View>
      </BrandedPage>
    );
  }

  const length = form.message.trim().length;
  const counter = length < MESSAGE_MIN ? `${MESSAGE_MIN - length} more to go` : `${length}/${MESSAGE_MAX}`;

  return (
    <BrandedPage
      hideBanner
      title="Contact support"
      subtitle="Tell us what’s going on and we’ll help."
      eyebrow="LEMONTRIP / SUPPORT"
      onBack={back}
      footer={<PrimaryButton label="Send message" loading={busy} onPress={() => void send()} />}>
      {!user ? (
        <View style={s.signIn}>
          <Ionicons name="lock-closed-outline" size={18} color={BRAND} />
          <Text style={s.signInText}>Sign in to submit and track your request.{' '}<Text accessibilityRole="link" onPress={() => router.push('/login')} style={s.inlineLink}>Sign in</Text></Text>
        </View>
      ) : null}

      <View style={s.card}>
        <Text style={s.cardEyebrow}>WE USUALLY REPLY BY EMAIL</Text>
        <Text style={s.cardTitle}>Send us a message</Text>

        <View style={s.names}>
          <View style={s.flex}><Field label="First name" placeholder="First name" value={form.firstName} onChangeText={(v) => edit('firstName', v)} editable={!busy} maxLength={80} autoCapitalize="words" /></View>
          <View style={s.flex}><Field label="Last name" placeholder="Last name" value={form.lastName} onChangeText={(v) => edit('lastName', v)} editable={!busy} maxLength={80} autoCapitalize="words" /></View>
        </View>
        <Field label="Email address" placeholder="name@example.com" value={form.email} onChangeText={(v) => edit('email', v)} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!busy} maxLength={255} />

        <Text style={s.fieldLabel}>TOPIC</Text>
        <View style={s.topics} accessibilityRole="radiogroup">
          {supportTopics.map((option) => {
            const on = topic === option;
            return (
              <TouchableOpacity key={option} accessibilityRole="button" accessibilityState={{ selected: on, disabled: busy }} disabled={busy} onPress={() => { setTopic(option); submissionKey.current = ''; setError(''); }} style={[s.chip, on && s.chipOn]}>
                <Text style={[s.chipText, on && s.chipTextOn]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 16 }} />
        <Field label="Subject" placeholder="A short summary" value={form.subject} onChangeText={(v) => edit('subject', v)} maxLength={200} editable={!busy} />
        <Field label="Message" placeholder="Tell us how we can help…" multiline value={form.message} onChangeText={(v) => edit('message', v)} maxLength={MESSAGE_MAX} editable={!busy} counter={counter} />
        {reference ? <View style={s.ref2}><Ionicons name="link-outline" size={15} color={BRAND} /><Text style={s.ref2Text}>Booking / application reference: {reference}</Text></View> : null}
        {error ? <View accessibilityRole="alert" style={s.error}><Ionicons name="alert-circle" size={18} color={Colors.error} /><Text style={s.errorText}>{error}</Text></View> : null}
      </View>

      <View style={s.direct}>
        <View style={s.directHead}>
          <View style={s.directIcon}><Ionicons name="headset-outline" size={24} color="#FFFFFF" /></View>
          <View style={s.flex}>
            <Text style={s.directTitle}>Prefer to reach us directly?</Text>
            <Text style={s.directText}>Get in touch through your preferred channel.</Text>
          </View>
        </View>
        <View style={s.channelRow}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Email support" onPress={() => void open(`mailto:${supportContact.email}`)} style={s.channel} activeOpacity={0.8}>
            <Ionicons name="mail-outline" size={20} color={BRAND} /><Text style={s.channelText}>Email</Text><Ionicons name="chevron-forward" size={16} color={BRAND} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="WhatsApp support" onPress={() => void open(supportContact.whatsapp)} style={s.channel} activeOpacity={0.8}>
            <Ionicons name="logo-whatsapp" size={20} color={BRAND} /><Text style={s.channelText}>WhatsApp</Text><Ionicons name="chevron-forward" size={16} color={BRAND} />
          </TouchableOpacity>
        </View>
      </View>
    </BrandedPage>
  );
}

function Field({ label, counter, multiline, ...input }: TextInputProps & { label: string; counter?: string }) {
  return (
    <View style={s.field}>
      <View style={s.fieldHead}><Text style={s.fieldLabel}>{label.toUpperCase()}</Text>{counter ? <Text style={s.counter}>{counter}</Text> : null}</View>
      <TextInput {...input} multiline={multiline} accessibilityLabel={label} placeholderTextColor={Colors.textLight} style={[s.input, multiline && s.inputMulti]} />
    </View>
  );
}

function PrimaryButton({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!loading, busy: !!loading }} disabled={!!loading} onPress={onPress} activeOpacity={0.85} style={[s.primary, !!loading && { opacity: 0.55 }]}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={s.primaryText}>{label}</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></>}
    </TouchableOpacity>
  );
}

function SoftButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={0.85} style={s.soft}><Text style={s.softText}>{label}</Text></TouchableOpacity>;
}

function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => { const value = Math.floor(Math.random() * 16); return (character === 'x' ? value : (value & 3) | 8).toString(16); }); }

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardEyebrow: { fontFamily: INTER.extrabold, color: Colors.secondary, fontSize: TextSize.micro, letterSpacing: 1.2 },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginTop: 4, marginBottom: 12 },
  names: { flexDirection: 'row', gap: 10 },
  field: { marginBottom: 12 },
  fieldHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: { fontFamily: INTER.semibold, color: Colors.textLight, fontSize: TextSize.micro, letterSpacing: 1, marginBottom: 6 },
  counter: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.micro, marginBottom: 6 },
  input: { minHeight: 52, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  inputMulti: { minHeight: 120, textAlignVertical: 'top', paddingTop: 14 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontFamily: INTER.semibold, color: Colors.textDark, fontSize: TextSize.caption },
  chipTextOn: { color: Colors.white },
  ref2: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  ref2Text: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textDark },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: Colors.errorSoft },
  errorText: { flex: 1, fontFamily: INTER.medium, fontSize: TextSize.caption, lineHeight: 17, color: Colors.error },
  signIn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  signInText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 17, color: Colors.textDark },
  inlineLink: { fontFamily: INTER.extrabold, color: BRAND, textDecorationLine: 'underline' },

  direct: { marginHorizontal: 16, padding: 12, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  directHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: Colors.successSoft },
  directIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#103D30' },
  directTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.body },
  directText: { fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  channel: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  channelText: { flex: 1, fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  divider: { width: 1, height: 28, backgroundColor: Colors.borderStrong },

  primary: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, backgroundColor: '#103D30' },
  primaryText: { fontFamily: INTER.extrabold, color: '#FFFFFF', fontSize: TextSize.body },
  soft: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  softText: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.body },

  done: { alignItems: 'center', marginHorizontal: 16, marginBottom: 14, padding: 24, borderRadius: 22, backgroundColor: BRAND },
  doneIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  doneTitle: { fontFamily: INTER.extrabold, fontSize: TextSize.heading, color: Colors.white, marginTop: 14 },
  doneText: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: Colors.onDarkMuted, marginTop: 5, textAlign: 'center' },
  refBox: { alignItems: 'center', marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.onDarkSubtle },
  refLabel: { fontFamily: INTER.semibold, fontSize: TextSize.micro, letterSpacing: 1, color: Colors.onDarkMuted },
  ref: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: Colors.white, marginTop: 4 },
});