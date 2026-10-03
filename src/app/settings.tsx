import { Colors } from '@/constants/colors';
import { TravelArtworkIcon, type TravelArtworkName } from '@/components/TravelArtworkIcon';
import { logout, useAuth } from '@/utils/authStore';
import { useThemeName } from '@/utils/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const user = useAuth();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [offerUpdates, setOfferUpdates] = useState(false);
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('English');
  const { theme, setTheme } = useThemeName();

  const confirmLogout = () => Alert.alert('Log out?', 'You will be signed out on this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.topBar}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={19} color={Colors.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.topBarLabel}>YOUR ACCOUNT</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>LEMONTRIP / PREFERENCES</Text>
            <Text style={styles.pageTitle}>Settings</Text>
            <Text style={styles.pageSubtitle}>Make every part of your journey feel like yours.</Text>
          </View>

          <View style={styles.accountBanner}>
            <View style={styles.accountAvatar}>
              <Text style={styles.avatarInitial}>{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'G'}</Text>
            </View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountEyebrow}>{user ? 'LEMONTRIP MEMBER' : 'TRAVELLING AS'}</Text>
              <Text style={styles.accountName} numberOfLines={1}>{user?.name ?? 'Guest User'}</Text>
              <Text style={styles.accountEmail} numberOfLines={1}>{user?.email ?? 'Sign in to manage your account'}</Text>
            </View>
            {user ? (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="View profile" onPress={() => router.push('/(tabs)/profile')} style={styles.accountAction}>
                <Ionicons name="arrow-forward" size={17} color={Colors.primaryDark} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/login')} style={styles.signInButton}>
                <Text style={styles.signInText}>Sign in</Text>
              </TouchableOpacity>
            )}
            <View pointerEvents="none" style={styles.bannerAccent} />
          </View>

          <View style={[styles.columns, desktop && styles.columnsDesktop]}>
            <View style={styles.column}>
              <SettingsSection title="Your preferences" subtitle="Set the way LemonTrip feels" icon="options-outline" artwork="explore">
                <SettingRow icon="contrast-outline" title="Appearance" detail={theme === 'dark' ? 'Dark mode' : 'Light mode'} onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <SettingRow icon="language-outline" title="Language" detail={language} onPress={() => setLanguage((current) => current === 'English' ? 'Hindi' : 'English')} />
                <SettingRow icon="cash-outline" title="Currency" detail={currency} onPress={() => setCurrency((current) => current === 'INR (₹)' ? 'USD ($)' : 'INR (₹)')} last />
              </SettingsSection>

              <SettingsSection title="Notifications" subtitle="Only the updates you want" icon="notifications-outline">
                <SettingRow icon="mail-outline" title="Email updates" detail="News and account messages" trailing={<PreferenceSwitch value={emailNotifications} onValueChange={setEmailNotifications} />} />
                <SettingRow icon="calendar-outline" title="Booking updates" detail="Changes to your trips" trailing={<PreferenceSwitch value={bookingUpdates} onValueChange={setBookingUpdates} />} />
                <SettingRow icon="pricetag-outline" artwork="offer" title="Travel offers" detail="Handpicked deals and inspiration" trailing={<PreferenceSwitch value={offerUpdates} onValueChange={setOfferUpdates} />} last />
              </SettingsSection>

              <SettingsSection title="Account" subtitle="Your LemonTrip profile" icon="person-circle-outline">
                <SettingRow icon="person-outline" title="Personal information" detail="Name and contact details" onPress={() => Alert.alert('Personal information', user ? `Name: ${user.name}\nEmail: ${user.email ?? 'Not added'}\nPhone: ${user.phone ?? 'Not added'}` : 'Sign in to view account details.')} />
                {user ? <SettingRow icon="log-out-outline" title="Log out" detail="Sign out on this device" danger onPress={confirmLogout} last /> : <SettingRow icon="log-in-outline" title="Sign in or create account" detail="Keep your trips close at hand" onPress={() => router.push('/login')} last />}
              </SettingsSection>
            </View>

            <View style={styles.column}>
              <SettingsSection title="Security & privacy" subtitle="Your account, in your control" icon="shield-checkmark-outline">
                <SettingRow icon="key-outline" title="Change password" detail="Not connected yet" onPress={() => Alert.alert('Change password', 'Password changes are not connected yet.')} />
                <SettingRow icon="phone-portrait-outline" title="Login sessions" detail="Current device" onPress={() => Alert.alert('Login sessions', 'Session management is not available yet.')} />
                <SettingRow icon="eye-outline" title="Privacy policy" onPress={() => Alert.alert('Privacy policy', 'Full policy coming soon.')} />
                <SettingRow icon="document-text-outline" title="Terms of service" onPress={() => Alert.alert('Terms of service', 'Full terms coming soon.')} last />
              </SettingsSection>

              <SettingsSection title="We’re here to help" subtitle="A little help goes a long way" icon="help-circle-outline" artwork="help">
                <SettingRow icon="book-outline" artwork="help" title="Help center" detail="Find answers to common questions" onPress={() => router.push('/help' as never)} />
                <SettingRow icon="chatbubble-ellipses-outline" artwork="help" title="Contact support" detail="hello@lemontrip.in" onPress={() => { void Linking.openURL('mailto:hello@lemontrip.in'); }} last />
              </SettingsSection>

              <View style={styles.helpCard}>
                <View style={styles.helpIcon}><TravelArtworkIcon name="explore" size={29} /></View>
                <View style={styles.helpCopy}>
                  <Text style={styles.helpTitle}>Ready for somewhere new?</Text>
                  <Text style={styles.helpText}>Explore places and find your next favourite.</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore destinations" onPress={() => router.push('/(tabs)/explore')} style={styles.helpArrow}>
                  <Ionicons name="arrow-forward" size={17} color={Colors.primaryDark} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.version}>LEMONTRIP · MADE FOR THE WAY YOU TRAVEL</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceSwitch({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) {
  return <Switch value={value} onValueChange={onValueChange} trackColor={{ false: Colors.borderStrong, true: Colors.primary }} thumbColor={Colors.white} />;
}

function SettingsSection({ title, subtitle, icon, artwork, children }: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; artwork?: TravelArtworkName; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>{artwork ? <TravelArtworkIcon name={artwork} size={28} /> : <Ionicons name={icon} size={17} color={Colors.primary} />}</View>
        <View style={styles.sectionHeadingCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, artwork, title, detail, trailing, onPress, danger = false, last = false }: { icon: keyof typeof Ionicons.glyphMap; artwork?: TravelArtworkName; title: string; detail?: string; trailing?: ReactNode; onPress?: () => void; danger?: boolean; last?: boolean }) {
  const content = <>
    <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>{artwork ? <TravelArtworkIcon name={artwork} size={25} /> : <Ionicons name={icon} size={17} color={danger ? Colors.error : Colors.primary} />}</View>
    <View style={styles.rowCopy}>
      <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
      {detail ? <Text style={styles.rowDetail} numberOfLines={1}>{detail}</Text> : null}
    </View>
    {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={15} color={Colors.textLight} /> : null)}
  </>;
  const rowStyle = [styles.row, !last && styles.rowDivider];
  return onPress
    ? <TouchableOpacity accessibilityRole="button" onPress={onPress} style={rowStyle} activeOpacity={0.72}>{content}</TouchableOpacity>
    : <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  topBar: { minHeight: 42, marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.surfaceMuted },
  topBarLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.7 },
  topBarSpacer: { width: 38 },
  intro: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 20 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900', letterSpacing: 1.35 },
  pageTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 31, lineHeight: 38, fontWeight: '900', marginTop: 5 },
  pageSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 17, marginTop: 4 },
  accountBanner: { minHeight: 102, flexDirection: 'row', alignItems: 'center', gap: 13, marginHorizontal: 16, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 17, backgroundColor: Colors.primaryDark, overflow: 'hidden' },
  accountAvatar: { width: 51, height: 51, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.accent },
  avatarInitial: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 21, fontWeight: '900' },
  accountCopy: { flex: 1, minWidth: 0 },
  accountEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 7, fontWeight: '900', letterSpacing: 1.25, marginBottom: 3 },
  accountName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  accountEmail: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Manrope', fontSize: 9, marginTop: 3 },
  accountAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  signInButton: { minHeight: 35, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors.accent },
  signInText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  bannerAccent: { position: 'absolute', width: 120, height: 120, right: -57, top: -78, borderRadius: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  columns: { gap: 13, marginTop: 17, paddingHorizontal: 16 },
  columnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: 13 },
  section: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  sectionHeading: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  sectionSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 3 },
  rows: { paddingHorizontal: 12, paddingVertical: 2 },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 2, paddingVertical: 7 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  rowIconDanger: { borderColor: '#FECACA' },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  rowDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 3 },
  dangerText: { color: Colors.error },
  helpCard: { minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 16, backgroundColor: Colors.accentSoft },
  helpIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  helpCopy: { flex: 1, minWidth: 0 },
  helpTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  helpText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 12, marginTop: 4 },
  helpArrow: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.surface },
  version: { marginTop: 22, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 1.1, textAlign: 'center' },
});
