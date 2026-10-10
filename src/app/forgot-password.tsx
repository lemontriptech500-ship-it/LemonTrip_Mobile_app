import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { SupportCard, SupportHeading, SupportItem, SupportNotice, SupportPage, goTo } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function AccountRecoveryScreen() {
  return (
    <SupportPage title="Let’s get you back in." subtitle="Choose a way to access your LemonTrip account." eyebrow="ACCOUNT RECOVERY" onBack={() => router.replace('/login')}>
      <View style={s.hero}>
        <View style={s.heroIcon}><Ionicons name="key-outline" size={30} color={Colors.primaryDark} /></View>
        <Text style={s.heroTitle}>Forgot your password?</Text>
        <Text style={s.heroText}>No problem. If your account has a verified phone number, you can sign in with a one-time SMS code.</Text>
      </View>

      <SupportCard>
        <SupportHeading eyebrow="YOUR OPTIONS" title="How would you like to continue?" />
        <SupportItem icon="phone-portrait-outline" title="Sign in with phone OTP" detail="We’ll text a six-digit code to your verified number" onPress={() => router.replace({ pathname: '/login', params: { mode: 'phone' } } as Href)} />
        <SupportItem icon="headset-outline" title="Get account support" detail="For email access or password recovery, our team can help" onPress={() => goTo('/contact')} />
        <SupportItem icon="log-in-outline" title="Back to log in" onPress={() => router.replace('/login')} last />
      </SupportCard>

      <SupportNotice icon="shield-checkmark-outline">Never share your one-time code with anyone, including people who say they are from LemonTrip.</SupportNotice>
    </SupportPage>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: 'center', marginHorizontal: Ui.space.page, marginBottom: 14, padding: 22, borderRadius: Ui.radius.card, backgroundColor: Colors.accentSoft },
  heroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  heroTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.primaryDark, marginTop: 14 },
  heroText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 22, color: Colors.textDark, marginTop: 6, textAlign: 'center' },
});