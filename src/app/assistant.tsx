import { SupportButton, SupportCard, SupportHeading, SupportItem, SupportNotice, SupportPage } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { sendChatMessage, type ChatMessage } from '@/utils/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useRef, useState, type ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

const shortcuts: { title: string; detail: string; icon: IconName; route?: Href; prompt?: string }[] = [
  { title: 'Book a flight', detail: 'Search and compare fares', icon: 'airplane-outline', route: '/(tabs)/explore/flights' },
  { title: 'Search hotels', detail: 'Find a place to stay', icon: 'bed-outline', route: '/(tabs)/explore/hotels' },
  { title: 'Manage bookings', detail: 'Status, dates and payments', icon: 'briefcase-outline', route: '/(tabs)/bookings' },
  { title: 'My travel documents', detail: 'Tickets, vouchers and visas', icon: 'document-text-outline', route: '/travel-documents' },
  { title: 'Local recommendations', detail: 'Ask for ideas at your destination', icon: 'map-outline', prompt: 'Help me find local recommendations for my destination.' },
];

export default function AssistantScreen() {
  const user = useAuth();
  return <AssistantChat key={user?.id ?? 'guest'} />;
}

function AssistantChat() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scroll = useRef<ScrollView>(null);
  const submitting = useRef(false);
  const canSend = !busy && !!prompt.trim();

  const send = async () => {
    const content = prompt.trim();
    if (!content || submitting.current) return;
    submitting.current = true; setBusy(true); setError('');
    try {
      const result = await sendChatMessage(content, messages, getAccessToken() ?? undefined, conversationId);
      setMessages((current) => [...current, { role: 'user', content }, { role: 'assistant', content: result.reply }]);
      setConversationId(result.conversationId);
      setPrompt('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reach the travel assistant. Please retry.');
    } finally {
      submitting.current = false; setBusy(false);
    }
  };

  const back = () => (router.canGoBack() ? router.back() : router.replace('/help' as never));

  const composer = (
    <View style={styles.composer}>
      <TextInput
        accessibilityLabel="Message travel assistant"
        placeholder="Type your message…"
        placeholderTextColor={Colors.textLight}
        multiline
        maxLength={1200}
        value={prompt}
        onChangeText={(value) => { setPrompt(value); setError(''); }}
        editable={!busy}
        style={styles.input}
      />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Send message" disabled={!canSend} onPress={() => void send()} activeOpacity={0.8} style={[styles.send, !canSend && styles.disabled]}>
        {busy ? <ActivityIndicator color={Colors.white} size="small" /> : <Ionicons name="send" size={17} color={Colors.white} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SupportPage
      title="Travel assistant"
      subtitle="Ask about trips, bookings and destinations."
      eyebrow="LEMONTRIP / SUPPORT"
      onBack={back}
      scrollRef={scroll}
      onContentSizeChange={() => { if (messages.length || busy) scroll.current?.scrollToEnd({ animated: true }); }}
      footer={composer}>
      <View style={styles.page}>
        {!messages.length ? (
          <SupportCard>
            <SupportHeading eyebrow="QUICK START" title="What can I help with?" />
            {shortcuts.map((item, index) => (
              <SupportItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                detail={item.detail}
                last={index === shortcuts.length - 1}
                onPress={() => { if (item.route) router.push(item.route); else { setPrompt(item.prompt ?? ''); setError(''); } }}
              />
            ))}
          </SupportCard>
        ) : (
          messages.map((message, index) => {
            const mine = message.role === 'user';
            return (
              <View key={index} style={[styles.message, mine ? styles.userMessage : styles.botMessage]}>
                <Text style={[styles.sender, mine && styles.userSender]}>{mine ? 'YOU' : 'LEMONTRIP ASSISTANT'}</Text>
                <Text selectable style={[styles.messageText, mine && styles.userText]}>{message.content}</Text>
              </View>
            );
          })
        )}

        {busy ? (
          <View style={[styles.message, styles.botMessage, styles.typing]}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}>The travel assistant is replying…</Text>
          </View>
        ) : null}

        {error ? (
          <SupportCard>
            <SupportNotice tone="error">{error}</SupportNotice>
            <View style={{ height: 10 }} />
            <SupportButton variant="soft" label="Contact support" icon="mail-open-outline" onPress={() => router.push('/contact')} />
          </SupportCard>
        ) : null}
      </View>
    </SupportPage>
  );
}

const styles = StyleSheet.create({
  page: { gap: 12, paddingBottom: 8 },
  message: { maxWidth: '88%', padding: 14, borderRadius: 18, marginHorizontal: Ui.space.page },
  botMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  userMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 4, backgroundColor: Colors.primaryDark },
  sender: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  userSender: { color: Colors.onDarkMuted },
  messageText: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22, color: Colors.textDark },
  userText: { color: Colors.white },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typingText: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textLight },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderRadius: 26, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface, paddingLeft: 6, paddingRight: 6, paddingVertical: 6 },
  input: { flex: 1, minWidth: 0, minHeight: 40, maxHeight: 110, paddingHorizontal: 29, paddingVertical: 10, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  disabled: { opacity: 0.45 },
});
