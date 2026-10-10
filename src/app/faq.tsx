import { SupportButton, SupportCard, SupportField, SupportHeading, SupportNotice, SupportPage, goTo } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, type ComponentProps } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

const answers: { title: string; icon: IconName; answer: string }[] = [
  { title: 'General Booking', icon: 'settings-outline', answer: 'Open My Trips to find your booking ID, dates, payment state, and current status. Select a trip to view its details. Keep the booking reference handy when contacting support.' },
  { title: 'Payment Options', icon: 'card-outline', answer: 'Available payment options and the final amount appear at checkout. A booking is confirmed after the payment and provider confirmation steps complete. Never share a card PIN, CVV, password, or OTP with support.' },
  { title: 'Cancellation Policy', icon: 'close-outline', answer: 'Cancellation options depend on the provider and fare rules shown with your booking. Open the trip to check its cancellation options. If online cancellation is unavailable, contact support with your booking reference.' },
  { title: 'Account & Login', icon: 'person-outline', answer: 'Sign in using the account options on the login screen. Use password recovery if you cannot access your account. Verified contact details help you receive booking updates.' },
  { title: 'Feedback', icon: 'star-outline', answer: 'Choose Feedback in Contact Support to share your experience or suggest an improvement. Submitted requests can be viewed in My Support Requests.' },
  { title: 'Tour & Activity Details', icon: 'briefcase-outline', answer: 'Review the itinerary, inclusions, dates, and provider terms on the package or activity page before booking. Contact support for arrangements that are not listed.' },
  { title: 'Travel Documents', icon: 'document-text-outline', answer: 'Open My Trips and select your booking for its available travel documents. Visa application documents are available in Visa Services → My visa applications. Document requirements vary by destination and traveller.' },
];

export default function FaqScreen() {
  const [open, setOpen] = useState('');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? answers.filter((item) => `${item.title} ${item.answer}`.toLowerCase().includes(query)) : answers;
  }, [search]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/help' as never));

  return (
    <SupportPage
      title="FAQ"
      subtitle="Answers to the questions we hear most."
      eyebrow="LEMONTRIP / SUPPORT"
      onBack={back}
      footer={<SupportButton label="Contact support" icon="mail-open-outline" onPress={() => goTo('/contact')} />}>
      <SupportCard>
        <SupportHeading eyebrow="FIND AN ANSWER" title="Search help topics" />
        <SupportField
          label="Search"
          placeholder="Try “refund”, “visa”, “login”…"
          value={search}
          onChangeText={(value) => { setSearch(value); setOpen(''); }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={80}
        />
      </SupportCard>

      <SupportCard>
        <SupportHeading eyebrow="FREQUENTLY ASKED" title="Common questions" />
        {visible.map((item, index) => {
          const expanded = open === item.title;
          const last = index === visible.length - 1;
          return (
            <View key={item.title} style={[s.item, last && s.itemLast]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityState={{ expanded }}
                activeOpacity={0.8}
                style={s.row}
                onPress={() => setOpen(expanded ? '' : item.title)}>
                <View style={[s.icon, expanded && s.iconActive]}>
                  <Ionicons name={item.icon} size={19} color={expanded ? Colors.white : Colors.primary} />
                </View>
                <Text style={s.title}>{item.title}</Text>
                <Ionicons name={expanded ? 'chevron-down' : 'chevron-forward'} size={16} color={Colors.textLight} />
              </TouchableOpacity>
              {expanded ? <Text style={s.answer}>{item.answer}</Text> : null}
            </View>
          );
        })}
        {!visible.length ? (
          <SupportNotice icon="search-outline">No matching topics. Try another search or contact support.</SupportNotice>
        ) : null}
      </SupportCard>
    </SupportPage>
  );
}

const s = StyleSheet.create({
  item: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemLast: { borderBottomWidth: 0 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  iconActive: { backgroundColor: Colors.primary },
  title: { flex: 1, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark },
  answer: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, color: Colors.textLight, paddingLeft: 50, paddingBottom: 14, paddingRight: 4 },
});
