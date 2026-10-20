import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { SupportCard, SupportHeading, SupportItem, SupportPage, goTo } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { supportContact } from '@/constants/navigation';
import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, View } from 'react-native';

const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const BRAND = '#103D30';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const QUICK: { icon: IconName; label: string; detail: string; route: string }[] = [
  { icon: 'chatbubble-ellipses-outline', label: 'AI Assistant', detail: 'Get instant answers', route: '/assistant' },
  { icon: 'mail-open-outline', label: 'Contact Us', detail: 'Send us a message', route: '/contact' },
  { icon: 'document-text-outline', label: 'My Requests', detail: 'Track your queries', route: '/manage/support-requests' },
];

export default function HelpScreen() {
  useAppLanguage();
  const openExternal = (url: string) => { Linking.openURL(url).catch(() => undefined); };

  return (
    <SupportPage
      eyebrow="LEMONTRIP SUPPORT"
      title="How can we help?"
      subtitle="Answers, guides and a real team behind them."
      hero={{ image: require('../../assets/images/Emerald Customer Support Headset Banner.png'), topTitle: 'Help & Support', onSettings: () => goTo('/settings') }}
    >
      <View style={s.quick}>
        {QUICK.map((q) => (
          <TouchableOpacity key={q.label} accessibilityRole="button" accessibilityLabel={q.label} onPress={() => goTo(q.route)} style={s.quickItem}>
            <View style={s.quickIcon}>
              <Ionicons name={q.icon} size={20} color={BRAND} />
            </View>
            <Text style={s.quickLabel}>{q.label}</Text>
            <Text style={s.quickDetail}>{q.detail}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} style={s.quickChevron} />
          </TouchableOpacity>
        ))}
      </View>

      <SupportCard>
        <SupportHeading eyebrow="GET ANSWERS" title="Help & Support" />
        <SupportItem tone="mint" icon="headset-outline" title="FAQ" detail="Find answers to common questions" onPress={() => goTo('/faq')} />
        <SupportItem tone="mint" icon="person-outline" title="Contact us" detail="Send a message and track it easily" onPress={() => goTo('/contact')} />
        <SupportItem tone="mint" icon="pulse-outline" title="Status dashboard" detail="Follow the progress of your requests" onPress={() => goTo('/manage/support-requests')} last />
      </SupportCard>

      <SupportCard>
        <SupportHeading eyebrow="GOOD TO KNOW" title="About LemonTrip" />
        <SupportItem tone="mint" icon="information-circle-outline" title="About us" detail="Learn more about LemonTrip" onPress={() => goTo('/manage/about')} />
        <SupportItem tone="mint" icon="document-text-outline" title="Terms & conditions" detail="Read our terms of service" onPress={() => goTo('/terms')} />
        <SupportItem tone="mint" icon="shield-checkmark-outline" title="Privacy policy" detail="How we protect your data" onPress={() => goTo('/privacy')} last />
      </SupportCard>

      <SupportCard>
        <SupportHeading eyebrow="REACH US DIRECTLY" title="Prefer a quick chat?" />
        <Text style={s.reachSub}>Get in touch with our support team.</Text>
        <View style={s.channels}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Email support" onPress={() => openExternal(`mailto:${supportContact.email}`)} style={s.channel}>
            <Ionicons name="mail-outline" size={18} color={BRAND} />
            <Text style={s.channelText}>Email</Text>
            <Ionicons name="chevron-forward" size={16} color={BRAND} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="WhatsApp support" onPress={() => openExternal(supportContact.whatsapp)} style={[s.channel, s.channelFilled]}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            <Text style={[s.channelText, s.channelTextFilled]}>WhatsApp</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={s.emailRow}>
          <Ionicons name="mail-outline" size={14} color={Colors.textLight} />
          <Text style={s.email} selectable>{supportContact.email}</Text>
        </View>
      </SupportCard>
    </SupportPage>
  );
}

const s = StyleSheet.create({
  quick: { flexDirection: 'row', gap: 10, marginHorizontal: Ui.space.page, marginBottom: 14 },
  quickItem: { ...Ui.card, flex: 1, padding: 12, minHeight: 120 },
  quickIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, marginBottom: 8 },
  quickLabel: { fontFamily: INTER.bold, fontSize: TextSize.body, color: Colors.textDark },
  quickDetail: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2, paddingRight: 14 },
  quickChevron: { position: 'absolute', right: 10, top: 14 },
  reachSub: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: -6, marginBottom: 12 },
  emailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  channels: { flexDirection: 'row', gap: 10 },
  channel: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: BRAND, backgroundColor: Colors.background },
  channelFilled: { backgroundColor: BRAND },
  channelText: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: BRAND },
  channelTextFilled: { color: '#FFFFFF' },
  email: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, textAlign: 'center' },
});