import { Brand, Colors, Radius } from '@/constants/colors';
import { sendChatMessage, type ChatMessage } from '@/utils/chatApi';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FONT = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
} as const;

type Message = { id: string; role: 'user' | 'assistant'; text: string };

const suggestions = [
  'Plan a 5-day Goa trip under ₹30,000',
  'Best time to visit Maldives?',
  'Weekend getaway near Delhi',
  'Visa tips for Thailand',
];

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! I am your LemonTrip AI Planner. Tell me where you want to go, your budget and dates, and I will help plan your trip.',
};

export default function AiPlannerScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const conversationIdRef = useRef<string | undefined>(undefined);

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
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    try {
      const result = await sendChatMessage(text, history, undefined, conversationIdRef.current);
      conversationIdRef.current = result.conversationId;
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: result.reply }]);
    } catch (error) {
      console.error('Planner request failed:', error);
      const reason = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'assistant', text: reason }]);
    } finally {
      setLoading(false);
      scrollToEnd();
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
              return (
                <View key={message.id} style={[styles.row, mine && styles.rowMine]}>
                  {!mine ? (
                    <View style={styles.avatar}>
                      <Ionicons name="sparkles" size={14} color={Brand.forest} />
                    </View>
                  ) : null}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleBot]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{message.text}</Text>
                  </View>
                </View>
              );
            })}

            {loading ? (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={14} color={Brand.forest} />
                </View>
                <View style={[styles.bubble, styles.bubbleBot]}>
                  <ActivityIndicator size="small" color={Brand.forest} />
                </View>
              </View>
            ) : null}

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

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your next trip…"
              placeholderTextColor={Colors.textLight}
              multiline
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
            />
            <TouchableOpacity
              accessibilityRole="button"
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
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.6 },
  pageTitle: { color: Colors.white, fontFamily: FONT.extra, fontSize: 26, marginTop: 2 },
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
  bubbleText: { color: Colors.textDark, fontFamily: FONT.medium, fontSize: 14, lineHeight: 21 },
  bubbleTextMine: { color: Colors.white },

  suggestions: { gap: 8, marginTop: 4 },
  suggestLabel: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.4 },
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
  chipText: { flex: 1, color: Colors.textDark, fontFamily: FONT.bold, fontSize: 13 },

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
    fontFamily: FONT.medium,
    fontSize: 14,
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