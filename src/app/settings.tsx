import { useAppLanguage } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { usePreferences } from '@/utils/preferencesStore';
import { Colors } from '@/constants/colors';
import { logout, useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { type ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

type IconName = keyof typeof Ionicons.glyphMap;
const go = (path: string) => router.push(path as Href);
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const GREEN = '#103D30';

export default function SettingsScreen() {
  useAppLanguage();
  const user = useAuth();
  const preferences = usePreferences();
  const { language, currency, emails: emailNotifications, bookings: bookingUpdates, offers: offerUpdates } = preferences.value;

  const confirmLogout = () => Alert.alert('Log out?', 'You will be signed out on this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Settings</Text>
        <View style={styles.gear}><Ionicons name="settings-outline" size={22} color={GREEN} /></View>
      </View>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={user ? 'View profile' : 'Sign in'} onPress={() => go(user ? '/(tabs)/profile' : '/login')} activeOpacity={0.85} style={styles.userCard}>
            <View>
              <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'G'}</Text></View>
              <View style={styles.camera}><Ionicons name="camera" size={12} color={Colors.white} /></View>
            </View>
            <View style={styles.userCopy}>
              <Text style={styles.userName} numberOfLines={1}>{(user?.name ?? 'Guest User').toUpperCase()}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email ?? 'Sign in to manage your account'}</Text>
              {user ? <View style={styles.badge}><Text style={styles.badgeText}>LemonTrip member</Text></View> : <View style={styles.badge}><Text style={styles.badgeText}>Sign in</Text></View>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.banner}>
            <Image source={require('../../assets/images/Minimal Mint Leaf Arcs.png')} resizeMode="cover" style={styles.bannerBg} />
            <View style={styles.bannerCopy}><Text style={styles.bannerTitle}>Make your experience better</Text>
            <Text style={styles.bannerText}>Manage your preferences, notifications and account settings.</Text></View><Image source={require('../../assets/images/profile-banner.png')} resizeMode="contain" style={styles.bannerArt} />
          </View>

          <SettingsSection eyebrow="PREFERENCES" title="Language & currency">
            <SettingRow dark icon="language-outline" title="Language" detail="Choose your app language" value={language} onPress={() => go('/manage/language')} />
            <SettingRow dark icon="cash-outline" title="Currency" detail="Set your preferred currency" value={currency} onPress={() => go('/manage/currency')} last />
          </SettingsSection>

          <SettingsSection eyebrow="NOTIFICATIONS" title="Stay informed">
            <SettingRow dark icon="mail-outline" title="Email updates" detail="News and account messages" trailing={<PreferenceSwitch label="Email updates" value={emailNotifications} onValueChange={(value) => void preferences.update({ emails: value })} />} />
            <SettingRow dark icon="ticket-outline" title="Booking updates" detail="Changes to your trips" trailing={<PreferenceSwitch label="Booking updates" value={bookingUpdates} onValueChange={(value) => void preferences.update({ bookings: value })} />} />
            <SettingRow dark icon="pricetag-outline" title="Travel offers" detail="Handpicked deals and inspiration" trailing={<PreferenceSwitch label="Travel offers" value={offerUpdates} onValueChange={(value) => void preferences.update({ offers: value })} />} last />
          </SettingsSection>

          <SettingsSection eyebrow="SECURITY & PRIVACY" title="Keep your account safe">
            <SettingRow icon="key-outline" title="Change password" detail="Update or recover your password" onPress={() => go(user ? '/change-password' : '/forgot-password')} />
            <SettingRow icon="phone-portrait-outline" title="Account security" detail="Verification and account access" onPress={() => go('/manage/security')} />
            <SettingRow icon="eye-outline" title="Privacy policy" detail="How we handle your data" onPress={() => go('/privacy')} last />
          </SettingsSection>

          <SettingsSection eyebrow="HELP & SUPPORT" title="Get help when you need it">
            <SettingRow icon="help-circle-outline" title="Help center" detail="Find answers to common questions" onPress={() => go('/help')} />
            <SettingRow icon="chatbubble-ellipses-outline" title="Contact support" detail="Talk to the LemonTrip team" onPress={() => go('/contact')} />
            <SettingRow icon="information-circle-outline" title="About LemonTrip" detail="Travel smarter. Travel better." onPress={() => go('/manage/about')} last />
          </SettingsSection>

          {user ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Log out" onPress={confirmLogout} style={styles.logout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={GREEN} />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} trackColor={{ false: Colors.borderStrong, true: GREEN }} thumbColor={Colors.white} />;
}

function SettingsSection({ title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, title, detail, value, trailing, onPress, last = false, dark = false }: { icon: IconName; title: string; detail?: string; value?: string; trailing?: ReactNode; onPress?: () => void; last?: boolean; dark?: boolean }) {
  const content = <>
    <View style={[styles.rowIcon, dark && styles.rowIconDark]}><Ionicons name={icon} size={20} color={dark ? Colors.white : GREEN} /></View>
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle}>{title}</Text>
      {detail ? <Text style={styles.rowDetail} numberOfLines={1}>{detail}</Text> : null}
    </View>
    {value ? <View style={styles.valuePill}><Text style={styles.valueText} numberOfLines={1}>{value}</Text></View> : null}
    {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.textLight} /> : null)}
  </>;
  const rowStyle = [styles.row, !last && styles.rowDivider];
  return onPress
    ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={value ? `${title}, ${value}` : title} onPress={onPress} style={rowStyle} activeOpacity={0.72}>{content}</TouchableOpacity>
    : <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN },
  gear: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  avatarText: { fontFamily: INTER.bold, fontSize: 28, color: Colors.white },
  camera: { position: 'absolute', right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN, borderWidth: 2, borderColor: Colors.surface },
  userCopy: { flex: 1, minWidth: 0 },
  userName: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: GREEN },
  userEmail: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight, marginTop: 2 },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.accent },
  badgeText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: GREEN },
  banner: { overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, padding: 18, borderRadius: 18, backgroundColor: Colors.successSoft },
  bannerBg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { flex: 1, minWidth: 0 },
  bannerArt: { width: 120, height: 80 },
  bannerTitle: { fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN },
  bannerText: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: Colors.textLight, marginTop: 6 },
  section: { marginTop: 22 },
  card: { overflow: 'hidden', paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sectionEyebrow: { fontFamily: INTER.semibold, fontSize: TextSize.caption, letterSpacing: 1.2, color: '#1B6B4A' },
  sectionTitle: { fontFamily: INTER.bold, fontSize: TextSize.heading, color: GREEN, marginBottom: 10, marginHorizontal: 2 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  rowIconDark: { backgroundColor: GREEN },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: INTER.semibold, fontSize: TextSize.bodyLarge, color: Colors.textDark },
  rowDetail: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  valuePill: { maxWidth: 120, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.successSoft },
  valueText: { fontFamily: INTER.semibold, fontSize: TextSize.body, color: GREEN },
  logout: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 22, borderRadius: 26, borderWidth: 1, borderColor: GREEN, backgroundColor: Colors.surface },
  logoutText: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: GREEN },
});