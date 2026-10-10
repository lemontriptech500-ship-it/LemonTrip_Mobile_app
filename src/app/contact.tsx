import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { SupportButton, SupportCard, SupportChip, SupportField, SupportHeading, SupportNotice, SupportPage } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { supportContact } from '@/constants/navigation';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { submitSupportRequest, supportTopics, type SupportTopic } from '@/utils/supportApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 5000;

export default function ContactScreen() {
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
      <SupportPage title="Request received" subtitle="Thanks for reaching out. We’ll be in touch." eyebrow="LEMONTRIP / SUPPORT" onBack={back}>
        <View style={s.done}>
          <View style={s.doneIcon}><Ionicons name="checkmark" size={34} color={Colors.primaryDark} /></View>
          <Text style={s.doneTitle}>We’ve got your message</Text>
          <Text style={s.doneText}>Follow this request and its updates in My Support Requests.</Text>
          <View style={s.refBox}><Text style={s.refLabel}>REFERENCE</Text><Text selectable style={s.ref}>{received}</Text></View>
        </View>
        <View style={s.cta}>
          <SupportButton label="View my support requests" icon="arrow-forward" onPress={() => router.replace('/manage/support-requests' as never)} />
          <View style={{ height: 10 }} />
          <SupportButton variant="soft" label="Back to help" onPress={() => router.replace('/help' as never)} />
        </View>
      </SupportPage>
    );
  }

  const length = form.message.trim().length;

  return (
    <SupportPage
      title="Contact support"
      subtitle="Tell us what’s going on and we’ll help."
      onBack={back}
      footer={<SupportButton label="Send message" icon="send-outline" loading={busy} onPress={() => void send()} />}>
      {!user ? (
        <SupportNotice icon="lock-closed-outline">
          Sign in to submit and track your request.{' '}
          <Text accessibilityRole="link" onPress={() => router.push('/login')} style={s.inlineLink}>Sign in</Text>
        </SupportNotice>
      ) : null}

      <SupportCard>
        <SupportHeading eyebrow="WE USUALLY REPLY BY EMAIL" title="Send us a message" />

        <View style={s.names}>
          <View style={s.name}><SupportField label="First name" placeholder="First name" value={form.firstName} onChangeText={(v) => edit('firstName', v)} editable={!busy} maxLength={80} autoCapitalize="words" /></View>
          <View style={s.name}><SupportField label="Last name" placeholder="Last name" value={form.lastName} onChangeText={(v) => edit('lastName', v)} editable={!busy} maxLength={80} autoCapitalize="words" /></View>
        </View>
        <SupportField label="Email address" placeholder="name@example.com" value={form.email} onChangeText={(v) => edit('email', v)} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!busy} maxLength={255} />

        <Text style={s.label}>TOPIC</Text>
        <View style={s.topics} accessibilityRole="radiogroup">
          {supportTopics.map((option) => <SupportChip key={option} label={option} selected={topic === option} disabled={busy} onPress={() => { setTopic(option); submissionKey.current = ''; setError(''); }} />)}
        </View>

        <View style={{ height: 16 }} />
        <SupportField label="Subject" placeholder="A short summary" value={form.subject} onChangeText={(v) => edit('subject', v)} maxLength={200} editable={!busy} />
        <SupportField label="Message" placeholder="Tell us how we can help…" multiline value={form.message} onChangeText={(v) => edit('message', v)} maxLength={MESSAGE_MAX} editable={!busy} counter={length < MESSAGE_MIN ? `${MESSAGE_MIN - length} more to go` : `${length}/${MESSAGE_MAX}`} />
        {reference ? <View style={s.ref2}><Ionicons name="link-outline" size={15} color={Colors.primary} /><Text style={s.ref2Text}>Booking / application reference: {reference}</Text></View> : null}
        {error ? <View style={{ marginTop: 12 }}><SupportNotice tone="error">{error}</SupportNotice></View> : null}
      </SupportCard>

      <View style={s.channels}>
        <Text style={s.channelsLabel}>Prefer to reach us directly?</Text>
        <View style={s.channelRow}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Email support" onPress={() => void open(`mailto:${supportContact.email}`)} style={s.channel}><Ionicons name="mail-outline" size={17} color={Colors.primary} /><Text style={s.channelText}>Email</Text></TouchableOpacity>
          <View style={s.dot} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="WhatsApp support" onPress={() => void open(supportContact.whatsapp)} style={s.channel}><Ionicons name="logo-whatsapp" size={17} color={Colors.primary} /><Text style={s.channelText}>WhatsApp</Text></TouchableOpacity>
        </View>
      </View>
    </SupportPage>
  );
}

function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => { const value = Math.floor(Math.random() * 16); return (character === 'x' ? value : (value & 3) | 8).toString(16); }); }

const s = StyleSheet.create({
  names: { flexDirection: 'row', gap: 10 },
  name: { flex: 1, minWidth: 0 },
  label: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, color: Colors.textLight, marginBottom: 8 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inlineLink: { fontWeight: FontWeight.extraBold, color: Colors.primary, textDecorationLine: 'underline' },
  ref2: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  ref2Text: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textDark },
  channels: { alignItems: 'center', marginHorizontal: Ui.space.page, marginTop: 4 },
  channelsLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  channel: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7 },
  channelText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong },
  done: { alignItems: 'center', marginHorizontal: Ui.space.page, marginBottom: 14, padding: 24, borderRadius: Ui.radius.card, backgroundColor: Colors.primaryDark },
  doneIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  doneTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.white, marginTop: 14 },
  doneText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 20, color: Colors.onDarkMuted, marginTop: 5, textAlign: 'center' },
  refBox: { alignItems: 'center', marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.onDarkSubtle },
  refLabel: { ...Ui.eyebrow, color: Colors.onDarkMuted },
  ref: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.white, marginTop: 4 },
  cta: { marginHorizontal: Ui.space.page },
});