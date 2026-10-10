import { SupportRow, SupportScreen, supportStyles as s } from '@/components/support/SupportScreen';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpScreen() {
  return <SupportScreen title="Support">
    <View style={s.card}><SupportRow title="Help Center" icon="headset-outline" route="/faq" /><SupportRow title="Contact Us" icon="person-outline" route="/contact" /><SupportRow title="Terms & Conditions" icon="document-text-outline" route="/terms" /><SupportRow title="Privacy Policy" icon="shield-checkmark-outline" route="/privacy" /></View>
    <View style={s.card}><TouchableOpacity accessibilityRole="button" style={styles.link} onPress={() => router.push('/manage/support-requests')}><Text style={styles.linkText}>Status Dashboard</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" style={styles.link} onPress={() => router.push('/manage/about')}><Text style={styles.linkText}>About Us</Text></TouchableOpacity></View>
    <SupportRow title="AI Travel Assistant" icon="chatbubble-ellipses-outline" route="/assistant" />
  </SupportScreen>;
}
const styles = StyleSheet.create({ link: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border }, linkText: { fontFamily: 'Manrope', fontSize: 14, color: Colors.textDark } });
