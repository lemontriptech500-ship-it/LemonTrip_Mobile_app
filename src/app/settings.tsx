import { usePreferences } from '@/utils/preferencesStore';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AccountArtworkIcon, type AccountArtworkName } from '@/components/AccountArtworkIcon';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { logout, useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function SettingsScreen() {
  const user = useAuth();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const preferences = usePreferences();
  const { language, currency, emails: emailNotifications, bookings: bookingUpdates, offers: offerUpdates } = preferences.value;

  const confirmLogout = () => Alert.alert('Log out?', 'You will be signed out on this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
<ScreenHeader title="Settings" subtitle="Make every part of your journey feel like yours." eyebrow="YOUR ACCOUNT" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} />


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
              <SettingsSection title="Your preferences" subtitle="Set the way LemonTrip feels" icon="options-outline" artwork="settings">
                <SettingRow icon="language-outline" artwork="language" title="Language" detail={language} onPress={() => router.push('/manage/language')} />
                <SettingRow icon="cash-outline" artwork="currency" title="Currency" detail={currency} onPress={() => router.push('/manage/currency')} last />
              </SettingsSection>

              <SettingsSection title="Notifications" subtitle="Only the updates you want" icon="notifications-outline" artwork="notifications">
                <SettingRow icon="mail-outline" artwork="email" title="Email updates" detail="News and account messages" trailing={<PreferenceSwitch value={emailNotifications} onValueChange={value => void preferences.update({ emails: value })} />} />
                <SettingRow icon="calendar-outline" artwork="booking" title="Booking updates" detail="Changes to your trips" trailing={<PreferenceSwitch value={bookingUpdates} onValueChange={value => void preferences.update({ bookings: value })} />} />
                <SettingRow icon="pricetag-outline"  title="Travel offers" detail="Handpicked deals and inspiration" trailing={<PreferenceSwitch value={offerUpdates} onValueChange={value => void preferences.update({ offers: value })} />} last />
              </SettingsSection>

              <SettingsSection title="Account" subtitle="Your LemonTrip profile" icon="person-circle-outline" artwork="profile">
                <SettingRow icon="person-outline" artwork="profile" title="Personal information" detail="Name and contact details" onPress={() => router.push('/manage/personal-information')} />
                {user ? <SettingRow icon="log-out-outline" artwork="profile" title="Log out" detail="Sign out on this device" danger onPress={confirmLogout} last /> : <SettingRow icon="log-in-outline" artwork="profile" title="Sign in or create account" detail="Keep your trips close at hand" onPress={() => router.push('/login')} last />}
              </SettingsSection>
            </View>

            <View style={styles.column}>
              <SettingsSection title="Security & privacy" subtitle="Your account, in your control" icon="shield-checkmark-outline" artwork="security">
                <SettingRow icon="key-outline" artwork="password" title="Change password" detail="Help accessing your account" onPress={() => router.push('/forgot-password')} />
                <SettingRow icon="phone-portrait-outline" artwork="device" title="Account security" detail="Verification and account access" onPress={() => router.push('/manage/security')} />
                <SettingRow icon="eye-outline" artwork="privacy" title="Privacy policy" onPress={() => router.push('/privacy')} />
                <SettingRow icon="document-text-outline" artwork="document" title="Terms of service" onPress={() => router.push('/terms')} last />
              </SettingsSection>

              <SettingsSection title="We’re here to help" subtitle="A little help goes a long way" icon="help-circle-outline" artwork="support">
                <SettingRow icon="book-outline" artwork="help" title="Help center" detail="Find answers to common questions" onPress={() => router.push('/help' as never)} />
                <SettingRow icon="chatbubble-ellipses-outline" artwork="support" title="Contact support" detail="Talk to the LemonTrip team" onPress={() => router.push('/contact')} last />
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

function SettingsSection({ title, subtitle, icon, artwork, children }: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; artwork?: AccountArtworkName; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>{artwork ? <AccountArtworkIcon name={artwork as AccountArtworkName} size={28} /> : <Ionicons name={icon} size={17} color={Colors.primary} />}</View>
        <View style={styles.sectionHeadingCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, artwork, title, detail, trailing, onPress, danger = false, last = false }: { icon: keyof typeof Ionicons.glyphMap; artwork?: AccountArtworkName; title: string; detail?: string; trailing?: ReactNode; onPress?: () => void; danger?: boolean; last?: boolean }) {
  const content = <>
    <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>{artwork ? <AccountArtworkIcon name={artwork as AccountArtworkName} size={25} /> : <Ionicons name={icon} size={17} color={danger ? Colors.error : Colors.primary} />}</View>
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
  topBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16 },
  backButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.onDarkSurface },
  topBarLabel: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  topBarSpacer: { width: 38 },
  intro: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 20 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.35 },
  pageTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 31, lineHeight: 38, fontWeight: '800', marginTop: 5 },
  pageSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 17, marginTop: 4 },
  accountBanner: { minHeight: 102, flexDirection: 'row', alignItems: 'center', gap: 13, marginHorizontal: Ui.space.page, paddingHorizontal: 16, paddingVertical: 14, borderRadius: Ui.radius.card, backgroundColor: Colors.primaryDark, overflow: 'hidden' },
  accountAvatar: { width: 51, height: 51, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.accent },
  avatarInitial: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 21, fontWeight: '800' },
  accountCopy: { flex: 1, minWidth: 0 },
  accountEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.25, marginBottom: 3 },
  accountName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  accountEmail: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 13, marginTop: 3 },
  accountAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  signInButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  signInText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  bannerAccent: { position: 'absolute', width: 120, height: 120, right: -57, top: -78, borderRadius: 60, borderWidth: 1, borderColor: Colors.onDarkSurface },
  columns: { gap: 13, marginTop: 17, paddingHorizontal: 16 },
  columnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: 13 },
  section: { ...Ui.card, overflow: 'hidden', borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  sectionHeading: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceMuted },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 3 },
  rows: { paddingHorizontal: 12, paddingVertical: 2 },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 2, paddingVertical: 7 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceMuted },
  rowIconDanger: { borderColor: Colors.errorBorder },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  rowDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 3 },
  dangerText: { color: Colors.error },
  helpCard: { minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 16, backgroundColor: Colors.accentSoft },
  helpIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceMuted },
  helpCopy: { flex: 1, minWidth: 0 },
  helpTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  helpText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4 },
  helpArrow: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.surface },
  version: { marginTop: 22, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', letterSpacing: 1.1, textAlign: 'center' },
});
