import { SupportCard, SupportHeading, SupportItem, SupportPage, goTo } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { supportContact } from '@/constants/navigation';
import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const QUICK: { icon: IconName; label: string; route: string }[] = [
  { icon: 'chatbubble-ellipses-outline', label: 'AI assistant', route: '/assistant' },
  { icon: 'mail-open-outline', label: 'Contact us', route: '/contact' },
  { icon: 'pulse-outline', label: 'My requests', route: '/manage/support-requests' },
];

export default function HelpScreen() {
  const openExternal = (url: string) => { Linking.openURL(url).catch(() => undefined); };

  return (
    <SupportPage title="How can we help?" subtitle="Answers, guides and a real team behind them.">
      <View style={s.quick}>
        {QUICK.map((q) => (
          <TouchableOpacity key={q.label} accessibilityRole="button" accessibilityLabel={q.label} onPress={() => goTo(q.route)} activeOpacity={0.8} style={s.quickItem}>
            <View style={s.quickIcon}><Ionicons name={q.icon} size={20} color={Colors.primary} /></View>
            <Text style={s.quickLabel}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SupportCard>
        <SupportHeading eyebrow="GET ANSWERS" title="Help & support" />
        <SupportItem icon="headset-outline" title="FAQ" detail="Find answers to common questions" onPress={() => goTo('/faq')} />
        <SupportItem icon="person-outline" title="Contact us" detail="Send a message and track the reply" onPress={() => goTo('/contact')} />
        <SupportItem icon="pulse-outline" title="Status dashboard" detail="Follow the progress of your requests" onPress={() => goTo('/manage/support-requests')} last />
      </SupportCard>

      <SupportCard>
        <SupportHeading eyebrow="GOOD TO KNOW" title="About LemonTrip" />
        <SupportItem icon="information-circle-outline" title="About us" onPress={() => goTo('/manage/about')} />
        <SupportItem icon="document-text-outline" title="Terms & conditions" onPress={() => goTo('/terms')} />
        <SupportItem icon="shield-checkmark-outline" title="Privacy policy" onPress={() => goTo('/privacy')} last />
      </SupportCard>

      <SupportCard>
        <SupportHeading eyebrow="REACH US DIRECTLY" title="Prefer a quick chat?" />
        <View style={s.channels}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Email support" onPress={() => openExternal(`mailto:${supportContact.email}`)} style={s.channel}>
            <Ionicons name="mail-outline" size={18} color={Colors.primary} /><Text style={s.channelText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="WhatsApp support" onPress={() => openExternal(supportContact.whatsapp)} style={s.channel}>
            <Ionicons name="logo-whatsapp" size={18} color={Colors.primary} /><Text style={s.channelText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.email} selectable>{supportContact.email}</Text>
      </SupportCard>
    </SupportPage>
  );
}

const s = StyleSheet.create({
  quick: { flexDirection: 'row', gap: 10, marginHorizontal: Ui.space.page, marginBottom: 14 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  quickLabel: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.textDark, textAlign: 'center' },
  channels: { flexDirection: 'row', gap: 10 },
  channel: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.background },
  channelText: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.primary },
  email: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 10 },
});