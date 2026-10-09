import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon, type TravelArtworkName } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useBookings } from '@/utils/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { mockHelpFaqs } from '@/data/mock/faqs';

type QuickHelpItem = { title: string; query: string } & (
  | { artwork: TravelArtworkName }
  | { icon: keyof typeof Ionicons.glyphMap }
);

const quickHelp: QuickHelpItem[] = [
  { title: 'Bookings', artwork: 'offer', query: 'booking' },
  { title: 'Payments', icon: 'card-outline', query: 'payment' },
  { title: 'Flights', artwork: 'flight', query: 'flight' },
  { title: 'Hotels', artwork: 'hotel', query: 'hotel' },
  { title: 'Buses', artwork: 'bus', query: 'bus' },
  { title: 'Packages', artwork: 'package', query: 'package' },
  { title: 'Visa', artwork: 'visa', query: 'visa' },
];

export default function HelpScreen() {
  const bookings = useBookings();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mockHelpFaqs;
    return mockHelpFaqs.filter((faq) => `${faq.category} ${faq.question} ${faq.answer}`.toLowerCase().includes(query));
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


  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Help & Support" subtitle="Thoughtful help for every part of your journey." eyebrow="LEMONTRIP / SUPPORT" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} />

          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.heroIcon}><TravelArtworkIcon name="help" size={38} /></View>
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
            {quickHelp.map((item) => <TouchableOpacity key={item.title} accessibilityRole="button" onPress={() => setSearch(item.query)} style={[styles.quickCard, desktop && styles.quickCardDesktop]}><View style={styles.quickIcon}>{'artwork' in item ? <TravelArtworkIcon name={item.artwork} size={29} /> : <Ionicons name={item.icon} size={20} color={Colors.primary} />}</View><Text style={styles.quickTitle}>{item.title}</Text><Ionicons name="arrow-forward" size={15} color={Colors.textLight} /></TouchableOpacity>)}
          </View>

          <View style={[styles.mainLayout, desktop && styles.mainLayoutDesktop]}>
            <View style={styles.primaryColumn}>
              <View style={styles.panel}>
                <View style={styles.panelHeading}><View><Text style={styles.eyebrow}>GENERAL GUIDANCE</Text><Text style={styles.sectionTitle}>Frequently asked questions</Text></View><Text style={styles.resultCount}>{visibleFaqs.length} answers</Text></View>
                {visibleFaqs.length ? visibleFaqs.map((faq) => {
                  const expanded = openFaq === faq.question;
                  return <View key={faq.question} style={styles.faqItem}><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setOpenFaq(expanded ? null : faq.question)} style={styles.faqButton}><View style={styles.faqCategory}><Text style={styles.faqCategoryText}>{faq.category}</Text></View><Text style={styles.faqQuestion}>{faq.question}</Text><Ionicons name={expanded ? 'remove' : 'add'} size={18} color={Colors.primary} /></TouchableOpacity>{expanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}</View>;
                }) : <View style={styles.emptyFaq}><Ionicons name="search-outline" size={22} color={Colors.primary} /><Text style={styles.emptyTitle}>No matching answers</Text><Text style={styles.emptyText}>Try a different question or contact our team.</Text></View>}
              </View>

              <View style={styles.bookingPanel}>
                <View style={styles.bookingPanelIcon}><Ionicons name="receipt-outline" size={22} color={Colors.primary} /></View><View style={styles.bookingPanelCopy}><Text style={styles.eyebrow}>BOOKING SUPPORT</Text><Text style={styles.bookingTitle}>Need help with a specific trip?</Text><Text style={styles.bookingDescription}>Enter your booking ID and we will show the best next step.</Text></View>
                <View style={styles.bookingInputRow}><TextInput value={bookingId} onChangeText={(value) => { setBookingId(value); setBookingMessage(''); }} placeholder="Enter booking ID" placeholderTextColor={Colors.textLight} style={styles.bookingInput} autoCapitalize="characters" /><TouchableOpacity accessibilityRole="button" onPress={findBooking} style={styles.bookingButton}><Text style={styles.bookingButtonText}>Find booking</Text></TouchableOpacity></View>
                {bookingMessage ? <Text style={styles.bookingMessage}>{bookingMessage}</Text> : null}
                {bookingMessage.startsWith('Booking found') ? <View style={styles.supportOptions}><TouchableOpacity onPress={() => Linking.openURL('mailto:lemontripindia@gmail.com')} style={styles.supportOption}><Ionicons name="mail-outline" size={17} color={Colors.primary} /><Text style={styles.supportOptionText}>Email booking support</Text></TouchableOpacity><TouchableOpacity onPress={() => router.push('/assistant')} style={styles.supportOption}><Ionicons name="chatbubble-ellipses-outline" size={17} color={Colors.primary} /><Text style={styles.supportOptionText}>Ask the assistant</Text></TouchableOpacity></View> : null}
              </View>
            </View>

            <View style={styles.secondaryColumn}>
              <View style={styles.contactPanel}><Text style={styles.eyebrow}>CONTACT LEMONTRIP</Text><Text style={styles.contactTitle}>A real person is close by.</Text><Text style={styles.contactDescription}>Choose the channel that works best for your journey.</Text><ContactAction icon="logo-whatsapp" title="WhatsApp us" detail="Talk to the LemonTrip team" onPress={() => Linking.openURL('https://wa.me/919812042030')} /><ContactAction icon="mail-outline" title="Email us" detail="lemontripindia@gmail.com" onPress={() => Linking.openURL('mailto:lemontripindia@gmail.com')} /><ContactAction icon="chatbubble-ellipses-outline" title="Chat with LemonTrip" detail="Plan a trip or ask a question" onPress={() => router.push('/assistant')} /></View>

              <View style={styles.panel}><Text style={styles.sectionTitle}>One assistant, every journey.</Text><Text style={styles.contactDescription}>Get help with destinations, travel services and your trip plans.</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/assistant')} style={styles.bookingButton}><Text style={styles.bookingButtonText}>Open travel assistant</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/manage/support-requests')} style={styles.supportOption}><Text style={styles.supportOptionText}>My support requests</Text></TouchableOpacity></View>
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
  hero: { overflow: 'hidden', marginHorizontal: Ui.space.page, padding: 24, borderRadius: 22, backgroundColor: Colors.primaryDark }, heroGlow: { position: 'absolute', right: -35, top: -45, width: 170, height: 170, borderRadius: 85, backgroundColor: Colors.primary, opacity: 0.5 }, heroIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accent }, heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 17 }, heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 32, lineHeight: 38, fontWeight: '800', marginTop: 5 }, heroSubtitle: { maxWidth: 460, color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 5 },
  searchBox: { maxWidth: 580, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, paddingHorizontal: 15, borderRadius: 14, backgroundColor: Colors.surface }, searchInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, paddingVertical: 10 }, sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 25, marginHorizontal: Ui.space.page, marginBottom: 11 }, eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 4 }, sectionHint: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: 16 }, quickGridDesktop: { gap: 10 }, quickCard: { ...Ui.card, width: '31.8%', minHeight: 92, justifyContent: 'space-between', padding: Ui.space.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface }, quickCardDesktop: { flex: 1, width: undefined, minWidth: 120 }, quickIcon: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accentSoft }, quickTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  mainLayout: { gap: 14, marginTop: 15, paddingHorizontal: 16 }, mainLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 }, primaryColumn: { flex: 1.45, minWidth: 0, gap: 14 }, secondaryColumn: { flex: 1, minWidth: 0, gap: 14 }, panel: { ...Ui.card, padding: Ui.space.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface }, panelHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 12 }, resultCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 }, faqItem: { borderTopWidth: 1, borderTopColor: Colors.border }, faqButton: { minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 9 }, faqCategory: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.accentSoft }, faqCategoryText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' }, faqQuestion: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, fontWeight: '800' }, faqAnswer: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, paddingRight: 25, paddingBottom: 14 }, emptyFaq: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 5 }, emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' }, emptyText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13 },
  bookingPanel: { padding: 16, borderRadius: 17, backgroundColor: Colors.accentSoft }, bookingPanelIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.surface }, bookingPanelCopy: { marginTop: 12 }, bookingTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 4 }, bookingDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4 }, bookingInputRow: { flexDirection: 'row', gap: 7, marginTop: 13 }, bookingInput: { flex: 1, minWidth: 0, minHeight: Ui.field.minHeight, paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.surface, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 }, bookingButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: Ui.radius.control, backgroundColor: Colors.primary }, bookingButtonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' }, bookingMessage: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 9 }, supportOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }, supportOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: Colors.surface }, supportOptionText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  contactPanel: { ...Ui.card, padding: Ui.space.card, borderRadius: Ui.radius.card, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, contactTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', marginTop: 5 }, contactDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 8 }, contactAction: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: Colors.border }, contactIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accentSoft }, contactCopy: { flex: 1, minWidth: 0 }, contactActionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' }, contactDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  assistantPanel: { overflow: 'hidden', padding: 16, borderRadius: 17, backgroundColor: Colors.primaryDark }, assistantHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 }, assistantMark: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accent }, assistantHeadingCopy: { flex: 1 }, assistantTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' }, assistantStatus: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 13, marginTop: 2 }, onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }, messageList: { gap: 7, marginTop: 14 }, messageBubble: { maxWidth: '90%', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11 }, assistantBubble: { alignSelf: 'flex-start', backgroundColor: Colors.onDarkSurface }, userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.accent }, messageText: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 }, userMessageText: { color: Colors.primaryDark }, suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 }, suggestionChip: { paddingHorizontal: 7, paddingVertical: 6, borderRadius: Ui.radius.pill, backgroundColor: Colors.onDarkSurface }, suggestionText: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 13 }, errorRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 }, assistantError: { flex: 1, color: Colors.errorOnDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19 }, retryText: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' }, assistantInputRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13, paddingLeft: 11, paddingRight: 5, borderRadius: 11, backgroundColor: Colors.surface }, assistantInput: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, paddingVertical: 9 }, sendButton: { minHeight: 44,  width: 33, height: 33, alignItems: 'center', justifyContent: 'center', borderRadius: Ui.radius.control, backgroundColor: Colors.accent }, sendButtonDisabled: { opacity: 0.5 },
});
