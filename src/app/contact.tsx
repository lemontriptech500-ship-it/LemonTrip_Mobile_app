import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { supportContact } from '@/constants/navigation';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const initial = { name: '', email: '', phone: '', subject: '', message: '' };
export default function ContactScreen() {
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const [form, setForm] = useState({ ...initial, subject: reference ? `Help with reference ${reference}` : '' });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async () => {
    setSent(false);
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !form.subject.trim() || !form.message.trim()) { setFeedback('Please add your name, a valid email, subject, and message.'); return; }
    setBusy(true); setFeedback('');
    try {
      const endpoint = process.env.EXPO_PUBLIC_CONTACT_URL;
      if (endpoint) {
        const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), signal: controller.signal });
          const payload: unknown = await response.json().catch(() => null);
          if (!response.ok) throw new Error('Unable to send your message. Please try email or WhatsApp.');
          setSent(true); setForm(initial); setFeedback(typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string' ? payload.message : 'Your message has been received.');
        } finally { clearTimeout(timeout); }
      } else {
        const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`;
        await Linking.openURL(`mailto:${supportContact.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`);
        setSent(true); setFeedback('Your email draft is ready. Send it from your email app to contact our team.');
      }
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Your email app could not open. You can email us directly.'); }
    finally { setBusy(false); }
  };
  const open = async (url: string) => { try { await Linking.openURL(url); } catch { Alert.alert('Contact LemonTrip', `Email ${supportContact.email} for help.`); } };
  return <AppScreen><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <ScreenHeader title="Let’s plan the next step." subtitle="Questions about a booking, destination, or travel service? We’re here to help." eyebrow="CONTACT LEMONTRIP" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
    <View style={styles.channels}><TouchableOpacity accessibilityRole="button" onPress={() => void open(`mailto:${supportContact.email}`)} style={styles.channel}><Ionicons name="mail-outline" size={24} color={Colors.accent} /><View style={{ flex: 1 }}><Text style={styles.channelTitle}>Email LemonTrip</Text><Text style={styles.channelCopy}>{supportContact.email}</Text></View></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => void open(supportContact.whatsapp)} style={styles.channel}><Ionicons name="logo-whatsapp" size={24} color={Colors.accent} /><View style={{ flex: 1 }}><Text style={styles.channelTitle}>WhatsApp us</Text><Text style={styles.channelCopy}>Talk to the LemonTrip team</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.white} /></TouchableOpacity></View>
    <View style={styles.form}><Text style={styles.title}>Send us a message</Text><Text style={styles.copy}>Share the details and we’ll help you find the next step.</Text>{(Object.keys(initial) as (keyof typeof initial)[]).map(key => <View key={key} style={styles.field}><Text style={styles.label}>{key === 'phone' ? 'Phone (optional)' : key.charAt(0).toUpperCase() + key.slice(1)}</Text><TextInput accessibilityLabel={key} value={form[key]} onChangeText={value => { setForm(current => ({ ...current, [key]: value })); setFeedback(''); }} editable={!busy} autoCapitalize={key === 'email' ? 'none' : 'sentences'} keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'} multiline={key === 'message'} maxLength={key === 'message' ? 5000 : 200} placeholder={key === 'message' ? 'Tell us a little more about your question…' : key === 'email' ? 'you@example.com' : `Your ${key}`} placeholderTextColor={Colors.textLight} style={[styles.input, key === 'message' && styles.message]} /></View>)}{feedback ? <Text accessibilityRole="alert" style={[styles.feedback, { color: sent ? Colors.primary : Colors.error }]}>{feedback}</Text> : null}<TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={[styles.button, busy && { opacity: 0.5 }]}><Text style={styles.buttonText}>{busy ? 'Please wait…' : process.env.EXPO_PUBLIC_CONTACT_URL ? 'Send message' : 'Compose email'}</Text><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></TouchableOpacity></View>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/help')} style={styles.help}><Text style={styles.buttonText}>Looking for a quick answer? Visit Help</Text></TouchableOpacity>
  </ScrollView></KeyboardAvoidingView></AppScreen>;
}
const styles = StyleSheet.create({
  page: { paddingBottom: 24, maxWidth: 760, width: '100%', alignSelf: 'center' }, channels: { marginHorizontal: Ui.space.page, padding: 20, borderRadius: 24, backgroundColor: Colors.primaryDark, gap: 20 }, channel: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }, channelTitle: { fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', color: Colors.white }, channelCopy: { fontFamily: 'Manrope', fontSize: 12, lineHeight: 20, color: Colors.onDarkMuted, marginTop: 4 }, form: { ...Ui.card, padding: 20, margin: 18 }, title: { fontFamily: 'Manrope', fontSize: 22, fontWeight: '800', color: Colors.primary }, copy: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22, color: Colors.textLight, marginTop: 8, marginBottom: 18 }, field: { marginBottom: 14 }, label: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '700', color: Colors.primary, marginBottom: 6 }, input: { ...Ui.field, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: 'Manrope', fontSize: 14, color: Colors.textDark, padding: 14 }, message: { minHeight: 140, textAlignVertical: 'top' }, feedback: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 21, marginBottom: 12 }, button: { ...Ui.button, backgroundColor: Colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }, buttonText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primary }, help: { marginHorizontal: Ui.space.page, padding: 14, alignItems: 'center' },
});
