import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { logout, useAuth } from '@/utils/authStore';
import { useThemeName } from '@/utils/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DialogState = { title: string; message: string; actionLabel?: string } | null;
type ConfirmAction = 'logout' | 'delete' | null;

export default function SettingsScreen() {
  const user = useAuth();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [offerUpdates, setOfferUpdates] = useState(false);
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('English');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const { theme, setTheme } = useThemeName();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  const showUnavailable = (title: string, message: string) => setDialog({ title, message });

  const confirmDanger = () => {
    if (confirmAction === 'logout') {
      setConfirmAction(null);
      logout();
      router.replace('/(tabs)/profile');
      return;
    }
    setConfirmAction(null);
    setDialog({ title: 'Delete account', message: 'Account deletion is not connected. No account data was deleted. Contact hello@lemontrip.in for account assistance.' });
  };

  const showPersonalInfo = () => setDialog({
    title: 'Personal information',
    message: user ? `Name: ${user.name}\nEmail: ${user.email.includes('@') ? user.email : 'Not added'}\nMobile: ${user.phone || (user.email.includes('@') ? 'Not added' : user.email)}` : 'Sign in to view your account details.',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <ScreenHeader
            title="Settings"
            subtitle="Manage your account and travel preferences."
            eyebrow="LEMONTRIP / ACCOUNT"
            onBack={handleBack}
          />

          <View style={styles.accountBanner}>
            <View style={styles.accountAvatar}><Ionicons name="person-outline" size={20} color={Colors.primaryDark} /></View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountName}>{user?.name ?? 'Guest User'}</Text>
              <Text style={styles.accountEmail}>{user?.email ?? 'Sign in to manage your account'}</Text>
            </View>
            {!user ? <TouchableOpacity onPress={() => router.push('/login')} style={styles.signInButton}><Text style={styles.signInText}>Sign in</Text></TouchableOpacity> : null}
          </View>

          <View style={[styles.sections, desktop && styles.sectionsDesktop]}>
            <View style={styles.column}>
              <SettingsSection title="Account" icon="person-circle-outline" description="Your LemonTrip profile">
                <SettingRow icon="person-outline" title="Personal information" description="Name and contact details" onPress={showPersonalInfo} />
                <SettingRow icon="airplane-outline" title="Travel preferences" description="Language, currency and trip settings" onPress={() => showUnavailable('Travel preferences', 'Set your language and currency in Preferences below. More travel preferences are not available yet.')} />
              </SettingsSection>

              <SettingsSection title="Notifications" icon="notifications-outline" description="Choose what you hear from us">
                <SettingRow icon="mail-outline" title="Email notifications" description="Account news and service messages" trailing={<Switch value={emailNotifications} onValueChange={setEmailNotifications} trackColor={{ false: Colors.border, true: Colors.primary }} />} />
                <SettingRow icon="calendar-outline" title="Booking updates" description="Changes to your trips and bookings" trailing={<Switch value={bookingUpdates} onValueChange={setBookingUpdates} trackColor={{ false: Colors.border, true: Colors.primary }} />} />
                <SettingRow icon="pricetag-outline" title="Offers" description="Occasional travel deals by email" trailing={<Switch value={offerUpdates} onValueChange={setOfferUpdates} trackColor={{ false: Colors.border, true: Colors.primary }} />} />
              </SettingsSection>

              <SettingsSection title="Preferences" icon="options-outline" description="Personalize your app">
                <SettingRow icon="cash-outline" title="Currency" description="Display preference" value={currency} onPress={() => setCurrency((current) => current === 'INR (₹)' ? 'USD ($)' : 'INR (₹)')} />
                <SettingRow icon="language-outline" title="Language" description="App language" value={language} onPress={() => setLanguage((current) => current === 'English' ? 'Hindi' : 'English')} />
                <SettingRow icon="contrast-outline" title="Theme" description="Choose your app appearance" value={theme === 'dark' ? 'Dark' : 'Light'} onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
              </SettingsSection>
            </View>

            <View style={styles.column}>
              <SettingsSection title="Security" icon="shield-checkmark-outline" description="Keep your account protected">
                <SettingRow icon="key-outline" title="Change password" description="Password updates are not connected" badge="Unavailable" onPress={() => showUnavailable('Change password', 'Password changes are not connected to an authentication provider yet.')} />
                <SettingRow icon="phone-portrait-outline" title="Login sessions" description="This device · local session" value="Current" onPress={() => showUnavailable('Login sessions', 'Session management is not connected. Your account currently uses a local app session.')} />
                <SettingRow icon="lock-closed-outline" title="Two-factor authentication" description="Additional sign-in protection" badge="Coming soon" onPress={() => showUnavailable('Two-factor authentication', 'Two-factor authentication is not supported by the current sign-in system.')} />
              </SettingsSection>

              <SettingsSection title="Privacy" icon="eye-outline" description="Your privacy and data">
                <SettingRow icon="document-text-outline" title="Privacy settings" description="Review how account data is used" onPress={() => showUnavailable('Privacy settings', 'Detailed privacy controls are not available yet. Contact hello@lemontrip.in for privacy requests.')} />
                <SettingRow icon="server-outline" title="Data preferences" description="Request or manage your data" onPress={() => showUnavailable('Data preferences', 'Data management tools are not connected. Contact hello@lemontrip.in for a data request.')} />
              </SettingsSection>

              <SettingsSection title="Support" icon="help-circle-outline" description="We’re here to help">
                <SettingRow icon="book-outline" title="Help center" description="Find answers about your trips" onPress={() => router.push('/help' as never)} />
                <SettingRow icon="chatbubble-ellipses-outline" title="Contact support" description="hello@lemontrip.in" onPress={() => Linking.openURL('mailto:hello@lemontrip.in')} />
              </SettingsSection>

              <SettingsSection title="Danger zone" icon="warning-outline" description="Destructive account actions" danger>
                <SettingRow icon="log-out-outline" title="Log out" description="Sign out on this device" danger onPress={() => setConfirmAction('logout')} />
                <SettingRow icon="trash-outline" title="Delete account" description="Permanently remove your account" danger badge="Unavailable" onPress={() => setConfirmAction('delete')} />
              </SettingsSection>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Ionicons name="information-circle-outline" size={20} color={Colors.primary} /></View>
            <Text style={styles.modalTitle}>{dialog?.title}</Text>
            <Text style={styles.modalMessage}>{dialog?.message}</Text>
            <TouchableOpacity onPress={() => setDialog(null)} style={styles.modalDone}><Text style={styles.modalDoneText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmAction !== null} transparent animationType="fade" onRequestClose={() => setConfirmAction(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, styles.dangerModalIcon]}><Ionicons name={confirmAction === 'logout' ? 'log-out-outline' : 'trash-outline'} size={20} color={Colors.error} /></View>
            <Text style={styles.modalTitle}>{confirmAction === 'logout' ? 'Log out?' : 'Delete account?'}</Text>
            <Text style={styles.modalMessage}>{confirmAction === 'logout' ? 'You will be signed out of LemonTrip on this device.' : 'Account deletion cannot be completed from this app because no deletion service is connected.'}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity onPress={() => setConfirmAction(null)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={confirmDanger} style={[styles.confirmButton, confirmAction === 'delete' && styles.deleteConfirmButton]}><Text style={styles.confirmText}>{confirmAction === 'logout' ? 'Log out' : 'Continue'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsSection({ title, icon, description, children, danger = false }: { title: string; icon: keyof typeof Ionicons.glyphMap; description: string; children: ReactNode; danger?: boolean }) {
  return (
    <View style={[styles.section, danger && styles.dangerSection]}>
      <View style={styles.sectionHeading}>
        <View style={[styles.sectionIcon, danger && styles.dangerSectionIcon]}><Ionicons name={icon} size={17} color={danger ? Colors.error : Colors.primary} /></View>
        <View style={styles.sectionHeadingCopy}><Text style={[styles.sectionTitle, danger && styles.dangerTitle]}>{title}</Text><Text style={styles.sectionDescription}>{description}</Text></View>
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, title, description, value, badge, trailing, onPress, danger = false }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value?: string;
  badge?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      <View style={[styles.rowIcon, danger && styles.dangerRowIcon]}><Ionicons name={icon} size={15} color={danger ? Colors.error : Colors.primary} /></View>
      <View style={styles.rowCopy}><Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text><Text style={styles.rowDescription}>{description}</Text></View>
      {badge ? <Text style={[styles.rowBadge, danger && styles.dangerBadge]}>{badge}</Text> : null}
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={14} color={Colors.textLight} /> : null)}
    </>
  );
  return onPress ? <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.row}>{content}</TouchableOpacity> : <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 28 },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  accountBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 16, borderRadius: 18, backgroundColor: Colors.primaryDark },
  accountAvatar: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accent },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  accountEmail: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Manrope', fontSize: 11, marginTop: 4 },
  signInButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.accent },
  signInText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  sections: { gap: 14, marginTop: 18, paddingHorizontal: 16 },
  sectionsDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { flex: 1, minWidth: 0, gap: 14 },
  section: { overflow: 'hidden', borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  dangerSection: { borderColor: '#efdada', backgroundColor: '#fffafa' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  sectionIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  dangerSectionIcon: { backgroundColor: '#fff0f0' },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '900' },
  dangerTitle: { color: Colors.error },
  sectionDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 3 },
  rows: { paddingHorizontal: 10, paddingBottom: 9 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.background },
  rowIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.background },
  dangerRowIcon: { backgroundColor: '#fff5f5' },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  dangerText: { color: Colors.error },
  rowDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 14, marginTop: 3 },
  rowValue: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  rowBadge: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  dangerBadge: { color: Colors.error },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(8, 26, 18, 0.48)' },
  modalCard: { width: '100%', maxWidth: 400, padding: 17, borderRadius: 17, backgroundColor: Colors.surface },
  modalIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  dangerModalIcon: { backgroundColor: '#fff0f0' },
  modalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', marginTop: 11 },
  modalMessage: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 6 },
  modalDone: { minHeight: 43, alignItems: 'center', justifyContent: 'center', marginTop: 15, borderRadius: 10, backgroundColor: Colors.accent },
  modalDoneText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 7, marginTop: 14 },
  cancelButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9, backgroundColor: Colors.background },
  cancelText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  confirmButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9, backgroundColor: Colors.primary },
  deleteConfirmButton: { backgroundColor: Colors.error },
  confirmText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
});
