import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useBookings } from '@/utils/bookingStore';
import { sendChatMessage } from '@/utils/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Faq = { question: string; answer: string; category: string };
type AssistantMessage = { id: string; text: string; from: 'assistant' | 'user' };

const quickHelp = [
  { title: 'Bookings', icon: 'ticket-outline' as const, query: 'booking' },
  { title: 'Payments', icon: 'card-outline' as const, query: 'payment' },
  { title: 'Flights', icon: 'airplane-outline' as const, query: 'flight' },
  { title: 'Hotels', icon: 'bed-outline' as const, query: 'hotel' },
  { title: 'Buses', icon: 'bus-outline' as const, query: 'bus' },
  { title: 'Packages', icon: 'map-outline' as const, query: 'package' },
  { title: 'Visa', icon: 'document-text-outline' as const, query: 'visa' },
];

const faqs: Faq[] = [
  { category: 'Bookings', question: 'Where can I find my booking details?', answer: 'Open Your bookings from the profile tab. Select a trip to see its booking ID, status, date, and amount.' },
  { category: 'Bookings', question: 'Can I change or cancel a booking?', answer: 'Booking changes and cancellations depend on the provider and fare rules. Enter your booking ID below so our team can guide you to the right option.' },
  { category: 'Payments', question: 'What payment methods can I use?', answer: 'Payment method availability is shown during checkout. LemonTrip does not store your card details in this app.' },
  { category: 'Flights', question: 'When will I receive my flight confirmation?', answer: 'Your booking record appears in Your bookings after checkout. Keep the booking ID handy if you need help locating a confirmation.' },
  { category: 'Hotels', question: 'Can I request a special hotel arrangement?', answer: 'Send your request to hello@lemontrip.in with your booking ID and the property name. The hotel team will confirm what is possible.' },
  { category: 'Visa', question: 'How long does visa assistance take?', answer: 'Indicative processing times vary by destination and visa type. Review the destination guidance, then contact an advisor before applying.' },
];

const initialAssistantMessages: AssistantMessage[] = [
  { id: 'welcome', from: 'assistant', text: 'Hi, I am the LemonTrip assistant. Ask me about a booking, payment, flight, hotel, bus, package, or visa.' },
];

export default function HelpScreen() {
  const bookings = useBookings();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState(initialAssistantMessages);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();

  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqs;
    return faqs.filter((faq) => `${faq.category} ${faq.question} ${faq.answer}`.toLowerCase().includes(query));
  }, [search]);

  const findBooking = () => {
    const normalizedId = bookingId.trim().toLowerCase();
    if (!normalizedId) {
      setBookingMessage('Enter the booking ID from your confirmation or bookings list.');
      return;
    }
    const booking = bookings.find((item) => item.id.toLowerCase() === normalizedId);
    if (!booking) {
      setBookingMessage('We could not find that booking on this device. Check the ID and try again, or contact support for help.');
      return;
    }
    setBookingMessage(`Booking found: ${booking.itemName}. Choose how you need help below.`);
  };

  const sendAssistantMessage = async () => {
    const text = assistantInput.trim();
    if (!text || assistantLoading) return;
    setAssistantError('');
    setAssistantInput('');
    setAssistantMessages((current) => [...current, { id: `${Date.now()}-user`, from: 'user', text }]);
    setAssistantLoading(true);
    try {
      const history = assistantMessages.filter((message) => message.id !== 'welcome').map((message) => ({ role: message.from, content: message.text }));
      const result = await sendChatMessage(text, history, undefined, conversationId);
      setConversationId(result.conversationId);
      setAssistantMessages((current) => [...current, { id: `${Date.now()}-assistant`, from: 'assistant', text: result.reply }]);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'Support is temporarily unavailable.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const clearAssistant = () => {
    setAssistantMessages(initialAssistantMessages);
    setAssistantError('');
    setConversationId(undefined);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Help & Support" subtitle="Thoughtful help for every part of your journey." eyebrow="LEMONTRIP / SUPPORT" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} />

          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.heroIcon}><Ionicons name="headset-outline" size={24} color={Colors.primaryDark} /></View>
            <Text style={styles.heroEyebrow}>TRAVEL SUPPORT, MADE SIMPLE</Text>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSubtitle}>Find a quick answer, check a booking, or talk to our team.</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={Colors.primary} />
              <TextInput value={search} onChangeText={setSearch} placeholder="Search your question" placeholderTextColor={Colors.textLight} style={styles.searchInput} returnKeyType="search" />
              {search ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear support search" onPress={() => setSearch('')}><Ionicons name="close-circle" size={19} color={Colors.textLight} /></TouchableOpacity> : null}
            </View>
          </View>

          <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>QUICK HELP</Text><Text style={styles.sectionTitle}>What can we help with?</Text></View><Text style={styles.sectionHint}>Start with a topic</Text></View>
          <View style={[styles.quickGrid, desktop && styles.quickGridDesktop]}>
            {quickHelp.map((item) => <TouchableOpacity key={item.title} accessibilityRole="button" onPress={() => setSearch(item.query)} style={[styles.quickCard, desktop && styles.quickCardDesktop]}><View style={styles.quickIcon}><Ionicons name={item.icon} size={20} color={Colors.primary} /></View><Text style={styles.quickTitle}>{item.title}</Text><Ionicons name="arrow-forward" size={15} color={Colors.textLight} /></TouchableOpacity>)}
          </View>

          <View style={[styles.mainLayout, desktop && styles.mainLayoutDesktop]}>
            <View style={styles.primaryColumn}>
              <View style={styles.panel}>
                <View style={styles.panelHeading}><View><Text style={styles.eyebrow}>ANSWERS, AT A GLANCE</Text><Text style={styles.sectionTitle}>Frequently asked questions</Text></View><Text style={styles.resultCount}>{visibleFaqs.length} answers</Text></View>
                {visibleFaqs.length ? visibleFaqs.map((faq) => {
                  const expanded = openFaq === faq.question;
                  return <View key={faq.question} style={styles.faqItem}><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setOpenFaq(expanded ? null : faq.question)} style={styles.faqButton}><View style={styles.faqCategory}><Text style={styles.faqCategoryText}>{faq.category}</Text></View><Text style={styles.faqQuestion}>{faq.question}</Text><Ionicons name={expanded ? 'remove' : 'add'} size={18} color={Colors.primary} /></TouchableOpacity>{expanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}</View>;
                }) : <View style={styles.emptyFaq}><Ionicons name="search-outline" size={22} color={Colors.primary} /><Text style={styles.emptyTitle}>No matching answers</Text><Text style={styles.emptyText}>Try a different question or contact our team.</Text></View>}
              </View>

              <View style={styles.bookingPanel}>
                <View style={styles.bookingPanelIcon}><Ionicons name="receipt-outline" size={22} color={Colors.primary} /></View><View style={styles.bookingPanelCopy}><Text style={styles.eyebrow}>BOOKING SUPPORT</Text><Text style={styles.bookingTitle}>Need help with a specific trip?</Text><Text style={styles.bookingDescription}>Enter your booking ID and we will show the best next step.</Text></View>
                <View style={styles.bookingInputRow}><TextInput value={bookingId} onChangeText={(value) => { setBookingId(value); setBookingMessage(''); }} placeholder="Enter booking ID" placeholderTextColor={Colors.textLight} style={styles.bookingInput} autoCapitalize="characters" /><TouchableOpacity accessibilityRole="button" onPress={findBooking} style={styles.bookingButton}><Text style={styles.bookingButtonText}>Find booking</Text></TouchableOpacity></View>
                {bookingMessage ? <Text style={styles.bookingMessage}>{bookingMessage}</Text> : null}
                {bookingMessage.startsWith('Booking found') ? <View style={styles.supportOptions}><TouchableOpacity onPress={() => Linking.openURL('mailto:hello@lemontrip.in')} style={styles.supportOption}><Ionicons name="mail-outline" size={17} color={Colors.primary} /><Text style={styles.supportOptionText}>Email booking support</Text></TouchableOpacity><TouchableOpacity onPress={() => setAssistantInput('I need help with my booking')} style={styles.supportOption}><Ionicons name="chatbubble-ellipses-outline" size={17} color={Colors.primary} /><Text style={styles.supportOptionText}>Ask the assistant</Text></TouchableOpacity></View> : null}
              </View>
            </View>

            <View style={styles.secondaryColumn}>
              <View style={styles.contactPanel}><Text style={styles.eyebrow}>CONTACT LEMONTRIP</Text><Text style={styles.contactTitle}>A real person is close by.</Text><Text style={styles.contactDescription}>Choose the channel that works best for your journey.</Text><ContactAction icon="call-outline" title="Call us" detail="+91 22 1234 5678" onPress={() => Linking.openURL('tel:+912212345678')} /><ContactAction icon="mail-outline" title="Email us" detail="hello@lemontrip.in" onPress={() => Linking.openURL('mailto:hello@lemontrip.in')} /><ContactAction icon="chatbubble-ellipses-outline" title="Chat with LemonTrip" detail="Ask the assistant below" onPress={() => setAssistantInput('I need help')} /></View>

              <View style={styles.assistantPanel}><View style={styles.assistantHeader}><View style={styles.assistantMark}><Ionicons name="sparkles-outline" size={18} color={Colors.primaryDark} /></View><View style={styles.assistantHeadingCopy}><Text style={styles.assistantTitle}>LemonTrip assistant</Text><Text style={styles.assistantStatus}>{conversationId ? 'Conversation active' : 'Here in the support center'}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear assistant conversation" onPress={clearAssistant}><Ionicons name="refresh-outline" size={17} color={Colors.white} /></TouchableOpacity><View style={styles.onlineDot} /></View><View style={styles.messageList}>{assistantMessages.slice(-6).map((message) => <View key={message.id} style={[styles.messageBubble, message.from === 'user' ? styles.userBubble : styles.assistantBubble]}><Text style={[styles.messageText, message.from === 'user' && styles.userMessageText]}>{message.text}</Text></View>)}{assistantLoading ? <View style={[styles.messageBubble, styles.assistantBubble]}><Text style={styles.messageText}>Thinking...</Text></View> : null}{assistantError ? <View style={styles.errorRow}><Text style={styles.assistantError}>{assistantError}</Text><TouchableOpacity onPress={() => setAssistantInput('Please retry my last question')}><Text style={styles.retryText}>Retry</Text></TouchableOpacity></View> : null}</View><View style={styles.suggestionRow}>{['Find available travel packages', 'How can I check my booking?', 'How can I contact support?'].map((prompt) => <TouchableOpacity key={prompt} disabled={assistantLoading} onPress={() => setAssistantInput(prompt)} style={styles.suggestionChip}><Text style={styles.suggestionText}>{prompt}</Text></TouchableOpacity>)}</View><View style={styles.assistantInputRow}><TextInput value={assistantInput} onChangeText={setAssistantInput} placeholder="Ask a question" placeholderTextColor={Colors.textLight} style={styles.assistantInput} onSubmitEditing={sendAssistantMessage} returnKeyType="send" editable={!assistantLoading} /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Send message" disabled={assistantLoading || !assistantInput.trim()} onPress={sendAssistantMessage} style={[styles.sendButton, (assistantLoading || !assistantInput.trim()) && styles.sendButtonDisabled]}><Ionicons name={assistantLoading ? 'hourglass-outline' : 'arrow-up'} size={17} color={Colors.primaryDark} /></TouchableOpacity></View></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactAction({ icon, title, detail, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.contactAction}><View style={styles.contactIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View><View style={styles.contactCopy}><Text style={styles.contactActionTitle}>{title}</Text><Text style={styles.contactDetail}>{detail}</Text></View><Ionicons name="arrow-forward" size={16} color={Colors.textLight} /></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 32 }, content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  hero: { overflow: 'hidden', marginHorizontal: 16, padding: 24, borderRadius: 22, backgroundColor: Colors.primaryDark }, heroGlow: { position: 'absolute', right: -35, top: -45, width: 170, height: 170, borderRadius: 85, backgroundColor: '#118047', opacity: 0.5 }, heroIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accent }, heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginTop: 17 }, heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 32, lineHeight: 38, fontWeight: '900', marginTop: 5 }, heroSubtitle: { maxWidth: 460, color: 'rgba(255,255,255,0.78)', fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 5 },
  searchBox: { maxWidth: 580, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, paddingHorizontal: 15, borderRadius: 14, backgroundColor: Colors.surface }, searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, paddingVertical: 10 }, sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 25, marginHorizontal: 16, marginBottom: 11 }, eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1.1 }, sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900', marginTop: 4 }, sectionHint: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: 16 }, quickGridDesktop: { gap: 10 }, quickCard: { width: '31.8%', minHeight: 92, justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, backgroundColor: Colors.surface }, quickCardDesktop: { flex: 1, width: undefined, minWidth: 120 }, quickIcon: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accentSoft }, quickTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  mainLayout: { gap: 14, marginTop: 15, paddingHorizontal: 16 }, mainLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 }, primaryColumn: { flex: 1.45, minWidth: 0, gap: 14 }, secondaryColumn: { flex: 1, minWidth: 0, gap: 14 }, panel: { padding: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, backgroundColor: Colors.surface }, panelHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 12 }, resultCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 }, faqItem: { borderTopWidth: 1, borderTopColor: Colors.border }, faqButton: { minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 9 }, faqCategory: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.accentSoft }, faqCategoryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' }, faqQuestion: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, lineHeight: 16, fontWeight: '800' }, faqAnswer: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 16, paddingRight: 25, paddingBottom: 14 }, emptyFaq: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 5 }, emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' }, emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10 },
  bookingPanel: { padding: 16, borderRadius: 17, backgroundColor: Colors.accentSoft }, bookingPanelIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.surface }, bookingPanelCopy: { marginTop: 12 }, bookingTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900', marginTop: 4 }, bookingDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginTop: 4 }, bookingInputRow: { flexDirection: 'row', gap: 7, marginTop: 13 }, bookingInput: { flex: 1, minWidth: 0, minHeight: 43, paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.surface, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10 }, bookingButton: { minHeight: 43, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors.primary }, bookingButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' }, bookingMessage: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginTop: 9 }, supportOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }, supportOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: Colors.surface }, supportOptionText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  contactPanel: { padding: 17, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, contactTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 5 }, contactDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 15, marginTop: 4, marginBottom: 8 }, contactAction: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: Colors.border }, contactIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accentSoft }, contactCopy: { flex: 1, minWidth: 0 }, contactActionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' }, contactDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, marginTop: 2 },
  assistantPanel: { overflow: 'hidden', padding: 16, borderRadius: 17, backgroundColor: Colors.primaryDark }, assistantHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 }, assistantMark: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accent }, assistantHeadingCopy: { flex: 1 }, assistantTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900' }, assistantStatus: { color: 'rgba(255,255,255,0.62)', fontFamily: 'Manrope', fontSize: 9, marginTop: 2 }, onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }, messageList: { gap: 7, marginTop: 14 }, messageBubble: { maxWidth: '90%', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11 }, assistantBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)' }, userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.accent }, messageText: { color: 'rgba(255,255,255,0.88)', fontFamily: 'Manrope', fontSize: 9, lineHeight: 14 }, userMessageText: { color: Colors.primaryDark }, suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 }, suggestionChip: { paddingHorizontal: 7, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)' }, suggestionText: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Manrope', fontSize: 8 }, errorRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 }, assistantError: { flex: 1, color: '#ffb4b4', fontFamily: 'Manrope', fontSize: 8, lineHeight: 12 }, retryText: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' }, assistantInputRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13, paddingLeft: 11, paddingRight: 5, borderRadius: 11, backgroundColor: Colors.surface }, assistantInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, paddingVertical: 9 }, sendButton: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accent }, sendButtonDisabled: { opacity: 0.5 },
});
