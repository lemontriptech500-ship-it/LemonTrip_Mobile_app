import { Text, TextInput } from '@/components/ui/Text';
import { Brand, Colors, Radius } from '@/constants/colors';
import { FontFamily, TextSize } from '@/constants/typography';
import type { ChatMessage } from '@/utils/chatApi';
import { streamChatMessage } from '@/utils/chatStream';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

const BULLET = String.fromCharCode(8226) + '  ';

const suggestions = [
  'Plan a 5-day Goa trip under Rs 30,000',
  'Best time to visit Maldives?',
  'Weekend getaway near Delhi',
  'Visa tips for Thailand',
];

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! I am your LemonTrip AI Planner. Tell me where you want to go, your budget and dates, and I will help plan your trip.',
};

// Renders **bold** text and turns "- " / "* " lines into bullets.
function RichText({ text, style, boldStyle }: { text: string; style: object; boldStyle: object }) {
  const lines = text.split('\n');
  return (
    <Text style={style}>
      {lines.map((rawLine, lineIndex) => {
        const bulletMatch = rawLine.match(/^\s*[-*]\s+(.*)$/);
        const content = bulletMatch ? bulletMatch[1] : rawLine;
        const parts = content.split(/(\*\*[^*]+\*\*)/g).filter((part) => part !== '');
        return (
          <Text key={lineIndex}>
            {bulletMatch ? BULLET : ''}
            {parts.map((part, partIndex) =>
              part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
                <Text key={partIndex} style={boldStyle}>
                  {part.slice(2, -2)}
                </Text>
              ) : (
                <Text key={partIndex}>{part}</Text>
              ),
            )}
            {lineIndex < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      })}
    </Text>
  );
}

export default function AiPlannerScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const conversationIdRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  // Stop any running reply when the user leaves the screen.
  useEffect(() => () => abortRef.current?.abort(), []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as never);
  };

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    // Previous messages (without the welcome text) as chat history for the API
    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome' && m.text.trim())
      .map((m) => ({ role: m.role, content: m.text }));

    const stamp = Date.now();
    const replyId = `a-${stamp}`;
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: 'user', text },
      { id: replyId, role: 'assistant', text: '' },
    ]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await streamChatMessage(text, history, {
        mode: 'planner',
        conversationId: conversationIdRef.current,
        signal: controller.signal,
        onDelta: (delta) =>
          setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, text: m.text + delta } : m))),
      });
      if (result.conversationId) conversationIdRef.current = result.conversationId;
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Planner request failed:', error);
      const reason = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      // Keep any partial reply; otherwise show the error in the empty reply bubble.
      setMessages((prev) => prev.map((m) => (m.id === replyId && !m.text ? { ...m, text: reason } : m)));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        scrollToEnd();
      }
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Green header */}
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={22} color={Brand.forest} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrowLemon}>LEMONTRIP AI</Text>
            <Text style={styles.pageTitle}>Trip Planner</Text>
          </View>
          <View style={styles.sparkle}>
            <Ionicons name="sparkles" size={20} color={Brand.forest} />
          </View>
        </View>

        <View style={styles.body}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToEnd}
          >
            {messages.map((message) => {
              const mine = message.role === 'user';
              const waiting = !mine && message.text === '';
              return (
                <View key={message.id} style={[styles.row, mine && styles.rowMine]}>
                  {!mine ? (
                    <View style={styles.avatar}>
                      <Ionicons name="sparkles" size={14} color={Brand.forest} />
                    </View>
                  ) : null}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleBot]}>
                    {mine ? (
                      <Text style={[styles.bubbleText, styles.bubbleTextMine]}>{message.text}</Text>
                    ) : waiting ? (
                      <ActivityIndicator size="small" color={Brand.forest} />
                    ) : (
                      <RichText text={message.text} style={styles.bubbleText} boldStyle={styles.boldText} />
                    )}
                  </View>
                </View>
              );
            })}

            {showSuggestions ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestLabel}>TRY ASKING</Text>
                {suggestions.map((item) => (
                  <TouchableOpacity key={item} accessibilityRole="button" style={styles.chip} onPress={() => send(item)}>
                    <Text style={styles.chipText}>{item}</Text>
                    <Ionicons name="arrow-forward" size={14} color={Brand.forest} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Text style={styles.disclaimer}>AI suggestions are estimates. Check prices and availability in the app.</Text>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your next trip..."
              placeholderTextColor={Colors.textLight}
              multiline
              maxLength={1000}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendDisabled]}
              onPress={() => send(input)}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={18} color={Brand.forest} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.forest,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: Brand.lemon,
  },
  headerCopy: { flex: 1 },
  eyebrowLemon: { color: Brand.lemon, fontFamily: FontFamily.sans, fontSize: TextSize.micro, letterSpacing: 1.6 },
  pageTitle: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.display, marginTop: 2 },
  sparkle: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: Brand.lemon,
  },

  body: {
    flex: 1,
    backgroundColor: Brand.cream,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  messages: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowMine: { justifyContent: 'flex-end' },
  avatar: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Brand.lemon,
  },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: Radius.lg },
  bubbleBot: { backgroundColor: Colors.white, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: Brand.forest, borderBottomRightRadius: 4 },
  bubbleText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 21 },
  bubbleTextMine: { color: Colors.white },
  boldText: { fontFamily: FontFamily.sans, fontWeight: '800', color: Brand.forest },

  suggestions: { gap: 8, marginTop: 4 },
  suggestLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, letterSpacing: 1.4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: '#E4E3DA',
    backgroundColor: Colors.white,
  },
  chipText: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body },

  disclaimer: {
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    color: Colors.textLight,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E3DA',
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Brand.cream,
    color: Colors.textDark,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Brand.lemon,
  },
  sendDisabled: { opacity: 0.4 },
});
