import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { TextSize } from '@/constants/typography';
import type { ChatMessage } from '@/utils/chatApi';
import { streamChatMessage } from '@/utils/chatStream';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
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
  useAppLanguage();
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
    else router.replace('/home' as never);
  };

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    // Previous messages (without the welcome text) as chat history for the API
    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome' && m.text.trim())
      .map((m) => ({ role: m.role, content: m.text }));

    // eslint-disable-next-line react-hooks/purity -- Timestamp is created only by the send event, never during render.
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
        <View style={styles.topBar}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.topBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color={GREEN} />
          </TouchableOpacity>
          <Text accessibilityRole="header" style={styles.topTitle}>Trip Planner</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" style={[styles.topBtn, styles.topBtnTint]} onPress={() => router.push('/settings' as never)}>
            <Ionicons name="settings-outline" size={22} color={GREEN} />
          </TouchableOpacity>
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
            <View style={styles.banner}>
              <Image source={require('../../assets/images/Emerald Travel Assistant Banner.png')} resizeMode="cover" style={styles.bannerImg} />
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerEyebrow}>LEMONTRIP AI</Text>
                <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Trip Planner</Text>
              </View>
            </View>

            {messages.map((message) => {
              const mine = message.role === 'user';
              const waiting = !mine && message.text === '';
              return (
                <View key={message.id} style={[styles.row, mine && styles.rowMine]}>
                  {!mine ? (
                    <View style={styles.avatar}>
                      <Ionicons name="sparkles" size={18} color={GREEN} />
                    </View>
                  ) : null}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleBot]}>
                    {mine ? (
                      <Text style={[styles.bubbleText, styles.bubbleTextMine]}>{message.text}</Text>
                    ) : waiting ? (
                      <ActivityIndicator size="small" color={GREEN} />
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
                {suggestions.map((item, index) => (
                  <TouchableOpacity key={item} accessibilityRole="button" style={styles.chip} onPress={() => send(item)}>
                    <View style={styles.chipIcon}><Ionicons name={SUGGESTION_ICONS[index] ?? 'sparkles-outline'} size={22} color={Colors.white} /></View>
                    <Text style={styles.chipText}>{item}</Text>
                    <Ionicons name="arrow-forward" size={20} color={GREEN} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Text style={styles.disclaimer}>AI suggestions are estimates. Check prices and availability in the app.</Text>

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
              <Ionicons name="send" size={20} color={GREEN} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const INTER = { regular: 'Inter-Regular', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const GREEN = '#103D30';
const SUGGESTION_ICONS: React.ComponentProps<typeof Ionicons>['name'][] = ['umbrella-outline', 'globe-outline', 'briefcase-outline', 'id-card-outline'];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN },
  body: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center', backgroundColor: Colors.background },
  messages: { padding: 16, gap: 14 },
  banner: { width: '100%', aspectRatio: 2.993, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: GREEN },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { width: '55%', paddingLeft: 18 },
  bannerEyebrow: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.4, color: Colors.accent },
  bannerTitle: { fontFamily: INTER.bold, fontSize: 26, lineHeight: 32, color: Colors.white, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  rowMine: { justifyContent: 'flex-end' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1B8' },
  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 22 },
  bubbleBot: { backgroundColor: Colors.white },
  bubbleMine: { backgroundColor: GREEN },
  bubbleText: { color: Colors.textDark, fontFamily: INTER.regular, fontSize: TextSize.bodyLarge, lineHeight: 24 },
  bubbleTextMine: { color: Colors.white },
  boldText: { fontFamily: INTER.bold, color: GREEN },
  suggestions: { gap: 10, marginTop: 4 },
  suggestLabel: { color: Colors.textLight, fontFamily: INTER.semibold, fontSize: TextSize.body, letterSpacing: 1.4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  chipText: { flex: 1, color: Colors.textDark, fontFamily: INTER.regular, fontSize: TextSize.bodyLarge },
  disclaimer: { textAlign: 'center', paddingHorizontal: 16, paddingVertical: 8, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, margin: 12, padding: 8, borderRadius: 30, backgroundColor: Colors.white },
  input: { flex: 1, minHeight: 48, maxHeight: 110, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, backgroundColor: Colors.background, color: Colors.textDark, fontFamily: INTER.regular, fontSize: TextSize.bodyLarge },
  sendButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: Colors.accent },
  sendDisabled: { opacity: 0.4 },
});