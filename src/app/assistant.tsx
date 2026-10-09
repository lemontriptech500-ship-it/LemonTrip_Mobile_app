import { Ui } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { sendChatMessage, type ChatMessage } from '@/utils/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function AssistantScreen() {
  const user = useAuth();
  return <AssistantChat key={user?.id ?? 'guest'} />;
}

function AssistantChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scroll = useRef<ScrollView>(null);
  const send = async () => {
    const content = prompt.trim();
    if (!content || loading) return;
    setLoading(true); setError('');
    try {
      const response = await sendChatMessage(`${content}`, messages, getAccessToken() ?? undefined, conversationId);
      setMessages(current => [...current, { role: 'user', content }, { role: 'assistant', content: response.reply }]);
      setConversationId(response.conversationId); setPrompt('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please try again.'); }
    finally { setLoading(false); }
  };
  return <SafeAreaView style={styles.safe} edges={['top']}><StatusBar style="light" /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scroll} onContentSizeChange={() => { if (messages.length || loading) scroll.current?.scrollToEnd({ animated: true }); }} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Your travel assistant" subtitle="A little inspiration, a clear next step." eyebrow="LEMONTRIP INTELLIGENCE" onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} /><View style={styles.hero}><View style={styles.intro}><View style={styles.lemon}><Ionicons name="sparkles" size={30} color={Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.introTitle}>Dream it. We’ll plan it.</Text><Text style={styles.subtitle}>Tell us where, when, and what you love.</Text></View></View>
      <View style={styles.suggestions}>{['Honeymoon under ₹1 lakh', 'Plan 5 romantic days in Bali', 'A family escape to Kashmir'].map(text => <TouchableOpacity key={text} accessibilityRole="button" onPress={() => setPrompt(text)} style={styles.suggestion}><Text style={styles.suggestionText}>{text}</Text></TouchableOpacity>)}</View></View>
      {messages.length === 0 ? <View style={styles.empty}><Ionicons name="map-outline" size={35} color={Colors.primary} /><Text style={styles.emptyTitle}>A journey made for you</Text><Text style={styles.emptyText}>Share your destination, budget and travel dates to start planning.</Text></View> : messages.map((message, index) => <View key={index} style={[styles.message, message.role === 'user' && styles.userMessage]}><Text style={styles.messageLabel}>{message.role === 'user' ? 'YOU' : 'LEMONTRIP ASSISTANT'}</Text><Text selectable style={styles.messageText}>{message.content}</Text></View>)}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator accessibilityLabel="Planning your trip" color={Colors.primary} style={{ padding: 20 }} /> : null}
    </ScrollView>
    <View style={styles.composer}><TextInput accessibilityLabel="Describe your trip" multiline value={prompt} onChangeText={setPrompt} placeholder="Where would you love to go?" placeholderTextColor={Colors.textLight} style={styles.input} /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Send message" disabled={loading || !prompt.trim()} onPress={send} style={[styles.send, (loading || !prompt.trim()) && { opacity: 0.45 }]}><Ionicons name="arrow-up" size={22} color={Colors.primary} /></TouchableOpacity></View>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary }, page: { flexGrow: 1, backgroundColor: Colors.background }, hero: { marginHorizontal: Ui.space.page, padding: 20, borderRadius: Ui.radius.card, overflow: 'hidden', backgroundColor: Colors.primaryDark }, eyebrow: { fontFamily: 'Manrope', fontSize: 10, letterSpacing: 1.4, fontWeight: '800', color: Colors.accent }, title: { fontFamily: 'Manrope', fontSize: 25, fontWeight: '800', color: Colors.white, marginTop: 8 }, intro: { flexDirection: 'row', gap: 16, alignItems: 'center', marginVertical: 24 }, lemon: { width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }, introTitle: { fontFamily: 'Manrope', fontSize: 19, fontWeight: '800', color: Colors.white }, subtitle: { fontFamily: 'Manrope', fontSize: 12, lineHeight: 19, color: Colors.onDarkMuted, marginTop: 5 }, suggestions: { gap: 8 }, suggestion: { borderWidth: 1, borderColor: Colors.borderOnDark, borderRadius: 20, padding: 12 }, suggestionText: { fontFamily: 'Manrope', fontSize: 13, color: Colors.onDarkMuted }, empty: { padding: 35, alignItems: 'center', gap: 14 }, emptyTitle: { fontFamily: 'Manrope', fontSize: 19, fontWeight: '800', color: Colors.primary }, emptyText: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 21, textAlign: 'center', color: Colors.textLight }, message: { margin: 18, marginBottom: 0, borderRadius: 20, backgroundColor: Colors.surface, padding: 20 }, userMessage: { backgroundColor: Colors.accentSoft }, messageLabel: { fontFamily: 'Manrope', fontSize: 10, letterSpacing: 1, fontWeight: '800', color: Colors.primary, marginBottom: 10 }, messageText: { fontFamily: 'Manrope', color: Colors.textDark, fontSize: 14, lineHeight: 23 }, error: { color: Colors.error, padding: 20, fontFamily: 'Manrope' }, composer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: Colors.surface, alignItems: 'center' }, input: { flex: 1, maxHeight: 120, minHeight: Ui.field.minHeight, fontFamily: 'Manrope', color: Colors.textDark, padding: 12, backgroundColor: Colors.background, borderRadius: Ui.radius.control }, send: { backgroundColor: Colors.accent, borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
