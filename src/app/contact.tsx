import { SupportScreen, supportStyles as s } from '@/components/support/SupportScreen';
import { Colors } from '@/constants/colors';
import { supportContact } from '@/constants/navigation';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { submitSupportRequest, supportTopics, type SupportTopic } from '@/utils/supportApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ContactScreen() {
  const { reference, topic: initialTopic } = useLocalSearchParams<{ reference?: string; topic?: string }>();
  const user = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: reference ? `Help with ${reference}` : '', message: '' });
  const [topic, setTopic] = useState<SupportTopic | ''>(supportTopics.includes(initialTopic as SupportTopic) ? initialTopic as SupportTopic : '');
  const [expanded, setExpanded] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [received, setReceived] = useState('');
  const submitting = useRef(false); const submissionKey = useRef('');
  const edit = (key: keyof typeof form, value: string) => { setForm(current => ({ ...current, [key]: value })); submissionKey.current = ''; setError(''); };
  const send = async () => {
    if (submitting.current) return;
    if (!form.firstName.trim() || !form.lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !topic || form.subject.trim().length < 3 || form.message.trim().length < 10) { setError('Add both names, a valid email, topic, subject, and a message of at least 10 characters.'); return; }
    const token = getAccessToken(); if (!user || !token) { setError('Sign in to submit and track your support request.'); return; }
    submitting.current = true; setBusy(true); setError('');
    if (!submissionKey.current) submissionKey.current = uuid();
    try { const result = await submitSupportRequest({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), topic, reference, submissionKey: submissionKey.current }, token); if (!result.request?.id) throw new Error('Support did not return a request reference. Please retry.'); setReceived(result.request.id); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not send your message.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  const open = async (url: string) => { try { await Linking.openURL(url); } catch { setError(`Contact us at ${supportContact.email}.`); } };
  return <SupportScreen title="Contact Support" footer={!received ? <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => void send()} style={[s.button, busy && styles.disabled]}>{busy ? <ActivityIndicator color={Colors.primaryDark} /> : <Text style={s.buttonText}>Send Message</Text>}</TouchableOpacity> : undefined}>
    {received ? <View style={s.card}><Ionicons name="checkmark-circle" size={36} color={Colors.success} /><Text style={s.title}>Request received</Text><Text style={s.body}>You can follow this request and its updates in My Support Requests.</Text><Text selectable style={s.body}>{received}</Text><TouchableOpacity accessibilityRole="button" style={s.button} onPress={() => router.replace('/manage/support-requests')}><Text style={s.buttonText}>View my support requests</Text></TouchableOpacity></View> : <View style={s.card}>
      <Text style={s.title}>Send us a message</Text><View style={styles.names}>{(['firstName', 'lastName'] as const).map(key => <TextInput key={key} accessibilityLabel={key === 'firstName' ? 'First name' : 'Last name'} placeholder={key === 'firstName' ? 'First name' : 'Last name'} placeholderTextColor={Colors.textLight} value={form[key]} onChangeText={value => edit(key, value)} editable={!busy} maxLength={80} autoCapitalize="words" style={[s.input, styles.name]} />)}</View>
      <TextInput accessibilityLabel="Email address" placeholder="Email address" placeholderTextColor={Colors.textLight} value={form.email} onChangeText={value => edit('email', value)} keyboardType="email-address" autoCapitalize="none" editable={!busy} maxLength={255} style={s.input} />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Select topic" accessibilityState={{ expanded }} disabled={busy} onPress={() => setExpanded(value => !value)} style={styles.select}><Text style={s.body}>{topic || 'Select topic'}</Text><Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.primary} /></TouchableOpacity>
      {expanded ? <View style={styles.options}>{supportTopics.map(option => <TouchableOpacity key={option} accessibilityRole="button" accessibilityState={{ selected: topic === option }} style={styles.option} onPress={() => { setTopic(option); setExpanded(false); submissionKey.current = ''; setError(''); }}><Text style={styles.optionText}>{option}</Text>{topic === option ? <Ionicons name="checkmark" size={16} color={Colors.secondary} /> : null}</TouchableOpacity>)}</View> : null}
      <TextInput accessibilityLabel="Subject" placeholder="Subject" placeholderTextColor={Colors.textLight} value={form.subject} onChangeText={value => edit('subject', value)} maxLength={200} editable={!busy} style={s.input} />
      <TextInput accessibilityLabel="Message" placeholder="Tell us how we can help…" placeholderTextColor={Colors.textLight} value={form.message} onChangeText={value => edit('message', value)} maxLength={5000} multiline editable={!busy} style={[s.input, styles.message]} />
      {reference ? <Text style={s.body}>Booking / application reference: {reference}</Text> : null}
      {!user ? <TouchableOpacity accessibilityRole="button" style={styles.signin} onPress={() => router.push('/login')}><Text style={styles.optionText}>Sign in to submit and track your request</Text></TouchableOpacity> : null}
      {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    </View>}
    <View style={styles.channels}><TouchableOpacity accessibilityRole="button" onPress={() => void open(`mailto:${supportContact.email}`)} style={styles.channel}><Ionicons name="mail-outline" size={18} color={Colors.secondary} /><Text style={styles.optionText}>Email support</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => void open(supportContact.whatsapp)} style={styles.channel}><Ionicons name="logo-whatsapp" size={18} color={Colors.secondary} /><Text style={styles.optionText}>WhatsApp</Text></TouchableOpacity></View>
  </SupportScreen>;
}
function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => { const value = Math.floor(Math.random() * 16); return (character === 'x' ? value : (value & 3) | 8).toString(16); }); }
const styles = StyleSheet.create({ names: { flexDirection: 'row', gap: 8 }, name: { flex: 1, minWidth: 0 }, select: { ...s.input, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, options: { borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background }, option: { minHeight: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 }, optionText: { fontFamily: 'Manrope', fontSize: 13, color: Colors.secondary, fontWeight: '700' }, message: { minHeight: 120, textAlignVertical: 'top' }, signin: { minHeight: 44, justifyContent: 'center' }, channels: { flexDirection: 'row', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }, channel: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }, disabled: { opacity: 0.5 } });
