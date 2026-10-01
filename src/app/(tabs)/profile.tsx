import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { logout, useAuth, type User } from '@/utils/authStore';
import { useBookings, type Booking } from '@/utils/bookingStore';
import { useWishlist } from '@/utils/wishlistStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileEntry = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: '/(tabs)/bookings' | '/(tabs)/wishlist' | '/settings';
  requiresLogin?: boolean;
  info?: 'payments' | 'personal' | 'support' | 'security';
  badge?: string;
};

function hasFutureTripDate(booking: Booking) {
  if (booking.status === 'cancelled' || booking.status === 'completed') return false;
  if (booking.status === 'upcoming') return true;
  if (!booking.tripDate) return false;
  const tripDate = new Date(`${booking.tripDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(tripDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tripDate >= today;
}

function getProfileEmail(user: User) {
  return user.email.includes('@') ? user.email : 'Email not added';
}

function getProfilePhone(user: User) {
  return user.phone || (user.email.includes('@') ? 'Phone not added' : user.email);
}

const guestSections: Array<{ title: string; entries: ProfileEntry[] }> = [
  {
    title: 'Your travel',
    entries: [
      { id: 'trips', title: 'My Bookings', description: 'View your trip records and confirmations', icon: 'ticket-outline', route: '/(tabs)/bookings' },
      { id: 'saved', title: 'Saved / Wishlist', description: 'Places you want to explore later', icon: 'heart-outline', route: '/(tabs)/wishlist' },
    ],
  },
  {
    title: 'Account & support',
    entries: [
      { id: 'payments', title: 'Payment Methods', description: 'Sign in to manage payment details', icon: 'card-outline', requiresLogin: true },
      { id: 'support', title: 'Help & Support', description: 'Get in touch with the LemonTrip team', icon: 'chatbubble-ellipses-outline', info: 'support' },
      { id: 'settings', title: 'Settings', description: 'Language, currency and notification preferences', icon: 'settings-outline', route: '/settings' },
    ],
  },
];

const memberSections: Array<{ title: string; entries: ProfileEntry[] }> = [
  {
    title: 'Travel',
    entries: [
      { id: 'trips', title: 'My Trips', description: 'Bookings, confirmations and trip dates', icon: 'ticket-outline', route: '/(tabs)/bookings' },
      { id: 'saved', title: 'Wishlist', description: 'Your saved destinations and stays', icon: 'heart-outline', route: '/(tabs)/wishlist' },
      { id: 'payments', title: 'Payment Methods', description: 'Manage your payment details', icon: 'card-outline', info: 'payments', badge: 'Coming soon' },
    ],
  },
  {
    title: 'Account',
    entries: [
      { id: 'personal', title: 'Personal Information', description: 'Name, email and contact details', icon: 'person-circle-outline', info: 'personal' },
      { id: 'preferences', title: 'Travel Preferences', description: 'Language, currency and trip settings', icon: 'options-outline', route: '/settings' },
      { id: 'notifications', title: 'Notifications', description: 'Booking alerts and email updates', icon: 'notifications-outline', route: '/settings' },
      { id: 'security', title: 'Security', description: 'Privacy and account protection', icon: 'shield-checkmark-outline', info: 'security', badge: 'Coming soon' },
      { id: 'settings', title: 'Settings', description: 'Manage your app preferences', icon: 'settings-outline', route: '/settings' },
    ],
  },
  {
    title: 'Need a hand?',
    entries: [
      { id: 'support', title: 'Help & Support', description: 'We’re here to help with your journey', icon: 'chatbubble-ellipses-outline', info: 'support' },
    ],
  },
];

export default function ProfileScreen() {
  const user = useAuth();
  const bookings = useBookings();
  const wishlist = useWishlist();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [activeInfo, setActiveInfo] = useState<ProfileEntry['info'] | null>(null);
  const upcomingCount = bookings.filter(hasFutureTripDate).length;
  const sections = user ? memberSections : guestSections;

  const handleEntryPress = (entry: ProfileEntry) => {
    if (entry.requiresLogin) {
      router.push('/login');
      return;
    }

    if (entry.route) router.push(entry.route);
    if (entry.info) setActiveInfo(entry.info);
  };

  const infoTitle = activeInfo === 'payments'
    ? 'Payment methods'
    : activeInfo === 'personal'
      ? 'Personal information'
      : activeInfo === 'security'
        ? 'Security'
        : 'Help & Support';
  const infoDescription = activeInfo === 'payments'
    ? 'Saved payment methods are not available yet. No card details are stored in LemonTrip.'
    : activeInfo === 'personal'
      ? 'Your profile details currently come from your sign-in.'
      : activeInfo === 'security'
        ? 'Account security controls are not available yet. Your current sign-in session remains active on this device.'
        : 'Contact our travel support team for help with your account or journey.';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.eyebrow}>LEMONTRIP / ACCOUNT</Text>
              <Text style={styles.pageTitle}>Your account</Text>
            </View>
          </View>

          <View style={[styles.profileCard, wide && styles.profileCardWide]}>
            <View style={styles.profileIdentity}>
              <View style={[styles.avatar, user && styles.avatarMember]}>
                <Text style={styles.avatarText}>{user ? user.name.trim().charAt(0).toUpperCase() || 'U' : 'G'}</Text>
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.name}>{user ? user.name : 'Guest User'}</Text>
                <Text style={styles.emailText}>{user ? getProfileEmail(user) : 'Sign in to manage your trips'}</Text>
                {user ? <Text style={styles.phoneText}>{getProfilePhone(user)}</Text> : null}
              </View>
            </View>
            {!user ? (
              <View style={styles.guestAction}>
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/login')} style={styles.authButton}>
                  <Text style={styles.authButtonText}>Login / Sign up</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} />
                </TouchableOpacity>
                <Text style={styles.guestHint}>Your bookings and saved places are still available as a guest.</Text>
              </View>
            ) : null}
          </View>

          {user ? (
            <View style={styles.statsRow}>
              {[
                { label: 'Trips', value: bookings.length, icon: 'airplane-outline' as const },
                { label: 'Saved', value: wishlist.length, icon: 'heart-outline' as const },
                { label: 'Upcoming', value: upcomingCount, icon: 'calendar-outline' as const },
              ].map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Ionicons name={stat.icon} size={17} color={Colors.primary} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.accountLayout, wide && styles.accountLayoutWide]}>
            <View style={styles.accountColumn}>
              {sections.slice(0, 1).map((section) => (
                <View key={section.title} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.entryGroup}>
                    {section.entries.map((entry) => (
                      <TouchableOpacity key={entry.id} accessibilityRole="button" onPress={() => handleEntryPress(entry)} style={styles.entry}>
                        <View style={styles.entryIcon}><Ionicons name={entry.icon} size={18} color={Colors.primary} /></View>
                        <View style={styles.entryCopy}>
                          <Text style={styles.entryTitle}>{entry.title}</Text>
                          <Text style={styles.entryDescription}>{entry.description}</Text>
                        </View>
                        {entry.badge ? <Text style={styles.comingSoon}>{entry.badge}</Text> : null}
                        {entry.requiresLogin ? <Text style={styles.loginRequired}>Sign in required</Text> : null}
                        <Ionicons name={entry.requiresLogin ? 'lock-closed-outline' : 'chevron-forward'} size={16} color={Colors.textLight} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.accountColumn}>
              {sections.slice(1).map((section) => (
                <View key={section.title} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.entryGroup}>
                    {section.entries.map((entry) => (
                      <TouchableOpacity key={entry.id} accessibilityRole="button" onPress={() => handleEntryPress(entry)} style={styles.entry}>
                        <View style={styles.entryIcon}><Ionicons name={entry.icon} size={18} color={Colors.primary} /></View>
                        <View style={styles.entryCopy}>
                          <Text style={styles.entryTitle}>{entry.title}</Text>
                          <Text style={styles.entryDescription}>{entry.description}</Text>
                        </View>
                        {entry.badge ? <Text style={styles.comingSoon}>{entry.badge}</Text> : null}
                        {entry.requiresLogin ? <Text style={styles.loginRequired}>Sign in required</Text> : null}
                        <Ionicons name={entry.requiresLogin ? 'lock-closed-outline' : 'chevron-forward'} size={16} color={Colors.textLight} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {user ? <TouchableOpacity onPress={logout} style={styles.logoutButton}><Text style={styles.logoutText}>Log out</Text></TouchableOpacity> : null}
        </View>
      </ScrollView>

      <Modal visible={activeInfo !== null} transparent animationType="fade" onRequestClose={() => setActiveInfo(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}><Ionicons name={activeInfo === 'support' ? 'chatbubble-ellipses-outline' : activeInfo === 'personal' ? 'person-circle-outline' : activeInfo === 'security' ? 'shield-checkmark-outline' : 'card-outline'} size={20} color={Colors.primary} /></View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" onPress={() => setActiveInfo(null)} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={Colors.textDark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>{infoTitle}</Text>
            <Text style={styles.modalDescription}>{infoDescription}</Text>
            {activeInfo === 'personal' && user ? (
              <View style={styles.personalDetails}>
                <View><Text style={styles.detailLabel}>NAME</Text><Text style={styles.detailValue}>{user.name}</Text></View>
                <View><Text style={styles.detailLabel}>EMAIL</Text><Text style={styles.detailValue}>{getProfileEmail(user)}</Text></View>
                <View><Text style={styles.detailLabel}>PHONE</Text><Text style={styles.detailValue}>{getProfilePhone(user)}</Text></View>
              </View>
            ) : null}
            {activeInfo === 'support' ? (
              <TouchableOpacity onPress={() => Linking.openURL('mailto:hello@lemontrip.in')} style={styles.supportLink}>
                <Text style={styles.supportLinkText}>hello@lemontrip.in</Text>
                <Ionicons name="open-outline" size={14} color={Colors.primary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => setActiveInfo(null)} style={styles.doneButton}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 16 },
  pageHeader: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  pageTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 25, fontWeight: '900', marginTop: 3 },
  profileCard: { padding: 17, borderRadius: 18, backgroundColor: Colors.primaryDark },
  profileCardWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileIdentity: { flexDirection: 'row', alignItems: 'center', gap: 13, flex: 1 },
  avatar: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.accent },
  avatarMember: { backgroundColor: Colors.white },
  avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 22, fontWeight: '900' },
  identityCopy: { flex: 1, minWidth: 0 },
  name: { color: Colors.white, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800' },
  emailText: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Manrope', fontSize: 10, marginTop: 3 },
  phoneText: { color: 'rgba(255,255,255,0.68)', fontFamily: 'Manrope', fontSize: 9, marginTop: 3 },
  guestAction: { marginTop: 16 },
  authButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 15, alignSelf: 'flex-start', borderRadius: 11, backgroundColor: Colors.accent },
  authButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  guestHint: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Manrope', fontSize: 9, marginTop: 9 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingVertical: 13, paddingHorizontal: 7, borderRadius: 14, backgroundColor: Colors.surface },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  statLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  accountLayout: { gap: 18, marginTop: 22 },
  accountLayoutWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 24 },
  accountColumn: { flex: 1, minWidth: 0 },
  section: { marginBottom: 20 },
  sectionTitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 9 },
  entryGroup: { gap: 3 },
  entry: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 13, backgroundColor: Colors.surface },
  entryIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  entryCopy: { flex: 1, minWidth: 0 },
  entryTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  entryDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 12, marginTop: 3 },
  loginRequired: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700' },
  comingSoon: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  logoutButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 1, borderRadius: 11, backgroundColor: Colors.surface },
  logoutText: { color: Colors.error, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(8, 26, 18, 0.48)' },
  modalCard: { width: '100%', maxWidth: 430, padding: 18, borderRadius: 18, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: Colors.accentSoft },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.background },
  modalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 13 },
  modalDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, lineHeight: 16, marginTop: 5 },
  personalDetails: { gap: 12, marginTop: 15, padding: 13, borderRadius: 12, backgroundColor: Colors.background },
  detailLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  detailValue: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', marginTop: 3 },
  supportLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 13 },
  supportLinkText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  doneButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderRadius: 10, backgroundColor: Colors.accent },
  doneText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
});