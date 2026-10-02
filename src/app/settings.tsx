import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
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
          <ScreenHeader title="Settings" subtitle="Manage your account and travel preferences." eyebrow="LEMONTRIP / ACCOUNT" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} />

          <View style={styles.accountBanner}>
            <View style={styles.accountAvatar}><Ionicons name="person-outline" size={20} color={Colors.primaryDark} /></View>
            <View style={styles.accountCopy}><Text style={styles.accountName}>{user?.name ?? 'Guest User'}</Text><Text style={styles.accountEmail}>{user?.email ?? 'Sign in to manage your account'}</Text></View>
            {!user ? <TouchableOpacity onPress={() => router.push('/login')} style={styles.signInButton}><Text style={styles.signInText}>Sign in</Text></TouchableOpacity> : null}
          </View>

          <View style={[styles.columns, desktop && styles.columnsDesktop]}>
            <View style={styles.column}>
              <SettingsSection title="Preferences" icon="options-outline">
                <SettingRow icon="contrast-outline" title="Theme" detail={theme === 'dark' ? 'Dark' : 'Light'} onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <SettingRow icon="language-outline" title="Language" detail={language} onPress={() => setLanguage((current) => current === 'English' ? 'Hindi' : 'English')} />
                <SettingRow icon="cash-outline" title="Currency" detail={currency} onPress={() => setCurrency((current) => current === 'INR (₹)' ? 'USD ($)' : 'INR (₹)')} />
              </SettingsSection>

              <SettingsSection title="Notifications" icon="notifications-outline">
                <SettingRow icon="mail-outline" title="Email notifications" trailing={<Switch value={emailNotifications} onValueChange={setEmailNotifications} trackColor={{ false: Colors.border, true: Colors.primary }} />} />
                <SettingRow icon="calendar-outline" title="Booking updates" trailing={<Switch value={bookingUpdates} onValueChange={setBookingUpdates} trackColor={{ false: Colors.border, true: Colors.primary }} />} />
                <SettingRow icon="pricetag-outline" title="Travel offers" trailing={<Switch value={offerUpdates} onValueChange={setOfferUpdates} trackColor={{ false: Colors.border, true: Colors.primary }} />} />
              </SettingsSection>

              <SettingsSection title="Account" icon="person-circle-outline">
                <SettingRow icon="person-outline" title="Personal information" detail="View name and contact details" onPress={() => Alert.alert('Personal information', user ? `Name: ${user.name}\nEmail: ${user.email ?? 'Not added'}\nPhone: ${user.phone ?? 'Not added'}` : 'Sign in to view account details.')} />
                <SettingRow icon="log-out-outline" title="Log out" detail="Sign out on this device" danger onPress={confirmLogout} />
              </SettingsSection>
            </View>

            <View style={styles.column}>
              <SettingsSection title="Security & privacy" icon="shield-checkmark-outline">
                <SettingRow icon="key-outline" title="Change password" detail="Not connected" onPress={() => Alert.alert('Change password', 'Password changes are not connected yet.')} />
                <SettingRow icon="phone-portrait-outline" title="Login sessions" detail="Current device" onPress={() => Alert.alert('Login sessions', 'Session management is not available yet.')} />
                <SettingRow icon="eye-outline" title="Privacy policy" onPress={() => Alert.alert('Privacy policy', 'Full policy coming soon.')} />
                <SettingRow icon="document-text-outline" title="Terms of service" onPress={() => Alert.alert('Terms of service', 'Full terms coming soon.')} />
              </SettingsSection>

              <SettingsSection title="Support" icon="help-circle-outline">
                <SettingRow icon="book-outline" title="Help center" onPress={() => router.push('/help' as never)} />
                <SettingRow icon="chatbubble-ellipses-outline" title="Contact support" detail="hello@lemontrip.in" onPress={() => { void Linking.openURL('mailto:hello@lemontrip.in'); }} />
              </SettingsSection>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}><Ionicons name={icon} size={17} color={Colors.primary} /><Text style={styles.sectionTitle}>{title}</Text></View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, title, detail, trailing, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail?: string; trailing?: ReactNode; onPress?: () => void; danger?: boolean }) {
  const content = <><Ionicons name={icon} size={16} color={danger ? Colors.error : Colors.primary} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>{detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}</View>{trailing ?? (onPress ? <Ionicons name="chevron-forward" size={14} color={Colors.textLight} /> : null)}</>;
  return onPress ? <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.row}>{content}</TouchableOpacity> : <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  accountBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 15, borderRadius: 14, backgroundColor: Colors.primaryDark },
  accountAvatar: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  accountEmail: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Manrope', fontSize: 10, marginTop: 3 },
  signInButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9, backgroundColor: Colors.accent },
  signInText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  columns: { gap: 12, marginTop: 14, paddingHorizontal: 16 },
  columnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: 12 },
  section: { overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  sectionHeading: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  rows: { paddingHorizontal: 10, paddingBottom: 4 },
  row: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.background },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  rowDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 2 },
  dangerText: { color: Colors.error },
});