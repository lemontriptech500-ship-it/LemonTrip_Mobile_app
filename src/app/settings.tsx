import { usePreferences } from '@/utils/preferencesStore';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AccountArtworkIcon, type AccountArtworkName } from '@/components/AccountArtworkIcon';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { logout, useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

type IconName = keyof typeof Ionicons.glyphMap;
const go = (path: string) => router.push(path as Href);

const QUICK_LINKS: { icon: IconName; label: string; route: string }[] = [
  { icon: 'ticket-outline', label: 'My trips', route: '/(tabs)/bookings' },
  { icon: 'wallet-outline', label: 'Wallet', route: '/(tabs)/wallet' },
  { icon: 'heart-outline', label: 'Saved', route: '/(tabs)/wishlist' },
];

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
            <View style={styles.accountAvatar}><Text style={styles.avatarInitial}>{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'G'}</Text></View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountEyebrow}>{user ? 'LEMONTRIP MEMBER' : 'TRAVELLING AS'}</Text>
              <Text style={styles.accountName} numberOfLines={1}>{user?.name ?? 'Guest User'}</Text>
              <Text style={styles.accountEmail} numberOfLines={1}>{user?.email ?? 'Sign in to manage your account'}</Text>
            </View>
            {user ? (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="View profile" onPress={() => go('/(tabs)/profile')} style={styles.accountAction}>
                <Ionicons name="arrow-forward" size={17} color={Colors.primaryDark} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sign in" onPress={() => go('/login')} style={styles.signInButton}>
                <Text style={styles.signInText}>Sign in</Text>
              </TouchableOpacity>
            )}
            <View pointerEvents="none" style={styles.bannerAccent} />
          </View>

          <View style={styles.quick}>
            {QUICK_LINKS.map((q) => (
              <TouchableOpacity key={q.label} accessibilityRole="button" accessibilityLabel={q.label} onPress={() => go(q.route)} style={styles.quickItem} activeOpacity={0.8}>
                <View style={styles.quickIcon}><Ionicons name={q.icon} size={19} color={Colors.primary} /></View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.columns, desktop && styles.columnsDesktop]}>
            <View style={styles.column}>
              <SettingsSection eyebrow="PERSONALISE" title="Your preferences" icon="options-outline" artwork="settings">
                <SettingRow icon="language-outline" artwork="language" title="Language" value={language} onPress={() => go('/manage/language')} />
                <SettingRow icon="cash-outline" artwork="currency" title="Currency" value={currency} onPress={() => go('/manage/currency')} last />
              </SettingsSection>

              <SettingsSection eyebrow="STAY INFORMED" title="Notifications" icon="notifications-outline" artwork="notifications">
                <SettingRow icon="mail-outline" artwork="email" title="Email updates" detail="News and account messages" trailing={<PreferenceSwitch label="Email updates" value={emailNotifications} onValueChange={(value) => void preferences.update({ emails: value })} />} />
                <SettingRow icon="calendar-outline" artwork="booking" title="Booking updates" detail="Changes to your trips" trailing={<PreferenceSwitch label="Booking updates" value={bookingUpdates} onValueChange={(value) => void preferences.update({ bookings: value })} />} />
                <SettingRow icon="pricetag-outline" title="Travel offers" detail="Handpicked deals and inspiration" trailing={<PreferenceSwitch label="Travel offers" value={offerUpdates} onValueChange={(value) => void preferences.update({ offers: value })} />} last />
              </SettingsSection>

              <SettingsSection eyebrow="YOUR PROFILE" title="Account" icon="person-circle-outline" artwork="profile">
                <SettingRow icon="person-outline" artwork="profile" title="Personal information" detail="Name and contact details" onPress={() => go('/manage/personal-information')} />
                {!user ? <SettingRow icon="log-in-outline" artwork="profile" title="Sign in or create account" detail="Keep your trips close at hand" onPress={() => go('/login')} last /> : null}
              </SettingsSection>
            </View>

            <View style={styles.column}>
              <SettingsSection eyebrow="PROTECT" title="Security & privacy" icon="shield-checkmark-outline" artwork="security">
                <SettingRow icon="key-outline" artwork="password" title="Change password" detail="Help accessing your account" onPress={() => go('/forgot-password')} />
                <SettingRow icon="phone-portrait-outline" artwork="device" title="Account security" detail="Verification and account access" onPress={() => go('/manage/security')} />
                <SettingRow icon="eye-outline" artwork="privacy" title="Privacy policy" onPress={() => go('/privacy')} />
                <SettingRow icon="document-text-outline" artwork="document" title="Terms of service" onPress={() => go('/terms')} last />
              </SettingsSection>

              <SettingsSection eyebrow="SUPPORT" title="We’re here to help" icon="help-circle-outline" artwork="support">
                <SettingRow icon="book-outline" artwork="help" title="Help center" detail="Find answers to common questions" onPress={() => go('/help')} />
                <SettingRow icon="chatbubble-ellipses-outline" artwork="support" title="Contact support" detail="Talk to the LemonTrip team" onPress={() => go('/contact')} last />
              </SettingsSection>

              <View style={styles.helpCard}>
                <View style={styles.helpIcon}><TravelArtworkIcon name="explore" size={29} /></View>
                <View style={styles.helpCopy}>
                  <Text style={styles.helpTitle}>Ready for somewhere new?</Text>
                  <Text style={styles.helpText}>Explore places and find your next favourite.</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore destinations" onPress={() => go('/(tabs)/explore')} style={styles.helpArrow}>
                  <Ionicons name="arrow-forward" size={17} color={Colors.primaryDark} />
                </TouchableOpacity>
              </View>

              {user ? (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Log out" onPress={confirmLogout} style={styles.logout} activeOpacity={0.8}>
                  <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                  <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <Text style={styles.version}>LEMONTRIP · MADE FOR THE WAY YOU TRAVEL</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} trackColor={{ false: Colors.borderStrong, true: Colors.secondary }} thumbColor={value ? Colors.accent : Colors.white} />;
}

function SettingsSection({ eyebrow, title, icon, artwork, children }: { eyebrow: string; title: string; icon: IconName; artwork?: AccountArtworkName; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>{artwork ? <AccountArtworkIcon name={artwork} size={26} /> : <Ionicons name={icon} size={18} color={Colors.primary} />}</View>
        <View style={styles.sectionHeadingCopy}>
          <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, artwork, title, detail, value, trailing, onPress, last = false }: { icon: IconName; artwork?: AccountArtworkName; title: string; detail?: string; value?: string; trailing?: ReactNode; onPress?: () => void; last?: boolean }) {
  const content = <>
    <View style={styles.rowIcon}>{artwork ? <AccountArtworkIcon name={artwork} size={24} /> : <Ionicons name={icon} size={18} color={Colors.primary} />}</View>
    <View style={styles.rowCopy}>
      <Text style={styles.rowTitle}>{title}</Text>
      {detail ? <Text style={styles.rowDetail} numberOfLines={1}>{detail}</Text> : null}
    </View>
    {value ? <View style={styles.valuePill}><Text style={styles.valueText} numberOfLines={1}>{value}</Text></View> : null}
    {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.textLight} /> : null)}
  </>;
  const rowStyle = [styles.row, !last && styles.rowDivider];
  return onPress
    ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={value ? `${title}, ${value}` : title} onPress={onPress} style={rowStyle} activeOpacity={0.72}>{content}</TouchableOpacity>
    : <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
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
  quick: { flexDirection: 'row', gap: 10, marginHorizontal: Ui.space.page, marginTop: 13 },
  quickItem: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  quickLabel: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.textDark },
  columns: { gap: 13, marginTop: 17, paddingHorizontal: 16 },
  columnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: 13 },
  section: { ...Ui.card, overflow: 'hidden', borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  sectionHeading: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  sectionHeadingCopy: { flex: 1 },
  sectionEyebrow: { ...Ui.eyebrow, color: Colors.secondary, marginBottom: 2 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  rows: { paddingHorizontal: 14, paddingVertical: 2 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.background },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
  rowDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  valuePill: { maxWidth: 130, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  valueText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  helpCard: { minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 16, backgroundColor: Colors.accentSoft },
  helpIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceMuted },
  helpCopy: { flex: 1, minWidth: 0 },
  helpTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800' },
  helpText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4 },
  helpArrow: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.surface },
  logout: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.errorBorder, backgroundColor: Colors.errorSoft },
  logoutText: { color: Colors.error, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  version: { marginTop: 22, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', letterSpacing: 1.1, textAlign: 'center' },
});