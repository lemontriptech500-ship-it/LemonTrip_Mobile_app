import { SupportScreen, supportStyles as s } from '@/components/support/SupportScreen';
import { Colors } from '@/constants/colors';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { sendChatMessage, type ChatMessage } from '@/utils/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useRef, useState, type ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const shortcuts: { title: string; icon: ComponentProps<typeof Ionicons>['name']; route?: Href; prompt?: string }[] = [
  { title: 'Book a flight', icon: 'airplane', route: '/(tabs)/explore/flights' },
  { title: 'Search hotels', icon: 'bed', route: '/(tabs)/explore/hotels' },
  { title: 'Manage bookings', icon: 'briefcase-outline', route: '/(tabs)/bookings' },
  { title: 'View my travel documents', icon: 'document-text', route: '/travel-documents' },
  { title: 'Get local recommendations', icon: 'map-outline', prompt: 'Help me find local recommendations for my destination.' },
];
export default function AssistantScreen() { const user = useAuth(); return <AssistantChat key={user?.id ?? 'guest'} />; }
function AssistantChat() {
  const [prompt, setPrompt] = useState(''); const [messages, setMessages] = useState<ChatMessage[]>([]); const [conversationId, setConversationId] = useState<string>(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const scroll = useRef<ScrollView>(null); const submitting = useRef(false);
  const send = async () => {
    const content = prompt.trim(); if (!content || submitting.current) return;
    submitting.current = true; setBusy(true); setError('');
    try { const result = await sendChatMessage(content, messages, getAccessToken() ?? undefined, conversationId); setMessages(current => [...current, { role: 'user', content }, { role: 'assistant', content: result.reply }]); setConversationId(result.conversationId); setPrompt(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not reach the travel assistant. Please retry.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <SupportScreen title="AI Travel Assistant" scroll={false} footer={<View style={styles.composer}><TextInput accessibilityLabel="Message travel assistant" placeholder="Type your message…" placeholderTextColor={Colors.textLight} multiline maxLength={1200} value={prompt} onChangeText={value => { setPrompt(value); setError(''); }} editable={!busy} style={styles.input} /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Send message" disabled={busy || !prompt.trim()} onPress={() => void send()} style={[styles.send, (busy || !prompt.trim()) && styles.disabled]}>{busy ? <ActivityIndicator color={Colors.white} size="small" /> : <Ionicons name="send" size={18} color={Colors.white} />}</TouchableOpacity></View>}>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} onContentSizeChange={() => { if (messages.length || busy) scroll.current?.scrollToEnd({ animated: true }); }}>
      {!messages.length ? <View style={styles.menu}>{shortcuts.map(item => <TouchableOpacity key={item.title} accessibilityRole="button" style={styles.shortcut} onPress={() => { if (item.route) router.push(item.route); else { setPrompt(item.prompt ?? ''); setError(''); } }}><Ionicons name={item.icon} size={20} color={Colors.white} /><Text style={styles.shortcutText}>{item.title}</Text></TouchableOpacity>)}</View> : messages.map((message, index) => <View key={index} style={[styles.message, message.role === 'user' && styles.userMessage]}><Text style={styles.sender}>{message.role === 'user' ? 'You' : 'LemonTrip Assistant'}</Text><Text selectable style={styles.messageText}>{message.content}</Text></View>)}
      {busy ? <Text style={s.body}>The travel assistant is replying…</Text> : null}
      {error ? <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{error}</Text><TouchableOpacity accessibilityRole="button" style={styles.support} onPress={() => router.push('/contact')}><Text style={styles.supportText}>Contact Support</Text></TouchableOpacity></View> : null}
    </ScrollView>
  </SupportScreen>;
}
const styles = StyleSheet.create({ page: { width: '100%', maxWidth: 640, alignSelf: 'center', flexGrow: 1, padding: 18, gap: 14 }, menu: { alignSelf: 'flex-end', width: '88%', maxWidth: 340, backgroundColor: '#56635F', padding: 14, borderRadius: 14, borderBottomLeftRadius: 3, marginTop: 14 }, shortcut: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }, shortcutText: { flex: 1, color: Colors.white, fontFamily: 'Manrope', fontSize: 14, lineHeight: 20 }, message: { maxWidth: '92%', alignSelf: 'flex-start', padding: 14, borderRadius: 14, backgroundColor: Colors.surface }, userMessage: { alignSelf: 'flex-end', backgroundColor: Colors.surfaceMuted }, sender: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', marginBottom: 6 }, messageText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, lineHeight: 22 }, composer: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 24, backgroundColor: Colors.surfaceMuted, paddingHorizontal: 8 }, input: { flex: 1, minWidth: 0, minHeight: 48, maxHeight: 110, padding: 12, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13 }, send: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary }, disabled: { opacity: 0.45 }, support: { minHeight: 44, justifyContent: 'center' }, supportText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' } });
