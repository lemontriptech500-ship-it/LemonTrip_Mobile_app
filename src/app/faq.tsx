import { TextSize, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { SupportScreen, supportStyles as s } from '@/components/support/SupportScreen';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const answers: { title: string; icon: ComponentProps<typeof Ionicons>['name']; answer: string }[] = [
  { title: 'General Booking', icon: 'settings-outline', answer: 'Open My Trips to find your booking ID, dates, payment state, and current status. Select a trip to view its details. Keep the booking reference handy when contacting support.' },
  { title: 'Payment Options', icon: 'card-outline', answer: 'Available payment options and the final amount appear at checkout. A booking is confirmed after the payment and provider confirmation steps complete. Never share a card PIN, CVV, password, or OTP with support.' },
  { title: 'Cancellation Policy', icon: 'close-outline', answer: 'Cancellation options depend on the provider and fare rules shown with your booking. Open the trip to check its cancellation options. If online cancellation is unavailable, contact support with your booking reference.' },
  { title: 'Account & Login', icon: 'person-outline', answer: 'Sign in using the account options on the login screen. Use password recovery if you cannot access your account. Verified contact details help you receive booking updates.' },
  { title: 'Feedback', icon: 'star-outline', answer: 'Choose Feedback in Contact Support to share your experience or suggest an improvement. Submitted requests can be viewed in My Support Requests.' },
  { title: 'Tour & Activity Details', icon: 'briefcase-outline', answer: 'Review the itinerary, inclusions, dates, and provider terms on the package or activity page before booking. Contact support for arrangements that are not listed.' },
  { title: 'Travel Documents', icon: 'document-text-outline', answer: 'Open My Trips and select your booking for its available travel documents. Visa application documents are available in Visa Services → My visa applications. Document requirements vary by destination and traveller.' },
];
export default function FaqScreen() {
  const [open, setOpen] = useState(''); const [search, setSearch] = useState('');
  const visible = answers.filter(item => `${item.title} ${item.answer}`.toLowerCase().includes(search.toLowerCase()));
  return <SupportScreen title="FAQ"><TextInput accessibilityLabel="Search FAQs" placeholder="Search help topics" placeholderTextColor={Colors.textLight} value={search} onChangeText={setSearch} style={s.input} /><View style={s.card}>
    {visible.map(item => <View key={item.title}><TouchableOpacity accessibilityRole="button" accessibilityLabel={item.title} accessibilityState={{ expanded: open === item.title }} style={styles.row} onPress={() => setOpen(open === item.title ? '' : item.title)}><Ionicons name={item.icon} size={20} color={Colors.primary} /><Text style={styles.title}>{item.title}</Text><Ionicons name={open === item.title ? 'chevron-down' : 'chevron-forward'} size={16} color={Colors.textLight} /></TouchableOpacity>{open === item.title ? <Text style={styles.answer}>{item.answer}</Text> : null}</View>)}
    {!visible.length ? <Text style={s.body}>No matching topics. Try another search or contact support.</Text> : null}
  </View><TouchableOpacity accessibilityRole="button" style={s.button} onPress={() => router.push('/contact')}><Text style={s.buttonText}>Contact Support</Text></TouchableOpacity></SupportScreen>;
}
const styles = StyleSheet.create({ row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }, title: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textDark }, answer: { ...s.body, paddingVertical: 12, paddingLeft: 32 } });
